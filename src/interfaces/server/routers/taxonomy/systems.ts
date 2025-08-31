import { TRPCError } from "@trpc/server";

import { sharedSchema } from "@/domain/validation/shared";
import { taxonomySystemRoutesSchema } from "@/domain/validation/taxonomy/system";

import { publicProcedure, router } from "../../trpc";

export const taxonomySystemRouter = router({
  getAll: publicProcedure.query(
    async ({ ctx }) => await ctx.taxonomyQueries.getAllSystems(),
  ),

  getById: publicProcedure
    .input(sharedSchema.entityId)
    .query(async ({ ctx, input }) => {
      const system = await ctx.taxonomyQueries.getSystemById(input);
      if (!system) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Taxonomy system not found: ${input}`,
        });
      }
      return system;
    }),

  create: publicProcedure
    .input(taxonomySystemRoutesSchema.createSystem)
    .mutation(
      async ({ ctx, input }) => await ctx.taxonomyCommands.createSystem(input),
    ),

  update: publicProcedure
    .input(taxonomySystemRoutesSchema.updateSystem)
    .mutation(
      async ({ ctx, input }) =>
        await ctx.taxonomyCommands.updateSystem(input.id, input.data),
    ),

  delete: publicProcedure
    .input(sharedSchema.entityId)
    .mutation(async ({ ctx, input }) => {
      await ctx.taxonomyCommands.deleteSystem(input);
      return { success: true };
    }),

  getStatistics: publicProcedure
    .input(sharedSchema.entityId)
    .query(
      async ({ ctx, input }) =>
        await ctx.taxonomyQueries.getSystemStatistics(input),
    ),
});
