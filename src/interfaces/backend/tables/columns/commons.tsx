import type { ColumnDef } from "@tanstack/react-table";
import { Pickaxe } from "lucide-react";

import type { BaseMetadata } from "@/domain/validation/shared";

import { ActionGroup } from "@/ui/components/actions/ActionGroup";
import type { ActionConfig } from "@/ui/components/actions/types";
import { IconTooltip } from "@/ui/components/extra/icon-tooltip";
import { CheckableCell } from "@/ui/components/table/cells/CheckableCell";
import { DateCell } from "@/ui/components/table/cells/DateCell";
import { RelativeTimeCell } from "@/ui/components/table/cells/RelativeTimeCell";
import { CheckableHeader } from "@/ui/components/table/headers/CheckableHeader";
import type {
  SelectionConfiguration,
  TableConfiguration,
} from "@/ui/components/table/types";

export const getSystemTimestampColumns = <
  TData extends { metadata: BaseMetadata },
  TTableData extends TData = TData,
>(): TableConfiguration<TData, TTableData>["columns"] => {
  return [
    {
      id: "createdAt",
      header: "Created",
      accessorFn: (row) => row.metadata.system.createdAt,
      cell: (info) => <DateCell date={info.getValue<Date>()} />,
      filterFn: "dateRangeFilter",
      enableGlobalFilter: false,
      sortingFn: "datetime",
      sortDescFirst: true,
      enableResizing: false,
      size: 110,
    },
    {
      id: "updatedAt",
      header: "Updated",
      accessorFn: (row) => row.metadata.system.updatedAt,
      cell: (info) => <RelativeTimeCell date={info.getValue<Date>()} />,
      filterFn: "dateRangeFilter",
      enableGlobalFilter: false,
      sortingFn: "datetime",
      sortDescFirst: true,
      enableResizing: false,
      size: 110,
    },
  ] as const;
};

// Base configurations that can be shared across different table types
export const baseTableFeatures = {
  enableRowSelection: true,
  enableColumnFilters: true,
  enableColumnResizing: true,
  enableGlobalFilter: true,
  enableSorting: true,
  enableMultiSort: true,
} as const;

export const getControlColumnGroup = <TData, TTableData = TData>(
  actions?: ActionConfig<TData>[],
): ColumnDef<TTableData> => {
  return {
    id: "controls",
    enableResizing: false,
    columns: [
      {
        id: "select-col",
        header: CheckableHeader,
        cell: CheckableCell,
        enableResizing: false,
        size: 25,
      },
      ...(actions
        ? ([
            {
              id: "edit",
              header: () => <IconTooltip icon={Pickaxe} label="Actions" />,
              cell: (info) => (
                <ActionGroup<TData>
                  data={info.row.original as unknown as TData}
                  context="row"
                  actions={actions}
                />
              ),
              enableResizing: false,
              size: 100,
            },
          ] satisfies ColumnDef<TTableData>[])
        : []),
    ],
  } as const;
};

export const getSelectionDef = <TData, TTableData extends TData = TData>(
  actions: ActionConfig<TData>[] = [],
): SelectionConfiguration<TData, TTableData> => {
  return {
    actions,
    getSelected: (rows) => rows.map((row) => row.original),
  };
};
