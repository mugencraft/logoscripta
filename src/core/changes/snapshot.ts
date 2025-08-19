import { readdir, unlink } from "node:fs/promises";
import { join } from "node:path";

import { validatePathSegment } from "../fs/paths";
import { readJson, saveJson } from "../serialization/json";
import type { SnapshotOptions, SnapshotPath, SnapshotResult } from "./types";

/**
 * Manages versioned snapshots of entity data with automatic rotation.
 * Handles reading, writing, and cleanup of snapshot files using a date-based
 * naming scheme.
 */
export class SnapshotService {
  /**
   * Creates a new SnapshotService instance.
   * @param options - Configuration for snapshot retention and behavior
   */
  constructor(private readonly options: SnapshotOptions = {}) {}

  /**
   * Retrieves the most recent snapshot from a directory.
   * @param entityPath - Path to entity snapshot directory
   * @returns Latest snapshot data or undefined if none exists
   */
  public async getLatestSnapshot<T>(
    entityPath: string,
  ): Promise<T | undefined> {
    const latest = await this.getLatestSnapshotPath(entityPath);
    if (!latest) return undefined;

    return readJson<T>(latest.path);
  }

  /**
   * Retrieves the previous snapshot for an entity.
   * @param entityPath - Path to entity snapshot directory
   * @returns Previous snapshot data or undefined if none exists
   */
  public async getPreviousSnapshot<T>(
    entityPath: string,
  ): Promise<T | undefined> {
    const previous = await this.getPreviousSnapshotPath(entityPath);
    if (!previous) return undefined;

    return readJson<T>(previous.path);
  }

  /**
   * Determines if a snapshot needs refreshing based on timestamp.
   * @param entityPath - Path to entity snapshot directory
   * @returns True if snapshot should be refreshed
   */
  public async shouldRefresh(entityPath: string): Promise<boolean> {
    const latest = await this.getLatestSnapshotPath(entityPath);
    if (!latest) return true;

    const currentDate = new Date().toISOString().split("T")[0];
    return currentDate !== latest.date;
  }

  /**
   * Updates snapshots with new content and handles rotation.
   * @param entityPath - Path to entity snapshot directory
   * @param content - New snapshot content
   * @param options - Optional overrides for snapshot behavior
   * @returns Result of snapshot operation
   */
  public async updateSnapshots<T>(
    entityPath: string,
    content: T | T[],
    options?: Partial<SnapshotOptions>,
  ): Promise<SnapshotResult<T | T[]>> {
    const { force = false, retainCount = 2 } = { ...this.options, ...options };
    const shouldUpdate = await this.shouldRefresh(entityPath);

    if (!force && !shouldUpdate) {
      const current = await this.getLatestSnapshotPath(entityPath);
      if (current) {
        return {
          type: "skipped",
          path: current.path,
          date: current.date,
          data: content,
        };
      }
    }

    const date = new Date().toISOString().split("T")[0] as string;
    const newPath = join(entityPath, `${date}.json`);

    const previous = await this.getLatestSnapshotPath(entityPath);

    await saveJson(content, newPath, {
      overwrite: true,
      createFolders: true,
    });

    // Handle rotation if needed
    if (retainCount > 0) {
      const snapshots = await this.findExistingSnapshots(entityPath);
      if (snapshots.length > retainCount) {
        const toDelete = snapshots.slice(0, -retainCount);
        await Promise.all(toDelete.map((snapshot) => unlink(snapshot.path)));
      }
    }

    return {
      type: previous ? "updated" : "created",
      path: newPath,
      date,
      data: content,
      ...(previous && {
        previous: {
          path: previous.path,
          date: previous.date,
          data: await readJson<T>(previous.path),
        },
      }),
    };
  }

  private async getLatestSnapshotPath(
    entityPath: string,
  ): Promise<SnapshotPath | undefined> {
    const snapshots = await this.findExistingSnapshots(entityPath);
    return snapshots.length > 0 ? snapshots[snapshots.length - 1] : undefined;
  }

  private async getPreviousSnapshotPath(
    entityPath: string,
  ): Promise<SnapshotPath | undefined> {
    const snapshots = await this.findExistingSnapshots(entityPath);
    return snapshots.length > 1 ? snapshots[snapshots.length - 2] : undefined;
  }

  private async findExistingSnapshots(
    entityPath: string,
  ): Promise<SnapshotPath[]> {
    validatePathSegment(entityPath);
    try {
      const files = await readdir(entityPath);

      return files
        .filter((file) => file.endsWith(".json"))
        .map((file) => {
          const match = file.match(/^(\d{4}-\d{2}-\d{2})\.json$/);
          return match
            ? {
                path: join(entityPath, file),
                date: match[1],
              }
            : null;
        })
        .filter((x): x is SnapshotPath => x !== null)
        .sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
      const typedError = error as NodeJS.ErrnoException;
      if (typedError.code === "ENOENT") {
        // logger.info(`Snapshot directory does not exist: ${entityPath}`);
        return [];
      }
      if (typedError.code === "EACCES") {
        throw new Error(
          `Permission denied accessing snapshot directory: ${entityPath}`,
        );
      }
      throw new Error(
        `Failed to read snapshot directory ${entityPath}: ${typedError.message}`,
      );
    }
  }
}
