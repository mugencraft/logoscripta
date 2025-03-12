import { ActionGroup } from "@/ui/components/actions/ActionGroup";
import type { ActionConfig } from "@/ui/components/actions/types";
import type { Row, Table } from "@tanstack/react-table";

interface ActionButtonsProps<TData> {
	actions: ActionConfig<TData>[];
	selectedRows: Row<TData>[];
	table: Table<TData>;
}

export const ActionButtons = <TData,>({
	actions,
	selectedRows,
	table,
}: ActionButtonsProps<TData>) => {
	const selected = selectedRows.map((row) => row.original);

	const handleActionComplete = () => {
		table.toggleAllRowsSelected(false);
	};

	return (
		<ActionGroup
			actions={actions}
			context="selection"
			selected={selected}
			table={table}
			onActionComplete={handleActionComplete}
		/>
	);
};
