import { useMemo } from "react";

import { startCase } from "@/core/utils/format";
import type { TagConfiguration } from "@/domain/validation/tagging/group";

import { Badge } from "@/ui/components/core/badge";
import { Label } from "@/ui/components/core/label";
import { cn } from "@/ui/utils";

import type { AvailableTag, TagsByCategory } from "./types";

interface TagCombinationProps {
  selectedTags: string[];
  activationTags: AvailableTag[];
  onUpdate: (updates: Partial<TagConfiguration>) => void;
}

export const TagCombinationSelector = ({
  selectedTags,
  activationTags,
  onUpdate,
}: TagCombinationProps) => {
  const tagsByCategory = useMemo(() => {
    const grouped: TagsByCategory = {};
    for (const tag of activationTags) {
      if (!grouped[tag.categoryName]) {
        grouped[tag.categoryName] = {
          tags: [],
          isOneOfKind: tag.isOneOfKind,
        };
      }
      grouped[tag.categoryName]?.tags.push(tag);
    }
    return grouped;
  }, [activationTags]);

  const handleTagSelection = (tagName: string) => {
    const clickedTag = activationTags.find((tag) => tag.name === tagName);
    if (!clickedTag) return;

    let newTags: string[];

    if (selectedTags.includes(tagName)) {
      // Deselect the tag
      newTags = selectedTags.filter((t) => t !== tagName);
    } else {
      // Select the tag
      if (clickedTag.isOneOfKind) {
        // For oneOfKind categories, replace any existing selection from the same category
        const tagsFromOtherCategories = selectedTags.filter(
          (existingTagName) => {
            const existingTag = activationTags.find(
              (tag) => tag.name === existingTagName,
            );
            return existingTag?.categoryId !== clickedTag.categoryId;
          },
        );
        newTags = [...tagsFromOtherCategories, tagName];
      } else {
        // For normal categories, just add to selection
        newTags = [...selectedTags, tagName];
      }
    }

    onUpdate({
      tagNames: newTags,
    });
  };

  return (
    <div className="space-y-3">
      <Label>Tag Combination</Label>
      <div className="text-xs text-muted-foreground mb-2">
        Select which tags (or combination of tags) will trigger this image
      </div>

      {Object.entries(tagsByCategory).map(([categoryName, categoryInfo]) => (
        <div key={categoryName} className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium">{startCase(categoryName)}</div>
            {categoryInfo.isOneOfKind && (
              <Badge
                variant="outline"
                className="text-xs text-muted-foreground"
              >
                One only
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {categoryInfo.tags.map((tag) => {
              const isSelected = selectedTags.includes(tag.name);
              return (
                <Badge
                  key={tag.name}
                  variant={isSelected ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer ",
                    isSelected
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  onClick={() => {
                    handleTagSelection(tag.name);
                  }}
                >
                  {tag.label}
                </Badge>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
