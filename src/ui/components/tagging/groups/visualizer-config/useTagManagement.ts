import { useCallback, useMemo } from "react";

import type {
  TagCategoryWithTags,
  TagGroupWithCategories,
} from "@/domain/models/tagging/types";
import type { TagsVisualizerConfig } from "@/domain/validation/tagging/group";

import type { AvailableTag } from "./editor/types";

interface UseTagManagementReturn {
  activationTags: AvailableTag[];
  mappingTags: AvailableTag[];
  createCategorySelectionHandler: (
    updateConfig: (updates: Partial<TagsVisualizerConfig>) => void,
  ) => (categoryIds: number[]) => void;
}

export function useTagManagement(
  group: TagGroupWithCategories,
  activationCategoryIds: number[],
): UseTagManagementReturn {
  const createAvailableTags = useCallback(
    (categories: TagCategoryWithTags[]) => {
      return categories.flatMap(
        (cat) =>
          cat.tagAssociation?.map((assoc) => ({
            name: assoc.tag.name,
            label: assoc.tag.label || assoc.tag.name,
            categoryName: cat.name,
            categoryId: cat.id,
            isOneOfKind: cat.metadata?.rules?.oneOfKind || false,
          })) || [],
      );
    },
    [],
  );
  const activationTags = useMemo(() => {
    if (!activationCategoryIds?.length) return [];
    const selectedCategories = group.categories.filter((cat) =>
      activationCategoryIds.includes(cat.id),
    );
    return createAvailableTags(selectedCategories);
  }, [group.categories, activationCategoryIds, createAvailableTags]);

  const mappingTags = useMemo(() => {
    const nonActivationCategories = group.categories.filter(
      (cat) => !activationCategoryIds.includes(cat.id),
    );
    return createAvailableTags(nonActivationCategories);
  }, [group.categories, activationCategoryIds, createAvailableTags]);

  const createCategorySelectionHandler = useCallback(
    (updateConfig: (updates: Partial<TagsVisualizerConfig>) => void) => {
      return (categoryIds: number[]) => {
        updateConfig({
          activationCategoryIds: categoryIds,
          tagConfigurations: [],
        });
      };
    },
    [],
  );

  return {
    activationTags,
    mappingTags,
    createCategorySelectionHandler,
  };
}
