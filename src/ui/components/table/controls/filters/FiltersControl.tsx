import { Button } from "@/ui/components/core/button";
import { DialogStyled } from "@/ui/components/extra/dialog-styled";
import type { Table } from "@tanstack/react-table";
import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { Filters } from "./Filters";

interface FiltersControlProps<TData> {
	table: Table<TData>;
	totalRows: number;
	enabled?: boolean;
}

export const FiltersControl = <TData,>({
	table,
	totalRows,
	enabled,
}: FiltersControlProps<TData>) => {
	const [showFilters, setShowFilters] = useState(false);

	if (!enabled) return null;

	return (
		<div className="flex items-center gap-2">
			<Button
				variant={showFilters ? "default" : "outline"}
				size="sm"
				className="h-8 px-2 lg:px-3 cursor-pointer"
				onClick={() => setShowFilters(!showFilters)}
			>
				<SlidersHorizontal className="mr-2 h-4 w-4" />
				Filters
			</Button>
			<DialogStyled
				open={showFilters}
				onOpenChange={() => setShowFilters(!showFilters)}
				title="Filters"
				description={`${totalRows} records`}
				className="min-h-[50vh]"
			>
				<Filters table={table} />
			</DialogStyled>
		</div>
	);
};
