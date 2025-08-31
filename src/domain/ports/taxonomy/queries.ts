import type { ContentItemWithRelations } from "../../models/content/types";
import type { ContentTaxonomyTopic } from "../../models/taxonomy/assignment";
import type { TaxonomySystem } from "../../models/taxonomy/system";
import type { TaxonomyTopic } from "../../models/taxonomy/topic";
import type {
  ContentTaxonomyTopicWithTopic,
  TaxonomySystemStatistics,
  TaxonomyTopicWithChildren,
  TaxonomyTopicWithHierarchy,
  TopicHierarchy,
  TopicPath,
} from "../../models/taxonomy/types";

export interface TaxonomyQueriesPort {
  // System queries
  getSystemById(id: number): Promise<TaxonomySystem | null>;
  getSystemByName(name: string): Promise<TaxonomySystem | null>;
  getAllSystems(): Promise<TaxonomySystem[]>;
  getActiveSystem(type: string): Promise<TaxonomySystem | null>;

  // Topic hierarchy queries
  getTopicsBySystem(systemId: number): Promise<TaxonomyTopic[]>;
  getTopicById(id: number): Promise<TaxonomyTopic | null>;
  getTopicWithChildren(id: number): Promise<TaxonomyTopicWithChildren | null>;
  getTopicWithHierarchy(id: number): Promise<TaxonomyTopicWithHierarchy | null>;

  // Hierarchy navigation
  buildTopicHierarchy(systemId: number): Promise<TopicHierarchy[]>;
  getTopicPath(topicId: number): Promise<TopicPath | null>;
  getTopicAncestors(topicId: number): Promise<TaxonomyTopic[]>;
  getTopicDescendants(topicId: number): Promise<TaxonomyTopic[]>;

  // Assignment queries
  getTopicsForContent(
    contentIds: number[],
    systemId?: number,
  ): Promise<ContentTaxonomyTopic[]>;
  getContentByTopic(topicId: number): Promise<number[]>;
  getItemWithTagsAndTopics(itemId: number): Promise<ContentItemWithRelations>;
  getItemsByTopics(
    collectionId: number,
    topicIds: number[],
    systemId?: number,
  ): Promise<ContentItemWithRelations[]>;
  getContentTopics(
    contentId: number,
    systemId?: number,
  ): Promise<ContentTaxonomyTopicWithTopic[]>;

  // Statistics and validation
  getSystemStatistics(systemId: number): Promise<TaxonomySystemStatistics>;
  validateHierarchy(systemId: number): Promise<boolean>;
  hasCircularReferenceInPath(
    topic: { id: number; parentId: number | null; path: string },
    allTopics: Array<{ id: number; parentId: number | null; path: string }>,
  ): boolean;
}
