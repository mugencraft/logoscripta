import { cn } from "@/ui/utils";
import type { Table } from "@tanstack/react-table";
import type { SelectionConfiguration } from "../types";
import { ActionButtons } from "./ActionButtons";

interface SelectionControlProps<TData> {
	table: Table<TData>;
	totalRows: number;
	selection?: SelectionConfiguration<TData>;
}

export const SelectionControl = <TData,>({
	table,
	totalRows,
	selection,
}: SelectionControlProps<TData>) => {
	const selectedRows = table.getSelectedRowModel().rows;

	if (!selectedRows.length || !selection) return null;

	return (
		<div className="flex items-center gap-2">
			<span className="text-sm text-muted-foreground">
				<span
					className={cn(
						"text-sm",
						selectedRows.length ? "" : "text-muted-foreground/50",
					)}
				>
					<span className={selectedRows.length ? "text-primary font-bold" : ""}>
						{selectedRows.length}
					</span>{" "}
					of {totalRows} selected
				</span>
			</span>
			<div className="flex items-center gap-2">
				<ActionButtons
					actions={selection.actions}
					selectedRows={selectedRows}
					table={table}
				/>
			</div>
		</div>
	);
};
