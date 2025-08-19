import type { OwnerWithRepositories } from "@/domain/models/github/types";

import { ViewContainer } from "@/ui/components/layout/ViewContainer";
import { DataTable } from "@/ui/components/table/DataTable";

import { Route } from "../../routes/github/owners";
import { getOwnersTable } from "../../tables/columns/github/owners";
import { useDataTable } from "../../tables/useDataTable";

export function OwnersView() {
  const owners = Route.useLoaderData();

  const dataTable = useDataTable<OwnerWithRepositories>({
    data: owners,
    config: getOwnersTable([]),
    tableId: "owners-table",
  });

  return (
    <ViewContainer
      title="Repository Owners"
      description="View and manage repository owners and organizations"
    >
      <DataTable {...dataTable} />
    </ViewContainer>
  );
}
