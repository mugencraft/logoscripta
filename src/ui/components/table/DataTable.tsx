import {
	Table,
	TableBody,
	TableCell,
	TableHeader,
	TableRow,
} from "@/ui/components/core/table";
import { ColumnVisibilityControl } from "@/ui/components/table/controls/ColumnVisibilityControl";
import { TableControls } from "@/ui/components/table/controls/TableControls";
import { ResizableHeader } from "@/ui/components/table/headers/ResizableHeader";
import { SelectableRow } from "@/ui/components/table/rows/SelectableRow";
import type { DataTableProps } from "@/ui/components/table/types";
import { cn } from "@/ui/utils";
import { flexRender } from "@tanstack/react-table";
import { memo, useMemo } from "react";

export function DataTable<TData, T>({
	table,
	config,
}: DataTableProps<TData, T>) {
	/**
	 * Instead of calling `column.getSize()` on every render for every header
	 * and especially every data cell (very expensive),
	 * we will calculate all column sizes at once at the root table level in a useMemo
	 * and pass the column sizes down as CSS variables to the <table> element.
	 */
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const columnSizeVars = useMemo(() => {
		const headers = table.getFlatHeaders();
		const colSizes: { [key: string]: number } = {};
		for (let i = 0; i < headers.length; i++) {
			// biome-ignore lint/style/noNonNullAssertion: <explanation>
			const header = headers[i]!;
			const size = header.getSize();
			colSizes[`--header-${header.id}-size`] = size;
			colSizes[`--col-${header.column.id}-size`] = size;
		}
		return colSizes;
	}, [table.getState().columnSizingInfo, table.getState().columnSizing]);

	const tableContainerStyle = cn(
		"relative overflow-auto border",
		"h-[calc(90vh-var(--table-controls-height))]",
	);

	const tableStyle = cn(
		// "relative",
		"w-full",
		// Handle border styles more specifically
		"[&_th]:border-r",
		"[&_th]:border-b",
		"[&_td]:border-r",
		"[&_td]:border-b",
		// First column group Header
		"[&_thead_tr_th:first-child]:sticky",
		"[&_thead_tr_th:first-child]:left-0",
		"[&_thead_tr_th:first-child]:z-40",
		"[&_thead_tr_th:first-child]:bg-muted",
		// First column body
		"[&_tbody_tr_td:first-child]:sticky",
		"[&_tbody_tr_td:first-child]:left-0",
		"[&_tbody_tr_td:first-child]:z-20",
		"[&_tbody_tr_td:first-child]:bg-inherit",
		// Second column group header
		"[&_thead:first-child_th:nth-child(2)]:sticky",
		"[&_thead:first-child_th:nth-child(2)]:left-[31px]",
		"[&_thead:first-child_th:nth-child(2)]:z-40",
		"[&_thead:first-child_th:nth-child(2)_span]:bg-muted",
		// Third column header
		"[&_thead_tr:last-child_th:nth-child(3)]:sticky",
		"[&_thead_tr:last-child_th:nth-child(3)]:left-[31px]",
		"[&_thead_tr:last-child_th:nth-child(3)]:z-40",
		"[&_thead_tr:last-child_th:nth-child(3)]:bg-inherit",
		// Third column body
		"[&_tbody_tr_td:nth-child(3)]:sticky",
		"[&_tbody_tr_td:nth-child(3)]:z-20",
		"[&_tbody_tr_td:nth-child(3)]:left-[31px]",
		"[&_tbody_tr_td:nth-child(3)]:bg-inherit",
		// Group header styles
		"[&_thead_tr:first-child]:bg-muted",
		"[&_thead_tr:last-child]:bg-muted",
	);

	const headerStyle = cn("sticky top-0 left-0 bg-muted z-50 isolate");

	return (
		<div>
			{/* Table Controls */}
			<TableControls {...{ table, config }} />

			{/* Table */}
			<div className={tableContainerStyle}>
				<Table
					{...{
						className: tableStyle,
						style: {
							...columnSizeVars,
							width: table.getTotalSize(),
						},
					}}
				>
					{/* Table Header */}
					<TableHeader className={headerStyle}>
						{table.getHeaderGroups().map((headerGroup, groupIndex) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<ResizableHeader
										key={header.id}
										header={header}
										groupIndex={groupIndex}
										contentOverride={
											header.column.id === "controls" ? (
												<ColumnVisibilityControl
													table={table}
													config={config}
												/>
											) : undefined
										}
									/>
								))}
							</TableRow>
						))}
					</TableHeader>

					{/* Table Body */}
					{/* When resizing any column we will render this special memoized version of our table body */}
					{table.getState().columnSizingInfo.isResizingColumn ? (
						<MemoizedTableBody {...{ table, config }} />
					) : (
						<DataTableBody {...{ table, config }} />
					)}
				</Table>
			</div>
		</div>
	);
}

const DataTableBody = <TData, T>({
	table,
	config,
}: DataTableProps<TData, T>) => {
	return (
		<TableBody>
			{table.getRowModel().rows?.length ? (
				table.getRowModel().rows.map((row) => (
					<SelectableRow
						key={row.id}
						row={row}
						enableRowSelection={config.features?.enableRowSelection}
					>
						{row.getVisibleCells().map((cell) => (
							<TableCell
								key={cell.id}
								data-column-id={cell.column.id}
								style={{
									width: `calc(var(--col-${cell.column.id}-size) * 1px)`,
									maxWidth: `calc(var(--col-${cell.column.id}-size) * 1px)`,
									overflow: "hidden",
									textOverflow: "ellipsis",
								}}
							>
								{flexRender(cell.column.columnDef.cell, cell.getContext())}
							</TableCell>
						))}
					</SelectableRow>
				))
			) : (
				<TableRow>
					<TableCell
						className=" text-center"
						colSpan={
							table.getAllColumns().length +
							(config.features?.enableRowSelection ? 2 : 0)
						}
					>
						No results.
					</TableCell>
				</TableRow>
			)}
		</TableBody>
	);
};

//special memoized wrapper for our table body that we will use during column resizing
const MemoizedTableBody = memo(
	DataTableBody,
	(prev, next) => prev.table.options.data === next.table.options.data,
) as typeof DataTableBody;
