import type { TagGroup } from "@/domain/models/tagging/group";
import type { Tag } from "@/domain/models/tagging/tag";
import type { TagCategoryWithTags } from "@/domain/models/tagging/types";

import { Badge } from "@/ui/components/core/badge";

interface GroupHeaderProps {
  group: TagGroup;
  categories: TagCategoryWithTags[];
  selectedSystemTags: Tag[];
}

export function GroupHeader({
  group,
  categories,
  selectedSystemTags,
}: GroupHeaderProps) {
  const selectedCount = selectedSystemTags.filter((tag) =>
    isTagInGroup(tag.name, categories),
  ).length;

  return (
    <div className="flex items-center justify-between">
      <h3 className="font-medium">{group.name}</h3>
      <Badge variant="secondary">{selectedCount} selected</Badge>
    </div>
  );
}

function isTagInGroup(
  tagName: string,
  categories: TagCategoryWithTags[],
): boolean {
  return categories.some((category) =>
    category.tagAssociation?.some(
      (association) =>
        association.tag.name === tagName ||
        association.tag.label === tagName ||
        association.tag.name.toLowerCase() === tagName.toLowerCase(),
    ),
  );
}
