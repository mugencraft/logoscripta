import type { Table } from "@tanstack/react-table";

import type { DownloadOptions } from "@/core/serialization/export";

import { Action } from "@/ui/components/actions/Action";
import { ActionButtons } from "@/ui/components/actions/ActionButtons";
import { cn } from "@/ui/utils";

import type { SelectionConfiguration } from "../types";
import { getExportAction } from "./data-export/actions";

interface SelectionControlProps<TData, TTableData extends TData = TData> {
  table: Table<TTableData>;
  totalRows: number;
  selection?: SelectionConfiguration<TData, TTableData>;
}

export const SelectionControl = <TData, TTableData extends TData = TData>({
  table,
  totalRows,
  selection,
}: SelectionControlProps<TData, TTableData>) => {
  const selectedRows = table.getSelectedRowModel().rows;

  if (!selectedRows.length || !selection) return null;

  const selected = selectedRows.map((row) => row.original);

  const exportOptions: DownloadOptions = {
    fileName: "export-selection",
    includeTimestamp: true,
  };

  const exportAction = getExportAction(table, exportOptions);

  const onSuccess = () => {
    table.toggleAllRowsSelected(false);
  };

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
          context="selection"
          selected={selected}
          onSuccess={onSuccess}
        />
        <Action action={exportAction} context="selection" selected={selected} />
      </div>
    </div>
  );
};
