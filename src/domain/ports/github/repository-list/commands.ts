import type {
  NewRepositoryList,
  NewRepositoryListItem,
  RepositoryList,
  RepositoryListItem,
} from "../../../models/github/repository-list";

export interface RepositoryListCommandsPort {
  create(data: NewRepositoryList): Promise<RepositoryList | undefined>;
  delete(listId: number): Promise<RepositoryList | undefined>;
  createItem(
    data: NewRepositoryListItem,
  ): Promise<RepositoryListItem | undefined>;
  updateItem(
    listId: number,
    fullName: string,
    data: Partial<RepositoryListItem>,
  ): Promise<RepositoryListItem | undefined>;
  removeItem(
    listId: number,
    fullName: string,
  ): Promise<RepositoryListItem | undefined>;
  update(
    listId: number,
    data: Partial<RepositoryList>,
  ): Promise<RepositoryList | undefined>;
}
