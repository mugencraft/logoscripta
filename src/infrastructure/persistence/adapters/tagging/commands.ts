import { and, eq } from "drizzle-orm";

import type {
  NewTagCategory,
  TagCategory,
} from "@/domain/models/tagging/category";
import type { NewTagGroup, TagGroup } from "@/domain/models/tagging/group";
import type { NewTagSystem, TagSystem } from "@/domain/models/tagging/system";
import type {
  NewTag,
  NewTagCategoryAssociation,
  NewTagRelationship,
  Tag,
} from "@/domain/models/tagging/tag";
import type { RelationshipType } from "@/domain/models/tagging/types";
import type { TaggingCommandsPort } from "@/domain/ports/tagging/commands";
import { updateMetadataTimestamp } from "@/domain/services/shared/metadata";
import {
  tagCategories,
  tagCategoryAssociation,
  tagGroups,
  tagRelationships,
  tagSystems,
  tags,
} from "@/shared/schema";

import { db } from "../../db";

export class TaggingCommandsAdapter implements TaggingCommandsPort {
  async createSystem(data: NewTagSystem) {
    const [created] = await db.insert(tagSystems).values(data).returning();
    if (!created) {
      throw new Error("Failed to create tag system");
    }
    return created;
  }

  async updateSystem(id: number, data: Partial<TagSystem>) {
    const [updated] = await db
      .update(tagSystems)
      .set(updateMetadataTimestamp(data))
      .where(eq(tagSystems.id, id))
      .returning();

    if (!updated) {
      throw new Error(`Tag system ${id} not found`);
    }
    return updated;
  }

  async deleteSystem(id: number) {
    // Foreign key constraints will handle cascading deletes
    await db.delete(tagSystems).where(eq(tagSystems.id, id));
  }

  async createGroup(data: NewTagGroup) {
    const [created] = await db.insert(tagGroups).values(data).returning();
    if (!created) {
      throw new Error("Failed to create tag group");
    }
    return created;
  }

  async updateGroup(id: number, data: Partial<TagGroup>) {
    const [updated] = await db
      .update(tagGroups)
      .set(updateMetadataTimestamp(data))
      .where(eq(tagGroups.id, id))
      .returning();

    if (!updated) {
      throw new Error(`Tag group ${id} not found`);
    }
    return updated;
  }

  async deleteGroup(id: number) {
    await db.delete(tagGroups).where(eq(tagGroups.id, id));
  }

  async createCategory(data: NewTagCategory) {
    const [created] = await db.insert(tagCategories).values(data).returning();
    if (!created) {
      throw new Error("Failed to create tag category");
    }
    return created;
  }

  async updateCategory(id: number, data: Partial<TagCategory>) {
    const [updated] = await db
      .update(tagCategories)
      .set(updateMetadataTimestamp(data))
      .where(eq(tagCategories.id, id))
      .returning();

    if (!updated) {
      throw new Error(`Tag category ${id} not found`);
    }
    return updated;
  }

  async deleteCategory(id: number) {
    await db.delete(tagCategories).where(eq(tagCategories.id, id));
  }

  async createTag(data: NewTag) {
    const [created] = await db.insert(tags).values(data).returning();

    if (!created) {
      throw new Error("Failed to create tag");
    }
    return created;
  }

  async updateTag(id: number, data: Partial<Tag>) {
    const [updated] = await db
      .update(tags)
      .set(data)
      .where(eq(tags.id, id))
      .returning();

    if (!updated) {
      throw new Error(`Tag ${id} not found`);
    }
    return updated;
  }

  async deleteTag(id: number) {
    await db.delete(tags).where(eq(tags.id, id));
  }

  async createRelationship(data: NewTagRelationship) {
    const [created] = await db
      .insert(tagRelationships)
      .values(data)
      .returning();
    if (!created) {
      throw new Error("Failed to create tag relationship");
    }
    return created;
  }

  async deleteRelationship(
    sourceTagId: number,
    targetTagId: number,
    type: RelationshipType,
  ) {
    await db
      .delete(tagRelationships)
      .where(
        and(
          eq(tagRelationships.sourceTagId, sourceTagId),
          eq(tagRelationships.targetTagId, targetTagId),
          eq(tagRelationships.relationshipType, type),
        ),
      );
  }

  async createTagCategoryAssociation(data: NewTagCategoryAssociation) {
    const [created] = await db
      .insert(tagCategoryAssociation)
      .values(data)
      .returning();

    if (!created) {
      throw new Error("Failed to create tag category association");
    }
    return created;
  }

  async deleteTagCategoryAssociation(tagId: number, categoryId: number) {
    await db
      .delete(tagCategoryAssociation)
      .where(
        and(
          eq(tagCategoryAssociation.tagId, tagId),
          eq(tagCategoryAssociation.categoryId, categoryId),
        ),
      );
  }

  async bulkCreateTags(
    systemId: number,
    categoryId: number,
    newTags: NewTag[],
  ) {
    const tagData = newTags.map((tag) => ({ ...tag, categoryId, systemId }));
    return db.insert(tags).values(tagData).returning();
  }

  async bulkCreateRelationships(relationships: NewTagRelationship[]) {
    if (relationships.length === 0) return [];
    return db.insert(tagRelationships).values(relationships).returning();
  }
}
