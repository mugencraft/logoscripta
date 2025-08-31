import { taxonomyAssignmentRoutesSchema } from "@/domain/validation/taxonomy/assignment";

import { publicProcedure, router } from "../../trpc";

export const taxonomyAssignmentRouter = router({
  getContentTopics: publicProcedure
    .input(taxonomyAssignmentRoutesSchema.getContentTopics)
    .query(
      async ({ ctx, input }) =>
        await ctx.taxonomyQueries.getContentTopics(
          input.contentId,
          input.systemId,
        ),
    ),

  assignTopic: publicProcedure
    .input(taxonomyAssignmentRoutesSchema.assignTopic)
    .mutation(
      async ({ ctx, input }) =>
        await ctx.taxonomyCommands.assignTopicToContent(input),
    ),

  unassignTopic: publicProcedure
    .input(taxonomyAssignmentRoutesSchema.unassignTopic)
    .mutation(
      async ({ ctx, input }) =>
        await ctx.taxonomyCommands.unassignTopicFromContent(
          input.contentId,
          input.topicId,
        ),
    ),

  bulkAssignTopics: publicProcedure
    .input(taxonomyAssignmentRoutesSchema.bulkAssignTopics)
    .mutation(
      async ({ ctx, input }) =>
        await ctx.taxonomyCommands.bulkAssignTopics(input),
    ),

  updateAssignment: publicProcedure
    .input(taxonomyAssignmentRoutesSchema.updateAssignment)
    .mutation(
      async ({ ctx, input }) =>
        await ctx.taxonomyCommands.updateTopicAssignment(
          input.contentId,
          input.topicId,
          input.data,
        ),
    ),
});
