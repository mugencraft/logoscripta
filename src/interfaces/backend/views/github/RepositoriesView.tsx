import { useEffect, useState } from "react";

import type { Repository } from "@/domain/models/github/repository";
import type { RepositoryExtended } from "@/domain/models/github/types";

import { ViewContainer } from "@/ui/components/layout/ViewContainer";
import { DataTable } from "@/ui/components/table/DataTable";

import { getRepositoryActions } from "../../actions/github/buttons/repositories";
import { Route } from "../../routes/github/repos";
import { getRepositoriesTable } from "../../tables/columns/github/repositories";
import { useDataTable } from "../../tables/useDataTable";

export const RepositoriesView = () => {
  const repositories = Route.useLoaderData() as RepositoryExtended[];
  const data = repositories || [];
  const [isLoading, setIsLoading] = useState(true);

  const actions = getRepositoryActions();

  const dataTable = useDataTable<Repository, RepositoryExtended>({
    data,
    config: getRepositoriesTable(actions),
    tableId: "repositories",
  });

  useEffect(() => {
    if (repositories) {
      setIsLoading(false);
    }
  }, [repositories]);

  return (
    <ViewContainer
      title="All Repositories"
      description="View and manage all tracked repositories"
      actions={actions}
    >
      {isLoading ? "Loading..." : <DataTable {...dataTable} />}
    </ViewContainer>
  );
};
