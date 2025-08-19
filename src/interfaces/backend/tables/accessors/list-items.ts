import type { RepositoryExtended } from "@/domain/models/github/types";

export const getListItems = (row: RepositoryExtended) => {
  return (
    row.repositoryListItems?.map((item) => ({
      id: item.listId,
      name: item.list.name,
    })) ?? undefined
  );
};
