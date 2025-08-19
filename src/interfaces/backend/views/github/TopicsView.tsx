import type { TopicWithCount } from "@/domain/models/github/types";

import { ViewContainer } from "@/ui/components/layout/ViewContainer";
import { DataTable } from "@/ui/components/table/DataTable";

import { Route } from "../../routes/github/topics";
import { getTopicsTable } from "../../tables/columns/github/topics";
import { useDataTable } from "../../tables/useDataTable";

export function TopicsView() {
  const topics = Route.useLoaderData();

  const dataTable = useDataTable<TopicWithCount>({
    data: topics,
    config: getTopicsTable([]),
    tableId: "topics-table",
  });

  return (
    <ViewContainer
      title="Repository Topics"
      description="View and analyze repository topics and their usage"
    >
      <DataTable {...dataTable} />
    </ViewContainer>
  );
}
