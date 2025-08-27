import type { communes } from "@/shared/schema/location";

export type Commune = typeof communes.$inferSelect;
export type NewCommune = typeof communes.$inferInsert;
