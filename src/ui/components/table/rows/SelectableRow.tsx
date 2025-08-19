import type { Row } from "@tanstack/react-table";

import { TableRow } from "@/ui/components/core/table";
import { cn } from "@/ui/utils";

interface SelectableRowProps<TData> {
  row: Row<TData>;
  children: React.ReactNode;
  enableRowSelection?: boolean;
}

export function SelectableRow<TData>({
  row,
  children,
  enableRowSelection,
}: SelectableRowProps<TData>) {
  const handleClick = (e: React.MouseEvent) => {
    if (!e.ctrlKey && !e.metaKey) {
      return;
    }

    if (!enableRowSelection) return;

    // If there's selected text, user was selecting content, not the row
    if (window.getSelection()?.toString()) return;

    row.toggleSelected();
  };

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      onClick={handleClick}
      className={cn(
        "bg-[var(--color-mono-50)] hover:bg-[var(--color-mono-100)]",
        row.getIsSelected() &&
          "data-[state=selected]:bg-[var(--color-primary-50)] data-[state=selected]:hover:bg-[var(--color-mono-100)]",
      )}
    >
      {children}
    </TableRow>
  );
}
