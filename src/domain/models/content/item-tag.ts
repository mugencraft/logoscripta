import { createInsertSchema } from "drizzle-zod";

import { contentItemTags } from "@/shared/schema/content";

// Types from Drizzle
export type ContentItemTag = typeof contentItemTags.$inferSelect;
export type NewContentItemTag = typeof contentItemTags.$inferInsert;

// Zod schemas from Drizzle
export const newContentItemTagSchema = createInsertSchema(contentItemTags);
