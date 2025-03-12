import _ from "lodash";
import { useMemo } from "react";
import { GlobalFilter } from "../filters/GlobalFilter";
import type { DataTableProps } from "../types";
import { SelectionControl } from "./SelectionControl";
import { FiltersActive } from "./filters/FiltersActive";
import { FiltersControl } from "./filters/FiltersControl";
import { Pagination } from "./pagination/Pagination";
import { PaginationInfo } from "./pagination/PaginationInfo";

export function TableControls<TData>({ table, config }: DataTableProps<TData>) {
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
