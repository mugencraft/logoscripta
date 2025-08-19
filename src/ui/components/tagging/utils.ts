import type { TagLayout } from "@/domain/models/tagging/types";

export function getLayoutClasses(layout: TagLayout = "one-column"): string {
  switch (layout) {
    case "horizontal-pills":
      return "flex flex-wrap gap-2";
    case "compact-grid":
      return "grid grid-cols-3 gap-2";
    case "two-column":
      return "grid grid-cols-2 gap-4";
    case "one-column":
      return "grid grid-cols-1 gap-4";
    case "six-column":
      return "grid grid-cols-6 gap-4";
    default:
      return "space-y-3";
  }
}
