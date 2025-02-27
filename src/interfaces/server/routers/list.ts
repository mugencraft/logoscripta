import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "../trpc";
import { repositoryListsValidation } from "./validators";

export const listRouter = router({
	getAll: publicProcedure.query(
		async ({ ctx }) => await ctx.listQueries.findAll(),
	),

	getSystemList: publicProcedure
		.input(repositoryListsValidation.getSystemList)
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
		.input(repositoryListsValidation.getById)
		.query(async ({ ctx, input: listId }) => {
			const list = await ctx.listQueries.findById(listId);
			if (!list) {
				throw new Error(`List ${listId} not found`);
			}

			return list;
		}),

	getItems: publicProcedure
		.input(repositoryListsValidation.getItems)
		.query(async ({ ctx, input }) => {
			return await ctx.listQueries.findItemsWithRepository(input);
		}),

	create: publicProcedure
		.input(repositoryListsValidation.create)
		.mutation(async ({ ctx, input }) => await ctx.listService.create(input)),

	delete: publicProcedure
		.input(repositoryListsValidation.delete)
		.mutation(async ({ ctx, input }) => await ctx.listService.delete(input)),

	update: publicProcedure
		.input(repositoryListsValidation.update)
		.mutation(async ({ ctx, input }) => {
			const { listId, data } = input;
			return await ctx.listService.update(listId, data);
		}),

	saveToList: publicProcedure
		.input(repositoryListsValidation.saveToList)
		.mutation(async ({ ctx, input }) => {
			const { data } = input;
			return await ctx.listService.saveToList(data);
		}),

	removeFromList: publicProcedure
		.input(repositoryListsValidation.removeFromList)
		.mutation(async ({ ctx, input }) => {
			const { listId, fullName } = input;
			return await ctx.listService.removeFromList(listId, fullName);
		}),

	syncRepositoryData: publicProcedure
		.input(repositoryListsValidation.syncRepositoryData)
		.mutation(async ({ ctx, input }) => {
			return ctx.listProcessor.syncRepositoryData({
				listIds: input.listIds,
				fullNames: input.fullNames,
				skipIntegrateNew: input.skipIntegrateNew,
			});
		}),
});
