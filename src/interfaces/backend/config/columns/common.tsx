import type {
	ListItem,
	ListItemExtended,
	Repository,
} from "@/interfaces/server-client";
import { CheckableCell } from "@/ui/components/table/cells/CheckableCell";
import { DateCell } from "@/ui/components/table/cells/DateCell";
import { RelativeTimeCell } from "@/ui/components/table/cells/RelativeTimeCell";
import { CheckableHeader } from "@/ui/components/table/headers/CheckableHeader";
import type {
	SelectionConfiguration,
	TableConfiguration,
} from "@/ui/components/table/types";

// Base configurations that can be shared across different table types
export const baseTableFeatures = {
	enableRowSelection: true,
	enableColumnFilters: true,
	enableColumnResizing: true,
	enableGlobalFilter: true,
	enableSorting: true,
	enableMultiSort: true,
} as const;

export const controlColumnGroup = {
	id: "controls",
	enableResizing: false,
	size: 25,
	columns: [
		{
			id: "select-col",
			header: CheckableHeader,
			cell: CheckableCell,
			enableResizing: false,
			size: 25,
		},
	],
} as const;

export const getSystemTimestampColumns = <
	TData extends ListItemExtended,
>(): TableConfiguration<TData>["columns"] => {
	return [
		{
			id: "createdAt",
			header: "Created",
			accessorFn: (row) => row.metadata?.system?.createdAt,
			cell: (info) => <DateCell date={info.getValue<string>()} />,
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
			accessorFn: (row) => row.metadata?.system?.updatedAt,
			cell: (info) => <RelativeTimeCell date={info.getValue<string>()} />,
			filterFn: "dateRangeFilter",
			enableGlobalFilter: false,
			sortingFn: "datetime",
			sortDescFirst: true,
			enableResizing: false,
			size: 110,
		},
	] as const;
};

export const getListSelection = <
	T extends ListItem | Repository,
>(): SelectionConfiguration<T> => {
	return {
		actions: [],
		getSelected: (rows) => rows.map((row) => row.original),
	};
};
