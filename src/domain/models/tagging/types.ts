import type { TagSystemData } from "../../validation/tagging/system";
import type { TagCategory } from "./category";
import type { TagGroup } from "./group";
import type { TagSystem } from "./system";
import type { Tag, TagCategoryAssociation, TagRelationship } from "./tag";

// Enums

export const RELATIONSHIP_TYPES = [
  // Directional relationships
  "implies", // A implies B
  "requires", // A requires B
  "invalidates", // A invalidates B
  // Bidirectional relationships
  "conflicts",
  "opposite",
] as const;
export type RelationshipType = (typeof RELATIONSHIP_TYPES)[number];

export const TAG_SOURCES = ["manual", "ml", "imported", "inferred"] as const;
export type TagSource = (typeof TAG_SOURCES)[number];

export const TAG_LAYOUTS = [
  "horizontal-pills",
  "compact-grid",
  "one-column",
  "two-column",
  "three-column",
  "six-column",
] as const;
export type TagLayout = (typeof TAG_LAYOUTS)[number];

export const IMAGE_MAPPING_TYPES = ["crop", "overlay"] as const;
export type ImageMappingType = (typeof IMAGE_MAPPING_TYPES)[number];

export const ASPECT_RATIOS = [
  "aspect-[1/2]",
  "aspect-[2/3]",
  "aspect-[3/4]",
  "aspect-square",
] as const;
export type AspectRatio = (typeof ASPECT_RATIOS)[number];

export const TAG_VISUALIZER_POSITIONS = [
  "left",
  "right",
  "top",
  "bottom",
] as const;
export type TagVisualizerPosition = (typeof TAG_VISUALIZER_POSITIONS)[number];

export const TAG_VISUALIZER_SIZES = ["w-32", "w-48", "w-64", "w-80"] as const;
export type TagVisualizerSize = (typeof TAG_VISUALIZER_SIZES)[number];

// Extended

// With Stats

export type TagSystemWithStats = TagSystem & {
  totalTags: number;
  totalGroups: number;
  totalCategories: number;
};

export type TagGroupWithStats = TagGroup & {
  totalCategories: number;
  totalTags: number;
  systemName: string;
};

export type TagCategoryWithStats = TagCategory & {
  totalTags: number;
  groupName: string;
};

export type TagWithStats = Tag & {
  usageCount: number;
  categoryCount: number;
  systemCount: number;
};

// With Relationships

export type TagRelationshipWithTags = TagRelationship & {
  tag: Tag;
};

export type TagsWithRelations = Tag & {
  sourceRelationships: TagRelationship[];
  targetRelationships: TagRelationship[];
  categoryAssociations: TagCategoryAssociation[];
};

// With Tags

export type TagCategoryAssociationWithTags = TagCategoryAssociation & {
  tag: TagsWithRelations;
};

export type TagCategoryWithTags = TagCategory & {
  tagAssociation: TagCategoryAssociationWithTags[];
};

// With Elements

export type TagGroupWithCategories = TagGroup & {
  categories: TagCategoryWithTags[];
};

export type TagSystemWithGroups = TagSystem & {
  groups: TagGroupWithCategories[];
};

// Others

// Search and filtering interfaces
export interface TagSearchFilters {
  systemId?: number;
  groupId?: number;
  categoryId?: number;
  query?: string;
  isQuickSelection?: boolean;
}

// New type for system structure statistics
export interface TagSystemStatistics {
  totalTags: number;
  totalGroups: number;
  totalCategories: number;
  tagsByGroup: Array<{
    groupName: string;
    groupId: number;
    tagCount: number;
  }>;
  categoriesByGroup: Array<{
    groupName: string;
    groupId: number;
    categoryCount: number;
  }>;
}

export interface TagSystemStats {
  groups: number;
  categories: number;
  tags: number;
  relationships: number;
  // associations: number;
}

export interface TagSystemExportResult {
  data: TagSystemData;
  stats: TagSystemStats;
}

export interface TagSystemImportResult {
  system: TagSystem;
  stats: TagSystemStats;
  resolvedSystemName: string; // Actual name used (might be different if renamed)
}

export interface ImportOptions {
  overwrite?: boolean;
  renameIfExists?: boolean;
}
