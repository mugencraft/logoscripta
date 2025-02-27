import type { List } from "@/interfaces/server-client";
import type { FilterFn } from "@tanstack/react-table";

export const listIdsFilter: FilterFn<unknown> = (
	row,
	columnId,
	filterValue: List[],
) => {
	const rowValue = row.getValue<{ id: number }[]>(columnId) || [];

	// If no filter values are selected, show all rows
	if (!filterValue?.length) return true;

	// If row has no lists, filter it out when filters are active
	if (!rowValue?.length) return false;

	// Check if any of the selected filter values match the row's list IDs
	return filterValue.some((filter) =>
		rowValue.some((item) => item.id === filter.id),
	);
};

declare module "@tanstack/react-table" {
	interface FilterFns {
		listIdsFilter: FilterFn<unknown>;
	}
}
