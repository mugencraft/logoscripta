import { Button } from "@/ui/components/core/button";
import { toggleFilterValue } from "@/ui/components/table/filters/toggleFilterValue";
import type { Column } from "@tanstack/react-table";

interface LanguageCellProps<TData> {
	value: string;
	column: Column<TData, string[]>;
}

export const LanguageCell = <TData,>({
	value,
	column,
}: LanguageCellProps<TData>) => {
	if (!value) return <div>-</div>;

	const handleFilterClick = () => {
		toggleFilterValue(column, value);
	};

	return (
		<Button
			variant="ghost"
			size="sm"
			onClick={handleFilterClick}
			// Prevent clicks from propagating to the row selection
			onMouseUp={(e) => e.stopPropagation()}
			className="flex items-center space-x-2 hover:bg-primary cursor-pointer"
		>
			<span>{value}</span>
		</Button>
	);
};
