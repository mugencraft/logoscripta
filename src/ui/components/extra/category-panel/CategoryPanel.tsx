import { Badge } from "@/ui/components/core/badge";
import { Button } from "@/ui/components/core/button";
import {
	Dialog,
	DialogContent,
	DialogTrigger,
} from "@/ui/components/core/dialog";
import { Input } from "@/ui/components/core/input";
import { ScrollArea } from "@/ui/components/core/scroll-area";
import { Separator } from "@/ui/components/core/separator";
import { cn } from "@/ui/utils";
import {
	Check,
	ChevronDown,
	ChevronRight,
	ChevronUp,
	Plus,
	Search,
	X,
} from "lucide-react";
import React from "react";
import type { CategoryGroup } from "./types";
import { useCategoryPanel } from "./useCategoryPanel";

interface CategoryPanelProps {
	value: string;
	onChange: (value: string) => void;
	groups: CategoryGroup[];
	placeholder?: string;
	className?: string;
	allowCustomValues?: boolean;
}

export function CategoryPanel({
	value,
	onChange,
	groups,
	placeholder = "Select a category",
	className,
	allowCustomValues = false,
}: CategoryPanelProps) {
	const [open, setOpen] = React.useState(false);

	const {
		search,
		setSearch,
		expandedGroups,
		toggleGroup,
		toggleAllGroups,
		filteredGroups,
		getDisplayValue,
	} = useCategoryPanel({ groups, value, allowCustomValues });

	// Check if there are any expanded groups
	const hasExpandedGroups = Object.values(expandedGroups).some(Boolean);

	const handleOpenChange = (newOpen: boolean) => {
		setOpen(newOpen);
		if (!newOpen) {
			setSearch("");
		}
	};

	const handleItemSelect = (selectedValue: string) => {
		onChange(selectedValue);
		setOpen(false);
		setSearch("");
	};

	const displayValue = getDisplayValue(value);

	// Function to highlight matching text
	const highlightMatch = (text: string, query: string) => {
		if (!query) return text;

		const index = text.toLowerCase().indexOf(query.toLowerCase());
		if (index === -1) return text;

		const before = text.substring(0, index);
		const match = text.substring(index, index + query.length);
		const after = text.substring(index + query.length);

		return (
			<>
				{before}
				<span className="bg-yellow-200 text-black dark:bg-yellow-600 dark:text-white">
					{match}
				</span>
				{after}
			</>
		);
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					aria-expanded={open}
					className={cn(
						"w-full justify-between",
						!value && "text-muted-foreground",
						className,
					)}
				>
					{value ? (
						<span className="truncate">{displayValue}</span>
					) : (
						placeholder
					)}
					<ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</DialogTrigger>

			<DialogContent className="sm:max-w-[800px] lg:max-w-[1000px] p-0 max-h-[80vh] flex flex-col">
				<div className="p-2 border-b border-border flex items-center gap-2">
					<Search className="h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search categories..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="h-8 border-none shadow-none focus-visible:ring-0"
					/>
					{search && (
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setSearch("")}
							className="h-6 w-6 p-0"
						>
							<X className="h-4 w-4" />
						</Button>
					)}
				</div>

				<div className="p-2 flex justify-between items-center">
					<span className="text-sm text-muted-foreground">
						{filteredGroups.length}{" "}
						{filteredGroups.length === 1 ? "category" : "categories"}
					</span>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => toggleAllGroups(!hasExpandedGroups)}
						className="h-8 text-xs"
					>
						{hasExpandedGroups ? (
							<>
								Collapse All <ChevronUp className="ml-1 h-3 w-3" />
							</>
						) : (
							<>
								Expand All <ChevronDown className="ml-1 h-3 w-3" />
							</>
						)}
					</Button>
				</div>

				<ScrollArea className="flex-1 overflow-y-auto">
					<div className="p-4">
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
							{filteredGroups.map((group) => (
								<div
									key={group.value}
									className="border border-border rounded-md overflow-hidden h-fit"
								>
									<button
										type="button"
										onClick={() => toggleGroup(group.value)}
										className={cn(
											"flex items-center justify-between w-full p-3 text-left hover:bg-muted/50 transition-colors",
											expandedGroups[group.value] && "border-b border-border",
										)}
									>
										<div className="flex flex-col flex-1 min-w-0">
											<div className="font-medium flex items-center">
												<span className="truncate mr-2">
													{search
														? highlightMatch(group.label, search)
														: group.label}
												</span>
												{value === group.value && (
													<Check className="h-4 w-4 text-primary flex-shrink-0" />
												)}
											</div>
											{group.description && (
												<p className="text-sm text-muted-foreground mt-1 line-clamp-2">
													{search
														? highlightMatch(group.description, search)
														: group.description}
												</p>
											)}
										</div>
										<div className="flex-shrink-0 ml-2">
											{expandedGroups[group.value] ? (
												<ChevronUp className="h-4 w-4 opacity-50" />
											) : (
												<ChevronRight className="h-4 w-4 opacity-50" />
											)}
										</div>
									</button>

									{expandedGroups[group.value] && (
										<div className="p-2 bg-muted/30">
											{group.subitems.length > 0 ? (
												<div className="grid grid-cols-1 gap-1 max-h-[200px] overflow-y-auto">
													{group.subitems.map((subitem) => {
														const subitemValue = `${group.value} > ${subitem}`;
														const isSelected = value === subitemValue;
														return (
															<button
																key={subitemValue}
																type="button"
																onClick={() => handleItemSelect(subitemValue)}
																className={cn(
																	"px-3 py-1.5 text-sm text-left rounded flex items-center justify-between",
																	isSelected
																		? "bg-primary/20 text-primary hover:bg-primary/30"
																		: "hover:bg-muted/80",
																)}
															>
																<span className="truncate">
																	{search
																		? highlightMatch(subitem, search)
																		: subitem}
																</span>
																{isSelected && (
																	<Check className="h-3.5 w-3.5 flex-shrink-0" />
																)}
															</button>
														);
													})}
												</div>
											) : (
												<p className="text-sm text-muted-foreground py-2 px-3">
													No subitems available
												</p>
											)}
										</div>
									)}
								</div>
							))}
						</div>

						{filteredGroups.length === 0 && (
							<div className="py-6 text-center">
								<p className="text-muted-foreground">
									No categories match your search
								</p>
								{allowCustomValues && (
									<Button
										variant="outline"
										size="sm"
										className="mt-2"
										onClick={() => {
											handleItemSelect(search);
										}}
									>
										<Plus className="mr-2 h-3.5 w-3.5" />
										Use "{search}" as custom value
									</Button>
								)}
							</div>
						)}
					</div>
				</ScrollArea>

				{value && (
					<>
						<Separator />
						<div className="p-2 flex justify-between items-center">
							<div className="flex items-center text-sm">
								<span className="text-muted-foreground mr-2">Selected:</span>
								<Badge variant="outline" className="font-normal">
									{displayValue}
								</Badge>
							</div>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => onChange("")}
								className="h-8 text-xs"
							>
								Clear
							</Button>
						</div>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
