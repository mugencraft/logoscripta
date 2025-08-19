import { sharedSchema } from "@/domain/validation/shared";
import { taggingCategoryRoutesSchema } from "@/domain/validation/tagging/category";

import { publicProcedure, router } from "../../trpc";

export const taggingCategoryRouter = router({
  getAll: publicProcedure
    .input(sharedSchema.entityId.optional())
    .query(
      async ({ ctx, input }) =>
        await ctx.taggingQueries.getAllCategories(input),
    ),
  create: publicProcedure
    .input(taggingCategoryRoutesSchema.createCategory)
    .mutation(
      async ({ ctx, input }) => await ctx.taggingCommands.createCategory(input),
    ),

  update: publicProcedure
    .input(taggingCategoryRoutesSchema.updateCategory)
    .mutation(
      async ({ ctx, input }) =>
        await ctx.taggingCommands.updateCategory(input.id, input.data),
    ),

  delete: publicProcedure
    .input(sharedSchema.entityId)
    .mutation(async ({ ctx, input: categoryId }) => {
      await ctx.taggingCommands.deleteCategory(categoryId);
      return { success: true };
    }),

  getWithTags: publicProcedure
    .input(sharedSchema.entityId)
    .query(
      async ({ ctx, input: categoryId }) =>
        await ctx.taggingQueries.getCategoryWithTags(categoryId),
    ),
});
