import type { regions } from "@/shared/schema/location";

export type Region = typeof regions.$inferSelect;
export type NewRegion = typeof regions.$inferInsert;
