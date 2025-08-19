import type { Tag } from "../tagging/tag";
import type { TagSource } from "../tagging/types";
import type { ContentCollection } from "./collection";
import type { ContentItem } from "./item";
import type { ContentItemTag } from "./item-tag";

export interface ImageCaptioned {
  id: string;
  imageUrl: string;
  caption: string;
  tags: string[];
}

// Enums

export const COLLECTION_LAYOUTS = ["grid", "list", "timeline"] as const;

export const COLLECTION_TYPES = [
  "image",
  "url",
  "document",
  "video",
  "mixed",
] as const;
export type CollectionType = (typeof COLLECTION_TYPES)[number];

export const ITEM_TYPES = ["image", "url", "document", "video"] as const;
export type ItemType = (typeof ITEM_TYPES)[number];

// Extended

// With Stats

export type ContentCollectionWithStats = ContentCollection & {
  totalItems: number;
  totalTags: number;
};

export type ContentItemWithStats = ContentItem & {
  totalTags: number;
  collectionName: string;
};

// With Elements

// used in ContentImportExportService
export type ContentItemTagWithTag = ContentItemTag & { tag: Tag };

export type ContentItemWithTags = ContentItem & {
  collection: ContentCollection;
  tags?: ContentItemTagWithTag[];
};

export type ContentCollectionWithItems = ContentCollection & {
  items: ContentItem[];
};

// Return types

export interface ContentSearchFilters {
  collectionId: number;
  tags?: number[];
  excludeTags?: number[];
  source?: TagSource;
  contentType?: ItemType;
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
    item: ContentItemWithTags,
    tag: Tag,
  ) => Promise<{ success: boolean; data: ContentItemWithTags | null }>;
  bulkUpdateTags: (
    item: ContentItemWithTags,
    operations: TagOperation[],
  ) => Promise<{ success: boolean }>;
}

interface TagOperation {
  action: "add" | "remove";
  tagId: number;
  scope: TagToggleScope;
  systemId: number;
}
