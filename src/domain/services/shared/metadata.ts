import type * as z from "zod";

import { SYSTEM_TYPE_SYMBOL } from "../../models/shared";
import type { BaseMetadata } from "../../validation/shared";

export const updateMetadataTimestamp = <T extends { metadata?: BaseMetadata }>(
  data: T,
): T => {
  if (data.metadata) data.metadata.system.updatedAt = new Date();
  return data;
};

function extractSystemTypeFromSchema(schema: z.ZodSchema): string {
  const systemType = (schema as unknown as Record<symbol, unknown>)[
    SYSTEM_TYPE_SYMBOL
  ];

  if (typeof systemType === "string") {
    return systemType;
  }

  throw new Error("Schema does not contain systemType metadata");
}

export const createMetadata = <T extends BaseMetadata>(
  schema: z.ZodSchema<T>,
  customMetadata: Partial<T> = {},
): T => {
  const now = new Date();

  const systemType = extractSystemTypeFromSchema(schema);

  return schema.parse({
    system: {
      systemType,
      version: "1.0",
      createdAt: now,
      ...customMetadata.system,
    },
    ...customMetadata,
  });
};
