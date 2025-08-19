import { useEffect, useState } from "react";

import type { TagSystem } from "@/domain/models/tagging/system";
import type { TagSystemWithStats } from "@/domain/models/tagging/types";

import { ViewContainer } from "@/ui/components/layout/ViewContainer";
import { DataTable } from "@/ui/components/table/DataTable";

import { getTagSystemActions } from "../../actions/tagging/buttons/systems";
import { Route } from "../../routes/tagging/systems";
import { getTagSystemsTable } from "../../tables/columns/tagging/systems";
import { useDataTable } from "../../tables/useDataTable";

export function TagSystemsView() {
  const data = Route.useLoaderData() || [];
  const [isLoading, setIsLoading] = useState(true);

  const actions = getTagSystemActions();

  const dataTable = useDataTable<TagSystem, TagSystemWithStats>({
    data,
    config: getTagSystemsTable(actions),
    tableId: "tag-systems-table",
  });

  useEffect(() => {
    if (data) {
      setIsLoading(false);
    }
  }, [data]);

  return (
    <ViewContainer
      title="Tag Systems"
      description="Manage tag systems and their hierarchies"
      actions={actions}
    >
      {isLoading ? "Loading..." : <DataTable {...dataTable} />}
    </ViewContainer>
  );
}
