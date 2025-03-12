import { ActionGroup } from "@/ui/components/actions/ActionGroup";
import type { ActionConfig } from "@/ui/components/actions/types";
import type { Row, Table } from "@tanstack/react-table";

interface ActionsCellProps<TData> {
	actions: ActionConfig<TData>[];
	row: Row<TData>;
	table: Table<TData>;
}

export function ActionsCell<TData>({
	actions,
	row,
	table,
}: ActionsCellProps<TData>) {
	return (
		<ActionGroup
			actions={actions}
			context="row"
			data={row.original}
			table={table}
		/>
	);
}
