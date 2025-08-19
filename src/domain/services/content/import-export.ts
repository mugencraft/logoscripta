import fs from "node:fs/promises";
import path from "node:path";

import { getImageFilesInfo, readTextFile } from "@/core/fs/files";
import { buildSafePath } from "@/core/fs/paths";

import { buildPublicUrl, FOLDER_PATHS } from "../../config/paths";
import type { ContentCollection } from "../../models/content/collection";
import type { ContentItem, NewContentItem } from "../../models/content/item";
import type { ContentCommandsPort } from "../../ports/content/commands";
import type { ContentQueriesPort } from "../../ports/content/queries";
import { contentCollectionMetadataSchema } from "../../validation/content/collection";
import { contentItemMetadataSchema } from "../../validation/content/item";
import type { ImportMetadata } from "../../validation/shared";
import { createMetadata } from "../shared/metadata";

export interface ImportStats extends Record<string, number | string[]> {
  itemsCreated: number;
  itemsUpdated: number;
  errors: string[];
}

export interface ExportResult {
  exportedItems: number;
  outputPath: string;
  errors: string[];
}

export type ImportProgressUpdate =
  | { type: "created"; collection: ContentCollection }
  | { type: "started"; total: number; files: string[] }
  | {
      type: "progress";
      item: ContentItem;
      progress: number;
      total: number;
    }
  | {
      type: "error";
      filename: string;
      error: string;
      progress: number;
      total: number;
    }
  | {
      type: "completed";
      collection: ContentCollection;
      stats: ImportStats;
    }
  | { type: "error"; error: string };

export class ContentImportExportService {
  private importPath: string;
  constructor(
    private contentCommands: ContentCommandsPort,
    private contentQueries: ContentQueriesPort,
  ) {
    this.importPath = FOLDER_PATHS.import;
  }

  async *importFromFileSystem(
    folderName: string,
    name: string,
  ): AsyncGenerator<ImportProgressUpdate, void, unknown> {
    try {
      const safeFolderPath = await buildSafePath(this.importPath, folderName);

      const collection = await this.contentCommands.createCollection({
        name,
        description: `Imported from ${folderName}`,
        type: "image",
        metadata: createMetadata(contentCollectionMetadataSchema, {
          import: {
            source: "import",
            folderName,
            originalPath: safeFolderPath,
            importedAt: new Date(),
          },
        }),
      });

      yield { type: "created", collection };

      const imageFiles = await getImageFilesInfo(safeFolderPath);

      yield {
        type: "started",
        total: imageFiles.length,
        files: imageFiles.map((f) => f.name),
      };

      const items: ContentItem[] = [];
      const errors: string[] = [];

      for (const [index, imageFile] of imageFiles.entries()) {
        const captionFileName = this.getCaptionFileName(imageFile.name);

        const rawTags = await readTextFile(safeFolderPath, captionFileName);

        const itemData: NewContentItem = {
          collectionId: collection.id,
          identifier: imageFile.name,
          title: path.basename(imageFile.name, path.extname(imageFile.name)),
          contentType: "image",
          rawTags,
          metadata: createMetadata(contentItemMetadataSchema, {
            storage: {
              previewUrl: buildPublicUrl(
                "import",
                `${folderName}/${imageFile.name}`,
              ),
              localPath: path.join(folderName, imageFile.name),
              mimeType: imageFile.mimeType,
              fileSize: imageFile.size,
            },
            import: {
              source: "import",
              importedAt: new Date(),
            },
          }),
        };

        const item = await this.contentCommands.createItem(itemData);

        yield {
          type: "progress",
          item,
          progress: index + 1,
          total: imageFiles.length,
        };
      }

      await this.contentCommands.updateCollection(collection.id, {
        ...collection,
        metadata: createMetadata(contentCollectionMetadataSchema, {
          ...collection.metadata,
          import: {
            ...(collection.metadata.import as ImportMetadata),
            stats: {
              totalFiles: imageFiles.length,
              processedFiles: items.length,
              errors,
            },
          },
        }),
      });

      yield {
        type: "completed",
        collection,
        stats: { itemsCreated: items.length, itemsUpdated: 0, errors },
      };
    } catch (error: unknown) {
      yield {
        type: "error",
        error:
          error instanceof Error
            ? error.message
            : String(error) || "Unknown error",
      };
    }
  }

  private getCaptionFileName(imageFile: string): string {
    const baseName = path.basename(imageFile, path.extname(imageFile));
    return `${baseName}.txt`;
  }

  async exportForTraining(
    collectionId: number,
    outputPath: string,
  ): Promise<ExportResult> {
    const items =
      (await this.contentQueries.getItemsForCollection(collectionId)) || [];
    const errors: string[] = [];

    for (const item of items) {
      try {
        const caption = item.tags
          ? item.tags.map((t) => t.tag.name).join(", ")
          : "";
        await this.writeCaption(outputPath, item.identifier, caption);
      } catch (error: unknown) {
        errors.push(
          `${item.identifier}: ${error instanceof Error ? error.message : error}`,
        );
      }
    }

    return {
      exportedItems: items.length - errors.length,
      outputPath,
      errors,
    };
  }

  private async writeCaption(
    outputPath: string,
    identifier: string,
    caption: string,
  ): Promise<void> {
    const baseName = identifier.replace(/\.[^/.]+$/, "");
    const captionPath = path.join(outputPath, `${baseName}.txt`);

    await fs.writeFile(captionPath, caption, "utf-8");
  }
}
