import { createInsertSchema, createUpdateSchema } from "drizzle-zod";

import { contentItems } from "@/shared/schema/content";

export type ContentItem = typeof contentItems.$inferSelect;
export type NewContentItem = typeof contentItems.$inferInsert;

export const newContentItemSchema = createInsertSchema(contentItems);
export const contentItemSchema = createUpdateSchema(contentItems);
