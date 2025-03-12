import type { Owner } from "@/interfaces/server-client";
import { ViewContainer } from "@/ui/components/layout/ViewContainer";
import { DataTable } from "@/ui/components/table/DataTable";
import { ownersConfig } from "../config/columns/owners";
import { useDataTable } from "../hooks/useDataTable";
import { Route } from "../routes/owners";

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
