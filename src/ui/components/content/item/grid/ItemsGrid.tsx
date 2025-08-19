import { useState } from "react";

import type {
  ContentItemWithStats,
  ItemDetailLink,
} from "@/domain/models/content/types";

import { useKeyboardNavigation } from "@/ui/hooks/useKeyboardNavigation";
import { cn } from "@/ui/utils";

import { ItemPreview } from "../ItemPreview";
import { ItemInfo } from "./ItemInfo";

interface ItemsGridProps {
  items: ContentItemWithStats[];
  getItemDetailLink: ItemDetailLink;
  linkToCollection?: boolean;
}

export function ItemsGrid({
  items,
  getItemDetailLink,
  linkToCollection,
}: ItemsGridProps) {
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [previewItem, setPreviewItem] = useState<ContentItemWithStats | null>(
    null,
  );

  const handleKeyboardNavigation = (
    direction: "prev" | "next" | "up" | "down",
  ) => {
    if (items.length === 0) return;

    const gridColumns = 6; // Standard grid column count
    let newIndex = highlightedIndex;

    switch (direction) {
      case "prev":
        newIndex =
          highlightedIndex > 0 ? highlightedIndex - 1 : items.length - 1;
        break;
      case "next":
        newIndex =
          highlightedIndex < items.length - 1 ? highlightedIndex + 1 : 0;
        break;
      case "up":
        newIndex =
          highlightedIndex >= gridColumns
            ? highlightedIndex - gridColumns
            : Math.max(
                0,
                items.length - gridColumns + (highlightedIndex % gridColumns),
              );
        break;
      case "down":
        newIndex =
          highlightedIndex + gridColumns < items.length
            ? highlightedIndex + gridColumns
            : highlightedIndex % gridColumns;
        break;
    }

    setHighlightedIndex(newIndex);

    if (newIndex >= 0 && newIndex < items.length) {
      const item = items[newIndex];
      if (item) {
        setPreviewItem(item);
      }
    }
  };

  const handleItemClick = (item: ContentItemWithStats, index: number) => {
    setHighlightedIndex(index);
    setPreviewItem(item);
  };

  // Configure keyboard navigation
  useKeyboardNavigation({
    onLeft: () => handleKeyboardNavigation("prev"),
    onRight: () => handleKeyboardNavigation("next"),
    onUp: () => handleKeyboardNavigation("up"),
    onDown: () => handleKeyboardNavigation("down"),
    deps: [handleKeyboardNavigation, items],
  });

  // Handle empty state
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No items match the current filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Item Grid */}
      <div className="space-y-4">
        <div className="grid grid-cols-6 gap-2">
          {items.map((item, index) => (
            // biome-ignore lint/a11y/noStaticElementInteractions: fix this
            <div
              key={item.id}
              className={cn(
                "relative aspect-square border rounded cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all",
                highlightedIndex === index &&
                  "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950",
              )}
              onMouseUp={() => handleItemClick(item, index)}
            >
              <ItemPreview item={item} />

              {/* Tag count indicator */}
              <div className="absolute top-1 right-1 bg-black/70 text-white text-xs rounded px-1">
                {item.totalTags}
              </div>
            </div>
          ))}
        </div>

        <div className="text-sm text-gray-500 text-center">
          {items.length} items • Use arrow keys to navigate
        </div>
      </div>

      {/* Item Preview and Details */}
      <div className="sticky top-4">
        {previewItem ? (
          <ItemInfo
            item={previewItem}
            getItemDetailLink={getItemDetailLink}
            linkToCollection={linkToCollection}
          />
        ) : (
          <div className="flex items-center justify-center h-64 border rounded-lg bg-gray-50 dark:bg-gray-900">
            <p className="text-gray-500">Select an item to preview</p>
          </div>
        )}
      </div>
    </div>
  );
}
