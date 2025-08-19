import { TRPCError } from "@trpc/server";

import { contentCollectionsRoutesSchema } from "@/domain/validation/content/collection";
// import type { ContentCollectionWithItems } from "@/domain/models/content/types";
import { sharedSchema } from "@/domain/validation/shared";

import { publicProcedure, router } from "../../trpc";

export const contentCollectionRouter = router({
  get: publicProcedure
    .input(sharedSchema.entityId)
    .query(async ({ ctx, input }) => {
      const collection = await ctx.contentQueries.getCollection(input);

      if (!collection) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Collection not found: ${input}`,
        });
      }

      return collection;
    }),
  getAll: publicProcedure.query(
    async ({ ctx }) => await ctx.contentQueries.getAllCollections(),
  ),

  getWithItems: publicProcedure
    .input(sharedSchema.entityId)
    .query(async ({ ctx, input }) => {
      const collection = await ctx.contentQueries.getCollection(input);

      if (!collection) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Collection not found: ${input}`,
        });
      }

      return collection;
    }),

  getItems: publicProcedure
    .input(sharedSchema.entityId)
    .query(
      async ({ ctx, input: collectionId }) =>
        await ctx.contentQueries.getItemsForCollection(collectionId),
    ),

  create: publicProcedure
    .input(contentCollectionsRoutesSchema.createCollection)
    .mutation(
      async ({ ctx, input }) =>
        await ctx.contentCommands.createCollection(input),
    ),

  update: publicProcedure
    .input(contentCollectionsRoutesSchema.updateCollection)
    .mutation(
      async ({ ctx, input }) =>
        await ctx.contentCommands.updateCollection(input.id, input.data),
    ),

  delete: publicProcedure
    .input(sharedSchema.entityId)
    .mutation(async ({ ctx, input: collectionId }) => {
      await ctx.contentCommands.deleteCollection(collectionId);
      return { success: true };
    }),

  getOverallStats: publicProcedure.query(
    async ({ ctx }) => await ctx.contentQueries.getOverallStatistics(),
  ),

  getAnalysis: publicProcedure
    .input(sharedSchema.entityId)
    .query(
      async ({ ctx, input: collectionId }) =>
        await ctx.contentQueries.getCollectionStatistics(collectionId),
    ),
});
