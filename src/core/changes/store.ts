import { readJson, saveJson } from "../serialization/json";
import { AsyncQueue } from "../utils/queue";
import type { Change, ChangeQueryOptions } from "./types";

/**
 * Provides persistent storage for change records using JSON files.
 * Supports appending new changes and querying existing records with
 * filtering options.
 *
 * @template T The type of entity being tracked
 */
export class JsonChangeStore<T> {
  private queue: AsyncQueue;

  constructor() {
    this.queue = new AsyncQueue();
  }

  /**
   * Appends a new change record to storage.
   * @param changes - Change record or array of record to append
   * @param changelogPath - Path to changelog file
   */
  async append(
    changes: Change<T> | Change<T>[],
    changelogPath: string,
  ): Promise<void> {
    await this.queue.add(async () => {
      let existing: Change<T>[] = [];
      try {
        // Try to read existing changes
        existing = await readJson<Change<T>[]>(changelogPath);
      } catch (error) {
        // If file doesn't exist, start with empty array
        // For other errors, we'll still attempt to write the new change
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
          throw new Error(
            `Failed to read existing changes: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      }

      const actualChanges = Array.isArray(changes) ? changes : [changes];
      const updatedChangelog = [...existing, ...actualChanges];

      const saveOptions = {
        overwrite: true,
        createFolders: true,
      };
      try {
        await saveJson(updatedChangelog, changelogPath, saveOptions);
      } catch (error) {
        throw new Error(
          `Failed to append change: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    });
  }

  /**
   * Queries change records with optional filtering.
   * @param options - Query options for filtering changes
   * @param changelogPath - Path to changelog file
   * @returns Filtered array of changes
   */
  async query(
    options: ChangeQueryOptions,
    changelogPath: string,
  ): Promise<Change<T>[]> {
    try {
      const changes = await readJson<Change<T>[]>(changelogPath);

      return changes
        .filter((change) => {
          // Entity type filter
          if (options.entityType && change.entityType !== options.entityType) {
            return false;
          }

          // Date range filter
          if (options.fromDate && change.timestamp < options.fromDate) {
            return false;
          }
          if (options.toDate && change.timestamp > options.toDate) {
            return false;
          }

          // Change type filter
          if (
            options.changeTypes?.length &&
            !options.changeTypes.includes(change.type)
          ) {
            return false;
          }

          return true;
        })
        .slice(0, options.limit);
    } catch (error) {
      // Return empty array for non-existent file or parsing errors
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return [];
      }
      throw new Error(
        `Failed to query changes: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
