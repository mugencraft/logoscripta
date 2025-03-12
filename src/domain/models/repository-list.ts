import { repositoryListItems, repositoryLists } from "@/shared/schema";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import type { z } from "zod";

// Types from Drizzle
export type RepositoryList = typeof repositoryLists.$inferSelect;
export type NewRepositoryList = typeof repositoryLists.$inferInsert;
export type RepositoryListItem = typeof repositoryListItems.$inferSelect;
export type NewRepositoryListItem = typeof repositoryListItems.$inferInsert;

// Zod schemas derived from Drizzle
export const listInsertSchema = createInsertSchema(repositoryLists);
export const listUpdateSchema = createUpdateSchema(repositoryLists);
export const listItemInsertSchema = createInsertSchema(repositoryListItems);
// export const listItemUpdateSchema = createUpdateSchema(repositoryListItems);

// export type ListInsertInput = z.infer<typeof listInsertSchema>;
export type ListUpdateInput = z.infer<typeof listUpdateSchema>;
export type ListItemInsertInput = z.infer<typeof listItemInsertSchema>;
// export type ListItemUpdateInput = z.infer<typeof listItemUpdateSchema>;

// System list types
export const SYSTEM_LIST_TYPES = {
	OBSIDIAN_PLUGIN: "obsidian-plugin",
	OBSIDIAN_THEME: "obsidian-theme",
	ARCHIVED: "archived",
} as const;

export type SystemListType =
	(typeof SYSTEM_LIST_TYPES)[keyof typeof SYSTEM_LIST_TYPES];

// Validate if string is a system list type
export const isSystemListType = (value: string): value is SystemListType =>
	Object.values(SYSTEM_LIST_TYPES).includes(value as SystemListType);
