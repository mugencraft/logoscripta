import { createInsertSchema, createUpdateSchema } from "drizzle-zod";

import { repositoryListItems, repositoryLists } from "@/shared/schema/github";

export type RepositoryList = typeof repositoryLists.$inferSelect;
export type NewRepositoryList = typeof repositoryLists.$inferInsert;
export type RepositoryListItem = typeof repositoryListItems.$inferSelect;
export type NewRepositoryListItem = typeof repositoryListItems.$inferInsert;

export const newRepositoryListSchema = createInsertSchema(repositoryLists);
export const repositoryListSchema = createUpdateSchema(repositoryLists);
export const newRepositoryListItemSchema =
  createInsertSchema(repositoryListItems);
