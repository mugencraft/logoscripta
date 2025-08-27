import {
  Link,
  type LinkProps,
  type RegisteredRouter,
} from "@tanstack/react-router";
import type { Column } from "@tanstack/react-table";
import { SquareArrowOutUpRight } from "lucide-react";

import type { RepositoryList } from "@/domain/models/github/repository-list";

import { Badge } from "@/ui/components/core/badge";
import { Button } from "@/ui/components/core/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/ui/components/core/tooltip";
import { toggleFilterValue } from "@/ui/components/table/controls/filtering/filters/toggleFilterValue";

interface ListIdsCellProps<TData> {
  column: Column<TData, string[]>;
  link: LinkProps<RegisteredRouter["routeTree"]>;
  lists?: RepositoryList[];
}

export const ListIdsCell = <TData,>({
  column,
  link,
  lists,
}: ListIdsCellProps<TData>) => {
  if (!lists) return null;

  const handleFilterClick = (list: RepositoryList) => {
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
                  to={link.to}
                  params={link.params}
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
