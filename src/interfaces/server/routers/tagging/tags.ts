import type { RelationshipType } from "@/domain/models/tagging/types";
import { sharedSchema } from "@/domain/validation/shared";
import { tagRoutesSchema } from "@/domain/validation/tagging/tag";

import { publicProcedure, router } from "../../trpc";

export const taggingTagRouter = router({
  getAll: publicProcedure.query(
    async ({ ctx }) => await ctx.taggingQueries.getAllTags(),
  ),

  findByName: publicProcedure
    .input(tagRoutesSchema.findTagByName)
    .query(
      async ({ ctx, input }) =>
        await ctx.taggingQueries.findTagByName(input.systemId, input.name),
    ),

  create: publicProcedure
    .input(tagRoutesSchema.createTag)
    .mutation(
      async ({ ctx, input }) => await ctx.taggingCommands.createTag(input),
    ),

  update: publicProcedure
    .input(tagRoutesSchema.updateTag)
    .mutation(
      async ({ ctx, input }) =>
        await ctx.taggingCommands.updateTag(input.id, input.data),
    ),

  delete: publicProcedure
    .input(sharedSchema.entityId)
    .mutation(async ({ ctx, input: tagId }) => {
      await ctx.taggingCommands.deleteTag(tagId);
      return { success: true };
    }),

  search: publicProcedure
    .input(tagRoutesSchema.searchTags)
    .query(
      async ({ ctx, input }) => await ctx.taggingQueries.searchTags(input),
    ),

  bulkCreate: publicProcedure
    .input(tagRoutesSchema.bulkCreateTags)
    .mutation(
      async ({ ctx, input }) =>
        await ctx.taggingCommands.bulkCreateTags(
          input.systemId,
          input.categoryId,
          input.tags,
        ),
    ),

  // ============= TAG RELATIONSHIP =============

  getWithRelationships: publicProcedure
    .input(sharedSchema.entityId)
    .query(
      async ({ ctx, input: tagId }) =>
        await ctx.taggingQueries.findTagById(tagId),
    ),

  getRelationships: publicProcedure
    .input(sharedSchema.entityId)
    .query(
      async ({ ctx, input: tagId }) =>
        await ctx.taggingQueries.getRelationships(tagId),
    ),

  createRelationship: publicProcedure
    .input(tagRoutesSchema.createRelationship)
    .mutation(
      async ({ ctx, input }) =>
        await ctx.taggingCommands.createRelationship(input),
    ),

  deleteRelationship: publicProcedure
    .input(tagRoutesSchema.deleteRelationship)
    .mutation(async ({ ctx, input }) => {
      await ctx.taggingCommands.deleteRelationship(
        input.sourceTagId,
        input.targetTagId,
        input.relationshipType as RelationshipType,
      );
      return { success: true };
    }),

  // ============= TAG CATEGORY ASSOCIATIONS =============

  getAssociationsForTag: publicProcedure
    .input(sharedSchema.entityId)
    .query(
      async ({ ctx, input: tagId }) =>
        await ctx.taggingQueries.getAssociationsForTag(tagId),
    ),

  createAssociation: publicProcedure
    .input(tagRoutesSchema.createAssociation)
    .mutation(
      async ({ ctx, input }) =>
        await ctx.taggingCommands.createTagCategoryAssociation(input),
    ),

  deleteAssociation: publicProcedure
    .input(tagRoutesSchema.deleteAssociation)
    .mutation(
      async ({ ctx, input }) =>
        await ctx.taggingCommands.deleteTagCategoryAssociation(
          input.tagId,
          input.categoryId,
        ),
    ),
});
