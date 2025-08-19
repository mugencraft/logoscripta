import { createInsertSchema, createUpdateSchema } from "drizzle-zod";

import {
  tagCategoryAssociation,
  tagRelationships,
  tags,
} from "@/shared/schema/tagging";

// Types from Drizzle schema
export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
export type TagRelationship = typeof tagRelationships.$inferSelect;
export type NewTagRelationship = typeof tagRelationships.$inferInsert;
export type TagCategoryAssociation = typeof tagCategoryAssociation.$inferSelect;
export type NewTagCategoryAssociation =
  typeof tagCategoryAssociation.$inferInsert;

// Zod schemas from Drizzle
export const newTagSchema = createInsertSchema(tags);
export const tagSchema = createUpdateSchema(tags);
export const newTagRelationshipSchema = createInsertSchema(tagRelationships);
export const newTagCategoryAssociationSchema = createInsertSchema(
  tagCategoryAssociation,
);
