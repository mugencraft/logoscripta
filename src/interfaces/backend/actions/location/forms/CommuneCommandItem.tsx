import { Check } from "lucide-react";

import type { CommuneWithStats } from "@/domain/models/location/types";

import { Badge } from "@/ui/components/core/badge";
import { CommandItem } from "@/ui/components/core/command";
import { cn } from "@/ui/utils";

interface CommuneCommandItemProps {
  commune: CommuneWithStats;
  isSelected: boolean;
  onSelect: () => void;
  showCapitalBadge?: boolean;
}

export const CommuneCommandItem = ({
  commune,
  isSelected,
  onSelect,
  showCapitalBadge = false,
}: CommuneCommandItemProps) => {
  return (
    <CommandItem value={commune.code} onSelect={onSelect}>
      <Check
        className={cn("mr-2 h-4 w-4", isSelected ? "opacity-100" : "opacity-0")}
      />
      <div className="flex flex-col flex-1">
        <div className="flex items-center gap-2">
          <span>{commune.name}</span>
          {showCapitalBadge && commune.isCapital && (
            <Badge variant="secondary" className="text-xs">
              Capital
            </Badge>
          )}
        </div>
        <span className="text-sm text-muted-foreground">
          {commune.namesPath.split("/").slice(0, -1).join(" → ")}
          {commune.poisCount > 0 && ` • ${commune.poisCount} POIs`}
        </span>
      </div>
    </CommandItem>
  );
};
