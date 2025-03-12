import type { ActionConfig } from "@/ui/components/actions/types";
import type {
	ColumnDef,
	Row,
	Table,
	Updater,
	VisibilityState,
} from "@tanstack/react-table";

export interface DataTableProps<TData> {
	config: TableConfiguration<TData>;
	table: Table<TData>;
}

export interface TableConfiguration<TData> {
	columns: ColumnDef<TData>[];
	features?: TableFeatures;
	paginationSizes?: number[];
	selection: SelectionConfiguration<TData>;
	visibilityPresets: VisibilityPreset[];
}

interface TableFeatures {
	enableColumnFilters?: boolean;
	enableColumnResizing?: boolean;
	enableGlobalFilter?: boolean;
	enableMultiSort?: boolean;
	enableRowSelection?: boolean;
	enableSorting?: boolean;
}

export interface SelectionConfiguration<TData> {
	actions: ActionConfig<TData>[];
	getSelected: (rows: Row<TData>[]) => TData[];
	onActionComplete?: () => void;
}

export interface VisibilityPreset {
	name: string;
	columns: Updater<VisibilityState>;
}

export interface InteractionProps<TData> {
	data?: TData;
	row?: TData;
	selected?: TData[];
	table?: Table<TData>;
	onSuccess?: () => void;
	onCancel?: () => void;
}
