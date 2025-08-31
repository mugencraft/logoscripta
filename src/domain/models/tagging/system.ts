import { createInsertSchema, createUpdateSchema } from "drizzle-zod";

import { tagSystems } from "@/shared/schema/tagging";

export type TagSystem = typeof tagSystems.$inferSelect;
export type NewTagSystem = typeof tagSystems.$inferInsert;

export const newTagSystemSchema = createInsertSchema(tagSystems);
export const tagSystemSchema = createUpdateSchema(tagSystems);
