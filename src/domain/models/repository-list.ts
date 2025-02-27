import { type repositoryListItems, repositoryLists } from "@/shared/schema";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";

export type RepositoryList = typeof repositoryLists.$inferSelect;
export type NewRepositoryList = typeof repositoryLists.$inferInsert;
export type RepositoryListItem = typeof repositoryListItems.$inferSelect;
export type NewRepositoryListItem = typeof repositoryListItems.$inferInsert;

// Zod schemas derived from Drizzle
export const listInsertSchema = createInsertSchema(repositoryLists);
export const listUpdateSchema = createUpdateSchema(repositoryLists);
// export const listItemInsertSchema = createInsertSchema(repositoryListItems);

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

// export const saveToListSchema = listItemInsertSchema;
export const saveToListSchema = z.object({
	listId: z.number(),
	fullName: z.string().min(1, "Repository name is required"),
	metadata: z.union([z.record(z.any()), z.array(z.any())]),
	repositoryId: z.number().nullable(),
});

export type SaveToListInput = z.infer<typeof saveToListSchema>;

export const repositoryListValidator = {
	validateSaveToList: (
		data: unknown,
	): z.SafeParseReturnType<unknown, SaveToListInput> =>
		saveToListSchema.safeParse(data),
};
