import type { List } from "@/interfaces/server-client";
import { Badge } from "@/ui/components/core/badge";
import { Button } from "@/ui/components/core/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/ui/components/core/tooltip";
import { toggleFilterValue } from "@/ui/components/table/filters/toggleFilterValue";
import { Link } from "@tanstack/react-router";
import type { Column } from "@tanstack/react-table";
import { ExternalLink, Filter, SquareArrowOutUpRight } from "lucide-react";

interface ListIdsCellProps<TData> {
	lists?: List[];
	column: Column<TData, string[]>;
}

export const ListIdsCell = <TData,>({
	lists,
	column,
}: ListIdsCellProps<TData>) => {
	if (!lists) return null;

	const handleFilterClick = (list: List) => {
		toggleFilterValue(column, list);
	};

	return (
		<Tooltip>
			<TooltipTrigger>
				<div className="line-clamp-2 text-left">
					{lists.map((list) => (
						<Badge
							key={list.id}
							variant="default"
							className="cursor-pointer mr-1 mb-1"
							onMouseUp={(e) => e.stopPropagation()}
							onClick={() => handleFilterClick(list)}
						>
							<span className="line-clamp-1">{list.name}</span>
						</Badge>
					))}
				</div>
			</TooltipTrigger>
			<TooltipContent>
				<ul>
					{lists.map((list) => (
						<li key={list.id}>
							<Button
								variant="ghost"
								size="sm"
								className="w-full cursor-pointer"
								onMouseUp={(e) => {
									e.stopPropagation();
									handleFilterClick(list);
								}}
							>
								{list.name}
								<Link
									to="/lists/$id"
									params={{ id: String(list.id) }}
									className="text-sm cursor-alias"
								>
									<SquareArrowOutUpRight />
								</Link>
							</Button>
						</li>
					))}
				</ul>
			</TooltipContent>
		</Tooltip>
	);
};
