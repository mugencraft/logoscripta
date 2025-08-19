import type { Header } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import type { ReactNode } from "react";

import { TableHead } from "@/ui/components/core/table";
import { cn } from "@/ui/utils";

import { SortableHeader } from "./SortableHeader";

interface ResizableHeaderProps<TData> {
  header: Header<TData, unknown>;
  groupIndex: number;
  contentOverride?: ReactNode;
}

export function ResizableHeader<TData>({
  header,
  groupIndex,
  contentOverride,
}: ResizableHeaderProps<TData>) {
  const isResizing = header.column.getIsResizing();
  const canResize = header.column.getCanResize();

  const styleHeader = cn(
    groupIndex === 0 ? "text-lg font-semibold" : "",
    canResize && "relative select-none group",
    isResizing && "select-none cursor-col-resize",
  );

  const styleResizer = cn(
    "absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none",
    "bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity", // Show on header hover
    "hover:bg-primary/50 active:bg-primary",
    isResizing && "bg-primary w-1 opacity-100", // Always show when resizing
  );

  const content = contentOverride
    ? contentOverride
    : header.isPlaceholder
      ? null
      : flexRender(header.column.columnDef.header, header.getContext());

  const width = `calc(var(--header-${header?.id}-size) * 1px)`;

  return (
    <TableHead
      {...{
        className: styleHeader,
        style: { width },
        colSpan: header.colSpan,
      }}
    >
      {header.subHeaders.length > 0 ? (
        content
      ) : (
        <SortableHeader column={header.column}>{content}</SortableHeader>
      )}

      {canResize && (
        <div
          {...{
            onDoubleClick: () => header.column.resetSize(),
            onMouseDown: header.getResizeHandler(),
            onTouchStart: header.getResizeHandler(),
            className: styleResizer,
          }}
        />
      )}
    </TableHead>
  );
}
