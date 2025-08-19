import { createInsertSchema, createUpdateSchema } from "drizzle-zod";

import { tagGroups } from "@/shared/schema/tagging";

// Types from Drizzle schema
export type TagGroup = typeof tagGroups.$inferSelect;
export type NewTagGroup = typeof tagGroups.$inferInsert;

// Zod schemas from Drizzle
export const newTagGroupSchema = createInsertSchema(tagGroups);
export const tagGroupSchema = createUpdateSchema(tagGroups);
