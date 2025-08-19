import type { FilterFn, Row } from "@tanstack/react-table";

// Custom date range filter function
export const dateRangeFilter: FilterFn<unknown> = (
  row: Row<unknown>,
  columnId: string,
  filterValue: string[],
): boolean => {
  const cellValue = row.getValue(columnId) as string;
  const [start, end] = filterValue;

  if (!start && !end) return true;
  if (!cellValue) return false;

  const date = new Date(cellValue);

  if (start && end) {
    return date >= new Date(start) && date <= new Date(end);
  }
  if (start) {
    return date >= new Date(start);
  }
  if (end) {
    return date <= new Date(end);
  }
  return true;
};

declare module "@tanstack/react-table" {
  interface FilterFns {
    dateRangeFilter: FilterFn<unknown>;
  }
}
