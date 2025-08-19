import { formatDistance, fromUnixTime } from "date-fns";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/ui/components/core/tooltip";

interface RelativeTimeProps {
  date: Date | number;
}

export const RelativeTimeCell = ({ date }: RelativeTimeProps) => {
  if (!date) return <span className="text-muted-foreground italic">-</span>;
  const parsedDate = parseDate(date);

  const getRelativeTime = () => {
    return formatDistance(parsedDate, new Date(), { addSuffix: true });
  };

  return (
    <Tooltip>
      <TooltipTrigger>
        <span className="text-sm">{getRelativeTime()}</span>
      </TooltipTrigger>
      <TooltipContent>
        <p>{parsedDate.toLocaleDateString()}</p>
      </TooltipContent>
    </Tooltip>
  );
};

const parseDate = (date: Date | number) => {
  if (date instanceof Date) {
    return date;
  }

  // Check if the string is a numeric timestamp
  const timestamp = Number(date);
  if (!Number.isNaN(timestamp)) {
    return fromUnixTime(timestamp);
  }

  return new Date(date);
};
