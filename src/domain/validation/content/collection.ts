import * as z from "zod";

import {
  contentCollectionSchema,
  newContentCollectionSchema,
} from "../../models/content/collection";
import { COLLECTION_LAYOUTS } from "../../models/content/types";
import { createMetadataSchema, sharedSchema } from "../shared";

const { entityId } = sharedSchema;

// ROUTES

export const contentCollectionsRoutesSchema = {
  createCollection: newContentCollectionSchema,

  updateCollection: z.object({
    id: entityId,
    data: contentCollectionSchema,
  }),
};

// METADATA

export const contentCollectionMetadataSchema = createMetadataSchema(
  "content-collection",
  {
    processing: z
      .object({
        autoTagging: z.boolean().default(false),
        lastProcessedAt: z.coerce.date().optional(),
        processingRules: z.array(z.string()).optional(),
      })
      .optional(),

    display: z
      .object({
        thumbnail: z.string().optional(),
        layout: z.enum(COLLECTION_LAYOUTS).default("grid"),
      })
      .optional(),
  },
);

export type ContentCollectionMetadata = z.infer<
  typeof contentCollectionMetadataSchema
>;

// FORM

export const contentCollectionFormSchema = newContentCollectionSchema.extend({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(255, "Name must be at most 255 characters"),
});
