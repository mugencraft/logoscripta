import { Badge } from "@/ui/components/core/badge";

interface ArchivedCellProps {
  value: string;
}

export const ArchivedCell = ({ value }: ArchivedCellProps) => (
  <Badge variant="default">{value || "-"}</Badge>
);
