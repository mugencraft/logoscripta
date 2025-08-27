import * as z from "zod";

export const regionSearchFiltersSchema = z.object({
  countryCode: z.string().optional(),
  nameQuery: z.string().min(2).optional(),
  limit: z.number().min(1).max(500).default(50),
});

export type RegionSearchFilters = z.infer<typeof regionSearchFiltersSchema>;

// ROUTES
export const regionRoutesSchema = {
  getAllRegions: z.object({
    countryCode: z.string().optional(),
  }),
  get: z.string(),
  search: regionSearchFiltersSchema,
};
