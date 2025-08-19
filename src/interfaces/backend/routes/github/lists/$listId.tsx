import { createFileRoute } from "@tanstack/react-router";

import type { RepositoryList } from "@/domain/models/github/repository-list";
import { isSystemListType } from "@/domain/models/github/types";
import { trpcBase } from "@/interfaces/server-client";

import { RouteErrorComponent } from "@/ui/components/extra/errors";

import { ListView } from "../../../views/github/ListView";

export const Route = createFileRoute("/github/lists/$listId")({
  loader: async ({ params }) => {
    const list = await getList(params.listId);
    const items = await trpcBase.list.findItemsByListWithRelations.query(
      list.id,
    );

    return { list, items };
  },
  component: ListView,
  errorComponent: RouteErrorComponent,
});

const getList = async (sourceType: string) => {
  let list: RepositoryList | undefined;
  if (isSystemListType(sourceType)) {
    list = await trpcBase.list.getSystemList.query(sourceType);
    if (!list) throw new Error(`System list not found: ${sourceType}`);
  } else {
    // Otherwise treat as custom list ID
    const listId = Number.parseInt(sourceType, 10);
    if (Number.isNaN(listId)) throw new Error("Invalid list ID");

    list = await trpcBase.list.getById.query(listId);
    if (!list) throw new Error(`List ${listId} not found`);
  }
  return list;
};
