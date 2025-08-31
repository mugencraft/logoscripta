import { createInsertSchema, createUpdateSchema } from "drizzle-zod";

import { taxonomyTopics } from "@/shared/schema/taxonomy";

export type TaxonomyTopic = typeof taxonomyTopics.$inferSelect;
export type NewTaxonomyTopic = typeof taxonomyTopics.$inferInsert;

export const newTaxonomyTopicSchema = createInsertSchema(taxonomyTopics);
export const taxonomyTopicSchema = createUpdateSchema(taxonomyTopics);
