import type { Table } from "@tanstack/react-table";

import { Checkbox } from "@/ui/components/core/checkbox";

export const CheckableHeader = <TData,>({ table }: { table: Table<TData> }) => {
  return (
    <Checkbox
      aria-label="Select all"
      className="cursor-pointer"
      checked={
        table.getIsSomeRowsSelected()
          ? "indeterminate"
          : table.getIsAllRowsSelected()
      }
      onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
    />
  );
};
