export interface ProcessingOptionsBase {
  /** enable verbose logging */
  verbose?: boolean;

  /** Force fresh data fetch even if cache is valid */
  forceFetch?: boolean;

  /** Skip external data fetching, use only local data */
  skipFetch?: boolean;

  /** Throw error if repository not found with skipFetch */
  throwOnMissing?: boolean;

  /** Force new snapshot creation even if recent */
  forceSnapshot?: boolean;

  /** Skip snapshot creation, use only local data */
  skipSnapshot?: boolean;

  /** Number of snapshots to retain */
  snapshotRetention?: number;

  /** Process repositories in batches of this size */
  batchSize?: number;
}

export interface ProcessingOptions extends ProcessingOptionsBase {
  paths: {
    /** Base path for storing GitHub data */
    github: string;
    /** Base path for storing Obsidian data */
    obsidian: string;
  };
}

export interface SyncSummaryResult {
  processed: number;
  created: number;
  updated: number;
  failed: string[];
  skipped: string[];
}
