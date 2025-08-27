import { TRPCError } from "@trpc/server";

import { countryRoutesSchema } from "@/domain/validation/location/country";

import { publicProcedure, router } from "../../trpc";

export const locationCountriesRouter = router({
  getAll: publicProcedure.query(
    async ({ ctx }) => await ctx.locationQueries.getAllCountries(),
  ),

  get: publicProcedure
    .input(countryRoutesSchema.get)
    .query(async ({ ctx, input }) => {
      const country = await ctx.locationQueries.getCountryWithRegions(input);
      if (!country) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Country not found: ${input}`,
        });
      }
      return country;
    }),

  // Countries are read-only - managed only through sync
  // No create/update/delete endpoints
});
