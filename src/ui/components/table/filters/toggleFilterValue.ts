import type { Column } from "@tanstack/react-table";

// Simple toggle filter that works for both array of strings and array of objects
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const toggleFilterValue = (column: Column<any, unknown>, value: any) => {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const currentFilter = (column.getFilterValue() as any[]) || [];

	// Handle objects (like List items) or primitive values uniformly
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const getValue = (item: any) => (item?.id !== undefined ? item.id : item);
	const compareValue = getValue(value);

	const exists = currentFilter.some((item) => getValue(item) === compareValue);
	const newFilter = exists
		? currentFilter.filter((item) => getValue(item) !== compareValue)
		: [...currentFilter, value];

	column.setFilterValue(newFilter);
};
