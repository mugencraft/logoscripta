import { useEffect, useState } from "react";

import type { Tag } from "@/domain/models/tagging/tag";
import type { TagWithStats } from "@/domain/models/tagging/types";

import { ViewContainer } from "@/ui/components/layout/ViewContainer";
import { DataTable } from "@/ui/components/table/DataTable";

import { getTagsActions } from "../../actions/tagging/buttons/tags";
import { Route } from "../../routes/tagging/tags";
import { getTagsTable } from "../../tables/columns/tagging/tags";
import { useDataTable } from "../../tables/useDataTable";

export function TagsView() {
  const data = Route.useLoaderData() || [];
  const [isLoading, setIsLoading] = useState(true);

  const actions = getTagsActions();

  const dataTable = useDataTable<Tag, TagWithStats>({
    data,
    config: getTagsTable(actions),
    tableId: "tags-table",
  });

  useEffect(() => {
    if (data) {
      setIsLoading(false);
    }
  }, [data]);

  return (
    <ViewContainer
      title={"Tags"}
      description="Manage individual tags within this category"
      actions={actions}
      selected={data}
    >
      <div className="space-y-4">
        {/* Table */}
        {isLoading ? "Loading..." : <DataTable {...dataTable} />}
      </div>
    </ViewContainer>
  );
}
