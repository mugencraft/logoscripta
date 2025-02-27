import type { repositories } from "@/shared/schema";

// Type definitions inferred from Drizzle schema
export type NewRepository = typeof repositories.$inferInsert;
export type Repository = typeof repositories.$inferSelect;
