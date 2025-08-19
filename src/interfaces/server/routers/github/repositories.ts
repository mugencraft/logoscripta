import { repositoryRoutesSchema } from "@/domain/validation/github/repository";
import { sharedSchema } from "@/domain/validation/shared";

import { publicProcedure, router } from "../../trpc";

export const repositoryRouter = router({
  getAll: publicProcedure.query(
    async ({ ctx }) => await ctx.repositoriesQueries.getAllWithRelations(),
  ),

  getById: publicProcedure
    .input(sharedSchema.entityId)
    .query(
      async ({ input, ctx }) => await ctx.repositoriesQueries.findById(input),
    ),

  search: publicProcedure
    .input(repositoryRoutesSchema.search)
    .query(
      async ({ input, ctx }) => await ctx.repositoriesQueries.search(input),
    ),

  // Owner routes
  getAllOwnersWithRepositories: publicProcedure.query(
    async ({ ctx }) => await ctx.repositoriesQueries.getOwnersWithRelations(),
  ),

  getOwnerById: publicProcedure
    .input(sharedSchema.entityId)
    .query(
      async ({ ctx, input }) =>
        await ctx.repositoriesQueries.getOwnerById(input),
    ),

  // Topic routes
  getAllTopicsWithCount: publicProcedure.query(
    async ({ ctx }) => await ctx.repositoriesQueries.getAllTopicsWithCount(),
  ),

  getTopicWithRepositories: publicProcedure
    .input(sharedSchema.entityId)
    .query(
      async ({ ctx, input }) =>
        await ctx.repositoriesQueries.getTopicByIdWithRelations(input),
    ),

  getRepositoriesByOwner: publicProcedure
    .input(sharedSchema.entityId)
    .query(
      async ({ ctx, input }) =>
        await ctx.repositoriesQueries.getRepositoriesByOwnerId(input),
    ),

  getRepositoriesByTopic: publicProcedure
    .input(repositoryRoutesSchema.search)
    .query(
      async ({ ctx, input }) =>
        await ctx.repositoriesQueries.getRepositoriesByTopic(input),
    ),

  save: publicProcedure
    .input(repositoryRoutesSchema.save)
    .mutation(
      async ({ ctx, input }) => await ctx.githubProcessor.saveRepository(input),
    ),
});
