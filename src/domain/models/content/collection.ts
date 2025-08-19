import { createInsertSchema, createUpdateSchema } from "drizzle-zod";

import { contentCollections } from "@/shared/schema/content";

// Types from Drizzle
export type ContentCollection = typeof contentCollections.$inferSelect;
export type NewContentCollection = typeof contentCollections.$inferInsert;

// Zod schemas from Drizzle
export const newContentCollectionSchema =
  createInsertSchema(contentCollections);
export const contentCollectionSchema = createUpdateSchema(contentCollections);
