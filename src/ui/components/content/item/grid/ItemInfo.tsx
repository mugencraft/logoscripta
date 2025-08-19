import { Link } from "lucide-react";

import type {
  ContentItemWithStats,
  ItemDetailLink,
} from "@/domain/models/content/types";

import { Badge } from "@/ui/components/core/badge";

import { ItemPreview } from "../ItemPreview";

interface ItemInfoProps {
  item: ContentItemWithStats;
  getItemDetailLink: ItemDetailLink;
  linkToCollection?: boolean;
}

export function ItemInfo({
  item,
  getItemDetailLink,
  linkToCollection,
}: ItemInfoProps) {
  return (
    <div className="space-y-4 bg-white dark:bg-gray-900 border rounded-lg p-4">
      {/* Item Preview */}
      <div className="aspect-square border rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800">
        <ItemPreview item={item} />
      </div>

      {/* Item Information */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {item.contentType}
          </Badge>
          <span className="text-xs text-gray-500">ID: {item.id}</span>
        </div>

        <div>
          <h3 className="font-medium text-sm">
            <Link
              to={getItemDetailLink(item, linkToCollection)}
              className="font-mono text-sm hover:underline text-blue-600 dark:text-blue-400"
            >
              {item.title || item.identifier}
            </Link>
          </h3>
          {item.title && (
            <p className="text-xs text-gray-500 font-mono">{item.identifier}</p>
          )}
        </div>

        {/* Caption */}
        {item.rawTags && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p className="font-medium text-xs uppercase tracking-wide text-gray-500 mb-1">
              Caption
            </p>
            <p className="text-xs leading-relaxed">{item.rawTags}</p>
          </div>
        )}
      </div>

      {/* Tags Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-sm">Tags</h4>
          <Badge variant="outline" className="text-xs">
            {item.totalTags}
          </Badge>
        </div>
      </div>

      {/* Metadata Section */}
      <div className="text-xs text-gray-500 space-y-1 pt-2 border-t">
        <div className="flex justify-between">
          <span>Created:</span>
          <span>
            {new Date(item.metadata.system.createdAt).toLocaleDateString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Updated:</span>
          <span>
            {item.metadata.system.updatedAt
              ? new Date(item.metadata.system.updatedAt).toLocaleDateString()
              : "-"}
          </span>
        </div>
      </div>
    </div>
  );
}
