import type {
  NewTagCategory,
  TagCategory,
} from "../../models/tagging/category";
import type { NewTagGroup, TagGroup } from "../../models/tagging/group";
import type { NewTagSystem, TagSystem } from "../../models/tagging/system";
import type {
  NewTag,
  NewTagCategoryAssociation,
  NewTagRelationship,
  Tag,
  TagCategoryAssociation,
  TagRelationship,
} from "../../models/tagging/tag";
import type { RelationshipType } from "../../models/tagging/types";

export interface TaggingCommandsPort {
  createSystem(data: NewTagSystem): Promise<TagSystem>;

  updateSystem(id: number, data: Partial<TagSystem>): Promise<TagSystem>;

  deleteSystem(id: number): Promise<void>;

  createGroup(data: NewTagGroup): Promise<TagGroup>;

  updateGroup(id: number, data: Partial<TagGroup>): Promise<TagGroup>;

  deleteGroup(id: number): Promise<void>;

  createCategory(data: NewTagCategory): Promise<TagCategory>;

  updateCategory(id: number, data: Partial<TagCategory>): Promise<TagCategory>;

  deleteCategory(id: number): Promise<void>;

  createTag(data: NewTag): Promise<Tag>;

  updateTag(id: number, data: Partial<Tag>): Promise<Tag>;

  deleteTag(id: number): Promise<void>;

  createRelationship(data: NewTagRelationship): Promise<TagRelationship>;

  deleteRelationship(
    sourceTagId: number,
    targetTagId: number,
    type: RelationshipType,
  ): Promise<void>;

  createTagCategoryAssociation(
    data: NewTagCategoryAssociation,
  ): Promise<TagCategoryAssociation>;

  deleteTagCategoryAssociation(
    tagId: number,
    categoryId: number,
  ): Promise<void>;

  bulkCreateTags(
    systemId: number,
    categoryId: number,
    newTags: NewTag[],
  ): Promise<Tag[]>;

  bulkCreateRelationships(
    relationships: NewTagRelationship[],
  ): Promise<TagRelationship[]>;
}
