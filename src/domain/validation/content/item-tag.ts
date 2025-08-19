import * as z from "zod";

import { newContentItemTagSchema } from "../../models/content/item-tag";
import { sharedSchema } from "../shared";
import { tagSources } from "./item";

const { entityId } = sharedSchema;

// ROUTES

export const contentItemsTaggingRoutesSchema = {
  tagItem: newContentItemTagSchema,

  removeTag: z.object({
    itemId: entityId,
    tagId: entityId,
  }),

  updateItemTag: z.object({
    itemId: entityId,
    tagId: entityId,
    data: z.object({
      source: tagSources.optional(),
    }),
  }),

  bulkRemoveTag: z.object({
    itemIds: z.array(entityId).min(1),
    tagId: entityId,
  }),

  bulkTagItems: z.array(newContentItemTagSchema),
};
