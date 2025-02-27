import { topicsConfig } from "@/interfaces/backend/config/columns/topics";
import { useDataTable } from "@/interfaces/backend/hooks/useDataTable";
import { Route } from "@/interfaces/backend/routes/topics";
import type { Topic } from "@/interfaces/server-client";
import { ViewContainer } from "@/ui/components/layout/ViewContainer";
import { DataTable } from "@/ui/components/table/DataTable";

export function TopicsView() {
	const topics = Route.useLoaderData();

	const dataTable = useDataTable<Topic>({
		data: topics,
		config: topicsConfig,
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
