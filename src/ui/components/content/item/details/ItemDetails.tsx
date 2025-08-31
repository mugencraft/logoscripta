import { useRef } from "react";

import type {
  ContentItemWithRelations,
  ItemTagOperations,
} from "@/domain/models/content/types";

import { SystemMetadata } from "../../../metadata/SystemMetadata";
import { ItemPreview } from "../ItemPreview";
import { ItemMetadata } from "./ItemMetadata";
import { ItemTags } from "./ItemTags";

interface ItemDetailsProps {
  item: ContentItemWithRelations;
  linkToCollection?: boolean;
  toggleRawTag: ItemTagOperations["toggleRawTag"];
}

export function ItemDetails({ item, toggleRawTag }: ItemDetailsProps) {
  const itemContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col gap-2">
      {/* Item preview container */}
      <div
        ref={itemContainerRef}
        className="relative border rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800"
        style={{ aspectRatio: "1", minHeight: "300px" }}
      >
        <div className="w-full h-full">
          <ItemPreview item={item} className="w-full h-full" />
        </div>
      </div>

      {/* Item information */}
      <div className="px-2">
        <ItemMetadata item={item} />
        <ItemTags
          item={item}
          onToggleTag={(tagName) => toggleRawTag(item, tagName)}
        />
        <SystemMetadata metadata={item.metadata} />
      </div>
    </div>
  );
}
