import * as z from "zod";

import { provinceSearchFiltersSchema } from "./province";

export const communeSearchFiltersSchema = provinceSearchFiltersSchema.extend({
  provinceCode: z.string().optional(),
  onlyCapitals: z.boolean().default(false),
});

export type CommuneSearchFilters = z.infer<typeof communeSearchFiltersSchema>;

// ROUTES
export const communeRoutesSchema = {
  getAllWithStats: z.object({
    countryCode: z.string().optional(),
    regionCode: z.string().optional(),
    provinceCode: z.string().optional(),
  }),
  get: z.string(),
  findByCode: z.object({ code: z.string().min(1) }),
  search: communeSearchFiltersSchema,
  getMostUsed: z.object({
    limit: z.number().min(1).max(50).default(20),
    countryCode: z.string().optional(),
  }),
  getRecentlyUsed: z.object({
    limit: z.number().min(1).max(20).default(10),
  }),
};
