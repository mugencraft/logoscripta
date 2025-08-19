import { ConsoleLogger } from "@/core/logging/logger";

import type { ProcessingOptionsBase } from "../../../config/processing";
import type { RepositoryListItem } from "../../../models/github/repository-list";
import type { RepositoryQueriesPort } from "../../../ports/github/repository/queries";
import type { RepositoryListQueriesPort } from "../../../ports/github/repository-list/queries";
import type { RepositoryListService } from "../repository-list";
import type { GithubCommands } from "./github";

interface ValidationResult {
  valid: number;
  invalid: {
    unlinkedRepositories: string[]; // Items with no repositoryId
    deletedRepositories: string[]; // Items with repositoryId that doesn't exist
    invalidMetadata: string[];
  };
}

/**
 * Configuration options for syncRepositoryData
 */
export interface SyncRepositoryOptions extends ProcessingOptionsBase {
  /** List item listIDs to sync */
  listIds?: number[];

  /** List item fullNames to sync */
  fullNames?: string[];

  /**
   * Whether to skip integrate new repositories from GitHub when not found locally
   */
  skipIntegrateNew?: boolean;

  /**
   * Whether to skip link items with missing repositoryId
   */
  skipLinkMissing?: boolean;

  /**
   * Whether to skip update item names when repository name has changed
   */
  skipUpdateNames?: boolean;
}

/**
 * Results of the synchronization operation
 */
export interface SyncRepositoryResult {
  linked: number; // Items whose repositoryId was missing and got linked
  created: number; // Items whose repository was created from GitHub
  updated: number; // Items whose repository fullName was updated
  notFound: string[]; // Items that couldn't be linked or created
  failed: string[]; // Items that failed during GitHub integration
  total: number; // Total number of processed items
}

/**
 * Commands for maintaining and validating repository list items
 * Handles repository linkage, validation, and maintenance tasks
 */
export class ListItemCommands {
  private readonly logger: ConsoleLogger;

  constructor(
    // private readonly listCommands: RepositoryListCommandsAdapter,
    private readonly listQueries: RepositoryListQueriesPort,
    private readonly listService: RepositoryListService,
    private readonly repositoryQueriesPort: RepositoryQueriesPort,
    private readonly githubProcessor: GithubCommands,
  ) {
    this.logger = ConsoleLogger.getInstance();
  }

  /**
   * Validates repository list items for common issues
   * Checks for missing repositories, invalid metadata, and duplicates
   *
   * @param listIds - IDs of the lists to validate or none to validate all the list items
   * @returns Validation results including counts and problem items
   */
  async validateItems(listIds?: number[]): Promise<ValidationResult> {
    const result: ValidationResult = {
      valid: 0,
      invalid: {
        unlinkedRepositories: [],
        deletedRepositories: [],
        invalidMetadata: [],
      },
    };

    const items = await this.listQueries.findItems(listIds);

    for (const item of items) {
      let isValid = true;

      // Check repository linkage
      if (!item.repositoryId) {
        result.invalid.unlinkedRepositories.push(item.fullName);
        isValid = false;
      } else {
        // Check if linked repository exists
        const repo = await this.repositoryQueriesPort.findById(
          item.repositoryId,
        );
        if (!repo) {
          result.invalid.deletedRepositories.push(item.fullName);
          isValid = false;
        }
      }

      if (isValid) result.valid++;
    }

    return result;
  }

  /**
   * Synchronizes list items with repository data
   * - Optionally integrates repositories on missing data
   * - Optionally skip to link unlinked items matching on fullName
   * - Optionally skip to update repository fullName on name changes
   *
   * @param options Configuration options for synchronization
   * @param listIds Optional list IDs to filter which items to sync
   * @returns Detailed results of the synchronization process
   */
  async syncRepositoryData(
    options: SyncRepositoryOptions = {},
  ): Promise<SyncRepositoryResult> {
    const result: SyncRepositoryResult = {
      linked: 0,
      created: 0,
      updated: 0,
      notFound: [],
      failed: [],
      total: 0,
    };

    const { listIds, fullNames, skipUpdateNames, skipLinkMissing } = options;

    const items = await this.listQueries.findItems(listIds, fullNames);

    result.total = items.length;

    for (const item of items) {
      try {
        // Handle items with missing repositoryId
        if (!item.repositoryId && !skipLinkMissing) {
          // Try to find existing repository
          const repo = await this.repositoryQueriesPort.findByName(
            item.fullName,
          );

          if (repo) {
            // Link to existing repository
            await this.listService.saveToList({
              ...item,
              repositoryId: repo.id,
              metadata: item.metadata,
            });
            result.linked++;
            continue;
          }

          await this.handleMissingRepository(item, options, result);
          continue;
        }

        // Handle items with an existing repositoryId
        if (item.repositoryId) {
          const repo = await this.repositoryQueriesPort.findById(
            item.repositoryId,
          );

          if (!repo) {
            // This shouldn't normally happen due to referential integrity
            // But handle it gracefully just in case
            this.logger.warn(
              `Repository ID ${item.repositoryId} not found for item ${item.fullName}`,
            );
            result.failed.push(item.fullName);
          } else {
            // We found the repository in our database
            if (!skipUpdateNames && repo.fullName !== item.fullName) {
              // Update item if repository name does not match
              await this.listService.saveToList({
                ...item,
                fullName: repo.fullName,
                metadata: item.metadata,
              });
              result.updated++;
            }
          }
        } else {
          await this.handleMissingRepository(item, options, result);
        }
      } catch (error) {
        this.logger.error(`Error syncing item ${item.fullName}: ${error}`);
        result.failed.push(item.fullName);
      }
    }

    return result;
  }

  /**
   * Handle case where a referenced repository can't be found in our database
   */
  private async handleMissingRepository(
    item: RepositoryListItem,
    options: SyncRepositoryOptions,
    result: SyncRepositoryResult,
  ) {
    if (!options.skipIntegrateNew) {
      try {
        // Try to fetch from GitHub
        const integrated = await this.githubProcessor.saveRepository(
          item.fullName,
        );

        if (integrated) {
          // Successfully integrated from GitHub
          await this.listService.saveToList({
            ...item,
            repositoryId: integrated.id || null,
            metadata: item.metadata,
          });
          result.created++;
          return;
        }

        result.notFound.push(item.fullName);
        return;
      } catch (error) {
        this.logger.error(
          `GitHub integration failed for ${item.fullName}: ${error}`,
        );
        result.failed.push(item.fullName);
        return;
      }
    }

    result.notFound.push(item.fullName);
  }
}
