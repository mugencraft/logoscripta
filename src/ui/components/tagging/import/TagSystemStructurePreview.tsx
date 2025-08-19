import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

import type { TagSystemData } from "@/domain/validation/tagging/system";

import { Badge } from "@/ui/components/core/badge";
import { Button } from "@/ui/components/core/button";

interface TagSystemStructurePreviewProps {
  systemData: TagSystemData;
}

export function TagSystemStructurePreview({
  systemData,
}: TagSystemStructurePreviewProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (groupName: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      newSet.has(groupName) ? newSet.delete(groupName) : newSet.add(groupName);
      return newSet;
    });
  };

  return (
    <div className="max-h-96 overflow-y-auto border rounded-lg p-4 space-y-2">
      {systemData.groups.map((group) => {
        const groupCategories = systemData.categories.filter(
          (cat) => cat.groupName === group.name,
        );
        const isExpanded = expandedGroups.has(group.name);

        return (
          <div key={group.name} className="border-l-2 border-primary pl-4">
            <Button
              variant="ghost"
              className="flex items-center gap-2 h-auto p-2"
              onClick={() => toggleGroup(group.name)}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              {group.label || group.name}
              <Badge variant="secondary" className="ml-2">
                {groupCategories.length} categories
              </Badge>
            </Button>

            {isExpanded && (
              <div className="mt-2 ml-6 space-y-1">
                {groupCategories.map((category) => {
                  const categoryTagCount =
                    systemData.tagCategoryAssociations.filter(
                      (assoc) => assoc.categoryName === category.name,
                    ).length;

                  return (
                    <div
                      key={category.name}
                      className="text-sm flex items-center gap-2"
                    >
                      <span className="font-medium">
                        {category.label || category.name}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {categoryTagCount} tags
                      </Badge>
                      {category.metadata?.rules?.oneOfKind && (
                        <Badge variant="destructive" className="text-xs">
                          One of kind
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
