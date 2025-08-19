import type { ContentItem } from "@/domain/models/content/item";

export const ItemMetadata = ({ item }: { item: ContentItem }) => {
  return (
    <>
      <p className="text-xs font-mono text-gray-500 mb-2">{item.identifier}</p>

      {item.title && item.title !== item.identifier && (
        <p className="text-sm font-medium mb-2">{item.title}</p>
      )}

      <p className="text-xs text-gray-500 mb-2">Type: {item.contentType}</p>

      {item.rawTags && (
        <div className="mb-4">
          <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Caption:
          </h4>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {item.rawTags}
          </p>
        </div>
      )}
    </>
  );
};
