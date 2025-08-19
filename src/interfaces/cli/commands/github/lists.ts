import { Command } from "commander";

import { ConsoleLogger } from "@/core/logging/logger";
import type { GitHubProcessorOptions } from "@/domain/config/github";
import type { ProcessingOptionsBase } from "@/domain/config/processing";
import { useConfig } from "@/domain/config/useConfig";
import type { SyncRepositoryOptions } from "@/domain/services/github/commands/list-item";
import { createListItemProcessor } from "@/infrastructure/factories/list-item";

interface ListsProcessingOptions extends ProcessingOptionsBase {
  listIds: string[];
}

interface ListSyncProcessingOptions
  extends GitHubProcessorOptions,
    SyncRepositoryOptions {}

export const listCommands = () => {
  const list = new Command("list");

  list
    .description("Repository list management tools")
    .addCommand(validateCommand())
    .addCommand(syncCommand());

  return list;
};

const validateCommand = () => {
  return new Command("validate")
    .description("Validate list items for common issues")
    .option("-l, --list-ids", "List IDs to validate (space-separated)")
    .option("-v, --verbose", "enable verbose logging")
    .action(async (options: ListsProcessingOptions) => {
      const logger = ConsoleLogger.getInstance({ verbose: options.verbose });
      const { config } = await useConfig();

      try {
        const { listItemProcessor } = createListItemProcessor({
          paths: config.paths,
        });

        const result = await listItemProcessor.validateItems(
          options.listIds?.map((item) => Number.parseInt(item, 10)),
        );

        logger.success("\nValidation Results:");
        logger.success(`- Valid Items: ${result.valid}`);
        logger.success("- Invalid Items:");
        logger.success(
          `  - Unlinked Repositories: ${result.invalid.unlinkedRepositories.length}`,
        );
        logger.success(
          `  - Deleted Repositories: ${result.invalid.deletedRepositories.length}`,
        );
        logger.success(
          `  - Invalid Metadata: ${result.invalid.invalidMetadata.length}`,
        );

        if (options.verbose) {
          if (result.invalid.unlinkedRepositories.length > 0) {
            logger.info("\nUnlinked Repositories:");
            for (const repo of result.invalid.unlinkedRepositories) {
              logger.info(`- ${repo}`);
            }
          }

          if (result.invalid.deletedRepositories.length > 0) {
            logger.info("\nDeleted Repositories:");
            for (const repo of result.invalid.deletedRepositories) {
              logger.info(`- ${repo}`);
            }
          }

          if (result.invalid.invalidMetadata.length > 0) {
            logger.info("\nInvalid Metadata:");
            for (const repo of result.invalid.invalidMetadata) {
              logger.info(`- ${repo}`);
            }
          }
        }
      } catch (error) {
        logger.error(`Unexpected error: ${error}`);
        process.exit(1);
      }
    });
};

const syncCommand = () => {
  return new Command("sync")
    .description("Sync list items with repository data")
    .option("-l, --list-ids", "List IDs to sync (space-separated)")
    .option("-v, --verbose", "enable verbose logging")
    .option("-i, --integrate-new", "integrate new repositories from GitHub")
    .option(
      "-u, --skip-update-names",
      "update repository names when repository name has changed",
    )
    .option("-m, --skip-link-missing", "link items with missing repositoryId")
    .action(async (options: ListSyncProcessingOptions) => {
      const logger = ConsoleLogger.getInstance({ verbose: options.verbose });
      const { config } = await useConfig();

      try {
        const { listItemProcessor } = createListItemProcessor({
          ...options,
          paths: config.paths,
          token: options.token ? options.token : config.github?.token,
        });

        const result = await listItemProcessor.syncRepositoryData(options);

        logger.success(
          `Synchronization complete. Processed ${result.total} items:`,
        );
        logger.info(`- ${result.linked} items linked to existing repositories`);
        logger.info(`- ${result.created} new repositories created from GitHub`);
        logger.info(
          `- ${result.updated} items with updated repository information`,
        );

        if (result.notFound.length > 0) {
          logger.warn(
            `${result.notFound.length} items couldn't be linked or created:`,
          );
          for (const fullName of result.notFound) {
            logger.info(`  - ${fullName}`);
          }
        }

        if (result.failed.length > 0) {
          logger.warn(
            `Error: ${result.failed.length} items failed during GitHub integration:`,
          );
          for (const fullName of result.failed) {
            logger.info(`  - ${fullName}`);
          }
        }
      } catch (error) {
        logger.error(`Unexpected error: ${error}`);
        process.exit(1);
      }
    });
};
