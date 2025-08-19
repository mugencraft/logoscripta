import { relations, sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

import { COLLECTION_TYPES, ITEM_TYPES } from "@/domain/models/content/types";
import { TAG_SOURCES } from "@/domain/models/tagging/types";
import type { ContentCollectionMetadata } from "@/domain/validation/content/collection";
import type { ContentItemMetadata } from "@/domain/validation/content/item";

import {
  tagCategoryAssociation,
  tagRelationships,
  tagSystems,
  tags,
} from "./tagging";

export const contentCollections = sqliteTable(
  "content_collections",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    description: text("description"),
    type: text("type", { enum: COLLECTION_TYPES }).notNull(),
    metadata: text("metadata", { mode: "json" })
      .$type<ContentCollectionMetadata>()
      .notNull(),
  },
  () => [check("name_check", sql`LENGTH(name) >= 3`)],
);

export const contentItems = sqliteTable(
  "content_items",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    collectionId: integer("collection_id")
      .notNull()
      .references(() => contentCollections.id, { onDelete: "cascade" }),
    identifier: text("identifier").notNull(), // filename, URL, or unique ID
    title: text("title"),
    contentType: text("content_type", { enum: ITEM_TYPES }).notNull(),
    rawTags: text("raw_tags"), // Original comma separated tags
    metadata: text("metadata", { mode: "json" })
      .$type<ContentItemMetadata>()
      .notNull(),
  },
  (table) => [
    index("idx_content_items_collection").on(table.collectionId),
    index("idx_content_items_identifier").on(table.identifier),
    check("identifier_check", sql`LENGTH(identifier) >= 3`),
  ],
);

export const contentItemTags = sqliteTable(
  "content_item_tags",
  {
    contentItemId: integer("content_item_id")
      .notNull()
      .references(() => contentItems.id, { onDelete: "cascade" }),
    tagId: integer("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
    systemId: integer("system_id")
      .notNull()
      .references(() => tagSystems.id, { onDelete: "cascade" }),
    source: text("source", { enum: TAG_SOURCES }).notNull().default("manual"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
  },
  (table) => [
    primaryKey({ columns: [table.contentItemId, table.tagId, table.systemId] }),
    index("idx_content_item_tags_item_system").on(
      table.contentItemId,
      table.systemId,
    ),
    index("idx_content_item_tags_item").on(table.contentItemId),
    index("idx_content_item_tags_tag_system").on(table.tagId, table.systemId),
  ],
);

// Relations

export const contentCollectionsRelations = relations(
  contentCollections,
  ({ many }) => ({
    items: many(contentItems),
  }),
);

export const contentItemsRelations = relations(
  contentItems,
  ({ one, many }) => ({
    collection: one(contentCollections, {
      fields: [contentItems.collectionId],
      references: [contentCollections.id],
    }),
    tags: many(contentItemTags),
  }),
);

export const contentItemTagsRelations = relations(
  contentItemTags,
  ({ one }) => ({
    contentItem: one(contentItems, {
      fields: [contentItemTags.contentItemId],
      references: [contentItems.id],
    }),
    tag: one(tags, {
      fields: [contentItemTags.tagId],
      references: [tags.id],
    }),
  }),
);

export const tagsRelations = relations(tags, ({ one, many }) => ({
  system: one(tagSystems, {
    fields: [tags.systemId],
    references: [tagSystems.id],
  }),
  sourceRelationships: many(tagRelationships, { relationName: "sourceTag" }),
  targetRelationships: many(tagRelationships, { relationName: "targetTag" }),
  contentItemTags: many(contentItemTags),
  categoryAssociations: many(tagCategoryAssociation),
}));
