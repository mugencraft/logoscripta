import type { repositories } from "@/shared/schema/github";

// Type definitions from Drizzle schema
export type NewRepository = typeof repositories.$inferInsert;
export type Repository = typeof repositories.$inferSelect;
