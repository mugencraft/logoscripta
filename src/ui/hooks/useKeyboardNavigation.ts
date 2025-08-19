import { useEffect } from "react";

interface KeyboardNavigationOptions {
  onLeft?: () => void;
  onRight?: () => void;
  onUp?: () => void;
  onDown?: () => void;
  onEscape?: () => void;
  onEnter?: () => void;
  onSave?: () => void;
  enabled?: boolean;
  deps?: React.DependencyList;
}

/**
 * Hook for handling keyboard navigation
 */
export function useKeyboardNavigation({
  onLeft,
  onRight,
  onUp,
  onDown,
  onEscape,
  onEnter,
  onSave,
  enabled = true,
  deps = [],
}: KeyboardNavigationOptions) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture keys when typing in form elements
      if (
        ["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(
          document.activeElement?.tagName || "",
        )
      ) {
        return;
      }

      // Check for Ctrl+S or Command+S
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        if (onSave) {
          e.preventDefault(); // Prevent browser default save behavior
          onSave();
          return;
        }
      }

      switch (e.key) {
        case "ArrowLeft":
          if (onLeft) {
            e.preventDefault();
            onLeft();
          }
          break;
        case "ArrowRight":
          if (onRight) {
            e.preventDefault();
            onRight();
          }
          break;
        case "ArrowUp":
          if (onUp) {
            e.preventDefault();
            onUp();
          }
          break;
        case "ArrowDown":
          if (onDown) {
            e.preventDefault();
            onDown();
          }
          break;
        case "Escape":
          if (onEscape) {
            e.preventDefault();
            onEscape();
          }
          break;
        case "Enter":
          if (onEnter) {
            e.preventDefault();
            onEnter();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    enabled,
    onLeft,
    onRight,
    onUp,
    onDown,
    onEscape,
    onEnter,
    onSave,
    ...deps,
  ]);
}
