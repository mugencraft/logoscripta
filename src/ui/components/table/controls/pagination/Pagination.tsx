import { Button } from "@/ui/components/core/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/ui/components/core/select";
import {
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
} from "lucide-react";
import type { DataTableProps } from "../../types";

const PAGE_SIZES = [10, 20, 30, 50, 100];

export const Pagination = <TData,>({
	table,
	config,
}: DataTableProps<TData>) => {
	const { pageSize } = table.getState().pagination;

	const pageSizes = config.paginationSizes || PAGE_SIZES;

	return (
		<div className="flex items-center space-x-2">
			<p className="text-sm font-medium w-fit">Rows per page</p>
			<Select
				value={pageSize.toString()}
				onValueChange={(value) => {
					table.setPageSize(Number(value));
				}}
			>
				<SelectTrigger className="h-8 w-[70px] cursor-pointer">
					<SelectValue placeholder={pageSize} />
				</SelectTrigger>
				<SelectContent>
					{pageSizes.map((size) => (
						<SelectItem key={size} value={size.toString()}>
							{size}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			<Button
				variant="outline"
				className="h-8 w-8 p-0"
				onClick={() => table.firstPage()}
				disabled={!table.getCanPreviousPage()}
			>
				<span className="sr-only">Go to first page</span>
				<ChevronsLeft className="h-4 w-4" />
			</Button>
			<Button
				variant="outline"
				className="h-8 w-8 p-0"
				onClick={() => table.previousPage()}
				disabled={!table.getCanPreviousPage()}
			>
				<span className="sr-only">Go to previous page</span>
				<ChevronLeft className="h-4 w-4" />
			</Button>
			<Button
				variant="outline"
				className="h-8 w-8 p-0"
				onClick={() => table.nextPage()}
				disabled={!table.getCanNextPage()}
			>
				<span className="sr-only">Go to next page</span>
				<ChevronRight className="h-4 w-4" />
			</Button>
			<Button
				variant="outline"
				className="h-8 w-8 p-0"
				onClick={() => table.lastPage()}
				disabled={!table.getCanNextPage()}
			>
				<span className="sr-only">Go to last page</span>
				<ChevronsRight className="h-4 w-4" />
			</Button>
		</div>
	);
};
