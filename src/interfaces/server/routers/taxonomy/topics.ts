import { TRPCError } from "@trpc/server";

import { sharedSchema } from "@/domain/validation/shared";
import { taxonomyTopicRoutesSchema } from "@/domain/validation/taxonomy/topic";

import { publicProcedure, router } from "../../trpc";

export const taxonomyTopicRouter = router({
  getHierarchy: publicProcedure
    .input(sharedSchema.entityId)
    .query(
      async ({ ctx, input }) =>
        await ctx.taxonomyQueries.buildTopicHierarchy(input),
    ),

  getById: publicProcedure
    .input(sharedSchema.entityId)
    .query(async ({ ctx, input }) => {
      const topic = await ctx.taxonomyQueries.getTopicById(input);
      if (!topic) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Topic not found: ${input}`,
        });
      }
      return topic;
    }),

  getTopicWithChildren: publicProcedure
    .input(sharedSchema.entityId)
    .query(async ({ ctx, input }) => {
      const topic = await ctx.taxonomyQueries.getTopicWithChildren(input);
      if (!topic) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Topic with children not found: ${input}`,
        });
      }
      return topic;
    }),

  getWithHierarchy: publicProcedure
    .input(sharedSchema.entityId)
    .query(async ({ ctx, input }) => {
      const topic = await ctx.taxonomyQueries.getTopicWithHierarchy(input);
      if (!topic) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Topic with hierarchy not found: ${input}`,
        });
      }
      return topic;
    }),

  getPath: publicProcedure
    .input(sharedSchema.entityId)
    .query(
      async ({ ctx, input }) => await ctx.taxonomyQueries.getTopicPath(input),
    ),

  create: publicProcedure
    .input(taxonomyTopicRoutesSchema.createTopic)
    .mutation(
      async ({ ctx, input }) => await ctx.taxonomyCommands.createTopic(input),
    ),

  update: publicProcedure
    .input(taxonomyTopicRoutesSchema.updateTopic)
    .mutation(
      async ({ ctx, input }) =>
        await ctx.taxonomyCommands.updateTopic(input.id, input.data),
    ),

  moveTopic: publicProcedure
    .input(taxonomyTopicRoutesSchema.moveTopic)
    .mutation(
      async ({ ctx, input }) =>
        await ctx.taxonomyCommands.moveTopic(input.topicId, input.newParentId),
    ),

  delete: publicProcedure
    .input(sharedSchema.entityId)
    .mutation(async ({ ctx, input }) => {
      await ctx.taxonomyCommands.deleteTopic(input);
      return { success: true };
    }),
});
