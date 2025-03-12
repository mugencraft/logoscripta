import {
	SYSTEM_LIST_TYPES,
	isSystemListType,
	listInsertSchema,
	listItemInsertSchema,
	listUpdateSchema,
} from "@/domain/models/repository-list";
import { z } from "zod";

export const repositoryValidation = {
	getById: z.number(),
	search: z.string().min(1).max(100),
	save: z.string(),
};

export const repositoryListsValidation = {
	getSystemList: z.string().refine(isSystemListType, {
		message: `Invalid system list type. Must be one of: ${Object.values(SYSTEM_LIST_TYPES).join(", ")}`,
	}),
	getById: z.number(),
	getItems: z.number(),
	create: listInsertSchema,
	delete: z.number(),
	update: z.object({ listId: z.number(), data: listUpdateSchema }),
	saveToList: listItemInsertSchema,
	removeFromList: z.object({ listId: z.number(), fullName: z.string() }),
	syncRepositoryData: z.object({
		listIds: z.array(z.number()).optional(),
		fullNames: z.array(z.string()).optional(),
		skipIntegrateNew: z.boolean().optional(),
	}),
};
