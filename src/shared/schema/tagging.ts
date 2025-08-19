import { relations, sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

import { RELATIONSHIP_TYPES } from "@/domain/models/tagging/types";
import type { TagCategoryMetadata } from "@/domain/validation/tagging/category";
import type { TagGroupMetadata } from "@/domain/validation/tagging/group";
import type { TagSystemMetadata } from "@/domain/validation/tagging/system";
import type {
  TagMetadata,
  TagRelationshipMetadata,
} from "@/domain/validation/tagging/tag";

export const tagSystems = sqliteTable(
  "tag_systems",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull().unique(), // e.g., "danbooru", "custom-art", "content-analysis"
    label: text("label"),
    description: text("description"),
    metadata: text("metadata", { mode: "json" })
      .$type<TagSystemMetadata>()
      .notNull(),
  },
  () => [check("name_check", sql`LENGTH(name) >= 3`)],
);

export const tagGroups = sqliteTable(
  "tag_groups",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    systemId: integer("system_id")
      .notNull()
      .references(() => tagSystems.id, { onDelete: "cascade" }),
    name: text("name").notNull().unique(),
    label: text("label"),
    description: text("description"),
    metadata: text("metadata", { mode: "json" })
      .$type<TagGroupMetadata>()
      .notNull(),
  },
  (table) => [
    index("idx_tag_groups_system").on(table.systemId),
    check("name_check", sql`LENGTH(name) >= 3`),
  ],
);

export const tagCategories = sqliteTable(
  "tag_categories",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    systemId: integer("system_id")
      .notNull()
      .references(() => tagSystems.id, { onDelete: "cascade" }),
    groupId: integer("group_id")
      .notNull()
      .references(() => tagGroups.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    label: text("label"),
    description: text("description"),
    metadata: text("metadata", { mode: "json" })
      .$type<TagCategoryMetadata>()
      .notNull(),
  },
  (table) => [
    index("idx_tag_categories_group").on(table.groupId),
    index("idx_tag_categories_system").on(table.systemId),
    check("name_check", sql`LENGTH(name) >= 3`),
  ],
);

export const tags = sqliteTable(
  "tags",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    systemId: integer("system_id")
      .notNull()
      .references(() => tagSystems.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    label: text("label"),
    description: text("description"),
    isQuickSelection: integer("is_quick_selection", { mode: "boolean" })
      .notNull()
      .default(false),
    metadata: text("metadata", { mode: "json" }).$type<TagMetadata>().notNull(),
  },
  (table) => [
    index("idx_tags_system_name").on(table.systemId, table.name),
    uniqueIndex("idx_tags_unique_system_name").on(table.systemId, table.name),
    check("name_check", sql`LENGTH(name) >= 3`),
  ],
);

// Tag Relationships and Rules
export const tagRelationships = sqliteTable(
  "tag_relationships",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    sourceTagId: integer("source_tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
    targetTagId: integer("target_tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
    relationshipType: text("relationship_type", {
      enum: RELATIONSHIP_TYPES,
    }).notNull(),
    metadata: text("metadata", { mode: "json" })
      .$type<TagRelationshipMetadata>()
      .notNull(),
  },
  (table) => [
    index("idx_tag_relationships_source").on(table.sourceTagId),
    index("idx_tag_relationships_target").on(table.targetTagId),
  ],
);

export const tagCategoryAssociation = sqliteTable(
  "tag_category_association",
  {
    tagId: integer("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
    categoryId: integer("category_id")
      .notNull()
      .references(() => tagCategories.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.tagId, table.categoryId] })],
);

// Relations

export const tagSystemsRelations = relations(tagSystems, ({ many }) => ({
  groups: many(tagGroups),
  tags: many(tags),
}));

export const tagGroupsRelations = relations(tagGroups, ({ one, many }) => ({
  system: one(tagSystems, {
    fields: [tagGroups.systemId],
    references: [tagSystems.id],
  }),
  categories: many(tagCategories),
}));

export const tagCategoriesRelations = relations(
  tagCategories,
  ({ one, many }) => ({
    system: one(tagSystems, {
      fields: [tagCategories.systemId],
      references: [tagSystems.id],
    }),
    group: one(tagGroups, {
      fields: [tagCategories.groupId],
      references: [tagGroups.id],
    }),
    tagAssociation: many(tagCategoryAssociation),
  }),
);
// !WARNING tagsRelations are defined in content.ts

export const tagCategoryAssociationRelations = relations(
  tagCategoryAssociation,
  ({ one }) => ({
    tag: one(tags, {
      fields: [tagCategoryAssociation.tagId],
      references: [tags.id],
    }),
    category: one(tagCategories, {
      fields: [tagCategoryAssociation.categoryId],
      references: [tagCategories.id],
    }),
  }),
);

export const tagRelationshipsRelations = relations(
  tagRelationships,
  ({ one }) => ({
    sourceTag: one(tags, {
      fields: [tagRelationships.sourceTagId],
      references: [tags.id],
      relationName: "sourceTag",
    }),
    targetTag: one(tags, {
      fields: [tagRelationships.targetTagId],
      references: [tags.id],
      relationName: "targetTag",
    }),
  }),
);
