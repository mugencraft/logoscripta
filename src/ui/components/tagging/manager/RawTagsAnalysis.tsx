import { useMemo } from "react";

import { parseTagsFromText } from "@/core/utils/parse";
import type {
  ContentItemWithRelations,
  ItemTagOperations,
} from "@/domain/models/content/types";
import type { Tag } from "@/domain/models/tagging/tag";
import type { TagSystemWithGroups } from "@/domain/models/tagging/types";

import { RawTagSection } from "./RawTagSection";

interface RawTagsAnalysisProps {
  item: ContentItemWithRelations;
  system: TagSystemWithGroups;
  selectedSystemTags: Tag[];
  toggleSystemTag: ItemTagOperations["toggleSystemTag"];
}

export function RawTagsAnalysis({
  item,
  system,
  selectedSystemTags,
  toggleSystemTag,
}: RawTagsAnalysisProps) {
  const rawTags = useMemo(() => {
    return parseTagsFromText(item.rawTags);
  }, [item.rawTags]);

  const systemTags = useMemo(() => {
    return system.groups
      .flatMap((group) => group.categories)
      .flatMap((cat) => cat.tagAssociation.map((assoc) => assoc.tag));
  }, [system]);

  const categorizedTags = useMemo(() => {
    const matched: Tag[] = [];
    const unmatched: string[] = [];
    const alreadyInSystem: Tag[] = [];

    for (const rawTag of rawTags) {
      const tag = selectedSystemTags.find((tag) => tag.name === rawTag);
      if (tag) {
        alreadyInSystem.push(tag);
      } else {
        const tag = systemTags.find((tag) => tag.name === rawTag);
        tag ? matched.push(tag) : unmatched.push(rawTag);
      }
    }

    return { matched, unmatched, alreadyInSystem };
  }, [rawTags, selectedSystemTags, systemTags]);

  // Group matched tags by group name for better organization
  const groupedMatchedTags = useMemo(() => {
    const grouped: Record<string, Tag[]> = {};

    for (const tag of categorizedTags.matched) {
      const groupName = findTagGroup(tag, system) || "Unknown";
      if (!grouped[groupName]) {
        grouped[groupName] = [];
      }
      grouped[groupName].push(tag);
    }

    return grouped;
  }, [categorizedTags.matched, system]);

  const bulkAddToSystem = async () => {
    for (const tag of categorizedTags.matched) {
      await toggleSystemTag(item, tag);
    }

    return Promise.resolve();
  };

  return (
    <div className="space-y-6">
      <RawTagSection
        title="Already in System"
        tags={categorizedTags.alreadyInSystem}
        variant="success"
        item={item}
        toggleSystemTag={toggleSystemTag}
      />

      <RawTagSection
        title="Available to Add"
        tags={categorizedTags.matched}
        groupedTags={groupedMatchedTags}
        variant="warning"
        item={item}
        toggleSystemTag={toggleSystemTag}
        bulkAction={bulkAddToSystem}
      />

      <RawTagSection
        title="Not in Current System"
        tags={categorizedTags.unmatched}
        variant="muted"
        item={item}
        showCreateOption
      />
    </div>
  );
}

// Helper function to find which group a tag belongs to
function findTagGroup(tag: Tag, system: TagSystemWithGroups): string | null {
  if (!system?.groups) return null;

  for (const group of system.groups) {
    if (!group.categories) continue;

    for (const category of group.categories) {
      if (!category.tagAssociation) continue;

      const tagExists = category.tagAssociation.some(
        (association) => association.tag.id === tag.id,
      );

      if (tagExists) return group.name;
    }
  }

  return null;
}
