import { createInsertSchema, createUpdateSchema } from "drizzle-zod";

import { repositoryListItems, repositoryLists } from "@/shared/schema/github";

// Types from Drizzle
export type RepositoryList = typeof repositoryLists.$inferSelect;
export type NewRepositoryList = typeof repositoryLists.$inferInsert;
export type RepositoryListItem = typeof repositoryListItems.$inferSelect;
export type NewRepositoryListItem = typeof repositoryListItems.$inferInsert;

// Zod schemas from Drizzle
export const newRepositoryListSchema = createInsertSchema(repositoryLists);
export const repositoryListSchema = createUpdateSchema(repositoryLists);
export const newRepositoryListItemSchema =
  createInsertSchema(repositoryListItems);
