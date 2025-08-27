import { createInsertSchema, createUpdateSchema } from "drizzle-zod";

import { pois } from "@/shared/schema/location";

export type POI = typeof pois.$inferSelect;
export type NewPOI = typeof pois.$inferInsert;
export const newPOISchema = createInsertSchema(pois);
export const poiSchema = createUpdateSchema(pois);
