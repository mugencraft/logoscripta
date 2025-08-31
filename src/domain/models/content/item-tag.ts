import { createInsertSchema } from "drizzle-zod";

import { contentItemTags } from "@/shared/schema/content";

export type ContentItemTag = typeof contentItemTags.$inferSelect;
export type NewContentItemTag = typeof contentItemTags.$inferInsert;

export const newContentItemTagSchema = createInsertSchema(contentItemTags);
