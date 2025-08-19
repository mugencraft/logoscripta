import { AlertTriangle, Check, Info, Lightbulb } from "lucide-react";

import type { ContentItemWithTags } from "@/domain/models/content/types";
import type { Tag } from "@/domain/models/tagging/tag";

import { Badge } from "@/ui/components/core/badge";
import { Button } from "@/ui/components/core/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/ui/components/core/tooltip";
import { cn } from "@/ui/utils";

interface TagButtonProps {
  tag: Tag;
  item: ContentItemWithTags;
  isSelected: boolean;
  isInRawTags: boolean;
  hasConflict?: boolean;
  isRequired?: boolean;
  isSuggested?: boolean;
  violatesRule?: string;
  onClick: () => void;
  className?: string;
}

export function TagButton({
  tag,
  // item,
  isSelected,
  isInRawTags,
  hasConflict,
  isRequired,
  isSuggested,
  violatesRule,
  onClick,
  className,
}: TagButtonProps) {
  const getButtonVariant = () => {
    if (hasConflict) return "destructive";
    if (isSelected) return "default";
    if (isSuggested) return "outline";
    return "outline";
  };

  const getButtonClasses = () => {
    return cn(
      "justify-start text-left relative transition-all",
      // Raw tags styling - distinctive border when tag exists in rawTags
      isInRawTags && "ring-2 ring-blue-200 dark:ring-blue-800",
      isInRawTags && isSelected && "ring-green-200 dark:ring-green-800",
      // Conflict styling
      hasConflict && "border-red-400 bg-red-50 dark:bg-red-950",
      // Required styling
      isRequired &&
        !isSelected &&
        "border-orange-400 bg-orange-50 dark:bg-orange-950",
      // Rule violation styling
      violatesRule && "border-yellow-400 bg-yellow-50 dark:bg-yellow-950",
      className,
    );
  };

  const getTooltipContent = () => {
    const messages = [];

    if (isInRawTags) {
      messages.push(
        isSelected
          ? "✓ Found in caption and selected in system"
          : "⚠ Found in caption but not selected in system",
      );
    }

    if (hasConflict) messages.push("⚡ Conflicts with other selected tags");
    if (isRequired) messages.push("❗ Required by system rules");
    if (violatesRule) messages.push(`⚠ Violates rule: ${violatesRule}`);
    if (isSuggested) messages.push("💡 Suggested by system");

    if (tag.description) messages.push(tag.description);

    return messages.join("\n");
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={getButtonVariant()}
          size="sm"
          className={getButtonClasses()}
          onClick={onClick}
        >
          <span className="truncate">{tag.label || tag.name}</span>

          {/* Status indicators */}
          <div className="flex items-center gap-1 ml-2">
            {isSelected && <Check className="h-3 w-3" />}
            {hasConflict && <AlertTriangle className="h-3 w-3 text-red-500" />}
            {isRequired && !isSelected && (
              <Badge variant="destructive" className="h-4 w-4 p-0 text-xs">
                !
              </Badge>
            )}
            {isSuggested && <Lightbulb className="h-3 w-3 text-blue-500" />}
            {(isInRawTags || hasConflict || isRequired || violatesRule) && (
              <Info className="h-3 w-3 text-muted-foreground" />
            )}
          </div>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <div className="max-w-xs whitespace-pre-line text-sm">
          {getTooltipContent()}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
