import { FileText, Film, Image, Link } from "lucide-react";

import type { ContentItem } from "@/domain/models/content/item";

interface ItemPreviewProps {
  item: ContentItem;
  className?: string;
}

export function ItemPreview({ item, className = "" }: ItemPreviewProps) {
  const baseClasses = `w-full h-full object-cover rounded ${className}`;

  const getPreviewUrl = (): string | null => {
    const metadata = item.metadata;

    // For images, try to get the image URL from metadata
    if (item.contentType === "image") {
      return metadata?.content?.previewUrl || null;
    }

    // For videos, try to get thumbnail
    if (item.contentType === "video") {
      return metadata.content?.thumbnail || null;
    }

    return null;
  };

  const previewUrl = getPreviewUrl();

  switch (item.contentType) {
    case "image":
      return previewUrl ? (
        <img
          src={previewUrl}
          alt={item.title || item.identifier}
          className={baseClasses}
          loading="lazy"
        />
      ) : (
        <div
          className={`${baseClasses} flex items-center justify-center bg-gray-100 dark:bg-gray-800`}
        >
          <Image className="h-8 w-8 text-gray-400" />
        </div>
      );

    case "video":
      return previewUrl ? (
        <div className="relative">
          <img
            src={previewUrl}
            alt={item.title || item.identifier}
            className={baseClasses}
            loading="lazy"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded">
            <Film className="h-8 w-8 text-white" />
          </div>
        </div>
      ) : (
        <div
          className={`${baseClasses} flex items-center justify-center bg-gray-100 dark:bg-gray-800`}
        >
          <Film className="h-8 w-8 text-gray-400" />
        </div>
      );

    case "document":
      return (
        <div
          className={`${baseClasses} flex items-center justify-center bg-gray-100 dark:bg-gray-800`}
        >
          <FileText className="h-8 w-8 text-gray-400" />
        </div>
      );

    case "url":
      return (
        <div
          className={`${baseClasses} flex items-center justify-center bg-gray-100 dark:bg-gray-800`}
        >
          <Link className="h-8 w-8 text-gray-400" />
        </div>
      );

    default:
      return (
        <div
          className={`${baseClasses} flex items-center justify-center bg-gray-100 dark:bg-gray-800`}
        >
          <FileText className="h-8 w-8 text-gray-400" />
        </div>
      );
  }
}
