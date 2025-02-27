import type {
	NewRepositoryList,
	NewRepositoryListItem,
	RepositoryListItem,
} from "@/domain/models/repository-list";
import type { RepositoryListCommandsPort } from "@/domain/ports/repository-list/commands";
import { repositoryListItems, repositoryLists } from "@/shared/schema";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "../../db";

export class RepositoryListCommandsAdapter
	implements RepositoryListCommandsPort
{
	private readonly itemConditions = {
		byListAndRepositoryId: (listId: number, repoId: number) =>
			and(
				eq(repositoryListItems.listId, listId),
				eq(repositoryListItems.repositoryId, repoId),
			),
		byListAndFullName: (listId: number, fullName: string) =>
			and(
				eq(repositoryListItems.listId, listId),
				eq(repositoryListItems.fullName, fullName),
			),
	};

	/**
	 * Creates a new repository list
	 * @param data - Repository list data to insert
	 * @returns The created repository list
	 */
	async create(data: NewRepositoryList) {
		const [created] = await db.insert(repositoryLists).values(data).returning();
		return created;
	}

	async delete(listId: number) {
		const [deleted] = await db
			.delete(repositoryLists)
			.where(eq(repositoryLists.id, listId))
			.returning();

		return deleted;
	}

	async createItem(data: NewRepositoryListItem) {
		await db.insert(repositoryListItems).values(data);
	}

	async updateItem(listId: number, fullName: string, data: RepositoryListItem) {
		await db
			.update(repositoryListItems)
			.set(data)
			.where(this.itemConditions.byListAndFullName(listId, fullName));
	}

	async removeItem(listId: number, fullName: string) {
		await db
			.delete(repositoryListItems)
			.where(this.itemConditions.byListAndFullName(listId, fullName));
	}

	/**
	 * Remove multiple items from a list
	 */
	async removeItems(listId: number, repositoryNames: string[]) {
		await db
			.delete(repositoryListItems)
			.where(
				and(
					eq(repositoryListItems.listId, listId),
					inArray(repositoryListItems.fullName, repositoryNames),
				),
			);
	}

	/**
	 * Update list details
	 */
	async update(listId: number, updates: Partial<NewRepositoryList>) {
		// Use transaction to ensure data consistency
		return await db.transaction(async (tx) => {
			// Verify list exists before update
			const existing = await tx
				.select()
				.from(repositoryLists)
				.where(eq(repositoryLists.id, listId))
				.get();

			if (!existing) {
				throw new Error(`List ${listId} not found`);
			}

			// Perform update
			const [updated] = await tx
				.update(repositoryLists)
				.set({
					...updates,
					// Always update the timestamp
					metadata: {
						...(updates.metadata || {}),
						updatedAt: new Date(),
					},
				})
				.where(eq(repositoryLists.id, listId))
				.returning();

			return updated;
		});
	}
}
