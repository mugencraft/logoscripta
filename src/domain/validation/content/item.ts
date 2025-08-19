import * as z from "zod";

import {
  contentItemSchema,
  newContentItemSchema,
} from "../../models/content/item";
import { ITEM_TYPES } from "../../models/content/types";
import { TAG_SOURCES } from "../../models/tagging/types";
import { createMetadataSchema, sharedSchema } from "../shared";

const { entityId } = sharedSchema;

export const tagSources = z.enum(TAG_SOURCES);

// ROUTES

export const contentItemsRoutesSchema = {
  createItem: newContentItemSchema,

  updateItem: z.object({
    id: entityId,
    data: contentItemSchema,
  }),

  // Search operations
  searchItems: z.object({
    collectionId: entityId,
    tags: z.array(entityId).optional(),
    excludeTags: z.array(entityId).optional(),
    source: tagSources.optional(),
    contentType: z.enum(ITEM_TYPES).optional(),
  }),

  getItemsByTags: z.object({
    collectionId: entityId,
    tagIds: z.array(entityId),
  }),
};

// METADATA

export const contentItemMetadataSchema = createMetadataSchema("content-item", {
  processing: z
    .object({
      extractedText: z.string().optional(),
      aiGeneratedCaption: z.string().optional(),
      detectedObjects: z.array(z.string()).optional(),
      processingHistory: z
        .array(
          z.object({
            operation: z.string(),
            timestamp: z.coerce.date(),
            result: z.record(z.string(), z.unknown()),
          }),
        )
        .optional(),
    })
    .optional(),

  storage: z
    .object({
      previewUrl: z.string().optional(),
      localPath: z.string().optional(), // for files (document, image, video)
      mimeType: z.string().optional(), // for files
      fileSize: z.number().optional(), // for files
      // for image/video files
      dimensions: z
        .object({
          width: z.number(),
          height: z.number(),
        })
        .optional(),
    })
    .optional(),

  // contentType = 'url'
  url: z
    .object({
      domain: z.string().optional(),
      favicon: z.string().optional(),
      lastVisited: z.coerce.date().optional(),
      statusCode: z.number().optional(), // check working urls
      redirectUrl: z.string().optional(), // if there is a redirect
      openGraph: z
        .object({
          title: z.string().optional(),
          description: z.string().optional(),
          image: z.string().optional(),
          siteName: z.string().optional(),
          type: z.string().optional(),
        })
        .optional(),
    })
    .optional(),

  // contentType = 'document'
  document: z
    .object({
      pageCount: z.number().optional(),
      author: z.string().optional(),
      language: z.string().optional(),
      format: z.enum(["pdf", "docx", "txt", "md", "html"]).optional(),
    })
    .optional(),

  // contentType = 'video'
  video: z
    .object({
      duration: z.number().optional(), // in seconds
      resolution: z.string().optional(), // "ex 1920x1080"
      fps: z.number().optional(),
      codec: z.string().optional(),
    })
    .optional(),
});

export type ContentItemMetadata = z.infer<typeof contentItemMetadataSchema>;

// FORM

export const contentItemFormSchema = newContentItemSchema.extend({
  identifier: z
    .string()
    .min(3, "Identifier must be at least 3 characters")
    .max(255, "Identifier must be at most 255 characters"),
});
