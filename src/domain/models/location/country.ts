import type { countries } from "@/shared/schema/location";

export type Country = typeof countries.$inferSelect;
export type NewCountry = typeof countries.$inferInsert;
