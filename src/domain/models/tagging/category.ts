import { createInsertSchema, createUpdateSchema } from "drizzle-zod";

import { tagCategories } from "@/shared/schema/tagging";

// Types from Drizzle schema
export type TagCategory = typeof tagCategories.$inferSelect;
export type NewTagCategory = typeof tagCategories.$inferInsert;

// Zod schemas from Drizzle
export const newTagCategorySchema = createInsertSchema(tagCategories);
export const tagCategorySchema = createUpdateSchema(tagCategories);
