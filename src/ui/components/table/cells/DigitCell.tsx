import { formatNumber } from "@/core/utils/format";

interface DigitCellProps {
  value: number;
}

export const DigitCell = ({ value }: DigitCellProps) => (
  <div title={String(value)}>{value ? formatNumber(value) : 0}</div>
);
