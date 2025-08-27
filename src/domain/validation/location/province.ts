import * as z from "zod";

import { regionSearchFiltersSchema } from "./region";

export const provinceSearchFiltersSchema = regionSearchFiltersSchema.extend({
  regionCode: z.string().optional(),
});

export type ProvinceSearchFilters = z.infer<typeof provinceSearchFiltersSchema>;

// ROUTES
export const provinceRoutesSchema = {
  getAllWithStats: z.object({
    countryCode: z.string().optional(),
    regionCode: z.string().optional(),
  }),
  get: z.string(),
  search: provinceSearchFiltersSchema,
};
