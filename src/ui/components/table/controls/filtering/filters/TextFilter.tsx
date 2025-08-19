import type { Column } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

import { Input } from "@/ui/components/core/input";

export const TextFilter = <TData,>({ column }: { column: Column<TData> }) => {
  const [value, setValue] = useState((column.getFilterValue() as string) ?? "");
  const [debouncedValue] = useDebounce(value, 300);

  useEffect(() => {
    column.setFilterValue(debouncedValue);
  }, [column, debouncedValue]);

  return (
    <Input
      className="max-w-sm bg-mono-50"
      id={column.id}
      placeholder={`Filter ${column.id}...`}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
};
