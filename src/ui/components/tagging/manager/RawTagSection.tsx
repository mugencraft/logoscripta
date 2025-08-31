import { Plus } from "lucide-react";

import type {
  ContentItemWithRelations,
  ItemTagOperations,
} from "@/domain/models/content/types";
import type { Tag } from "@/domain/models/tagging/tag";

import { Badge } from "@/ui/components/core/badge";
import { Button } from "@/ui/components/core/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/ui/components/core/card";

interface TagSectionProps {
  title: string;
  tags: Tag[] | string[];
  groupedTags?: Record<string, Tag[]>;
  variant: "success" | "warning" | "muted";
  item: ContentItemWithRelations;
  toggleSystemTag?: ItemTagOperations["toggleSystemTag"];
  toggleRawTag?: ItemTagOperations["toggleRawTag"];
  bulkAction?: () => Promise<void>;
  showCreateOption?: boolean;
}

export function RawTagSection({
  title,
  tags,
  groupedTags,
  variant,
  item,
  toggleSystemTag,
  toggleRawTag,
  bulkAction,
  showCreateOption = false,
}: TagSectionProps) {
  const handleBulkAction = async () => {
    if (!bulkAction) return;

    try {
      await bulkAction();
    } catch (error) {
      console.error("Bulk action failed:", error);
    }
  };

  if (tags.length === 0 && !showCreateOption) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{tags.length}</Badge>
          {bulkAction && tags.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkAction}
              className="h-6 px-2 text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {tags.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {showCreateOption ? "No unmatched tags" : "No tags available"}
          </p>
        ) : groupedTags ? (
          <div className="space-y-3">
            {Object.entries(groupedTags).map(([groupName, groupTags]) => (
              <div key={groupName}>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  {groupName}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {groupTags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant={getInteractiveBadgeVariant(variant)}
                      onClick={() => toggleSystemTag?.(item, tag)}
                    >
                      {tag.label || tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge
                key={typeof tag === "string" ? tag : tag.id}
                variant={getInteractiveBadgeVariant(variant)}
                onClick={() =>
                  typeof tag === "string"
                    ? toggleRawTag?.(item, tag)
                    : toggleSystemTag?.(item, tag)
                }
              >
                {typeof tag === "string" ? tag : tag.label || tag.name}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const getInteractiveBadgeVariant = (variant: TagSectionProps["variant"]) => {
  switch (variant) {
    case "success":
      return "interactive-success";
    case "warning":
      return "interactive-warning";
    case "muted":
      return "interactive";
    default:
      return "interactive";
  }
};
