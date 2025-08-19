import { TRPCError } from "@trpc/server";

import { repositoryListsRoutesSchema } from "@/domain/validation/github/repository-list";
import { sharedSchema } from "@/domain/validation/shared";

import { publicProcedure, router } from "../../trpc";

export const listRouter = router({
  findAllWithItems: publicProcedure.query(
    async ({ ctx }) => await ctx.listQueries.getAll(),
  ),

  getSystemList: publicProcedure
    .input(repositoryListsRoutesSchema.getSystemList)
    .query(async ({ ctx, input }) => {
      const list = await ctx.listQueries.findBySourceType(input);
      if (!list) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `System list not found: ${input}`,
        });
      }
      return list;
    }),

  getById: publicProcedure
    .input(sharedSchema.entityId)
    .query(async ({ ctx, input }) => {
      const list = await ctx.listQueries.findById(input);
      if (!list) {
        throw new Error(`List ${input} not found`);
      }

      return list;
    }),

  findItemsByListWithRelations: publicProcedure
    .input(sharedSchema.entityId)
    .query(
      async ({ ctx, input }) =>
        await ctx.listQueries.findItemsByListWithRelations(input),
    ),

  create: publicProcedure
    .input(repositoryListsRoutesSchema.create)
    .mutation(async ({ ctx, input }) => await ctx.listService.create(input)),

  delete: publicProcedure
    .input(sharedSchema.entityId)
    .mutation(async ({ ctx, input }) => await ctx.listService.delete(input)),

  update: publicProcedure
    .input(repositoryListsRoutesSchema.update)
    .mutation(
      async ({ ctx, input }) =>
        await ctx.listService.update(input.id, input.data),
    ),

  saveToList: publicProcedure
    .input(repositoryListsRoutesSchema.saveToList)
    .mutation(
      async ({ ctx, input }) => await ctx.listService.saveToList(input),
    ),

  removeFromList: publicProcedure
    .input(repositoryListsRoutesSchema.removeFromList)
    .mutation(
      async ({ ctx, input }) =>
        await ctx.listService.removeFromList(input.listId, input.fullName),
    ),

  syncRepositoryData: publicProcedure
    .input(repositoryListsRoutesSchema.syncRepositoryData)
    .mutation(async ({ ctx, input }) =>
      ctx.listProcessor.syncRepositoryData(input),
    ),
});
