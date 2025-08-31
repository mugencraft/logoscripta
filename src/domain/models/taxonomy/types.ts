import type { ContentTaxonomyTopic } from "../../models/taxonomy/assignment";
import type { TaxonomyTopic } from "../../models/taxonomy/topic";

// Assignment sources for tracking how topics were assigned
export const TAXONOMY_SOURCES = [
  "manual",
  "auto",
  "imported",
  "inferred",
] as const;
export type TaxonomySource = (typeof TAXONOMY_SOURCES)[number];

// System types for future multi-taxonomy support
export const TAXONOMY_SYSTEM_TYPES = [
  "editorial",
  "competitive",
  "semantic",
] as const;

// Hierarchy representation types
export interface TopicHierarchy {
  topic: TaxonomyTopic;
  children: TopicHierarchy[];
  level: number;
}

export interface TopicPath {
  topic: TaxonomyTopic;
  ancestors: TaxonomyTopic[];
  fullPath: string;
}

// Extended types with relationships

// only direct children
export type TaxonomyTopicWithChildren = TaxonomyTopic & {
  children: TaxonomyTopic[];
  childrenCount: number;
};

// with parent and ancestors
export type TaxonomyTopicWithHierarchy = TaxonomyTopic & {
  parent: TaxonomyTopic | null;
  children: TaxonomyTopic[];
  ancestors: TaxonomyTopic[];
};

// Assignment types
export type ContentTaxonomyTopicWithTopic = ContentTaxonomyTopic & {
  topic: TaxonomyTopic;
};

// System statistics
export interface TaxonomySystemStatistics {
  totalTopics: number;
  maxDepth: number;
  topicsPerLevel: Record<number, number>;
  assignmentsCount: number;
}
