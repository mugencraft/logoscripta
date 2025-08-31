import type {
  ContentTaxonomyTopic,
  NewContentTaxonomyTopic,
} from "../../models/taxonomy/assignment";
import type {
  NewTaxonomySystem,
  TaxonomySystem,
} from "../../models/taxonomy/system";
import type {
  NewTaxonomyTopic,
  TaxonomyTopic,
} from "../../models/taxonomy/topic";

export interface TaxonomyCommandsPort {
  // System operations
  createSystem(data: NewTaxonomySystem): Promise<TaxonomySystem>;
  updateSystem(
    id: number,
    data: Partial<TaxonomySystem>,
  ): Promise<TaxonomySystem>;
  deleteSystem(id: number): Promise<void>;

  // Topic operations
  createTopic(data: NewTaxonomyTopic): Promise<TaxonomyTopic>;
  updateTopic(id: number, data: Partial<TaxonomyTopic>): Promise<TaxonomyTopic>;
  deleteTopic(id: number): Promise<void>;

  // Topic hierarchy operations
  moveTopic(
    topicId: number,
    newParentId: number | null,
  ): Promise<TaxonomyTopic>;
  updateMaterializedPaths(systemId: number): Promise<void>;

  // Assignment operations
  assignTopicToContent(
    data: NewContentTaxonomyTopic,
  ): Promise<ContentTaxonomyTopic>;
  unassignTopicFromContent(contentId: number, topicId: number): Promise<void>;
  updateTopicAssignment(
    contentId: number,
    topicId: number,
    updates: Partial<ContentTaxonomyTopic>,
  ): Promise<ContentTaxonomyTopic>;

  // Bulk operations
  bulkAssignTopics(
    assignments: NewContentTaxonomyTopic[],
  ): Promise<ContentTaxonomyTopic[]>;
  bulkUnassignTopics(contentId: number, topicIds: number[]): Promise<void>;
}
