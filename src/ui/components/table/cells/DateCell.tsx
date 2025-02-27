import { format } from "date-fns";

interface DateCellProps {
	date?: string | undefined;
}

export const DateCell = ({ date }: DateCellProps) => {
	return date ? format(new Date(date), "PP") : "-";
};
