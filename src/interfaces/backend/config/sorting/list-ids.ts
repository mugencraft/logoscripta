import { getListItems } from "@/interfaces/backend/config/accessors/list-items";
import type { RepositoryExtended } from "@/interfaces/server-client";
import type { SortingFn } from "@tanstack/react-table";

export const listIdsSort: SortingFn<RepositoryExtended> = (rowA, rowB) => {
	const a = getListItems(rowA.original);
	const b = getListItems(rowB.original);

	// For empty arrays, let TanStack's sortUndefined handling take over
	if (!a?.length || !b?.length) return 0;

	// Compare by number of lists first
	const lengthDiff = a.length - b.length;
	if (lengthDiff !== 0) return lengthDiff;

	// If same number of lists, compare by list names alphabetically
	const aNames = a
		// @ts-expect-error
		.map((item) => item.name)
		.sort()
		.join("|");
	const bNames = b
		// @ts-expect-error
		.map((item) => item.name)
		.sort()
		.join("|");
	return aNames.localeCompare(bNames);
};
