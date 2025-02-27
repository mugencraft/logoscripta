import type { TableProps } from "@/ui/components/table/types";
import { useMemo } from "react";

export const PaginationInfo = <TData,>({ table }: TableProps<TData>) => {
	const rowCount = table.getRowCount();
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const pageCount = useMemo(() => table.getPageCount(), [rowCount]);

	if (pageCount === undefined) return null;

	const { pageIndex, pageSize } = table.getState().pagination;

	const startIndex = pageIndex * pageSize + 1;
	const endIndex = Math.min((pageIndex + 1) * pageSize, rowCount);

	return (
		<div className="text-sm text-muted-foreground">
			{rowCount > 0 ? (
				<>
					Showing {startIndex} to {endIndex} of {rowCount} results
					{pageCount > 1 && (
						<>
							{" "}
							(Page {pageIndex + 1} of {pageCount})
						</>
					)}
				</>
			) : (
				"No results"
			)}
		</div>
	);
};
