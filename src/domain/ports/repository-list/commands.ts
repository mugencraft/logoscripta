import type {
	NewRepositoryList,
	NewRepositoryListItem,
	RepositoryList,
	RepositoryListItem,
} from "../../models/repository-list";

export interface RepositoryListCommandsPort {
	create(data: NewRepositoryList): Promise<RepositoryList | undefined>;
	update(
		listId: number,
		data: Partial<NewRepositoryList>,
	): Promise<RepositoryList | undefined>;
	delete(listId: number): Promise<RepositoryList | undefined>;
	createItem(data: NewRepositoryListItem): Promise<void>;
	updateItem(
		listId: number,
		fullName: string,
		data: RepositoryListItem,
	): Promise<void>;
	removeItem(listId: number, fullName: string): Promise<void>;
}
