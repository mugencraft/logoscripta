import { useEffect, useState } from "react";

import type { ContentCollection } from "@/domain/models/content/collection";
import type { ContentCollectionWithStats } from "@/domain/models/content/types";

import { ViewContainer } from "@/ui/components/layout/ViewContainer";
import { DataTable } from "@/ui/components/table/DataTable";

import { getCollectionsActions } from "../../../actions/content/buttons/collections";
import { Route } from "../../../routes/content/collections";
import { getCollectionsTable } from "../../../tables/columns/content/collections";
import { useDataTable } from "../../../tables/useDataTable";

export function CollectionsView() {
  const data = Route.useLoaderData() || [];
  const [isLoading, setIsLoading] = useState(true);

  const actions = getCollectionsActions();

  const dataTable = useDataTable<ContentCollection, ContentCollectionWithStats>(
    {
      data,
      config: getCollectionsTable(actions),
      tableId: "lists-table",
    },
  );

  useEffect(() => {
    if (data) {
      setIsLoading(false);
    }
  }, [data]);

  return (
    <ViewContainer
      title="All Collections"
      description="Manage collections"
      actions={actions}
    >
      {isLoading ? "Loading..." : <DataTable {...dataTable} />}
    </ViewContainer>
  );
}
