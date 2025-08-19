import { useMemo } from "react";

import type {
  ContentItemWithTags,
  ItemTagOperations,
} from "@/domain/models/content/types";
import type { TagSystemWithGroups } from "@/domain/models/tagging/types";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/ui/components/core/tabs";

import { TagGroupManager } from "../groups/TagGroupManager";
import { RawTagsAnalysis } from "./RawTagsAnalysis";

interface TagSystemManagerProps {
  item: ContentItemWithTags;
  system: TagSystemWithGroups;
  toggleSystemTag: ItemTagOperations["toggleSystemTag"];
}

export function TagSystemManager({
  item,
  system,
  toggleSystemTag,
}: TagSystemManagerProps) {
  const selectedSystemTags = useMemo(() => {
    return (item.tags || [])
      .filter((itemTag) => itemTag.tag.systemId === system.id)
      .map((itemTag) => itemTag.tag);
  }, [item.tags, system.id]);

  if (!system?.groups) {
    return <div>Loading system structure...</div>;
  }

  return (
    <Tabs defaultValue="raw-analysis" className="w-full">
      <TabsList aria-orientation="horizontal">
        <TabsTrigger value="raw-analysis">Raw Analysis</TabsTrigger>
        {system.groups.map((group) => (
          <TabsTrigger key={group.id} value={String(group.id)}>
            {group.name}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="raw-analysis">
        <RawTagsAnalysis
          item={item}
          system={system}
          selectedSystemTags={selectedSystemTags}
          toggleSystemTag={toggleSystemTag}
        />
      </TabsContent>

      {system.groups.map((group) => (
        <TabsContent key={group.id} value={String(group.id)}>
          <TagGroupManager
            item={item}
            group={group}
            categories={group.categories}
            systemId={system.id}
            selectedSystemTags={selectedSystemTags}
            toggleSystemTag={toggleSystemTag}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}
