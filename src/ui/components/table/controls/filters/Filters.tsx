import { Input } from "@/ui/components/core/input";
import { Label } from "@/ui/components/core/label";
import { ScrollArea } from "@/ui/components/core/scroll-area";
import type { Column, Table } from "@tanstack/react-table";
import _ from "lodash";
import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "use-debounce";
import { AdaptiveRangerFilter } from "../../filters/AdaptiveRangerFilter";
import { BooleanFilter } from "../../filters/BooleanFilter";
import { DateRangeFilterPlus } from "../../filters/DateRangeFilterPlus";
import { FacetedFilter } from "../../filters/FacetedFilter";

const getFilterType = <TData,>(column: Column<TData>) => {
	// Special column IDs take precedence
	switch (column.id) {
		case "isArchived":
		case "isDisabled":
		case "isLinked":
		case "readOnly":
			return "boolean";
		case "language":
		case "licenseName":
		case "listIds":
			return "faceted";
		case "topics":
		case "modes":
			return "facetedArray";
	}

	// Then check filter function
	switch (column.columnDef.filterFn) {
		case "includesString":
			return "text";
		case "inNumberRange":
			return "range";
		case "dateRangeFilter":
			return "dateRange";
		case "arrIncludesSome":
			return "faceted";
	}

	return "default";
};

const renderFilter = <TData,>(table: Table<TData>, column: Column<TData>) => {
	const filterType = getFilterType(column);

	switch (filterType) {
		case "range":
			return <AdaptiveRangerFilter column={column} />;
		case "dateRange":
			return <DateRangeFilterPlus column={column} />;
		case "boolean":
			return <BooleanFilter column={column} />;
		case "text": {
			const [value, setValue] = useState(
				(column.getFilterValue() as string) ?? "",
			);
			const [debouncedValue] = useDebounce(value, 300);

			useEffect(() => {
				column.setFilterValue(debouncedValue);
			}, [column, debouncedValue]);

			return (
				<Input
					className="max-w-sm bg-mono-50"
					id={column.id}
					placeholder={`Filter ${column.id}...`}
					value={value}
					onChange={(e) => setValue(e.target.value)}
				/>
			);
		}
		case "faceted":
			return (
				<FacetedFilter
					table={table}
					column={column}
					title={column.id}
					mode="single"
				/>
			);
		case "facetedArray":
			return (
				<FacetedFilter
					table={table}
					column={column}
					title={column.id}
					mode="array"
				/>
			);
		default:
			return null;
	}
};

export const Filters = <TData,>({ table }: { table: Table<TData> }) => {
	const filterableColumns = useMemo(
		() => table.getAllLeafColumns().filter((column) => column.getCanFilter()),
		[table],
	);

	return (
		<ScrollArea className="sm:max-h-[50vh] md:max-h-[70vh] lg:max-h-[80vh] pr-4">
			<div className="grid grid-cols-2 gap-4 mb-4">
				{filterableColumns.map((column) => {
					return (
						<div
							key={column.id}
							className="space-y-2 hover:bg-muted/20 pl-1 pr-4"
						>
							<Label htmlFor={column.id}>
								{_.upperFirst(_.startCase(column.id))}
							</Label>
							{renderFilter(table, column)}
						</div>
					);
				})}
			</div>
		</ScrollArea>
	);
};
