import type { Column } from "@tanstack/react-table";

type FilterValue = string | number | { id: string | number };

// Simple toggle filter that works for both array of strings and array of objects
export const toggleFilterValue = <T>(
  column: Column<T, string[]>,
  value: FilterValue,
) => {
  const currentFilter = (column.getFilterValue() as FilterValue[]) || [];

  // Handle objects (like List items) or primitive values uniformly
  const getValue = (item: FilterValue): string | number => {
    if (typeof item === "object" && item !== null && "id" in item) {
      return item.id;
    }
    return item;
  };

  const compareValue = getValue(value);

  const exists = currentFilter.some((item) => getValue(item) === compareValue);
  const newFilter = exists
    ? currentFilter.filter((item) => getValue(item) !== compareValue)
    : [...currentFilter, value];

  column.setFilterValue(newFilter);
};
