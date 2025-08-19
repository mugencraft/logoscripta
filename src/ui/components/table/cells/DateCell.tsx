import { format } from "date-fns";

interface DateCellProps {
  date?: Date | undefined;
}

export const DateCell = ({ date }: DateCellProps) => {
  return date ? (
    format(date, "PP")
  ) : (
    <span className="text-muted-foreground italic">-</span>
  );
};
