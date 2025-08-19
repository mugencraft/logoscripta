import { join } from "node:path";

import { Command } from "commander";

import { JsonChangeStore } from "@/core/changes/store";
import type { ChangeType } from "@/core/changes/types";
import { ConsoleLogger } from "@/core/logging/logger";
import type { ProcessingOptionsBase } from "@/domain/config/processing";
import { useConfig } from "@/domain/config/useConfig";
import { createObsidianReleasesProcessor } from "@/infrastructure/factories/obsidian-releases";
import {
  OBSIDIAN_FILES,
  type ObsidianFilesKeys,
} from "@/shared/obsidian/types";

interface HistoryCommandOptions {
  verbose?: boolean;
  type?: ObsidianFilesKeys;
  from?: string;
  changes?: string;
  limit?: string;
}
export const releasesCommands = () => {
  const plugins = new Command("releases").description(
    "Community releases management tools",
  );

  plugins
    .command("fetch")
    .description("Fetch and process Obsidian community files")
    .option("-v, --verbose", "enable verbose logging")
    .option("-F, --force-fetch", "force repository update")
    .option("-S, --skip-fetch", "skip repository updates")
    .action(async (options: ProcessingOptionsBase) => {
      const logger = ConsoleLogger.getInstance({ verbose: options.verbose });
      const { config } = await useConfig();

      try {
        // Load configuration and initialize processor
        const processor = createObsidianReleasesProcessor({
          paths: config.paths,
          token: config.github?.token,
          forceFetch: options.forceFetch,
          skipFetch: options.skipFetch,
        });

        logger.info(
          `Start Syncing Obsidian releases whit options: forceFetch: ${options.forceFetch}, skipFetch: ${options.skipFetch}`,
        );

        const summary = await processor.syncReleases();

        // Log detailed summary
        logger.success("Successfully processed Obsidian community files");
        logger.info("\nProcessing Summary:");
        logger.info(`Plugins processed: ${summary.processed.plugins}`);
        logger.info(`Themes processed: ${summary.processed.themes}`);
        logger.info("\nChanges detected:");
        logger.info(`- Plugin changes: ${summary.changes.plugins}`);
        logger.info(`- Theme changes: ${summary.changes.themes}`);
        logger.info(`- Removed plugins: ${summary.changes.removed}`);

        if (summary.missing.length > 0) {
          logger.warn(`\nMissing repositories: ${summary.missing.length}`);
        }
      } catch (error) {
        logger.error(`Failed to process Obsidian files: ${error}`);
        process.exit(1);
      }
    });

  plugins
    .command("history")
    .description("Get change history for Obsidian community files")
    .option("-v, --verbose", "enable verbose logging")
    .option(
      "-t, --type <fileType>",
      `file type to check (${VALID_FILE_TYPES.join("|")})`,
      "plugins",
    )
    .option("-f, --from <date>", "start date (YYYY-MM-DD)")
    .option(
      "-c, --changes <types>",
      `change types (${Object.keys(CHANGE_TYPE_MAP).join(",")})`,
      "updated",
    )
    .option("-l, --limit <number>", "limit number of results", "100")
    .action(async (options: HistoryCommandOptions) => {
      const logger = ConsoleLogger.getInstance({ verbose: options.verbose });
      const { config } = await useConfig();

      try {
        // Validate inputs
        const fileType = validateFileType(options.type);
        const changeTypes = parseChangeTypes(options.changes || "updated");
        const limit = Number.parseInt(options.limit || "100", 10);

        if (changeTypes.length === 0) {
          throw new Error(
            `Invalid change types. Must be one of: ${Object.keys(CHANGE_TYPE_MAP).join(", ")}`,
          );
        }

        // Load configuration and initialize store
        const storePath = join(config.paths.obsidian, OBSIDIAN_FILES[fileType]);

        const store = new JsonChangeStore();

        // Query changes
        const changes = await store.query(
          {
            fromDate: options.from,
            changeTypes,
            limit,
          },
          storePath,
        );

        // Format and display results
        const formattedChanges = changes.map((change) => ({
          id: change.id,
          type: change.type,
          timestamp: change.timestamp,
          data: change.data,
        }));

        logger.info(JSON.stringify(formattedChanges, null, 2));
      } catch (error) {
        logger.error(
          `Failed to get file history: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
        process.exit(1);
      }
    });

  return plugins;
};

/**
 * Maps user-friendly change type names to internal change types
 */
const CHANGE_TYPE_MAP: Record<string, ChangeType> = {
  added: "add",
  changed: "full",
  updated: "soft",
  removed: "removal",
} as const;

/**
 * Valid file types that can be queried
 */
const VALID_FILE_TYPES: ObsidianFilesKeys[] = ["plugins", "themes"];

/**
 * Validates and parses change types from comma-separated string
 */
const parseChangeTypes = (changes: string): ChangeType[] => {
  const requestedTypes = changes.split(",");

  return requestedTypes
    .map((type) => CHANGE_TYPE_MAP[type.trim().toLowerCase()])
    .filter((type): type is ChangeType => type !== undefined);
};

/**
 * Validates file type option
 */
const validateFileType = (fileType: string | undefined): ObsidianFilesKeys => {
  if (!fileType || !VALID_FILE_TYPES.includes(fileType as ObsidianFilesKeys)) {
    throw new Error(
      `Invalid file type. Must be one of: ${VALID_FILE_TYPES.join(", ")}`,
    );
  }
  return fileType as ObsidianFilesKeys;
};
