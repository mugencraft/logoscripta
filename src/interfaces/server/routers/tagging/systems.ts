import { sharedSchema } from "@/domain/validation/shared";
import { tagSystemRoutesSchema } from "@/domain/validation/tagging/system";

import { publicProcedure, router } from "../../trpc";

export const taggingSystemRouter = router({
  getAll: publicProcedure.query(
    async ({ ctx }) => await ctx.taggingQueries.getAllSystems(),
  ),

  getStructure: publicProcedure
    .input(sharedSchema.entityId)
    .query(
      async ({ ctx, input }) =>
        await ctx.taggingQueries.getSystemWithStructure(input),
    ),

  create: publicProcedure
    .input(tagSystemRoutesSchema.createSystem)
    .mutation(
      async ({ ctx, input }) => await ctx.taggingCommands.createSystem(input),
    ),

  update: publicProcedure
    .input(tagSystemRoutesSchema.updateSystem)
    .mutation(
      async ({ ctx, input }) =>
        await ctx.taggingCommands.updateSystem(input.id, input.data),
    ),

  delete: publicProcedure
    .input(sharedSchema.entityId)
    .mutation(async ({ ctx, input }) => {
      await ctx.taggingCommands.deleteSystem(input);
      return { success: true };
    }),

  getStatistics: publicProcedure
    .input(sharedSchema.entityId)
    .query(
      async ({ ctx, input }) =>
        await ctx.taggingQueries.getTagStatistics(input),
    ),

  // ============= TAG VALIDATION =============

  validateTagSelection: publicProcedure
    .input(tagSystemRoutesSchema.validateTagSelection)
    .query(
      async ({ ctx, input }) =>
        await ctx.tagValidationService.validateTagSelection(
          input.selectedTagIds,
          input.systemId,
        ),
    ),

  validateSystemIntegrity: publicProcedure
    .input(sharedSchema.entityId)
    .query(
      async ({ ctx, input }) =>
        await ctx.tagValidationService.validateSystemIntegrity(input),
    ),
});
