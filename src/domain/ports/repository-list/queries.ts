import type {
	RepositoryList,
	RepositoryListItem,
} from "../../models/repository-list";

export interface RepositoryListQueriesPort {
	findAll(): Promise<RepositoryList[]>;
	findById(id: number): Promise<RepositoryList | undefined>;
	findBySourceType(sourceType: string): Promise<RepositoryList | undefined>;
	findItem(
		listId: number,
		fullName: string,
	): Promise<RepositoryListItem | undefined>;
	findItems(
		listIds?: number[],
		fullNames?: string[],
	): Promise<RepositoryListItem[]>;
	findItemsByMetadataType(
		listId: number,
		metadataType: string,
	): Promise<RepositoryListItem[]>;
	findItemsWithRepository(listId: number): Promise<RepositoryListItem[]>;
	getItemCount(listId: number): Promise<number>;
}
