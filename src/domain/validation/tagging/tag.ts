import * as z from "zod";

import {
  newTagCategoryAssociationSchema,
  newTagRelationshipSchema,
  newTagSchema,
  tagSchema,
} from "../../models/tagging/tag";
import { createMetadataSchema, sharedSchema } from "../shared";

const { entityId } = sharedSchema;

// ROUTES

export const tagRoutesSchema = {
  // Tag operations
  createTag: newTagSchema,
  updateTag: z.object({
    id: entityId,
    data: tagSchema,
  }),

  // Bulk operations
  bulkCreateTags: z.object({
    systemId: entityId,
    categoryId: entityId,
    tags: z.array(newTagSchema),
  }),

  // Search operations
  findTagByName: z.object({
    systemId: entityId,
    name: z.string(),
  }),
  searchTags: z.object({
    systemId: entityId.optional(),
    groupId: entityId.optional(),
    categoryId: entityId.optional(),
    query: z.string().min(1).optional(),
    isQuickSelection: z.boolean().optional(),
  }),
  createRelationship: newTagRelationshipSchema,
  deleteRelationship: newTagRelationshipSchema,
  createAssociation: newTagCategoryAssociationSchema,
  deleteAssociation: z.object({
    tagId: entityId,
    categoryId: entityId,
  }),
};

// METADATA

export const tagMetadataSchema = createMetadataSchema("tag", {
  validation: z
    .object({
      isDisabled: z.boolean().default(false),
      isDeprecated: z.boolean().default(false),
      replacedBy: z.number().optional(), // Tag ID that replaces this one
    })
    .optional(),
});

export type TagMetadata = z.infer<typeof tagMetadataSchema>;

export const tagRelationshipMetadataSchema = createMetadataSchema(
  "tag-relationship",
  {},
);

export type TagRelationshipMetadata = z.infer<
  typeof tagRelationshipMetadataSchema
>;

// FORM

export const tagFormSchema = newTagSchema.extend({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(255, "Name must be at most 255 characters"),
});
