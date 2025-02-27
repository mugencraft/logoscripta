import type { RepositoryExtended } from "@/interfaces/server-client";
import type { SortingFn } from "@tanstack/react-table";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const getArraySortValue = (arr: any[] | null | undefined) => {
	if (!arr?.length) return "";
	// Sort the array to ensure consistent ordering
	return [...arr].sort().join("|");
};

export const topicsSort: SortingFn<RepositoryExtended> = (rowA, rowB) => {
	const a = rowA.original.topics;
	const b = rowB.original.topics;

	// Handle empty arrays
	if (!a?.length && !b?.length) return 0;
	if (!a?.length) return 1;
	if (!b?.length) return -1;

	// First, compare by array length
	const lengthDiff = a.length - b.length;
	if (lengthDiff !== 0) return lengthDiff;

	// If lengths are equal, compare alphabetically using sorted concatenated values
	const aValue = getArraySortValue(a);
	const bValue = getArraySortValue(b);
	return aValue.localeCompare(bValue);
};
