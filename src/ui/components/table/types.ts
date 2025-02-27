import type {
	ColumnDef,
	Row,
	Table,
	Updater,
	VisibilityState,
} from "@tanstack/react-table";
import type { LucideIcon } from "lucide-react";
import type { ComponentType, ReactNode } from "react";

export interface TableProps<TData> {
	table: Table<TData>;
}

export interface DataTableProps<TData, T = string | number>
	extends TableProps<TData> {
	config: TableConfiguration<TData, T>;
}

export interface TableConfiguration<TData, T = string | number> {
	columns: ColumnDef<TData>[];
	visibilityPresets: VisibilityPreset[];
	paginationSizes?: number[];
	selection: SelectionConfiguration<TData, T>;
	features?: {
		enableRowSelection?: boolean;
		enableColumnFilters?: boolean;
		enableColumnResizing?: boolean;
		enableGlobalFilter?: boolean;
		enableSorting?: boolean;
		enableMultiSort?: boolean;
	};
}

export interface SelectionConfiguration<TData, T = string | number> {
	actions: SelectionAction<T>[];
	// ids can be either fullName or id
	getSelectedIds: (rows: Row<TData>[]) => T[];
	onActionComplete?: () => void;
}

export interface SelectionAction<T = string | number> {
	label: string;
	icon?: LucideIcon;
	onClick?: (selectedElements: T[]) => void;
	component?: ComponentType<StepProps<T>>;
	dialog?: {
		title: string;
		content: (props: StepProps<T>) => ReactNode;
	};
}

export interface StepProps<T> {
	selectedIds?: T[];
	onSuccess?: () => void;
	onCancel?: () => void;
}

export interface VisibilityPreset {
	name: string;
	columns: Updater<VisibilityState>;
}
