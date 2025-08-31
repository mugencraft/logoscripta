import { useEffect, useState } from "react";

import type { ContentItem } from "@/domain/models/content/item";
import type { ContentItemWithRelations } from "@/domain/models/content/types";
import type { TagSystem } from "@/domain/models/tagging/system";
import type { Tag } from "@/domain/models/tagging/tag";
import type { TagSystemWithGroups } from "@/domain/models/tagging/types";
import { trpcBase } from "@/interfaces/server-client";

import { ItemDetails } from "@/ui/components/content/item/details/ItemDetails";
import { Label } from "@/ui/components/core/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/components/core/select";
import { ViewContainer } from "@/ui/components/layout/ViewContainer";
import { TagSystemManager } from "@/ui/components/tagging/manager/TagSystemManager";

// import { useKeyboardNavigation } from "@/ui/hooks/useKeyboardNavigation";

import { useItemTaggingActions } from "../../../actions/content/useItemTaggingActions";
import { useItemsNavigator } from "./useItemsNavigator";

interface ItemDetailViewProps {
  tagSystems: TagSystem[];
  item: ContentItemWithRelations;
  itemIds: number[]; // for navigation
  linkToCollection: boolean; // for navigate to collection or items
}

export function ItemDetailView({
  tagSystems,
  item,
  itemIds,
  linkToCollection,
}: ItemDetailViewProps) {
  const initialSystemId = item.tags?.[0]?.tag.systemId;
  const [activeSystemId, setActiveSystemId] = useState<number | null>(
    initialSystemId || null,
  );
  const [activeSystemStructure, setActiveSystemStructure] =
    useState<TagSystemWithGroups | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { canNavigate, currentIndex, totalItems } = useItemsNavigator({
    itemIds,
    currentItemId: item.id,
    collectionId: linkToCollection ? item.collectionId : undefined,
  });

  const { toggleRawTag, toggleSystemTag } = useItemTaggingActions();

  const handleRawTagToggle = async (item: ContentItem, tagName: string) => {
    if (tagName) {
      const result = await toggleRawTag(item, tagName);
      if (result.success && result.data) {
        item.rawTags = result.data.rawTags;
      }
    }
    return Promise.resolve({ success: true, data: item });
  };

  const handleSystemTagToggle = async (
    item: ContentItemWithRelations,
    tag: Tag,
  ) => {
    if (tag) {
      const result = await toggleSystemTag(item, tag);
      if (result.success && result.data) {
        item.tags = result.data.tags;
      }
    }

    return Promise.resolve({ success: true, data: item });
  };

  // TODO: fix this, get called 4 times
  console.log("activeSystemId:", activeSystemId);
  // Load system structure when active system changes
  useEffect(() => {
    if (activeSystemId) {
      // TODO: fix this, get called 2 times
      console.log("Loading system structure for:", activeSystemId);
      setIsLoading(true);
      trpcBase.tagging.systems.getStructure
        .query(activeSystemId)
        .then(setActiveSystemStructure)
        .finally(() => setIsLoading(false));
    }
  }, [activeSystemId]);

  // TODO: check the use of useKeyboardNavigation in useItemsNavigator and remove this if it works
  // useKeyboardNavigation({
  //   onLeft: () => canNavigate && navigateToItem("prev"),
  //   onRight: () => canNavigate && navigateToItem("next"),
  //   deps: [navigateToItem, canNavigate],
  // });

  const title = linkToCollection
    ? `${item.collection.name} › ${item.title || item.identifier}`
    : `Item: ${item.title || item.identifier}`;

  const description = linkToCollection
    ? `Edit item in ${item.collection.name} collection ${canNavigate ? `(${currentIndex + 1}/${totalItems})` : ""}`
    : `Edit item details and manage tags ${canNavigate ? `(${currentIndex + 1}/${totalItems})` : ""}`;

  return (
    <ViewContainer title={title} description={description}>
      <div className="grid grid-cols-[1fr_5fr] gap-4 h-[calc(100vh-80px)]">
        <div>
          {/* <TagsInference tagging={taggingData} /> */}
          <ItemDetails
            item={item}
            toggleRawTag={handleRawTagToggle}
            linkToCollection={linkToCollection}
          />
        </div>

        {/* TagSystemSelector */}
        <div className="overflow-y-auto border rounded-lg p-2">
          {activeSystemId ? (
            <div className="space-y-4">
              {/* Sistema selector */}
              <div className="space-y-2">
                <Label>Tag System</Label>
                <Select
                  value={activeSystemId?.toString()}
                  onValueChange={(value) => setActiveSystemId(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a tag system" />
                  </SelectTrigger>
                  <SelectContent>
                    {tagSystems?.map((system) => (
                      <SelectItem key={system.id} value={system.id.toString()}>
                        {system.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isLoading ? (
                <div className="text-center text-muted-foreground p-8">
                  Loading system structure...
                </div>
              ) : activeSystemStructure ? (
                <TagSystemManager
                  item={item}
                  system={activeSystemStructure}
                  toggleSystemTag={handleSystemTagToggle}
                />
              ) : (
                <div className="text-center text-muted-foreground p-8">
                  Please select a tag system to start managing tags
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-muted-foreground p-8">
              Please select a tag system to start managing tags
            </div>
          )}
        </div>
      </div>
    </ViewContainer>
  );
}
