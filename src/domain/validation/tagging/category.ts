import * as z from "zod";

import {
  newTagCategorySchema,
  tagCategorySchema,
} from "../../models/tagging/category";
import { TAG_LAYOUTS } from "../../models/tagging/types";
import { createMetadataSchema, sharedSchema } from "../shared";

const { color, entityId, iconName } = sharedSchema;

// ROUTES

export const taggingCategoryRoutesSchema = {
  createCategory: newTagCategorySchema,
  updateCategory: z.object({
    id: entityId,
    data: tagCategorySchema,
  }),
};

// METADATA

export const tagCategoryMetadataSchema = createMetadataSchema("tag-category", {
  display: z
    .object({
      icon: iconName.optional(),
      color,
      order: z.number().default(0),
      layoutType: z.enum(TAG_LAYOUTS).default("horizontal-pills"),
      sectionGroup: z.string().optional(), // used by useCategoryGrouping
      sectionOrder: z.number().default(0),
    })
    .optional(),
  rules: z
    .object({
      required: z.boolean().default(false), // At least one tag from this category
      oneOfKind: z.boolean().default(false), // Only one tag from tags in this category
      toggledBy: z.string().optional(), // Tag that toggled this category
    })
    .optional(),
});

export type TagCategoryMetadata = z.infer<typeof tagCategoryMetadataSchema>;

// FORM

export const tagCategoryFormSchema = newTagCategorySchema.extend({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(255, "Name must be at most 255 characters"),
});
