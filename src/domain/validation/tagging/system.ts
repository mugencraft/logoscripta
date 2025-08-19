import * as z from "zod";

import {
  newTagSystemSchema,
  tagSystemSchema,
} from "../../models/tagging/system";
import { RELATIONSHIP_TYPES } from "../../models/tagging/types";
import { createMetadataSchema, sharedSchema } from "../shared";

const { entityId } = sharedSchema;

const relationshipType = z.enum(RELATIONSHIP_TYPES);

// IMPORT/EXPORT

export const tagSystemDataSchema = z.object({
  system: z.object({
    name: z.string().min(3),
    label: z.string().optional(),
    description: z.string().optional(),
    metadata: z.any(),
  }),
  groups: z.array(
    z.object({
      name: z.string().min(3),
      label: z.string().optional(),
      description: z.string().optional(),
      metadata: z.any(),
    }),
  ),
  categories: z.array(
    z.object({
      name: z.string().min(3),
      groupName: z.string(),
      label: z.string().optional(),
      description: z.string().optional(),
      metadata: z.any(),
    }),
  ),
  tags: z.array(
    z.object({
      name: z.string().min(3),
      label: z.string().optional(),
      description: z.string().optional(),
      isQuickSelection: z.boolean().default(false),
      metadata: z.any(),
    }),
  ),
  tagCategoryAssociations: z.array(
    z.object({
      tagName: z.string(),
      categoryName: z.string(),
    }),
  ),
  relationships: z.array(
    z.object({
      sourceTagName: z.string(),
      targetTagName: z.string(),
      relationshipType: relationshipType,
      metadata: z.any().optional(),
    }),
  ),
  exportedAt: z.string().optional(),
  version: z.string(),
});

export type TagSystemData = z.infer<typeof tagSystemDataSchema>;

// ROUTES

export const tagSystemRoutesSchema = {
  createSystem: newTagSystemSchema,
  updateSystem: z.object({
    id: entityId,
    data: tagSystemSchema,
  }),
  validateSystemConsistency: z.array(entityId).min(1),

  // Tag processing and inference
  validateTagSelection: z.object({
    selectedTagIds: z.array(entityId),
    systemId: entityId,
  }),

  // Import/Export operations
  importSystem: z.object({
    systemData: tagSystemDataSchema,
    options: z.object({
      overwrite: z.boolean().optional(),
      renameIfExists: z.boolean().optional(),
    }),
  }),
};

// METADATA
export const tagSystemMetadataSchema = createMetadataSchema("tag-system", {
  import: z
    .object({
      source: z.string().optional(),
      importedAt: z.coerce.date().optional(),
      originalSystemId: z.string().optional(),
    })
    .optional(),
});

export type TagSystemMetadata = z.infer<typeof tagSystemMetadataSchema>;

// FORM

export const tagSystemFormSchema = newTagSystemSchema.extend({
  name: z
    .string()
    .min(1, "Name is required")
    .min(3, "Name must be at least 3 characters"),
});
