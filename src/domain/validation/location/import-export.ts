import * as z from "zod";

import { poiMetadataSchema } from "@/domain/validation/location/poi";

// ROUTES
export const locationImportExportRoutesSchema = {
  syncOptions: z.object({
    force: z.boolean().default(false),
    dryRun: z.boolean().default(false),
    country: z.string().optional(),
  }),
  importPOIs: z.object({
    poisData: z.array(
      z.object({
        name: z.string().min(2),
        type: z.string(),
        communeCode: z.string().regex(/^\d{6}$/),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        address: z.string().optional(),
        metadata: poiMetadataSchema.optional(),
      }),
    ),
    options: z
      .object({
        skipInvalid: z.boolean().default(true),
      })
      .optional(),
  }),
  exportPOIs: z.object({
    communeCodes: z.array(z.string()).optional(),
  }),
};
