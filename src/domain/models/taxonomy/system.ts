import { createInsertSchema, createUpdateSchema } from "drizzle-zod";

import { taxonomySystems } from "@/shared/schema/taxonomy";

export type TaxonomySystem = typeof taxonomySystems.$inferSelect;
export type NewTaxonomySystem = typeof taxonomySystems.$inferInsert;

export const newTaxonomySystemSchema = createInsertSchema(taxonomySystems);
export const taxonomySystemSchema = createUpdateSchema(taxonomySystems);
