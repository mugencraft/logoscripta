import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/ui/components/core/tooltip";
import { formatDistance, fromUnixTime, parseISO } from "date-fns";

interface RelativeTimeProps {
	date: string | number;
}

export const RelativeTimeCell = ({ date }: RelativeTimeProps) => {
	if (!date) return null;
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

const parseDate = (dateString: string | number) => {
	// Check if the string is a numeric timestamp
	const timestamp = Number(dateString);
	if (!Number.isNaN(timestamp)) {
		return fromUnixTime(timestamp);
	}
	// Otherwise parse as ISO date string
	return parseISO(dateString as string);
};
