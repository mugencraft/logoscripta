import { useMemo } from "react";

import type { Tag } from "@/domain/models/tagging/tag";
import type { TagSystemWithGroups } from "@/domain/models/tagging/types";

export interface TagValidationResult {
  conflicts: Array<{ tag: Tag; conflictsWith: Tag[] }>;
  missing: Array<{ tag: Tag; requires: Tag[] }>;
  violations: Array<{ categoryId: number; rule: string; tags: Tag[] }>;
  suggestions: Array<{
    tag: Tag;
    reason: string;
    severity: "high" | "medium" | "low";
  }>;
}

export function useTagValidation(
  system: TagSystemWithGroups,
  selectedSystemTags: Tag[],
): TagValidationResult {
  return useMemo(() => {
    const conflicts: TagValidationResult["conflicts"] = [];
    const missing: TagValidationResult["missing"] = [];
    const violations: TagValidationResult["violations"] = [];
    const suggestions: TagValidationResult["suggestions"] = [];

    // Validate relationships between selected tags
    for (const tag of selectedSystemTags) {
      // Check for conflicts from tag relationships
      const tagConflicts = selectedSystemTags.filter(
        (otherTag) =>
          otherTag.id !== tag.id &&
          // This would need tag relationships data - placeholder logic
          false,
      );

      if (tagConflicts.length > 0) {
        conflicts.push({ tag, conflictsWith: tagConflicts });
      }
    }

    // Validate category rules
    for (const group of system.groups) {
      for (const category of group.categories) {
        const categoryTags = selectedSystemTags.filter((tag) =>
          category.tagAssociation?.some((assoc) => assoc.tag.id === tag.id),
        );

        // Check oneOfKind rule
        if (category.metadata?.rules?.oneOfKind && categoryTags.length > 1) {
          violations.push({
            categoryId: category.id,
            rule: "oneOfKind",
            tags: categoryTags,
          });
        }

        // Check required rule
        if (category.metadata?.rules?.required && categoryTags.length === 0) {
          // Suggest adding a tag from this category
          const availableTags =
            category.tagAssociation?.map((assoc) => assoc.tag) || [];
          if (availableTags.length > 0 && availableTags[0]) {
            suggestions.push({
              tag: availableTags[0],
              reason: `Required category: ${category.name}`,
              severity: "high",
            });
          }
        }
      }
    }

    return { conflicts, missing, violations, suggestions };
  }, [system, selectedSystemTags]);
}
