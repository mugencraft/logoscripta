import type { ContentItem } from "@/domain/models/content/item";

import { ItemPreview } from "../item/ItemPreview";

interface PreviewCellProps {
  item: ContentItem;
}

export function PreviewCell({ item }: PreviewCellProps) {
  return (
    <div className="w-16 h-16 border rounded overflow-hidden bg-gray-50 dark:bg-gray-800">
      <ItemPreview item={item} />
    </div>
  );
}
