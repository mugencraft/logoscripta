import type { ProcessingOptionsBase } from "../../config/processing";
import type {
  ArchivedListItemMetadata,
  ObsidianPluginMetadata,
  ObsidianThemeMetadata,
} from "../../validation/github/repository-list";
import type { Owner } from "./owner";
import type { Repository } from "./repository";
import type { RepositoryList, RepositoryListItem } from "./repository-list";

// System list types
export const SYSTEM_LIST_TYPES = {
  OBSIDIAN_PLUGIN: "obsidian-plugin",
  OBSIDIAN_THEME: "obsidian-theme",
  ARCHIVED: "archived",
} as const;

export type SystemListType =
  (typeof SYSTEM_LIST_TYPES)[keyof typeof SYSTEM_LIST_TYPES];

// Validate if string is a system list type
export const isSystemListType = (value: string): value is SystemListType =>
  Object.values(SYSTEM_LIST_TYPES).includes(value as SystemListType);

// REPOSITORY

export type RepositoryExtended = Repository & {
  owner: Owner;
  repositoryListItems: RepositoryListItemWithList[] | null;
};

export type OwnerWithRepositories = Owner & {
  repositories: Repository[] | null;
};

export type TopicWithCount = {
  id: number;
  topic: string;
  repositoryCount: number;
};

// REPOSITORY LIST

export type RepositoryListWithItems = RepositoryList & {
  items: RepositoryListItem[] | null;
};

export type RepositoryListWithItemsAndRelations = RepositoryList & {
  items: RepositoryListItemWithRelations[];
};

// REPOSITORY LIST ITEM

export type RepositoryListItemWithList = RepositoryListItem & {
  list: RepositoryList;
};

export type RepositoryListItemWithRelations = RepositoryListItemWithList & {
  repository: Repository | null;
};

export interface RepositoryListItemArchived
  extends RepositoryListItemWithRelations {
  metadata: ArchivedListItemMetadata;
}

export interface RepositoryListItemObsidianPlugin
  extends RepositoryListItemWithRelations {
  metadata: ObsidianPluginMetadata;
}

export interface RepositoryListItemObsidianTheme
  extends RepositoryListItemWithRelations {
  metadata: ObsidianThemeMetadata;
}

// Sync

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
