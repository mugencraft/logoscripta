import * as z from "zod";

import {
  newRepositoryListItemSchema,
  newRepositoryListSchema,
  repositoryListSchema,
} from "../../models/github/repository-list";
import { isSystemListType, SYSTEM_LIST_TYPES } from "../../models/github/types";
import { createMetadataSchema, sharedSchema } from "../shared";

const { entityId } = sharedSchema;

// ROUTES

export const repositoryListsRoutesSchema = {
  getSystemList: z.string().refine(isSystemListType, {
    message: `Invalid system list type. Must be one of: ${Object.values(SYSTEM_LIST_TYPES).join(", ")}`,
  }),
  create: newRepositoryListSchema,
  update: z.object({
    id: entityId,
    data: repositoryListSchema,
  }),
  saveToList: newRepositoryListItemSchema,
  removeFromList: z.object({ listId: entityId, fullName: z.string() }),
  syncRepositoryData: z.object({
    listIds: z.array(entityId).optional(),
    fullNames: z.array(z.string()).optional(),
    skipIntegrateNew: z.boolean().optional(),
  }),
};

// METADATA

// List Metadata

export const repositoryListMetadataSchema = createMetadataSchema(
  "repository-list",
  {},
);

export const repositoryListItemMetadataSchema = createMetadataSchema(
  "user-managed",
  {},
);

// List Item Archived

export const archivedListItemMetadataSchema = createMetadataSchema("archived", {
  archived: z.object({
    fullName: z.string(),
    sourceType: z.string().optional(),
    listId: entityId,
    reason: z.string().optional(),
    removedAt: z.coerce.date(),
  }),
  originalItem: z
    .object({
      fullName: z.string(),
      repositoryId: z.union([entityId, z.null()]),
    })
    .optional(),
});

// List Item Obsidian Plugin

export const obsidianPluginMetadataSchema = createMetadataSchema(
  "obsidian-plugin",
  {
    plugin: z.object({
      id: z.string(),
      name: z.string(),
      author: z.string(),
      description: z.string(),
      repo: z.string(),
    }),
    stats: z
      .object({
        downloads: z.number(),
        updated: z.number(),
      })
      // stats by versions
      .and(z.record(z.string(), z.number())),
    deprecation: z.array(z.string()).optional(),
  },
);

// List Item Obsidian Theme

export const obsidianThemeMetadataSchema = createMetadataSchema(
  "obsidian-theme",
  {
    theme: z.object({
      author: z.string(),
      name: z.string(),
      repo: z.string(),
      screenshot: z.string(),
      modes: z.array(z.enum(["dark", "light"])),
      legacy: z.string().optional(),
    }),
  },
);

export type RepositoryListMetadata = z.infer<
  typeof repositoryListMetadataSchema
>;

export type RepositoryListItemMetadata = z.infer<
  typeof repositoryListItemMetadataSchema
>;
export type ArchivedListItemMetadata = z.infer<
  typeof archivedListItemMetadataSchema
>;
export type ObsidianPluginMetadata = z.infer<
  typeof obsidianPluginMetadataSchema
>;
export type ObsidianThemeMetadata = z.infer<typeof obsidianThemeMetadataSchema>;
