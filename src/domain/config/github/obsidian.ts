import type { Change, ChangeDetectorConfig } from "@/core/changes/types";
import type { ObsidianPlugin, ObsidianTheme } from "@/shared/obsidian/types";

import type { ProcessingOptions } from "../processing";

/**
 * Configuration for Obsidian releases integrator
 */
export interface ObsidianReleasesIntegratorOptions extends ProcessingOptions {
  /** Change detection config for plugins */
  pluginChangeConfig: ChangeDetectorConfig;
  /** Change detection config for themes */
  themeChangeConfig: ChangeDetectorConfig;
}

/**
 * Collection of changes for Obsidian entities
 */
export type ProcessableChanges = {
  /** Plugin changes */
  plugins: Change<ObsidianPlugin>[] | null;
  /** Theme changes */
  themes: Change<ObsidianTheme>[] | null;
};

/**
 * Summary of Obsidian releases processing operation
 */
export interface ProcessingSummary {
  /** Count of entities processed during operation */
  processed: {
    /** Number of plugins processed */
    plugins: number;
    /** Number of themes processed */
    themes: number;
  };
  /** Count of detected changes during operation */
  changes: {
    /** Number of plugin changes detected */
    plugins: number;
    /** Number of theme changes detected */
    themes: number;
    /** Number of removed plugins */
    removed: number;
  };
  /** List of repository identifiers that couldn't be found or accessed */
  missing: string[];
}
