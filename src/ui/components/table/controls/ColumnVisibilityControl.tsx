import { Button } from "@/ui/components/core/button";
import { Checkbox } from "@/ui/components/core/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/ui/components/core/dropdown-menu";
import { Label } from "@/ui/components/core/label";
import { ScrollArea } from "@/ui/components/core/scroll-area";
import { getTableColumnGroups } from "@/ui/components/table/controls/column-visibility-helpers";
import type {
	DataTableProps,
	VisibilityPreset,
} from "@/ui/components/table/types";
import _ from "lodash";
import { EllipsisVertical } from "lucide-react";

export function ColumnVisibilityControl<TData, T = string | number>({
	table,
	config,
}: DataTableProps<TData, T>) {
	const { visibilityPresets: presets = [] } = config;
	const columns = table.getAllLeafColumns();
	const columnGroups = getTableColumnGroups(table);
	const fullVisibility = Object.fromEntries(
		columns.map((col) => [col.id, false]),
	);

	const getVisibility = (preset: VisibilityPreset) => ({
		...fullVisibility,
		...preset.columns,
	});
	const applyPreset = (preset: VisibilityPreset) => {
		table.setColumnVisibility(getVisibility(preset));
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="sm" className="p-0 cursor-pointer">
					<EllipsisVertical className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-[200px] ">
				<DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>

				{presets && presets.length > 0 && (
					<>
						<DropdownMenuLabel>Presets</DropdownMenuLabel>
						{presets.map((preset) => (
							<Label
								htmlFor={preset.name}
								key={`preset-${preset.name}`}
								className="flex items-center space-x-2 text-sm hover:bg-accent rounded-md p-2 cursor-pointer"
							>
								<Checkbox
									id={preset.name}
									className="capitalize"
									checked={_.isEqual(
										table.getState().columnVisibility,
										getVisibility(preset),
									)}
									onCheckedChange={() => applyPreset(preset)}
								/>
								<span>{preset.name}</span>
							</Label>
						))}
						<DropdownMenuSeparator />
					</>
				)}

				<DropdownMenuLabel>Columns by Group</DropdownMenuLabel>
				<ScrollArea className={"h-[400px] pr-4"}>
					{columnGroups.map(
						(group) =>
							group.id !== "controls" && (
								<div key={group.id} className="px-2 py-1">
									<div className="font-medium text-sm text-muted-foreground mb-1">
										{group.name}
									</div>
									<div className="space-y-1">
										{group.columns.map((column) => (
											<Label
												key={column.id}
												htmlFor={column.id}
												className="flex items-center space-x-2 text-sm hover:bg-accent rounded-md p-2 cursor-pointer"
											>
												<Checkbox
													id={column.id}
													checked={column.getIsVisible()}
													onCheckedChange={(checked) =>
														column.toggleVisibility(!!checked)
													}
												/>
												<span>{_.upperFirst(_.startCase(column.id))}</span>
											</Label>
										))}
									</div>
								</div>
							),
					)}
				</ScrollArea>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
