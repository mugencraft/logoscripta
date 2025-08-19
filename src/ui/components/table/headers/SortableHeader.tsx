import type { Column } from "@tanstack/react-table";
import type { KeyboardEvent, ReactNode } from "react";

import { SortingIcon } from "@/ui/components/table/headers/SortingIcon";

interface SortableHeaderProps<TData> {
  column: Column<TData, unknown>;
  children: ReactNode;
}

export function SortableHeader<TData>({
  column,
  children,
}: SortableHeaderProps<TData>) {
  const style = "flex items-center space-x-2 cursor-pointer select-none";

  const toggleSortingOnEnter = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      column.toggleSorting();
    }
  };

  if (column.getCanSort()) {
    return (
      // biome-ignore lint/a11y/noStaticElementInteractions: fix this
      <div
        className={style}
        onKeyDown={toggleSortingOnEnter}
        onClick={column.getToggleSortingHandler()}
      >
        <span>{children}</span>
        <SortingIcon
          canSort={column.getCanSort()}
          sorted={column.getIsSorted()}
          className="group-hover:text-primary transition-colors"
        />
      </div>
    );
  }

  return <div>{children}</div>;
}
