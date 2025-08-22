import type { ContentType, ParsedImportItem } from "../../models/content/types";
import { contentItemMetadataSchema } from "../../validation/content/item";
import { createMetadata } from "../shared/metadata";

export const mapGenericItem = (
  row: Record<string, unknown>,
  contentType: ContentType,
  fallbackIndex: number,
): ParsedImportItem => {
  const identifierFieldsMap: Record<ContentType, string[]> = {
    url: ["url", "link", "href"],
    document: ["filename", "title", "name", "path"],
    image: ["filename", "id", "name", "path"],
    video: ["filename", "id", "name", "path"],
  };

  const fields = identifierFieldsMap[contentType];
  const identifier =
    findFieldValue(row, fields) || `${contentType}-${fallbackIndex}`;
  const title = findFieldValue(row, ["title", "name"]) || identifier;
  const tags = findFieldValue(row, ["tags", "keywords"]);

  return {
    identifier,
    title,
    contentType,
    rawTags: tags ? normalizeTags(tags) : undefined,
    metadata: createMetadata(contentItemMetadataSchema, {
      storage: {
        previewUrl: findFieldValue(row, [
          "cover",
          "image",
          "thumbnail",
          "preview",
        ]),
        localPath: findFieldValue(row, ["path", "filename"]),
        mimeType: findFieldValue(row, ["mimeType", "type"]),
        fileSize: parseNumber(findFieldValue(row, ["size", "fileSize"])),
      },
      user: {
        notes: findFieldValue(row, ["note", "notes", "description"]),
        category: findFieldValue(row, ["folder", "category"]),
        rating: parseRating(findFieldValue(row, ["rating", "stars"])),
      },
    }),
  };
};

const parseNumber = (value: string | undefined): number | undefined => {
  if (!value) return undefined;
  const num = Number(value);
  return Number.isNaN(num) ? undefined : num;
};

export const mapUrlItem = (row: Record<string, unknown>): ParsedImportItem => {
  const url = findFieldValue(row, ["url", "link", "href"]);
  if (!url) {
    throw new Error("Missing required URL field");
  }

  try {
    new URL(url); // Validation
  } catch {
    throw new Error(`Invalid URL format: ${url}`);
  }

  const title = findFieldValue(row, ["title", "name"]) || new URL(url).hostname;
  const tags = findFieldValue(row, ["tags", "keywords"]);
  const originalId = findFieldValue(row, ["id", "_id"]);
  const favorite = findFieldValue(row, ["favorite", "starred"]);

  return {
    identifier: url,
    title,
    contentType: "url",
    rawTags: tags ? normalizeTags(tags) : undefined,
    metadata: createMetadata(contentItemMetadataSchema, {
      url: {
        domain: new URL(url).hostname,
        favicon: findFieldValue(row, ["favicon"]),
        openGraph: {
          title,
          description: findFieldValue(row, ["description"]),
          excerpt: findFieldValue(row, ["excerpt"]),
          image: findFieldValue(row, ["image", "cover"]),
        },
      },
      user: {
        notes: findFieldValue(row, ["note", "notes"]),
        category: findFieldValue(row, ["category", "folder"]),
        rating: parseRating(findFieldValue(row, ["rating"])),
        status:
          favorite && (favorite.toLowerCase() === "true" || favorite === "1")
            ? "favorite"
            : undefined,
      },
      import: {
        source: "import",
        originalId,
        folderName: findFieldValue(row, ["folder"]),
        importedAt: new Date(),
      },
    }),
  };
};

const normalizeToString = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return value.toString();
  if (typeof value === "boolean") return value.toString();
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const findFieldValue = (
  row: Record<string, unknown>,
  fields: string[],
): string | undefined => {
  for (const field of fields) {
    const value = row[field];
    if (value !== null && value !== undefined) {
      const stringValue = normalizeToString(value);
      if (stringValue.trim()) return stringValue;
    }

    // case-insensitive fallback
    const lowerField = field.toLowerCase();
    const matchingKey = Object.keys(row).find(
      (key) => key.toLowerCase() === lowerField,
    );
    if (
      matchingKey &&
      row[matchingKey] !== null &&
      row[matchingKey] !== undefined
    ) {
      const stringValue = normalizeToString(row[matchingKey]);
      if (stringValue.trim()) return stringValue;
    }
  }
  return undefined;
};

const normalizeTags = (tags: string): string =>
  tags
    .split(/[,;|]/)
    .map((t) => t.trim())
    .filter(Boolean)
    .join(", ");

const parseRating = (value: string | undefined): number | undefined => {
  if (!value) return undefined;
  if (value.toLowerCase() === "true" || value === "1") return 5;
  const num = Number(value);
  return Number.isNaN(num) ? undefined : Math.max(0, Math.min(5, num));
};
