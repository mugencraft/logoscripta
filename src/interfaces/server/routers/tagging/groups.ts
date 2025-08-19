import { sharedSchema } from "@/domain/validation/shared";
import { tagGroupRoutesSchema } from "@/domain/validation/tagging/group";

import { publicProcedure, router } from "../../trpc";

export const taggingGroupRouter = router({
  getAll: publicProcedure.query(
    async ({ ctx }) => await ctx.taggingQueries.getAllGroups(),
  ),
  create: publicProcedure
    .input(tagGroupRoutesSchema.createGroup)
    .mutation(
      async ({ ctx, input }) => await ctx.taggingCommands.createGroup(input),
    ),

  update: publicProcedure
    .input(tagGroupRoutesSchema.updateGroup)
    .mutation(
      async ({ ctx, input }) =>
        await ctx.taggingCommands.updateGroup(input.id, input.data),
    ),

  delete: publicProcedure
    .input(sharedSchema.entityId)
    .mutation(async ({ ctx, input: groupId }) => {
      await ctx.taggingCommands.deleteGroup(groupId);
      return { success: true };
    }),

  getWithCategories: publicProcedure
    .input(sharedSchema.entityId)
    .query(
      async ({ ctx, input: groupId }) =>
        await ctx.taggingQueries.getGroupWithCategories(groupId),
    ),
});
