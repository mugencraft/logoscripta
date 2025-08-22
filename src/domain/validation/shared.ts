import type { IconName } from "lucide-react/dynamic";
import * as z from "zod";

import {
  IMPORT_SOURCES,
  RECORD_STATUS,
  SYSTEM_TYPE_SYMBOL,
} from "../models/shared";

const importPreviewSchema = z.object({
  folderName: z.string(),
  contentType: z.enum(["image", "document"]),
});

export type ImportPreview = z.infer<typeof importPreviewSchema>;

export const sharedSchema = {
  entityId: z.number().positive(),
  folderName: z.string(),
  // TODO: move to a better place
  getImportPreview: importPreviewSchema,
  iconName: z.string().transform((val) => val as IconName),
  color: z
    .string()
    .optional()
    .transform((val) => (val === "" ? undefined : val)), // Hex color
};

// METADATA

const systemMetadataSchema = z.object({
  systemType: z.string(),
  version: z.string().default("1.0"),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
});

const userMetadataSchema = z.looseObject({
  notes: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  rating: z.number().min(0).max(5).optional(),
  status: z.enum(RECORD_STATUS).optional(),
  lastReviewDate: z.coerce.date().optional(),
});

const importMetadataSchema = z.object({
  source: z.enum(IMPORT_SOURCES),
  folderName: z.string().optional(),
  originalId: z.string().optional(),
  importedAt: z.coerce.date().optional(),
  lastSyncAt: z.coerce.date().optional(),
  originalUrl: z.string().optional(),
  originalPath: z.string().optional(),
  stats: z
    .object({
      totalFiles: z.number(),
      processedFiles: z.number(),
      errors: z.array(z.string()),
    })
    .optional(),
});

// Base metadata schema - foundation for all metadata
const baseMetadataSchema = z.object({
  system: systemMetadataSchema,
  user: userMetadataSchema.optional(),
  import: importMetadataSchema.optional(),
});

export function createMetadataSchema<T extends z.ZodRawShape>(
  systemType: string,
  customSchemas?: T,
) {
  const schema = z.object({
    system: systemMetadataSchema.extend({
      systemType: z.literal(systemType),
    }),
    user: userMetadataSchema.optional(),
    import: importMetadataSchema.optional(),
    ...(customSchemas || ({} as T)),
  });

  // Attach systemType as metadata using symbol property
  (schema as unknown as Record<symbol, unknown>)[SYSTEM_TYPE_SYMBOL] =
    systemType;

  return schema;
}

export type BaseMetadata = z.infer<typeof baseMetadataSchema>;
export type SystemMetadata = z.infer<typeof systemMetadataSchema>;
export type UserMetadata = z.infer<typeof userMetadataSchema>;
export type ImportMetadata = z.infer<typeof importMetadataSchema>;
