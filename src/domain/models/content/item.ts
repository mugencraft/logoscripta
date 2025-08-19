import { createInsertSchema, createUpdateSchema } from "drizzle-zod";

import { contentItems } from "@/shared/schema/content";

// Types from Drizzle
export type ContentItem = typeof contentItems.$inferSelect;
export type NewContentItem = typeof contentItems.$inferInsert;

// Zod schemas from Drizzle
export const newContentItemSchema = createInsertSchema(contentItems);
export const contentItemSchema = createUpdateSchema(contentItems);
