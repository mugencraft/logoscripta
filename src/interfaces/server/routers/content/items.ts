import { contentItemsRoutesSchema } from "@/domain/validation/content/item";
import { contentItemsTaggingRoutesSchema } from "@/domain/validation/content/item-tag";
import { sharedSchema } from "@/domain/validation/shared";

import { publicProcedure, router } from "../../trpc";

export const contentItemRouter = router({
  get: publicProcedure
    .input(sharedSchema.entityId)
    .query(
      async ({ ctx, input: itemId }) =>
        await ctx.contentQueries.getItem(itemId),
    ),
  getAll: publicProcedure.query(
    async ({ ctx }) => await ctx.contentQueries.getAllItems(),
  ),

  getForCollection: publicProcedure
    .input(sharedSchema.entityId)
    .query(
      async ({ ctx, input: collectionId }) =>
        await ctx.contentQueries.getItemsForCollection(collectionId),
    ),

  getNavigationIds: publicProcedure
    .input(sharedSchema.entityId.optional())
    .query(
      async ({ ctx, input: collectionId }) =>
        await ctx.contentQueries.getItemIdsForNavigation(collectionId),
    ),

  create: publicProcedure
    .input(contentItemsRoutesSchema.createItem)
    .mutation(
      async ({ ctx, input }) => await ctx.contentCommands.createItem(input),
    ),

  update: publicProcedure
    .input(contentItemsRoutesSchema.updateItem)
    .mutation(
      async ({ ctx, input }) =>
        await ctx.contentCommands.updateItem(input.id, input.data),
    ),

  delete: publicProcedure
    .input(sharedSchema.entityId)
    .mutation(async ({ ctx, input: itemId }) => {
      await ctx.contentCommands.deleteItem(itemId);
      return { success: true };
    }),

  getWithRelations: publicProcedure
    .input(sharedSchema.entityId)
    .query(
      async ({ ctx, input: itemId }) =>
        await ctx.contentQueries.getItemWithRelations(itemId),
    ),

  // ============= SEARCH AND FILTERING =============

  search: publicProcedure
    .input(contentItemsRoutesSchema.searchItems)
    .query(
      async ({ ctx, input }) => await ctx.contentQueries.searchItems(input),
    ),

  getByTags: publicProcedure
    .input(contentItemsRoutesSchema.getItemsByTags)
    .query(
      async ({ ctx, input }) =>
        await ctx.contentQueries.getItemsByTags(
          input.collectionId,
          input.tagIds,
        ),
    ),

  // ============= TAGGING OPERATIONS =============

  addTag: publicProcedure
    .input(contentItemsTaggingRoutesSchema.tagItem)
    .mutation(
      async ({ ctx, input }) => await ctx.contentCommands.tagItem(input),
    ),

  removeTag: publicProcedure
    .input(contentItemsTaggingRoutesSchema.removeTag)
    .mutation(
      async ({ ctx, input }) =>
        await ctx.contentCommands.removeTagFromItem(input.itemId, input.tagId),
    ),

  updateTag: publicProcedure
    .input(contentItemsTaggingRoutesSchema.updateItemTag)
    .mutation(async ({ ctx, input }) => {
      const { itemId, tagId, data } = input;
      return await ctx.contentCommands.updateItemTag(itemId, tagId, data);
    }),

  bulkTag: publicProcedure
    .input(contentItemsTaggingRoutesSchema.bulkTagItems)
    .mutation(async ({ ctx, input }) => {
      await ctx.contentCommands.bulkTagItems(input);
      return { success: true };
    }),

  bulkRemoveTag: publicProcedure
    .input(contentItemsTaggingRoutesSchema.bulkRemoveTag)
    .mutation(async ({ ctx, input }) => {
      await ctx.contentCommands.bulkRemoveTag(input.itemIds, input.tagId);
      return { success: true };
    }),
});
