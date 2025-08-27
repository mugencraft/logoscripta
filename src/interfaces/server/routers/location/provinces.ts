import { TRPCError } from "@trpc/server";

import { provinceRoutesSchema } from "@/domain/validation/location/province";

import { publicProcedure, router } from "../../trpc";

export const locationProvincesRouter = router({
  getAll: publicProcedure.query(
    async ({ ctx }) => await ctx.locationQueries.getAllProvinces(),
  ),

  getAllWithStats: publicProcedure
    .input(provinceRoutesSchema.getAllWithStats)
    .query(
      async ({ ctx, input }) =>
        await ctx.locationQueries.getProvincesWithStats(
          input.regionCode,
          input.countryCode,
        ),
    ),

  get: publicProcedure
    .input(provinceRoutesSchema.get)
    .query(async ({ ctx, input }) => {
      const province = await ctx.locationQueries.getProvinceWithCommunes(input);
      if (!province) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Province not found: ${input}`,
        });
      }
      return province;
    }),

  // Provinces are read-only - managed through sync
  // No create/update/delete endpoints
});
