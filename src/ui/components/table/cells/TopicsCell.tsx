import type { Column } from "@tanstack/react-table";

import { Badge } from "@/ui/components/core/badge";
import { Button } from "@/ui/components/core/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/ui/components/core/tooltip";

import { toggleFilterValue } from "../controls/filtering/filters/toggleFilterValue";

interface TopicsCellProps<TData> {
  topics?: string[];
  column: Column<TData, string[]>;
}

export const TopicsCell = <TData,>({
  topics,
  column,
}: TopicsCellProps<TData>) => {
  if (!topics?.length) return null;

  const handleFilterClick = (topic: string) => {
    toggleFilterValue(column, topic);
  };

  return (
    <Tooltip>
      <TooltipTrigger>
        <div className="line-clamp-4 text-left">
          {topics.map((topic) => (
            <Badge
              key={topic}
              variant="default"
              className="cursor-pointer mr-1 mb-1"
              onMouseUp={(e) => e.stopPropagation()}
              onClick={() => handleFilterClick(topic)}
            >
              <span className="line-clamp-1">{topic}</span>
            </Badge>
          ))}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <div className="flex flex-col gap-1">
          {topics.map((topic) => (
            <Button
              key={topic}
              variant="ghost"
              size="sm"
              onMouseUp={(e) => e.stopPropagation()}
              onClick={() => handleFilterClick(topic)}
              className="w-full text-left cursor-pointer "
            >
              {topic}
            </Button>
          ))}
        </div>
      </TooltipContent>
    </Tooltip>
  );
};
