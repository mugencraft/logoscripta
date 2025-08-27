import { TRPCError } from "@trpc/server";

import { regionRoutesSchema } from "@/domain/validation/location/region";

import { publicProcedure, router } from "../../trpc";

export const locationRegionsRouter = router({
  getAll: publicProcedure
    .input(regionRoutesSchema.getAllRegions)
    .query(
      async ({ ctx, input }) =>
        await ctx.locationQueries.getAllRegions(input.countryCode),
    ),

  getAllWithStats: publicProcedure
    .input(regionRoutesSchema.getAllRegions)
    .query(
      async ({ ctx, input }) =>
        await ctx.locationQueries.getAllRegionsWithStats(input.countryCode),
    ),

  get: publicProcedure
    .input(regionRoutesSchema.get)
    .query(async ({ ctx, input }) => {
      const region = await ctx.locationQueries.getRegionWithProvinces(input);
      if (!region) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Region not found: ${input}`,
        });
      }
      return region;
    }),

  getStatistics: publicProcedure
    .input(regionRoutesSchema.get)
    .query(
      async ({ ctx, input }) =>
        await ctx.locationQueries.getRegionStatistics(input),
    ),

  // Regions are read-only - managed only through sync
  // No create/update/delete endpoints
});
