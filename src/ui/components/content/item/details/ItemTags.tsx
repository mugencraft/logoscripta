import { X } from "lucide-react";

import type { ContentItemWithTags } from "@/domain/models/content/types";

import { Badge } from "@/ui/components/core/badge";
import { Button } from "@/ui/components/core/button";

export const ItemTags = ({
  item,
  onToggleTag,
}: {
  item: ContentItemWithTags;
  onToggleTag?: (tagName: string) => void;
}) => {
  const tagCount = item.tags?.length || 0;

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium mb-1">
        {tagCount > 0 ? `Selected Tags (${tagCount})` : "No tags"}:
      </h3>
      {item.tags && tagCount > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {item.tags.map((itemTag) => (
            <Badge
              key={`${itemTag.tagId}-${itemTag.systemId}`}
              variant="secondary"
              className="text-xs"
            >
              {itemTag.tag.name}
              {onToggleTag && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-3 w-3 p-0 ml-1 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => onToggleTag(itemTag.tag.name)}
                  title="Remove tag"
                >
                  <X className="h-2 w-2" />
                </Button>
              )}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
