import type { Row } from "@tanstack/react-table";

import { Checkbox } from "@/ui/components/core/checkbox";

export const CheckableCell = <TData,>({ row }: { row: Row<TData> }) => {
  return (
    <Checkbox
      checked={row.getIsSelected()}
      className="cursor-pointer"
      disabled={!row.getCanSelect()}
      // Prevent clicks from propagating to the row selection
      onMouseUp={(e) => e.stopPropagation()}
      onCheckedChange={(value) => row.toggleSelected(!!value)}
    />
  );
};
