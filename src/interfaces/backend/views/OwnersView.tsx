import { ownersConfig } from "@/interfaces/backend/config/columns/owners";
import { useDataTable } from "@/interfaces/backend/hooks/useDataTable";
import { Route } from "@/interfaces/backend/routes/owners";
import type { Owner } from "@/interfaces/server-client";
import { ViewContainer } from "@/ui/components/layout/ViewContainer";
import { DataTable } from "@/ui/components/table/DataTable";

export function OwnersView() {
	const owners = Route.useLoaderData();

	const dataTable = useDataTable<Owner>({
		data: owners,
		config: ownersConfig,
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
