import type {
  ContentItemWithStats,
  ContentType,
  ImportPreviewHandler,
  ParsedImportItem,
  PreviewItem,
} from "@/domain/models/content/types";
import { mapGenericItem, mapUrlItem } from "@/domain/services/content/parser";

import type { ImportSourceData } from "./StepSourceSelector";

export async function parseImportData(
  data: ImportSourceData,
  contentType: ContentType,
  existingItems: ContentItemWithStats[],
  onGetImportPreview?: ImportPreviewHandler,
): Promise<PreviewItem[]> {
  if (data.sourceType === "filesystem") {
    return parseFilesystemData(
      data,
      contentType,
      existingItems,
      onGetImportPreview,
    );
  }

  return parseStructuredData(data, contentType, existingItems);
}

// Filesystem parsing - delegates to server preview handler
async function parseFilesystemData(
  data: ImportSourceData,
  contentType: ContentType,
  existingItems: ContentItemWithStats[],
  onGetImportPreview?: ImportPreviewHandler,
): Promise<PreviewItem[]> {
  if (!onGetImportPreview) {
    throw new Error("Preview handler not available for folder imports");
  }

  const previewData = await onGetImportPreview(
    data.path,
    contentType as "image" | "document",
  );

  const existingIdentifiers = new Set(
    existingItems.map((item) => item.identifier),
  );

  return previewData.map((item) => ({
    id: item.id,
    name: item.name,
    type: contentType,
    status: existingIdentifiers.has(item.id) ? "exists" : "new",
    preview: item.previewUrl,
    metadata: {
      caption: item.caption,
      tags: item.tags,
    },
  }));
}

// Structured data parsing
async function parseStructuredData(
  data: ImportSourceData,
  contentType: ContentType,
  existingItems: ContentItemWithStats[],
): Promise<PreviewItem[]> {
  if (!data.parsedData || !Array.isArray(data.parsedData)) {
    throw new Error("Invalid structured data format");
  }

  const existingIdentifiers = new Set(
    existingItems.map((item) => item.identifier),
  );

  return data.parsedData.map((row, index) => {
    const parsedItem = parseRowToItem(row, contentType, index);

    const metadata = parsedItem.metadata;

    return {
      id: parsedItem.identifier,
      name: extractDisplayName(row, parsedItem.identifier),
      type: contentType,
      status: existingIdentifiers.has(parsedItem.identifier) ? "exists" : "new",
      preview: metadata.storage?.previewUrl || metadata.url?.openGraph?.image,
      metadata: {
        caption: extractCaption(parsedItem),
        tags: parsedItem.rawTags
          ? parsedItem.rawTags.split(", ").filter(Boolean)
          : [],
      },
    };
  });
}

function parseRowToItem(
  row: Record<string, unknown>,
  contentType: ContentType,
  fallbackIndex: number,
) {
  switch (contentType) {
    case "url":
      return mapUrlItem(row);
    case "document":
    case "image":
    case "video":
      return mapGenericItem(row, contentType, fallbackIndex);
    default:
      throw new Error(`Unsupported content type: ${contentType}`);
  }
}

function extractDisplayName(
  row: Record<string, unknown>,
  identifier: string,
): string {
  const title = row.title || row.name;
  return title && typeof title === "string" ? title.trim() : identifier;
}

function extractCaption(parsedItem: ParsedImportItem): string {
  const openGraphDesc = parsedItem.metadata?.url?.openGraph?.description;
  const openGraphExcerpt = parsedItem.metadata?.url?.openGraph?.excerpt;
  const userNotes = parsedItem.metadata?.user?.notes;

  return openGraphExcerpt || openGraphDesc || userNotes || "";
}
