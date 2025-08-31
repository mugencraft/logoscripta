import { createInsertSchema, createUpdateSchema } from "drizzle-zod";

import { contentCollections } from "@/shared/schema/content";

export type ContentCollection = typeof contentCollections.$inferSelect;
export type NewContentCollection = typeof contentCollections.$inferInsert;

export const newContentCollectionSchema =
  createInsertSchema(contentCollections);
export const contentCollectionSchema = createUpdateSchema(contentCollections);
