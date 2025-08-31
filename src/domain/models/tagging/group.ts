import { createInsertSchema, createUpdateSchema } from "drizzle-zod";

import { tagGroups } from "@/shared/schema/tagging";

export type TagGroup = typeof tagGroups.$inferSelect;
export type NewTagGroup = typeof tagGroups.$inferInsert;

export const newTagGroupSchema = createInsertSchema(tagGroups);
export const tagGroupSchema = createUpdateSchema(tagGroups);
