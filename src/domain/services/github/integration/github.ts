import { join } from "node:path";

import fg from "fast-glob";

import { HistoryService } from "@/core/changes/history";
import type { GithubRepository } from "@/shared/github/types";
import {
  parseGithubRepoToIdentifier,
  parseGithubRepoToString,
} from "@/shared/github/utils";

import type { GithubIntegratorOptions } from "../../../config/github";
import type { ProcessingOptionsBase } from "../../../config/processing";
import type { GitHubApiPort } from "../../../ports/github/github-api";

/**
 * Manages GitHub repository data fetching and snapshot handling.
 * Provides caching and transformation of GitHub API responses.
 */
export class GithubIntegrator {
  private readonly history: HistoryService<GithubRepository>;
  private basePath: string;

  /**
   * Creates a new GitHub integrator instance.
   * @param apiPort - GitHub API Port for making authenticated requests
   */
  constructor(
    private readonly apiPort: GitHubApiPort,
    readonly options: GithubIntegratorOptions,
  ) {
    this.basePath = join(options.paths.github, "repos");
    this.history = new HistoryService<GithubRepository>({
      basePath: this.basePath,
      entityType: "github-repository",
      useEntityFolder: true,
      changeConfig: options.changeConfig,
      snapshotRetention: options.snapshotRetention,
    });
  }

  /**
   * Fetches repository data with optional caching support.
   * @param repoString - Repository identifier (owner/repo format)
   * @param options - Fetch options for controlling caching and force refresh
   * @throws {Error} If repository fetch fails
   */
  async fetchRepository(
    repoString: string,
    options: ProcessingOptionsBase = {},
  ): Promise<GithubRepository> {
    const { forceFetch = false, skipSnapshot } = options;
    const fullName = parseGithubRepoToString(repoString);
    const identifier = parseGithubRepoToIdentifier(repoString);
    const current = (await this.history.getLatestSnapshot(
      identifier,
    )) as GithubRepository;
    const shouldRefresh = await this.history.shouldRefresh(identifier);

    if (
      (current && skipSnapshot) ||
      (current && !forceFetch && !shouldRefresh)
    ) {
      return current;
    }

    const newGithubData = await this.apiPort.getRepository(fullName);
    await this.history.trackChanges(identifier, newGithubData, current);

    return newGithubData;
  }

  /**
   * Finds all repositories that have snapshots in the filesystem.
   *
   * @returns Array of repository snapshots
   */
  async findAllSnapshots(): Promise<GithubRepository[]> {
    const entries = await fg("*/*", {
      onlyDirectories: true,
      cwd: this.basePath,
      baseNameMatch: true,
    });

    const snapshots = await Promise.all(
      entries.map(async (repo) => {
        const identifier = repo.split("/").pop();
        if (!identifier) return undefined;

        return (
          ((await this.history.getLatestSnapshot(
            identifier,
          )) as GithubRepository) || undefined
        );
      }),
    );

    return snapshots.filter(
      (snapshot): snapshot is GithubRepository => snapshot !== undefined,
    );
  }
}
