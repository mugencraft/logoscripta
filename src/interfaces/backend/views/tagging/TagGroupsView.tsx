import { useEffect, useState } from "react";

import type { TagGroup } from "@/domain/models/tagging/group";
import type { TagGroupWithStats } from "@/domain/models/tagging/types";

import { ViewContainer } from "@/ui/components/layout/ViewContainer";
import { DataTable } from "@/ui/components/table/DataTable";

import { getTagGroupsActions } from "../../actions/tagging/buttons/groups";
import { Route } from "../../routes/tagging/groups";
import { getTagGroupsTable } from "../../tables/columns/tagging/groups";
import { useDataTable } from "../../tables/useDataTable";

export function TagGroupsView() {
  const data = Route.useLoaderData() || [];
  const [isLoading, setIsLoading] = useState(true);

  const actions = getTagGroupsActions();

  const dataTable = useDataTable<TagGroup, TagGroupWithStats>({
    data,
    config: getTagGroupsTable(actions),
    tableId: "tag-groups-table",
  });

  useEffect(() => {
    if (data) {
      setIsLoading(false);
    }
  }, [data]);

  return (
    <ViewContainer
      title={"Tag Groups"}
      description="Manage tag groups"
      actions={actions}
      selected={data}
    >
      {isLoading ? "Loading..." : <DataTable {...dataTable} />}
    </ViewContainer>
  );
}
