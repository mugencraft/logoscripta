import type { Change } from "@/core/changes/types";
import type {
  ObsidianPlugin,
  ObsidianPluginStats,
  ObsidianPluginsDeprecation,
  ObsidianPluginsStats,
} from "@/shared/obsidian/types";

import {
  type ObsidianPluginMetadata,
  obsidianPluginMetadataSchema,
} from "../../../validation/github/repository-list";
import { createMetadata } from "../../shared/metadata";
import { BaseSystemListHandler } from "./base";

/**
 * Handler for Obsidian plugin changes.
 * Handles changes for plugins and their metadata.
 */
export class ObsidianPluginHandler extends BaseSystemListHandler<
  ObsidianPlugin,
  ObsidianPluginMetadata
> {
  private pluginsStats?: ObsidianPluginsStats;
  private pluginsDeprecation?: ObsidianPluginsDeprecation;
  private existingMetadata: Map<string, ObsidianPluginMetadata> = new Map();

  /**
   * Initializes the handler with plugin stats and deprecation data.
   * Throws an error if the list is not set.
   *
   * @param stats - Plugin stats
   * @param deprecation - Plugin deprecation data
   */
  async initializeState(
    stats: ObsidianPluginsStats,
    deprecation: ObsidianPluginsDeprecation,
  ): Promise<void> {
    this.pluginsStats = stats;
    this.pluginsDeprecation = deprecation;

    if (!this.sourceType) {
      throw new Error("List ID not set");
    }

    // Fetch all existing list items at once
    const items = await this.listService.getItems(
      this.sourceType,
      "obsidian-plugin",
    );

    // Cache existing metadata
    for (const item of items) {
      if (item.metadata) {
        const metadata = item.metadata as ObsidianPluginMetadata;
        this.existingMetadata.set(metadata.plugin.id, metadata);
      }
    }
  }

  private shouldDoFullUpdate(
    newStats: ObsidianPluginStats,
    prevStats?: ObsidianPluginStats,
  ): boolean {
    if (!prevStats) return true;

    return Object.keys(prevStats).length !== Object.keys(newStats).length;
  }

  protected async createMetadata(
    change: Change<ObsidianPlugin>,
  ): Promise<ObsidianPluginMetadata> {
    const pluginId = change.data.id;
    const newDeprecation = this.pluginsDeprecation?.[pluginId];
    const newStats = this.pluginsStats?.[pluginId] ?? {
      downloads: 0,
      updated: 0,
    };

    const prevMetadata = this.existingMetadata.get(pluginId);
    const isSoftUpdate =
      change.type === "soft" &&
      prevMetadata &&
      !this.shouldDoFullUpdate(newStats, prevMetadata.stats);

    const customMetadata = {
      plugin: change.data,
      stats: newStats,
      ...(newDeprecation && { deprecation: newDeprecation }),
    };

    return createMetadata(
      obsidianPluginMetadataSchema,
      isSoftUpdate ? { ...prevMetadata, ...customMetadata } : customMetadata,
    );
  }
}
