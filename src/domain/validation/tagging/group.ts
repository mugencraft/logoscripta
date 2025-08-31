import * as z from "zod";

import { newTagGroupSchema, tagGroupSchema } from "../../models/tagging/group";
import {
  ASPECT_RATIOS,
  IMAGE_MAPPING_TYPES,
  TAG_VISUALIZER_POSITIONS,
  TAG_VISUALIZER_SIZES,
} from "../../models/tagging/types";
import { createMetadataSchema, sharedSchema } from "../shared";

const { color, entityId, iconName } = sharedSchema;

// ROUTES

export const tagGroupRoutesSchema = {
  createGroup: newTagGroupSchema,
  updateGroup: z.object({
    id: entityId,
    data: tagGroupSchema,
  }),
};

// METADATA

const tagMappingSchema = z.object({
  tagName: z.string(),
  type: z.enum(IMAGE_MAPPING_TYPES),
  area: z.object({
    x: z.number().min(0).max(100),
    y: z.number().min(0).max(100),
    width: z.number().min(0).max(100),
    height: z.number().min(0).max(100),
  }),
  style: z.object({
    color,
    label: z.string(),
  }),
});

const tagConfigurationSchema = z.object({
  tagNames: z.array(z.string()).min(1),
  imagePath: z.string(),
  mappings: z.array(tagMappingSchema),
});

export const tagVisualizerConfigSchema = z.object({
  activationCategoryIds: z.array(z.number().min(1)).min(1),
  tagConfigurations: z.array(tagConfigurationSchema).min(1),
  aspectRatio: z.enum(ASPECT_RATIOS).default("aspect-[1/2]"),
  position: z.enum(TAG_VISUALIZER_POSITIONS).default("left"),
  width: z.enum(TAG_VISUALIZER_SIZES).default("w-48"),
});

export type TagsVisualizerConfig = z.infer<typeof tagVisualizerConfigSchema>;
export type TagConfiguration = z.infer<typeof tagConfigurationSchema>;
export type TagMapping = z.infer<typeof tagMappingSchema>;

export const tagGroupMetadataSchema = createMetadataSchema("tag-group", {
  display: z
    .object({
      icon: iconName.optional(),
      color,
      order: z.number().default(0),
      visualizer: tagVisualizerConfigSchema.optional(),
      sectionsPerRow: z.number().min(1).max(4).default(1),
      showSectionTitles: z.boolean().default(true),
    })
    .optional(),
});

export type TagGroupMetadata = z.infer<typeof tagGroupMetadataSchema>;

// FORM

export const tagGroupFormSchema = newTagGroupSchema.extend({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(255, "Name must be at most 255 characters"),
});
