import type { provinces } from "@/shared/schema/location";

export type Province = typeof provinces.$inferSelect;
export type NewProvince = typeof provinces.$inferInsert;
