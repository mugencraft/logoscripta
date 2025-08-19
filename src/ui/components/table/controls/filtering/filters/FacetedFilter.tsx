import type { Column, Table } from "@tanstack/react-table";
import React, { useId, useMemo } from "react";
import Select, { type MultiValue } from "react-select";

import { Label } from "@/ui/components/core/label";
import { RadioGroup, RadioGroupItem } from "@/ui/components/core/radio-group";
import { selectTheme } from "@/ui/theme/select-theme";

interface SelectOption {
  label: string;
  value: string | number | object;
  count: number;
}

interface FacetedFilterProps<TData, TValue> {
  column: Column<TData, TValue>;
  title?: string;
  mode?: "single" | "array";
  table?: Table<TData>;
}

export function FacetedFilter<TData, TValue>({
  column,
  title,
  mode = "single",
}: FacetedFilterProps<TData, TValue>) {
  const [filterMode, setFilterMode] = React.useState(
    column.getFilterFn()?.name || "arrIncludesSome",
  );

  const facets = column.getFacetedUniqueValues();
  const options = useMemo(() => generateOptions(facets), [facets]);

  const filter = column.getFilterValue() || [];
  const selectedOptions = useMemo(
    () => getSelectedOptions(options, filter),
    [options, filter],
  );

  const onChangeSelected = (values: MultiValue<SelectOption>) => {
    const value = values.map((v) => v.value);
    column.setFilterValue(value.length ? value : undefined);
  };

  const onValueChangeFilterModes = (value: string) => {
    setFilterMode(value);
    column?.setFilterValue(undefined);
    if (column) {
      column.columnDef.filterFn = value as "arrIncludesSome" | "arrIncludesAll";
    }
  };

  const anyId = useId();
  const allId = useId();

  return (
    <div className="space-y-2 z-40">
      {mode === "array" && (
        <RadioGroup
          value={filterMode}
          onValueChange={onValueChangeFilterModes}
          className="flex items-center space-x-4 p-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="arrIncludesSome"
              id={anyId}
              className="cursor-pointer"
            />
            <Label htmlFor={anyId} className="cursor-pointer">
              Match Any
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="arrIncludesAll"
              id={allId}
              className="cursor-pointer"
            />
            <Label htmlFor={allId} className="cursor-pointer">
              Match All
            </Label>
          </div>
        </RadioGroup>
      )}

      <Select
        placeholder={`Select ${title}...`}
        classNamePrefix="react-select"
        className="outline-accent"
        isMulti
        isClearable={true}
        closeMenuOnSelect={false}
        options={options}
        value={selectedOptions}
        onChange={onChangeSelected}
        theme={selectTheme}
      />
    </div>
  );
}

const generateOptions = (facets: Map<unknown, number>): SelectOption[] => {
  const options: SelectOption[] = [];

  for (const [value, count] of facets) {
    if (value == null) continue;

    if (Array.isArray(value)) {
      // Handle arrays (e.g. topics)
      for (const item of value) {
        if (item == null) continue;
        options.push({ label: `${item} (${count})`, value: item, count });
      }
    } else if (typeof value === "object") {
      // Handle objects (e.g. list items)
      // @ts-expect-error
      const label = value.name || value.label || String(value.id);
      if (label) {
        options.push({
          label: `${label} (${count})`,
          value,
          count,
        });
      }
    } else if (typeof value === "string") {
      options.push({ label: `${value} (${count})`, value, count });
    }
  }

  return options.sort((a, b) => b.count - a.count);
};

const getSelectedOptions = (
  options: SelectOption[],
  filterValue: unknown,
): SelectOption[] => {
  if (!filterValue) return [];

  if (Array.isArray(filterValue)) {
    if (typeof filterValue[0] === "object" && "id" in filterValue[0]) {
      return options.filter((option) =>
        filterValue.some(
          (item: { id: number }) =>
            // @ts-expect-error
            item.id === option.value.id,
        ),
      );
    }

    return options.filter((option) => filterValue.includes(option.value));
  }

  return [];
};
