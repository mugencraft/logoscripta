import * as z from "zod";

import { communeSearchFiltersSchema } from "@/domain/validation/location/commune";

import { newPOISchema, poiSchema } from "../../models/location/poi";
import { POI_TYPES } from "../../models/location/types";
import { createMetadataSchema, sharedSchema } from "../shared";

const { entityId } = sharedSchema;

const geographicBoundsSchema = z.object({
  north: z.number(),
  south: z.number(),
  east: z.number(),
  west: z.number(),
});

export type GeographicBounds = z.infer<typeof geographicBoundsSchema>;

const geographicRadiusSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  kilometers: z.number().positive(),
});

// Alternative to bounds - circular search
export type GeographicRadius = z.infer<typeof geographicRadiusSchema>;

const poiSearchFiltersSchema = communeSearchFiltersSchema.extend({
  communeCode: z.string().optional(),
  poiType: z.enum(POI_TYPES).optional(),
  bounds: geographicBoundsSchema.optional(),
  radius: geographicRadiusSchema.optional(),
});

export type POISearchFilters = z.infer<typeof poiSearchFiltersSchema>;

// ROUTES
export const poiRoutesSchema = {
  getAll: z.object({
    communeCode: z.string().optional(),
    provinceCode: z.string().optional(),
    regionCode: z.string().optional(),
    countryCode: z.string().optional(),
  }),
  getInBounds: geographicBoundsSchema,
  getNearPoint: geographicRadiusSchema,
  createPOI: newPOISchema,
  updatePOI: z.object({
    id: entityId,
    data: poiSchema,
  }),
  searchPOI: poiSearchFiltersSchema,
};

// METADATA
export const poiMetadataSchema = createMetadataSchema("poi", {
  mountains: z.array(z.string()).optional(),
  rivers: z.array(z.string()).optional(),
  historical: z
    .object({
      periods: z.array(z.string()).optional(),
      cultures: z.array(z.string()).optional(),
      remarkablePeople: z.array(z.string()).optional(),
    })
    .optional(),
});

export type POIMetadata = z.infer<typeof poiMetadataSchema>;

// FORM
export const poiFormSchema = newPOISchema.extend({
  name: z
    .string()
    .min(2, "POI name must be at least 2 characters")
    .max(200, "POI name must be at most 200 characters"),
});
