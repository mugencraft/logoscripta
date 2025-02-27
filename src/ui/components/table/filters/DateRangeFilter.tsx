import { Input } from "@/ui/components/core/input";
import type { Column } from "@tanstack/react-table";
import { useState } from "react";

export const DateRangeFilter = <TData,>({
	column,
}: { column: Column<TData, unknown> }) => {
	const [dates, setDates] = useState(["", ""]);

	return (
		<div className="flex gap-2 items-center">
			<Input
				type="date"
				value={dates[0]}
				onChange={(e) => {
					const newDates = [e.target.value, dates[1]] as string[];
					setDates(newDates);
					column.setFilterValue(newDates);
				}}
				className="w-32 p-1 border rounded [color-scheme:inherit] dark:[color-scheme:dark]"
			/>
			<span>to</span>
			<Input
				type="date"
				value={dates[1]}
				onChange={(e) => {
					const newDates = [dates[0], e.target.value] as string[];
					setDates(newDates);
					column.setFilterValue(newDates);
				}}
				className="w-32 p-1 border rounded [color-scheme:inherit] dark:[color-scheme:dark]"
			/>
		</div>
	);
};
