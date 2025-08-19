import type { SortDirection } from "@tanstack/react-table";
import { ChevronDown, ChevronsUpDown, ChevronUp } from "lucide-react";

interface SortingIconProps {
  canSort: boolean;
  sorted: SortDirection | false;
  className?: string;
}

export function SortingIcon({ canSort, sorted, className }: SortingIconProps) {
  if (!canSort) return null;

  return sorted === "desc" ? (
    <ChevronDown className={className} />
  ) : sorted === "asc" ? (
    <ChevronUp className={className} />
  ) : (
    <ChevronsUpDown className={className} />
  );
}
