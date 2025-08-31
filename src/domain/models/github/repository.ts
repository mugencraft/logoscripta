import type { repositories } from "@/shared/schema/github";

export type NewRepository = typeof repositories.$inferInsert;
export type Repository = typeof repositories.$inferSelect;
