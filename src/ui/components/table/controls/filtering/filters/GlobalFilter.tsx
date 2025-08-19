import type { Table } from "@tanstack/react-table";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

import { Input } from "@/ui/components/core/input";

interface GlobalFilterProps<TData> {
  table: Table<TData>;
  enabled?: boolean;
}

export const GlobalFilter = <TData,>({
  table,
  enabled,
}: GlobalFilterProps<TData>) => {
  const [value, setValue] = useState("");
  const [debouncedValue] = useDebounce(value, 300);

  useEffect(() => {
    table.setGlobalFilter(debouncedValue);
  }, [debouncedValue, table]);

  if (!enabled) return null;

  return (
    <div className="relative flex-1 max-w-sm">
      <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
      <Input
        name="globalFilter"
        placeholder="Search all columns..."
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="pl-8 bg-mono-50"
      />
    </div>
  );
};
