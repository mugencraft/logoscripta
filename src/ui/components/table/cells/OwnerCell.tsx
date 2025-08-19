import type { Column } from "@tanstack/react-table";

import type { Owner } from "@/domain/models/github/owner";

import { Button } from "@/ui/components/core/button";

interface OwnerCellProps<TData> {
  owner: Owner;
  column: Column<TData, string[]>;
}

export const OwnerCell = <TData,>({ owner, column }: OwnerCellProps<TData>) => {
  const handleFilterClick = () => {
    const currentFilter = column.getFilterValue() as string[];
    const ownerLogin = owner.login as string;
    if (currentFilter?.includes(ownerLogin)) {
      column.setFilterValue(
        currentFilter.filter((item: string) => item !== ownerLogin),
      );
    } else {
      column.setFilterValue(
        currentFilter ? [...currentFilter, ownerLogin] : [ownerLogin],
      );
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleFilterClick}
      onMouseUp={(e) => e.stopPropagation()}
      className="flex self-start gap-2 hover:bg-primary w-full cursor-pointer"
    >
      {owner?.avatarUrl && (
        <img
          className="w-6 h-6 rounded-full"
          src={owner.avatarUrl}
          alt={owner.login || ""}
        />
      )}
      <span className="line-clamp-1">{owner?.login || "-"}</span>
    </Button>
  );
};
