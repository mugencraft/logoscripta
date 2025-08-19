import type { ColumnFiltersState, Table } from "@tanstack/react-table";
import { X } from "lucide-react";

import { Badge } from "@/ui/components/core/badge";
import { Button } from "@/ui/components/core/button";
import { cn } from "@/ui/utils";

interface FiltersActiveProps<TData> {
  activeFilters: ColumnFiltersState;
  table: Table<TData>;
}

export const FiltersActive = <TData,>({
  table,
  activeFilters,
}: FiltersActiveProps<TData>) => {
  const clearFilter = (filterId: string) => {
    const column = table.getColumn(filterId);
    if (column) {
      column.setFilterValue(undefined);
    }
  };

  const formatFilterValue = (value: unknown): string => {
    if (Array.isArray(value)) {
      return value.map((v) => v.name || v).join(", ");
    }
    return String(value);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap flex-1">
      <span
        className={cn(
          "text-sm font-medium",
          !activeFilters.length && "text-muted-foreground/50",
        )}
      >
        Active Filters:
      </span>
      {activeFilters.map((filter) => (
        <Badge
          key={filter.id}
          variant="default"
          className="flex items-center gap-1 px-2 py-1"
        >
          <span className="truncate max-w-[200px]">
            {filter.id}: {formatFilterValue(filter.value)}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => clearFilter(filter.id)}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}
    </div>
  );
};
