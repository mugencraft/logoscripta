import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";

import { useKeyboardNavigation } from "@/ui/hooks/useKeyboardNavigation";

const STORAGE_KEY = "items-navigation-active-group";

interface UseItemsNavigatorProps {
  itemIds: number[];
  currentItemId: number;
  collectionId?: number;
}

export function useItemsNavigator({
  itemIds,
  currentItemId,
  collectionId,
}: UseItemsNavigatorProps) {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [activeGroup, setActiveGroup] = useState<number | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? Number.parseInt(stored, 10) : null;
  });

  // Find current item and set index
  useEffect(() => {
    const index = itemIds.indexOf(currentItemId);
    setCurrentIndex(index);
  }, [itemIds, currentItemId]);

  // Save active group to localStorage
  useEffect(() => {
    if (activeGroup !== null) {
      localStorage.setItem(STORAGE_KEY, activeGroup.toString());
    }
  }, [activeGroup]);

  const navigateToItem = useCallback(
    (direction: "next" | "prev") => {
      if (itemIds.length === 0 || currentIndex === -1) return;

      const newIndex =
        direction === "next"
          ? (currentIndex + 1) % itemIds.length
          : (currentIndex - 1 + itemIds.length) % itemIds.length;

      const targetItemId = itemIds[newIndex];
      if (!targetItemId) return;

      // Navigate based on context
      if (collectionId) {
        navigate({
          to: "/content/collections/$collectionId/items/$itemId",
          params: {
            collectionId: collectionId.toString(),
            itemId: targetItemId.toString(),
          },
        });
      } else {
        navigate({
          to: "/content/items/$itemId",
          params: { itemId: targetItemId.toString() },
        });
      }
    },
    [itemIds, currentIndex, navigate, collectionId],
  );

  // Keyboard navigation
  useKeyboardNavigation({
    onLeft: () => navigateToItem("prev"),
    onRight: () => navigateToItem("next"),
    deps: [navigateToItem],
  });

  return {
    // Navigation state
    currentIndex,
    totalItems: itemIds.length,
    navigateToItem,
    canNavigate: itemIds.length > 1 && currentIndex !== -1,

    // Tag group management
    activeGroup,
    setActiveGroup,
  };
}
