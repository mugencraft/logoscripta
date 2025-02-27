import { ActionButtons } from "@/ui/components/table/controls/ActionButtons";
import type { SelectionConfiguration } from "@/ui/components/table/types";
import { cn } from "@/ui/utils";
import type { Table } from "@tanstack/react-table";

interface SelectionControlProps<TData, T> {
	table: Table<TData>;
	totalRows: number;
	selection?: SelectionConfiguration<TData, T>;
}

export const SelectionControl = <TData, T>({
	table,
	totalRows,
	selection,
}: SelectionControlProps<TData, T>) => {
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
					table={table}
					selection={selection}
					selectedRows={selectedRows}
				/>
			</div>
		</div>
	);
};
