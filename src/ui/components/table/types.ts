import type {
  ColumnDef,
  Row,
  Table,
  Updater,
  VisibilityState,
} from "@tanstack/react-table";

import type { ActionConfig } from "@/ui/components/actions/types";

export interface DataTableProps<TData, TTableData extends TData = TData> {
  config: TableConfiguration<TData, TTableData>;
  table: Table<TTableData>;
}

interface TableFeatures {
  enableColumnFilters?: boolean;
  enableColumnResizing?: boolean;
  enableGlobalFilter?: boolean;
  enableMultiSort?: boolean;
  enableRowSelection?: boolean;
  enableSorting?: boolean;
}

export interface TableConfiguration<TData, TTableData extends TData = TData> {
  columns: ColumnDef<TTableData>[];
  features?: TableFeatures;
  paginationSizes?: number[];
  selection: SelectionConfiguration<TData, TTableData>;
  visibilityPresets: VisibilityPreset[];
}

export type GetTableConfiguration<TData, TTableData extends TData = TData> = (
  actions: ActionConfig<TData>[],
) => TableConfiguration<TData, TTableData>;

export interface SelectionConfiguration<
  TData,
  TTableData extends TData = TData,
> {
  actions: ActionConfig<TData>[];
  getSelected: (rows: Row<TTableData>[]) => TTableData[];
  onActionComplete?: () => void;
}

export interface VisibilityPreset {
  name: string;
  columns: Updater<VisibilityState>;
}
