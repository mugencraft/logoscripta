import { TRPCError } from "@trpc/server";

import { poiRoutesSchema } from "@/domain/validation/location/poi";
import { sharedSchema } from "@/domain/validation/shared";

import { publicProcedure, router } from "../../trpc";

export const locationPOIsRouter = router({
  getAll: publicProcedure
    .input(poiRoutesSchema.getAll)
    .query(
      async ({ ctx, input }) =>
        await ctx.locationQueries.getPOIsWithLocation(
          input.communeCode,
          input.provinceCode,
          input.regionCode,
          input.countryCode,
        ),
    ),

  get: publicProcedure
    .input(sharedSchema.entityId)
    .query(async ({ ctx, input }) => {
      const poi = await ctx.locationQueries.getPOI(input);
      if (!poi) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `POI not found: ${input}`,
        });
      }
      return poi;
    }),

  search: publicProcedure
    .input(poiRoutesSchema.searchPOI)
    .query(
      async ({ ctx, input }) =>
        await ctx.locationQueries.searchLocations(input),
    ),

  // Geographic queries
  getInBounds: publicProcedure
    .input(poiRoutesSchema.getInBounds)
    .query(
      async ({ ctx, input }) =>
        await ctx.locationQueries.getPOIsInBounds(input),
    ),

  getNearPoint: publicProcedure
    .input(poiRoutesSchema.getNearPoint)
    .query(
      async ({ ctx, input }) =>
        await ctx.locationQueries.getPOIsNearPoint(input),
    ),

  // CRUD operations
  create: publicProcedure
    .input(poiRoutesSchema.createPOI)
    .mutation(
      async ({ ctx, input }) => await ctx.locationCommands.createPOI(input),
    ),

  update: publicProcedure
    .input(poiRoutesSchema.updatePOI)
    .mutation(
      async ({ ctx, input }) =>
        await ctx.locationCommands.updatePOI(input.id, input.data),
    ),

  delete: publicProcedure
    .input(sharedSchema.entityId)
    .mutation(async ({ ctx, input }) => {
      await ctx.locationCommands.deletePOI(input);
      return { success: true };
    }),
});
