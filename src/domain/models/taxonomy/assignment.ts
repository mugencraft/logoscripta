import { createInsertSchema } from "drizzle-zod";

import { contentTaxonomyTopics } from "@/shared/schema/taxonomy";

export type ContentTaxonomyTopic = typeof contentTaxonomyTopics.$inferSelect;
export type NewContentTaxonomyTopic = typeof contentTaxonomyTopics.$inferInsert;

export const newContentTaxonomyTopicSchema = createInsertSchema(
  contentTaxonomyTopics,
);
