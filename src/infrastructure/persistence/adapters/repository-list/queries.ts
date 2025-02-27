import type { RepositoryListItem } from "@/domain/models/repository-list";
import type { RepositoryListQueriesPort } from "@/domain/ports/repository-list/queries";
import type { ListItemMetadata } from "@/domain/value-objects/metadata/base";
import { repositoryListItems, repositoryLists } from "@/shared/schema";
import { type SQL, and, eq, inArray, sql } from "drizzle-orm";
import { db } from "../../db";

export class RepositoryListQueriesAdapter implements RepositoryListQueriesPort {
	private readonly listConditions = {
		byId: (id: number) => eq(repositoryLists.id, id),
		byIds: (ids: number[]) => inArray(repositoryLists.id, ids),
		bySourceType: (sourceType: string) =>
			eq(repositoryLists.sourceType, sourceType),
	};

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

	async findBySourceType(sourceType: string) {
		return await db.query.repositoryLists.findFirst({
			where: this.listConditions.bySourceType(sourceType),
		});
	}

	async findById(id: number) {
		return await db.query.repositoryLists.findFirst({
			where: this.listConditions.byId(id),
		});
	}

	async findByIds(ids: number[]) {
		return await db.query.repositoryLists.findMany({
			where: this.listConditions.byIds(ids),
		});
	}

	async findAll() {
		return await db.query.repositoryLists.findMany({
			with: {
				items: true,
			},
		});
	}

	async findItemByRepositoryId(listId: number, repositoryId: number) {
		return await db.query.repositoryListItems.findFirst({
			where: this.itemConditions.byListAndRepositoryId(listId, repositoryId),
		});
	}

	async findItem(listId: number, fullName: string) {
		return await db.query.repositoryListItems.findFirst({
			where: this.itemConditions.byListAndFullName(listId, fullName),
		});
	}

	async findItemsWithRepository(listId: number) {
		return await db.query.repositoryListItems.findMany({
			where: eq(repositoryListItems.listId, listId),
			with: {
				repository: true,
			},
		});
	}

	async findItems(listIds?: number[], fullNames?: string[]) {
		let where: SQL<unknown> | undefined;

		if (listIds?.length) {
			where = inArray(repositoryListItems.listId, listIds);
			if (fullNames) {
				where = and(where, inArray(repositoryListItems.fullName, fullNames));
			}
		} else if (fullNames) {
			where = inArray(repositoryListItems.fullName, fullNames);
		}

		return await db.query.repositoryListItems.findMany({
			where,
		});
	}

	async findItemsByMetadataType<T extends ListItemMetadata>(
		listId: number,
		metadataType: string,
	): Promise<RepositoryListItem[]> {
		const items = await this.findItemsWithRepository(listId);

		return items.filter((item) => {
			if (!item.metadata) return false;
			try {
				const metadata = JSON.parse(item.metadata as string) as T;
				return metadata.metadataTypes?.includes(metadataType);
			} catch (error) {
				return false;
			}
		});
	}

	/**
	 * Get total count of items in a list
	 */
	async getItemCount(listId: number): Promise<number> {
		const result = await db
			.select({ count: sql<number>`count(*)` })
			.from(repositoryListItems)
			.where(eq(repositoryListItems.listId, listId))
			.get();

		return result?.count ?? 0;
	}
}
