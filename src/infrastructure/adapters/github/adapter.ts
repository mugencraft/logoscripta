import { ConsoleLogger } from "@/core/logging/logger";
import type { GitHubApiPort } from "@/domain/ports/github/github-api";

import type {
  GetContentsResponse,
  GetRepoResponse,
  GithubFileContent,
  GithubRepository,
  SearchRepositoryItem,
  SearchResponse,
} from "../../../shared/github/types";
import { parseGithubRepoToString } from "../../../shared/github/utils";
import { GitHubAPIError, GitHubRateLimitError } from "./error";

/**
 * GitHub API adapter for making authenticated requests and handling responses.
 * Provides type-safe methods for fetching repository data and files.
 */
export class GithubAdapter implements GitHubApiPort {
  /**
   * Creates a new GitHub API adapter instance.
   * @param apiToken - Optional GitHub personal access token for authenticated requests
   */
  constructor(private readonly apiToken?: string) {}

  /**
   * Searches GitHub repositories using the provided query.
   * @param query - Search query string
   * @returns Array of matching repository items
   * @throws {GitHubAPIError} If request fails
   * @throws {GitHubRateLimitError} If API rate limit is exceeded
   */
  public async searchRepositories(
    query: string,
  ): Promise<SearchRepositoryItem[]> {
    const response = await this.fetch<SearchResponse>(
      `/search/repositories?q=${encodeURIComponent(query)}`,
    );
    return response.items;
  }

  /**
   * Fetches repository metadata from GitHub.
   * @param repoString - String containing owner/repo
   * @returns Repository metadata
   * @throws {GitHubAPIError} If repository not found or request fails
   * @throws {GitHubRateLimitError} If API rate limit is exceeded
   */
  public async getRepository(repoString: string): Promise<GithubRepository> {
    return this.fetch<GetRepoResponse>(
      `/repos/${parseGithubRepoToString(repoString)}`,
    );
  }

  /**
   * Fetches and parses a JSON file from a GitHub repository.
   * @param repoString - String containing owner/repo
   * @param filePath - Path to the file within the repository
   * @param defaultBranch - Repository branch to fetch from (defaults to "master")
   * @returns Parsed file content as type T
   * @throws {Error} If file not found or content is invalid
   */
  public async getFile<T>(repoString: string, filePath: string): Promise<T> {
    const repo = parseGithubRepoToString(repoString);
    const contents = await this.fetch<GetContentsResponse>(
      `/repos/${repo}/contents/${filePath}`,
    );

    // GitHub returns either a file object or an array of directory contents
    if (Array.isArray(contents)) {
      throw new Error("Path points to a directory, not a file");
    }

    if (contents.type !== "file") {
      throw new Error(`Path points to a ${contents.type}, not a file`);
    }

    const fileContent = contents as GithubFileContent;
    if (!fileContent.content) {
      throw new Error("File is empty or does not exist");
    }

    // For files, decode content and parse as T
    const decoded = Buffer.from(contents.content, "base64").toString();
    return JSON.parse(decoded) as T;
  }

  private async fetch<T>(path: string): Promise<T> {
    const response = await this.executeRateLimitedRequest<Response>(() =>
      fetch(`https://api.github.com${path}`, {
        headers: {
          ...(this.apiToken && {
            Authorization: `Bearer ${this.apiToken}`,
          }),
          Accept: "application/vnd.github.v3+json",
        },
      }),
    );

    if (!response?.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data as T;
  }

  private async executeRateLimitedRequest<T>(
    request: () => Promise<T>,
  ): Promise<T> {
    try {
      const response = await request();
      return response;
    } catch (error) {
      const logger = ConsoleLogger.getInstance();

      if (error instanceof Response) {
        if (error.status === 403 || error.status === 429) {
          const retryAfter = error.headers.get("retry-after");
          const resetTime = error.headers.get("x-ratelimit-reset");

          throw new GitHubRateLimitError(
            `Rate limit reached. ${
              retryAfter
                ? `Retry after ${retryAfter}s`
                : resetTime
                  ? `Reset at ${new Date(Number.parseInt(resetTime, 10) * 1000).toISOString()}`
                  : "No retry information available"
            }`,
          );
        }

        throw new GitHubAPIError(
          `GitHub API error: ${error.statusText}`,
          error.status,
          await error.json(),
        );
      }

      logger.error(`Request failed: ${error}`);
      throw error;
    }
  }
}
