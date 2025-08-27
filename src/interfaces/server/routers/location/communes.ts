import { TRPCError } from "@trpc/server";

import { communeRoutesSchema } from "@/domain/validation/location/commune";

import { publicProcedure, router } from "../../trpc";

export const locationCommunesRouter = router({
  getAllWithStats: publicProcedure
    .input(communeRoutesSchema.getAllWithStats)
    .query(
      async ({ ctx, input }) =>
        await ctx.locationQueries.getCommunesWithStats(
          input.provinceCode,
          input.regionCode,
          input.countryCode,
        ),
    ),

  get: publicProcedure
    .input(communeRoutesSchema.get)
    .query(async ({ ctx, input }) => {
      const commune = await ctx.locationQueries.getCommuneWithPOIs(input);
      if (!commune) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Commune not found: ${input}`,
        });
      }
      return commune;
    }),

  search: publicProcedure
    .input(communeRoutesSchema.search)
    .query(async ({ ctx, input }) => {
      return await ctx.locationQueries.searchCommunes(input);
    }),

  getMostUsed: publicProcedure
    .input(communeRoutesSchema.getMostUsed)
    .query(async ({ ctx, input }) => {
      return await ctx.locationQueries.getMostUsedCommunes(input);
    }),

  getRecentlyUsed: publicProcedure
    .input(communeRoutesSchema.getRecentlyUsed)
    .query(async ({ ctx, input }) => {
      return await ctx.locationQueries.getRecentlyUsedCommunes(input);
    }),

  // Communes are read-only - managed through sync
  // No create/update/delete endpoints
});
