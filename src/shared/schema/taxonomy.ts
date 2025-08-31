import { relations, sql } from "drizzle-orm";
import {
  type AnySQLiteColumn,
  check,
  index,
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

import {
  TAXONOMY_SOURCES,
  TAXONOMY_SYSTEM_TYPES,
} from "@/domain/models/taxonomy/types";
import type { TaxonomySystemMetadata } from "@/domain/validation/taxonomy/system";
import type { TaxonomyTopicMetadata } from "@/domain/validation/taxonomy/topic";
import { contentItems } from "@/shared/schema/content";

export const taxonomySystems = sqliteTable("taxonomy_systems", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  type: text("type", { enum: TAXONOMY_SYSTEM_TYPES })
    .notNull()
    .default("editorial"),
  label: text("label"),
  description: text("description"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  metadata: text("metadata", { mode: "json" })
    .$type<TaxonomySystemMetadata>()
    .notNull(),
});

export const taxonomyTopics = sqliteTable(
  "taxonomy_topics",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    systemId: integer("system_id")
      .notNull()
      .references(() => taxonomySystems.id, { onDelete: "cascade" }),
    parentId: integer("parent_id").references(
      (): AnySQLiteColumn => taxonomyTopics.id,
    ), // explicit type needed for drizzle-orm
    name: text("name").notNull(),
    path: text("path").notNull(),
    level: integer("level").notNull().default(0),
    metadata: text("metadata", { mode: "json" })
      .$type<TaxonomyTopicMetadata>()
      .notNull(),
  },
  (table) => [
    index("idx_taxonomy_topics_system").on(table.systemId),
    index("idx_taxonomy_topics_parent").on(table.parentId),
    index("idx_taxonomy_topics_path").on(table.path),
    index("idx_taxonomy_topics_system_name").on(table.systemId, table.name),
  ],
);

// Junction table for content-topic assignments
export const contentTaxonomyTopics = sqliteTable(
  "content_taxonomy_topics",
  {
    contentId: integer("content_id")
      .notNull()
      .references(() => contentItems.id, { onDelete: "cascade" }),
    topicId: integer("topic_id")
      .notNull()
      .references(() => taxonomyTopics.id, { onDelete: "cascade" }),
    systemId: integer("system_id")
      .notNull()
      .references(() => taxonomySystems.id, { onDelete: "cascade" }),
    weight: real("weight").notNull().default(1.0), // 0.0-1.0 for primary/secondary classification
    source: text("source", { enum: TAXONOMY_SOURCES })
      .notNull()
      .default("manual"),
    assignedAt: integer("assigned_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
  },
  (table) => [
    primaryKey({ columns: [table.contentId, table.topicId] }),
    index("idx_content_taxonomy_topics_content").on(table.contentId),
    index("idx_content_taxonomy_topics_topic").on(table.topicId),
    index("idx_content_taxonomy_topics_system").on(table.systemId),
  ],
);

// Relations for Drizzle ORM
export const taxonomySystemsRelations = relations(
  taxonomySystems,
  ({ many }) => ({
    topics: many(taxonomyTopics),
    contentAssignments: many(contentTaxonomyTopics),
  }),
);

export const taxonomyTopicsRelations = relations(
  taxonomyTopics,
  ({ one, many }) => ({
    system: one(taxonomySystems, {
      fields: [taxonomyTopics.systemId],
      references: [taxonomySystems.id],
    }),
    parent: one(taxonomyTopics, {
      fields: [taxonomyTopics.parentId],
      references: [taxonomyTopics.id],
      relationName: "parent",
    }),
    children: many(taxonomyTopics, { relationName: "parent" }),
    contentAssignments: many(contentTaxonomyTopics),
  }),
);

export const contentTaxonomyTopicsRelations = relations(
  contentTaxonomyTopics,
  ({ one }) => ({
    content: one(contentItems, {
      fields: [contentTaxonomyTopics.contentId],
      references: [contentItems.id],
    }),
    topic: one(taxonomyTopics, {
      fields: [contentTaxonomyTopics.topicId],
      references: [taxonomyTopics.id],
    }),
    system: one(taxonomySystems, {
      fields: [contentTaxonomyTopics.systemId],
      references: [taxonomySystems.id],
    }),
  }),
);
