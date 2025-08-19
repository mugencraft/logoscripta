import type { ReactNode } from "react";

interface BaseCellProps {
  value?: ReactNode;
  lines?: string;
  noneText?: string;
  centered?: boolean;
}

export const BaseCell = ({
  value: node,
  lines = "1",
  noneText = "-",
  centered = false,
}: BaseCellProps) => (
  <div className={centered ? "text-center" : ""}>
    {node ? (
      <div {...{ className: `line-clamp-${lines}` }}>{node}</div>
    ) : (
      <span className="text-muted-foreground italic">{noneText}</span>
    )}
  </div>
);
