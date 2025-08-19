import { useMemo } from "react";

import type { DownloadOptions } from "@/core/serialization/export";

import { Action } from "@/ui/components/actions/Action";

import type { DataTableProps } from "../types";
import { getExportAction } from "./data-export/actions";
import { FiltersActive } from "./filtering/FiltersActive";
import { FiltersControl } from "./filtering/FiltersControl";
import { GlobalFilter } from "./filtering/filters/GlobalFilter";
import { Pagination } from "./pagination/Pagination";
import { PaginationInfo } from "./pagination/PaginationInfo";
import { SelectionControl } from "./SelectionControl";

export function TableControls<TData, TTableData extends TData = TData>({
  table,
  config,
}: DataTableProps<TData, TTableData>) {
  const { enableGlobalFilter, enableColumnFilters } = config.features || {};
  // biome-ignore lint/correctness/useExhaustiveDependencies: table.getFilteredRowModel is not needed
  const filteredModel = useMemo(
    () => table.getFilteredRowModel(),
    [table.getState().columnFilters, table.getState().globalFilter],
  );

  const totalRows = useMemo(() => filteredModel.rows.length, [filteredModel]);

  const activeFilters = table.getState().columnFilters;

  const exportOptions: DownloadOptions = {
    fileName: "export-all",
    includeTimestamp: true,
  };

  const exportAction = getExportAction(table, exportOptions);

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
          <Action
            action={exportAction}
            context="view"
            selected={table.getRowModel().rows.map((row) => row.original)}
          />
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
