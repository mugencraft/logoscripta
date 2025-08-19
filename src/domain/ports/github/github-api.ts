import type {
  GithubRepository,
  SearchRepositoryItem,
} from "@/shared/github/types";

/**
 * Port defining interactions with the GitHub API
 * Abstracts external GitHub operations to support testing and alternative implementations
 */
export interface GitHubApiPort {
  /**
   * Fetches repository data from GitHub
   * @param repoString - String containing owner/repo
   * @returns Promise resolving to repository data
   * @throws Error if repository not found or request fails
   */
  getRepository(repoString: string): Promise<GithubRepository>;

  /**
   * Fetches file content from a GitHub repository
   * @param repoString - String containing owner/repo
   * @param filePath - Path to the file within the repository
   * @returns Promise resolving to file content parsed according to type T
   * @throws Error if file not found or request fails
   */
  getFile<T>(repoString: string, filePath: string): Promise<T>;

  /**
   * Searches for repositories matching the query
   * @param query - Search query string
   * @param options - Optional parameters for the search
   * @returns Promise resolving to an array of matching repositories
   */
  searchRepositories(query: string): Promise<SearchRepositoryItem[]>;
}
