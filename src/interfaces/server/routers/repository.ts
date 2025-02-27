import { publicProcedure, router } from "../trpc";
import { repositoryValidation } from "./validators";

export const repositoryRouter = router({
	getAll: publicProcedure.query(
		async ({ ctx }) =>
			await ctx.repositoriesQueries.getAll({
				owner: true,
				repositoryListItems: {
					with: {
						list: {
							columns: {
								id: true,
								name: true,
								sourceType: true,
							},
						},
					},
				},
			}),
	),

	getById: publicProcedure
		.input(repositoryValidation.getById)
		.query(
			async ({ input, ctx }) => await ctx.repositoriesQueries.findById(input),
		),

	search: publicProcedure
		.input(repositoryValidation.search)
		.query(
			async ({ input, ctx }) => await ctx.repositoriesQueries.search(input),
		),

	// Owner routes
	getAllOwners: publicProcedure.query(
		async ({ ctx }) => await ctx.repositoriesQueries.getAllOwners(),
	),

	getOwnerById: publicProcedure
		.input(repositoryValidation.getById)
		.query(
			async ({ ctx, input }) =>
				await ctx.repositoriesQueries.getOwnerById(input),
		),

	// Topic routes
	getAllTopics: publicProcedure.query(
		async ({ ctx }) => await ctx.repositoriesQueries.getAllTopics(),
	),

	getTopicRepositories: publicProcedure
		.input(repositoryValidation.getById)
		.query(
			async ({ ctx, input }) =>
				await ctx.repositoriesQueries.getTopicRepositories(input),
		),

	save: publicProcedure
		.input(repositoryValidation.save)
		.mutation(async ({ ctx, input }) => {
			return ctx.githubProcessor.saveRepository(input);
		}),
});
