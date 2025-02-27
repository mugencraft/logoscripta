import type { topics } from "@/shared/schema";

export type NewTopic = typeof topics.$inferInsert;
export type Topic = typeof topics.$inferSelect;
