import { useMemo } from "react";

import type { TagCategoryWithTags } from "@/domain/models/tagging/types";

export interface CategoryGroup {
  name: string;
  categories: TagCategoryWithTags[];
  order: number;
}

export function useCategoryGrouping(
  categories: TagCategoryWithTags[],
): CategoryGroup[] {
  return useMemo(() => {
    const groups = new Map<string, CategoryGroup>();

    for (const category of categories) {
      const groupName = category.metadata?.display?.sectionGroup || "default";
      const order = category.metadata?.display?.sectionOrder ?? 999;

      if (!groups.has(groupName)) {
        groups.set(groupName, {
          name: groupName,
          categories: [],
          order,
        });
      }

      groups.get(groupName)?.categories.push(category);
    }

    return Array.from(groups.values())
      .sort((a, b) => a.order - b.order)
      .map((group) => ({
        ...group,
        categories: group.categories.sort(
          (a, b) =>
            (a.metadata?.display?.order || 0) -
            (b.metadata?.display?.order || 0),
        ),
      }));
  }, [categories]);
}
