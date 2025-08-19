import { and, eq, inArray } from "drizzle-orm";

import type {
  ContentCollection,
  NewContentCollection,
} from "@/domain/models/content/collection";
import type { ContentItem, NewContentItem } from "@/domain/models/content/item";
import type { NewContentItemTag } from "@/domain/models/content/item-tag";
import type { TagSource } from "@/domain/models/tagging/types";
import type { ContentCommandsPort } from "@/domain/ports/content/commands";
import { updateMetadataTimestamp } from "@/domain/services/shared/metadata";
import {
  contentCollections,
  contentItems,
  contentItemTags,
} from "@/shared/schema";

import { db } from "../../db";

export class ContentCommandsAdapter implements ContentCommandsPort {
  async createCollection(data: NewContentCollection) {
    const [created] = await db
      .insert(contentCollections)
      .values(data)
      .returning();
    if (!created) {
      throw new Error("Failed to create content collection");
    }
    return created;
  }

  async updateCollection(id: number, data: Partial<ContentCollection>) {
    const [updated] = await db
      .update(contentCollections)
      .set(updateMetadataTimestamp(data))
      .where(eq(contentCollections.id, id))
      .returning();

    if (!updated) {
      throw new Error(`Content collection ${id} not found`);
    }
    return updated;
  }

  async deleteCollection(id: number) {
    await db.delete(contentCollections).where(eq(contentCollections.id, id));
  }

  async createItem(data: NewContentItem) {
    const [item] = await db.insert(contentItems).values(data).returning();
    if (!item) {
      throw new Error("Failed to create content item");
    }

    return item;
  }

  async updateItem(id: number, data: Partial<ContentItem>) {
    const [updated] = await db
      .update(contentItems)
      .set(updateMetadataTimestamp(data))
      .where(eq(contentItems.id, id))
      .returning();

    if (!updated) {
      throw new Error(`Content item ${id} not found`);
    }
    return updated;
  }

  async deleteItem(id: number) {
    await db.delete(contentItems).where(eq(contentItems.id, id));
  }

  async tagItem(data: NewContentItemTag) {
    const [created] = await db.insert(contentItemTags).values(data).returning();
    if (!created) {
      throw new Error("Failed to tag content item");
    }
    return created;
  }

  async removeTagFromItem(itemId: number, tagId: number) {
    await db
      .delete(contentItemTags)
      .where(
        and(
          eq(contentItemTags.contentItemId, itemId),
          eq(contentItemTags.tagId, tagId),
        ),
      );
  }

  async updateItemTag(
    itemId: number,
    tagId: number,
    updates: { source?: TagSource },
  ) {
    const [updated] = await db
      .update(contentItemTags)
      .set(updates)
      .where(
        and(
          eq(contentItemTags.contentItemId, itemId),
          eq(contentItemTags.tagId, tagId),
        ),
      )
      .returning();

    if (!updated) {
      throw new Error(
        `Tag assignment not found for item ${itemId}, tag ${tagId}`,
      );
    }
    return updated;
  }

  async bulkTagItems(items: NewContentItemTag[]) {
    if (items.length === 0) return [];
    return db.insert(contentItemTags).values(items).returning();
  }

  async bulkRemoveTag(itemIds: number[], tagId: number) {
    await db
      .delete(contentItemTags)
      .where(
        and(
          inArray(contentItemTags.contentItemId, itemIds),
          eq(contentItemTags.tagId, tagId),
        ),
      );
  }
}
