import type { TagSystem } from "../../models/tagging/system";
import type { Tag, TagRelationship } from "../../models/tagging/tag";
import type {
  TagCategoryWithStats,
  TagSearchFilters,
  TagSystemStatistics,
  TagSystemWithGroups,
} from "../../models/tagging/types";

export interface TagSystemQueriesPort {
  findSystemByName(name: string): Promise<TagSystem | null>;

  getSystemWithStructure(systemId: number): Promise<TagSystemWithGroups | null>;

  getAllCategories(systemId?: number): Promise<TagCategoryWithStats[]>;

  searchTags(filters: TagSearchFilters): Promise<Tag[]>;

  getTagsBySystem(systemId: number): Promise<Tag[]>;

  findTagById(tagId: number): Promise<Tag | null>;

  findTagByName(systemId: number, name: string): Promise<Tag | null>;

  getTagsByCategory(categoryId: number): Promise<Tag[]>;

  hasTagCategoryAssociation(
    tagId: number,
    categoryId: number,
  ): Promise<boolean>;

  getTagRelationships(
    tagId: number,
    source: "sourceTagId" | "targetTagId",
  ): Promise<TagRelationship[]>;

  getRelationshipsByType(
    tagId: number,
    type: string,
  ): Promise<TagRelationship[]>;

  getTagStatistics(systemId: number): Promise<TagSystemStatistics>;
}
