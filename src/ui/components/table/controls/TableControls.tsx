import { FiltersActive } from "@/ui/components/table/controls/FiltersActive";
import { FiltersControl } from "@/ui/components/table/controls/FiltersControl";
import { Pagination } from "@/ui/components/table/controls/Pagination";
import { PaginationInfo } from "@/ui/components/table/controls/PaginationInfo";
import { SelectionControl } from "@/ui/components/table/controls/SelectionControl";
import { GlobalFilter } from "@/ui/components/table/filters/GlobalFilter";
import type { DataTableProps } from "@/ui/components/table/types";
import _ from "lodash";
import { useMemo } from "react";

export function TableControls<TData, T = string | number>({
	table,
	config,
}: DataTableProps<TData, T>) {
	const { enableGlobalFilter, enableColumnFilters } = config.features || {};
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const filteredModel = useMemo(
		() => table.getFilteredRowModel(),
		[table.getState().columnFilters, table.getState().globalFilter],
	);

	const totalRows = useMemo(() => filteredModel.rows.length, [filteredModel]);

	const activeFilters = table.getState().columnFilters;

	return (
		<div className="border shadow-sm mb-4 bg-mono-100">
			{/* Top Controls */}
			<div className="flex items-center space-x-2 flex-1 p-2 border-b">
				<GlobalFilter table={table} enabled={enableGlobalFilter} />
				<FiltersControl
					table={table}
					enabled={enableColumnFilters}
					totalRows={totalRows}
				/>
				<FiltersActive table={table} activeFilters={activeFilters} />
			</div>

			<div className="flex items-center justify-between px-2 py-2 bg-mono-50">
				<div className="flex items-center space-x-2">
					<PaginationInfo table={table} />
					<SelectionControl
						table={table}
						selection={config.selection}
						totalRows={totalRows}
					/>
				</div>
				<Pagination table={table} config={config} />
			</div>
		</div>
	);
}
