import { Label } from "@/ui/components/core/label";
import { RadioGroup, RadioGroupItem } from "@/ui/components/core/radio-group";
import type { Column } from "@tanstack/react-table";

const className =
	"pl-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer";

export const BooleanFilter = <TData,>({
	column,
}: {
	column: Column<TData, unknown>;
}) => (
	<RadioGroup
		defaultValue="all"
		className="flex gap-4"
		onValueChange={(value) => {
			column.setFilterValue(value === "all" ? undefined : value === "true");
		}}
	>
		<div className="flex items-center">
			<RadioGroupItem
				value="all"
				id={`${column.id}-filter-all`}
				className="cursor-pointer"
			/>
			<Label htmlFor={`${column.id}-filter-all`} className={className}>
				All
			</Label>
		</div>
		<div className="flex items-center">
			<RadioGroupItem
				value="true"
				id={`${column.id}-filter-yes`}
				className="cursor-pointer"
			/>
			<Label htmlFor={`${column.id}-filter-yes`} className={className}>
				Yes
			</Label>
		</div>
		<div className="flex items-center">
			<RadioGroupItem
				value="false"
				id={`${column.id}-filter-no`}
				className="cursor-pointer"
			/>
			<Label htmlFor={`${column.id}-filter-no`} className={className}>
				No
			</Label>
		</div>
	</RadioGroup>
);
