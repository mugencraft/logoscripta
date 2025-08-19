import { useMemo } from "react";

import { startCase } from "@/core/utils/format";
import type { TagMapping } from "@/domain/validation/tagging/group";

import { Badge } from "@/ui/components/core/badge";
import { Label } from "@/ui/components/core/label";
import { cn } from "@/ui/utils";

import type { AvailableTag } from "./types";

interface TagImageMappingProps {
  mappingTags: AvailableTag[];
  activeMappings: TagMapping[];
  onTagClick: (tagName: string) => void;
  selectedTag?: string;
}

export function TagImageMapping({
  mappingTags,
  activeMappings,
  onTagClick,
  selectedTag,
}: TagImageMappingProps) {
  const tagsByCategory = useMemo(() => {
    const grouped: Record<string, AvailableTag[]> = {};
    for (const tag of mappingTags) {
      if (!grouped[tag.categoryName]) {
        grouped[tag.categoryName] = [];
      }
      grouped[tag.categoryName]?.push(tag);
    }
    return grouped;
  }, [mappingTags]);

  const getTagStatus = (tagName: string) => {
    const mapping = activeMappings.find((m) => m.tagName === tagName);
    if (!mapping) return "available";
    return mapping.type; // 'focus', 'crop', 'frame'
  };

  const getTagVariant = (status: string, isSelected: boolean) => {
    if (isSelected) return "default";

    switch (status) {
      case "overlay":
        return "secondary";
      case "crop":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-4">
      <Label>Tag Mappings</Label>
      <div className="text-xs text-muted-foreground mb-3">
        Click on a tag to configure its mapping area
      </div>

      {Object.entries(tagsByCategory).map(([categoryName, tags]) => (
        <div key={categoryName} className="space-y-2">
          <div className="text-sm font-medium ">{startCase(categoryName)}</div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => {
              const status = getTagStatus(tag.name);
              const isSelected = selectedTag === tag.name;

              return (
                <Badge
                  key={tag.name}
                  variant={getTagVariant(status, isSelected)}
                  className={cn(
                    "cursor-pointer ",
                    isSelected
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  onClick={() => onTagClick(tag.name)}
                >
                  {tag.label}
                  {status !== "available" && (
                    <span className="ml-1 text-xs">({status})</span>
                  )}
                </Badge>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
