import type { owners } from "@/shared/schema";

export type NewOwner = typeof owners.$inferInsert;
export type Owner = typeof owners.$inferSelect;
