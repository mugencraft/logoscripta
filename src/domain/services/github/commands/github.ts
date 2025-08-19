import { ConsoleLogger } from "@/core/logging/logger";
import { chunk } from "@/core/utils/array";
import type { GithubRepository } from "@/shared/github/types";

import type {
  ProcessingOptionsBase,
  SyncSummaryResult,
} from "../../../config/processing";
import type {
  NewRepository,
  Repository,
} from "../../../models/github/repository";
import type { RepositoryCommandsPort } from "../../../ports/github/repository/commands";
import type { RepositoryQueriesPort } from "../../../ports/github/repository/queries";
import type { GithubIntegrator } from "../integration/github";

export class GithubCommands {
  constructor(
    private readonly integrator: GithubIntegrator,
    private readonly repositoryCommandsPort: RepositoryCommandsPort,
    private readonly repositoryQueriesPort: RepositoryQueriesPort,
  ) {}
  /**
   * Saves or updates a GitHub repository in storage.
   * Fetches latest data from GitHub unless skipFetch is true.
   *
   * @param repoString - Repository identifier (owner/repo format or GitHub URL)
   * @param options - Configuration options for the save operation
   * @param options.skipFetch - Skip fetching latest data from GitHub
   * @param options.throwOnMissing - Throw error if repository not found when skipFetch is true
   * @param options.forceFetch - Force refresh of GitHub data even if cache is valid
   * @returns Promise resolving to the saved/updated repository or null if operation failed
   * @throws {Error} If repository not found and throwOnMissing is true
   * @throws {Error} If repository string format is invalid
   * @throws {Error} If GitHub API request fails
   */
  async saveRepository(
    repoString: string,
    options: ProcessingOptionsBase = {},
  ): Promise<Repository | NewRepository | null> {
    const { skipFetch, throwOnMissing, forceFetch } = options;

    const currentRepo = await this.findByName(repoString);

    if (skipFetch) {
      if (!currentRepo && throwOnMissing) {
        throw new Error(`Repository not found: ${repoString}`);
      }
      return currentRepo;
    }

    const githubRepository = await this.integrator.fetchRepository(repoString, {
      forceFetch,
      skipFetch,
    });

    return (
      (currentRepo
        ? await this.repositoryCommandsPort.update(
            currentRepo.id,
            githubRepository,
          )
        : await this.repositoryCommandsPort.create(githubRepository)) || null
    );
  }

  /**
   * Synchronizes repositories from existing snapshots to the database
   *
   * @param options - Configuration options for the sync operation
   * @returns Summary of the sync operation
   */
  async syncFromSnapshots(
    options: ProcessingOptionsBase = {},
  ): Promise<SyncSummaryResult> {
    const logger = ConsoleLogger.getInstance();
    const { forceSnapshot = false, batchSize = 50 } = options;

    const summary: SyncSummaryResult = {
      processed: 0,
      created: 0,
      updated: 0,
      failed: [],
      skipped: [],
    };

    try {
      // Get list of repositories to process
      const snapshots = await this.integrator.findAllSnapshots();
      logger.info(`Found ${snapshots.length} repositories to process`);

      // Process in batches to avoid memory issues
      const batches = chunk(snapshots, batchSize);
      const progress = logger.getProgress({
        text: "Processing repositories...",
        color: "blue",
      });

      for (const [batchIndex, batch] of batches.entries()) {
        progress.update(
          `Processing batch ${batchIndex + 1}/${batches.length} ` +
            `(${summary.processed}/${snapshots.length} repositories)`,
        );
        // Process each repository in the batch sequentially
        for (const snapshot of batch) {
          try {
            const result = await this.processRepositorySnapshot(
              snapshot,
              forceSnapshot,
            );
            if (result) {
              summary.processed++;
              if (result.type === "created") summary.created++;
              if (result.type === "updated") summary.updated++;
            } else {
              summary.skipped.push(snapshot.full_name);
            }
          } catch (error) {
            logger.error(`Failed to process ${snapshot.full_name}: ${error}`);
            summary.failed.push(snapshot.full_name);
          }
        }
      }

      progress.complete("Repository sync completed");
      return summary;
    } catch (error) {
      logger.error(`Sync operation failed: ${error}`);
      throw error;
    }
  }

  private async findByName(repoString: string): Promise<Repository | null> {
    return (await this.repositoryQueriesPort.findByName(repoString)) || null;
  }

  private async processRepositorySnapshot(
    repo: GithubRepository,
    forceSnapshot: boolean,
  ): Promise<{ type: "created" | "updated" } | null> {
    const existing = await this.findByName(repo.full_name);

    if (existing && !forceSnapshot) return null;

    existing
      ? await this.repositoryCommandsPort.update(existing.id, repo)
      : await this.repositoryCommandsPort.create(repo);

    return { type: existing ? "updated" : "created" };
  }
}
