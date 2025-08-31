import { createInsertSchema, createUpdateSchema } from "drizzle-zod";

import { tagCategories } from "@/shared/schema/tagging";

export type TagCategory = typeof tagCategories.$inferSelect;
export type NewTagCategory = typeof tagCategories.$inferInsert;

export const newTagCategorySchema = createInsertSchema(tagCategories);
export const tagCategorySchema = createUpdateSchema(tagCategories);
