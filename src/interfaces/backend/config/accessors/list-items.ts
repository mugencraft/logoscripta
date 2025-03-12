import type {
	ListItemExtended,
	RepositoryExtended,
} from "@/interfaces/server-client";

export const getListItems = (row: RepositoryExtended) => {
	return (
		row.repositoryListItems?.map((item: ListItemExtended) => ({
			id: item.listId,
			name: item.list.name,
		})) ?? undefined
	);
};
