import { createInsertSchema, createUpdateSchema } from "drizzle-zod";

import { tagSystems } from "@/shared/schema/tagging";

// Types from Drizzle schema
export type TagSystem = typeof tagSystems.$inferSelect;
export type NewTagSystem = typeof tagSystems.$inferInsert;

// Zod schemas from Drizzle
export const newTagSystemSchema = createInsertSchema(tagSystems);
export const tagSystemSchema = createUpdateSchema(tagSystems);
