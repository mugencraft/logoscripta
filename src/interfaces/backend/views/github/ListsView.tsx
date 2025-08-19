import { useEffect, useState } from "react";

import type { RepositoryList } from "@/domain/models/github/repository-list";
import type { RepositoryListWithItems } from "@/domain/models/github/types";

import { ViewContainer } from "@/ui/components/layout/ViewContainer";
import { DataTable } from "@/ui/components/table/DataTable";

import { getListsActions } from "../../actions/github/buttons/lists";
import { Route } from "../../routes/github/lists";
import { getListsTable } from "../../tables/columns/github/lists";
import { useDataTable } from "../../tables/useDataTable";

export function ListsView() {
  const lists = Route.useLoaderData();
  const data = lists || [];
  const [isLoading, setIsLoading] = useState(true);

  const actions = getListsActions();

  const dataTable = useDataTable<RepositoryList, RepositoryListWithItems>({
    data,
    config: getListsTable(actions),
    tableId: "lists-table",
  });

  useEffect(() => {
    if (lists) {
      setIsLoading(false);
    }
  }, [lists]);

  return (
    <ViewContainer
      title="All Lists"
      description="Manage your custom and system lists"
      actions={actions}
    >
      {isLoading ? "Loading..." : <DataTable {...dataTable} />}
    </ViewContainer>
  );
}
