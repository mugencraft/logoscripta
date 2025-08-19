import { useMemo } from "react";

import { parseTagsFromText } from "@/core/utils/parse";

// import { useTagValidation } from "@/ui/components/tagging/useTagValidation";

import { TagButton } from "@/ui/components/tagging/TagButton";

import type { CategoryTaggingProps } from "../types";
import { getLayoutClasses } from "../utils";

export function TagCategoryGrid({
  item,
  category,
  selectedSystemTags,
  layout,
  toggleSystemTag,
}: CategoryTaggingProps) {
  const rawTagNames = useMemo(
    () => parseTagsFromText(item.rawTags || ""),
    [item.rawTags],
  );

  // const validation = useTagValidation(system, selectedSystemTags);

  return (
    <div className={getLayoutClasses(layout)}>
      {category.tagAssociation?.map((association) => {
        const tag = association.tag;
        const isSelected = selectedSystemTags.some(
          (selectedTag) => selectedTag.id === tag.id,
        );
        const isInRawTags = rawTagNames.includes(tag.name);

        // const hasConflict = validation.conflicts.some(c => c.tag.id === tag.id);
        // const isRequired = validation.missing.some(m => m.tag.id === tag.id);

        // Check for oneOfKind violation
        const violatesOneOfKind =
          category.metadata?.rules?.oneOfKind &&
          selectedSystemTags.filter((t) =>
            category.tagAssociation?.some((assoc) => assoc.tag.id === t.id),
          ).length > 1;

        return (
          <TagButton
            key={tag.id}
            tag={tag}
            item={item}
            isSelected={isSelected}
            isInRawTags={isInRawTags}
            violatesRule={violatesOneOfKind ? "oneOfKind" : undefined}
            onClick={() => toggleSystemTag(item, tag)}
          />
        );
      })}
    </div>
  );
}
