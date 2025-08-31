import * as z from "zod";

import {
  newTaxonomyTopicSchema,
  taxonomyTopicSchema,
} from "../../models/taxonomy/topic";
import { createMetadataSchema, sharedSchema } from "../shared";

const { entityId, iconName, color } = sharedSchema;

// ROUTES
export const taxonomyTopicRoutesSchema = {
  createTopic: newTaxonomyTopicSchema,
  updateTopic: z.object({
    id: entityId,
    data: taxonomyTopicSchema,
  }),
  moveTopic: z.object({
    topicId: entityId,
    newParentId: entityId.nullable(),
  }),
  getTopicHierarchy: z.object({
    topicId: entityId,
    includeAncestors: z.boolean().default(true),
    includeDescendants: z.boolean().default(true),
  }),
  validateMove: z.object({
    topicId: entityId,
    targetParentId: entityId.nullable(),
  }),
};

// METADATA
export const taxonomyTopicMetadataSchema = createMetadataSchema(
  "taxonomy-topic",
  {
    editorial: z
      .object({
        description: z.string().optional(),
        keywords: z.array(z.string()).optional(),
        synonyms: z.array(z.string()).optional(),
        notes: z.string().optional(),
      })
      .optional(),
    display: z
      .object({
        icon: iconName.optional(),
        color,
        order: z.number().default(0),
      })
      .optional(),
  },
);

export type TaxonomyTopicMetadata = z.infer<typeof taxonomyTopicMetadataSchema>;

// FORM
export const taxonomyTopicFormSchema = newTaxonomyTopicSchema.extend({
  name: z
    .string()
    .min(2, "Topic name must be at least 2 characters")
    .max(200, "Topic name must be at most 200 characters"),
});
