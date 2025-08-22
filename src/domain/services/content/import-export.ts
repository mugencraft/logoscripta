import fs from "node:fs/promises";
import path from "node:path";

import { getImageFilesInfo, readTextFile } from "@/core/fs/files";
import { buildSafePath } from "@/core/fs/paths";

import { buildPublicUrl, FOLDER_PATHS } from "../../config/paths";
import type { ContentItem } from "../../models/content/item";
import type {
  ContentType,
  ImportProgressUpdate,
  ParsedImportItem,
} from "../../models/content/types";
import type { ContentCommandsPort } from "../../ports/content/commands";
import type { ContentQueriesPort } from "../../ports/content/queries";
import { contentCollectionMetadataSchema } from "../../validation/content/collection";
import type {
  ClientImportInput,
  ContentImportOptions,
  ServerImportInput,
} from "../../validation/content/import-export";
import { contentItemMetadataSchema } from "../../validation/content/item";
import type { ImportMetadata } from "../../validation/shared";
import { createMetadata } from "../shared/metadata";
import { mapUrlItem } from "./parser";

export interface ExportResult {
  exportedItems: number;
  outputPath: string;
  errors: string[];
}

export class ContentImportExportService {
  private importPath: string;
  constructor(
    private contentCommands: ContentCommandsPort,
    private contentQueries: ContentQueriesPort,
  ) {
    this.importPath = FOLDER_PATHS.import;
  }

  async *importFromServer(
    input: ServerImportInput,
    options: ContentImportOptions,
  ): AsyncGenerator<ImportProgressUpdate, void, unknown> {
    try {
      const importMetadata: ImportMetadata = {
        source: "import" as const,
        importedAt: new Date(),
      };

      if (input.source === "filesystem") {
        const safeFolderPath = await buildSafePath(
          this.importPath,
          input.data.folderName,
        );
        importMetadata.folderName = input.data.folderName;
        importMetadata.originalPath = safeFolderPath;
      }

      const collection = await this.contentCommands.createCollection({
        name: options.collectionName,
        description:
          options.description || `Imported ${input.contentType} content`,
        type: input.contentType,
        metadata: createMetadata(contentCollectionMetadataSchema, {
          import: importMetadata,
        }),
      });
      yield { type: "created", collection };

      const items = await this.parseImageFiles(input.data.folderName);
      yield {
        type: "started",
        total: items.length,
        files: items.map((i) => i.identifier),
      };

      const results = await this.processItems(items, collection.id);

      for (const [index, result] of results.entries()) {
        if (result.success && result.item) {
          yield {
            type: "progress",
            item: result.item,
            progress: index + 1,
            total: items.length,
          };
        } else {
          yield {
            type: "error",
            filename: result.identifier,
            error: result.error || "Unknown error",
            progress: index + 1,
            total: items.length,
          };
        }
      }

      const successCount = results.filter((r) => r.success).length;
      const errors = results
        .filter((r) => !r.success)
        .map((r) => r.error || "Unknown error");

      await this.contentCommands.updateCollection(collection.id, {
        ...collection,
        metadata: createMetadata(contentCollectionMetadataSchema, {
          ...collection.metadata,
          import: {
            ...(collection.metadata.import as ImportMetadata),
            stats: {
              totalFiles: items.length,
              processedFiles: successCount,
              errors,
            },
          },
        }),
      });

      yield {
        type: "completed",
        collection,
        stats: { itemsCreated: successCount, itemsUpdated: 0, errors },
      };
    } catch (error: unknown) {
      yield {
        type: "error",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async processItems(
    items: ParsedImportItem[],
    collectionId: number,
  ): Promise<
    Array<{
      success: boolean;
      item?: ContentItem;
      identifier: string;
      error?: string;
    }>
  > {
    const results = [];

    for (const item of items) {
      try {
        const newItem = await this.contentCommands.createItem({
          ...item,
          collectionId,
        });
        results.push({
          success: true,
          item: newItem,
          identifier: item.identifier,
        });
      } catch (error) {
        results.push({
          success: false,
          identifier: item.identifier,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return results;
  }

  private getCaptionFileName(imageFile: string): string {
    const baseName = path.basename(imageFile, path.extname(imageFile));
    return `${baseName}.txt`;
  }

  private async parseImageFiles(
    folderName: string,
  ): Promise<ParsedImportItem[]> {
    const safeFolderPath = await buildSafePath(FOLDER_PATHS.import, folderName);
    const imageFiles = await getImageFilesInfo(safeFolderPath);

    const items: ParsedImportItem[] = [];

    for (const imageFile of imageFiles) {
      const captionFileName = this.getCaptionFileName(imageFile.name);
      const rawTags = await readTextFile(safeFolderPath, captionFileName);

      items.push({
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
      });
    }

    return items;
  }

  async importFromClient(
    input: ClientImportInput,
    options: ContentImportOptions,
  ): Promise<ImportProgressUpdate[]> {
    const updates: ImportProgressUpdate[] = [];

    for await (const update of this.processClientData(input, options)) {
      updates.push(update);
    }

    return updates;
  }

  private async *processClientData(
    input: ClientImportInput,
    options: ContentImportOptions,
  ): AsyncGenerator<ImportProgressUpdate, void, unknown> {
    const collection = await this.contentCommands.createCollection({
      name: options.collectionName,
      description:
        options.description || `Imported ${input.contentType} content`,
      type: input.contentType,
      metadata: createMetadata(contentCollectionMetadataSchema, {
        import: { source: "import" as const, importedAt: new Date() },
      }),
    });

    yield { type: "created", collection };

    const items = this.processJsonData(input.data, input.contentType);
    yield {
      type: "started",
      total: items.length,
      files: items.map((i) => i.identifier),
    };

    const results = await this.processItems(items, collection.id);

    for (const [index, result] of results.entries()) {
      if (result.success && result.item) {
        yield {
          type: "progress",
          item: result.item,
          progress: index + 1,
          total: items.length,
        };
      } else {
        yield {
          type: "error",
          filename: result.identifier,
          error: result.error || "Unknown error",
          progress: index + 1,
          total: items.length,
        };
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const errors = results
      .filter((r) => !r.success)
      .map((r) => r.error || "Unknown error");

    yield {
      type: "completed",
      collection,
      stats: { itemsCreated: successCount, itemsUpdated: 0, errors },
    };
  }

  private processJsonData(
    data: Record<string, unknown>[],
    contentType: ContentType,
  ): ParsedImportItem[] {
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("Data must be a non-empty array");
    }

    return data.map((row) => {
      switch (contentType) {
        case "url":
          return mapUrlItem(row);
        default:
          throw new Error(
            `Content type ${contentType} not supported for JSON import`,
          );
      }
    });
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
