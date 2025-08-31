import type { ContentTaxonomyTopicWithTopic } from "@/domain/models/taxonomy/types";

import type {
  ClientImportInput,
  ContentImportOptions,
  ServerImportInput,
} from "../../validation/content/import-export";
import type { Tag } from "../tagging/tag";
import type { TagSource } from "../tagging/types";
import type { ContentCollection } from "./collection";
import type { ContentItem, NewContentItem } from "./item";
import type { ContentItemTag } from "./item-tag";

export interface ImportPreviewItem {
  id: string;
  name: string;
  type: ContentType;
  previewUrl?: string;
  caption?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

// Enums

export const CONTENT_TYPES = ["image", "url", "document", "video"] as const;
export type ContentType = (typeof CONTENT_TYPES)[number];

export const COLLECTION_TYPES = [...CONTENT_TYPES, "mixed"] as const;
export type CollectionType = (typeof COLLECTION_TYPES)[number];

export const COLLECTION_LAYOUTS = ["grid", "list", "timeline"] as const;

// Import Types

export type ImportSourceType = "filesystem" | "text-content" | "file-upload";

export interface ServerImportConfig {
  input: ServerImportInput;
  options: ContentImportOptions;
}

export interface ClientImportConfig {
  input: ClientImportInput;
  options: ContentImportOptions;
}

export type ImportConfig = ServerImportConfig | ClientImportConfig;

export type ImportPreviewHandler = (
  folderName: string,
  contentType: "image" | "document",
) => Promise<ImportPreviewItem[]>;

export interface PreviewItem {
  id: string;
  name: string;
  type: string;
  size?: number;
  status: "new" | "exists" | "error";
  preview?: string;
  metadata?: {
    caption?: string;
    tags?: string[];
  };
}

export interface ImportStats extends Record<string, number | string[]> {
  itemsCreated: number;
  itemsUpdated: number;
  errors: string[];
}

export type ImportProgressUpdate =
  | { type: "created"; collection: ContentCollection }
  | { type: "started"; total: number; files: string[] }
  | {
      type: "progress";
      item: ContentItem;
      progress: number;
      total: number;
    }
  | {
      type: "error";
      filename: string;
      error: string;
      progress: number;
      total: number;
    }
  | {
      type: "completed";
      collection: ContentCollection;
      stats: ImportStats;
    }
  | { type: "error"; error: string };

export type ParsedImportItem = Omit<NewContentItem, "collectionId">;

// Extended

// With Stats

export type ContentCollectionWithStats = ContentCollection & {
  totalItems: number;
  totalTags: number;
};

export type ContentItemWithStats = ContentItem & {
  totalTags: number;
  totalTopics: number;
  collectionName: string;
};

// With Elements

// used in ContentImportExportService
export type ContentItemTagWithTag = ContentItemTag & { tag: Tag };

export type ContentItemWithRelations = ContentItem & {
  collection: ContentCollection;
  tags: ContentItemTagWithTag[];
  topics: ContentTaxonomyTopicWithTopic[];
};

export type ContentCollectionWithItems = ContentCollection & {
  items: ContentItem[];
};

// Return types

export interface ContentSearchFilters {
  collectionId: number;
  tags?: number[];
  excludeTags?: number[];
  topics?: number[];
  excludeTopics?: number[];
  source?: TagSource;
  contentType?: ContentType;
}

export interface ContentStatistics {
  totalCollections: number;
  totalItems: number;
  taggedItems: number;
  averageTagsPerItem: number;
}

export interface CollectionStatistics {
  totalItems: number;
  totalTags: number;
  averageTagsPerItem: number;
  tagDistribution: Record<string, number>;
}

export type ItemDetailLink = (
  item: ContentItem,
  linkToCollection?: boolean,
) => string;

// TAGGING

export type TagToggleScope =
  | "raw-only" // Toggle only in item.rawTags
  | "system-only" // Toggle only in specific tagSystem
  | "all-systems" // Toggle in all systems that contain this tag
  | "system-and-raw" // Toggle in specific system + rawTags
  | "everywhere"; // Toggle in all systems + rawTags

export interface ItemTagOperations {
  toggleRawTag: (
    item: ContentItem,
    tagName: string,
  ) => Promise<{ success: boolean; data: ContentItem | null }>;
  toggleSystemTag: (
    item: ContentItemWithRelations,
    tag: Tag,
  ) => Promise<{ success: boolean; data: ContentItemWithRelations | null }>;
  bulkUpdateTags: (
    item: ContentItemWithRelations,
    operations: TagOperation[],
  ) => Promise<{ success: boolean }>;
}

interface TagOperation {
  action: "add" | "remove";
  tagId: number;
  scope: TagToggleScope;
  systemId: number;
}
