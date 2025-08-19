import { formatSize } from "@/core/utils/format";

interface SizeCellProps {
  bytes: number;
}

export const SizeCell = ({ bytes }: SizeCellProps) => {
  return <div className="font-mono">{formatSize(bytes)}</div>;
};
