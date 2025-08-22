import fs from "node:fs/promises";
import path from "node:path";

import {
  getFolderNames,
  getImageFileNames,
  readTextFile,
  scanDirectoryNames,
} from "@/core/fs/files";
import { buildSafePath } from "@/core/fs/paths";
import { parseTagsFromText } from "@/core/utils/parse";

import { buildPublicUrl, FOLDER_PATHS } from "../../config/paths";
import type {
  ContentType,
  ImportPreviewItem,
} from "../../models/content/types";

export class FileSystemService {
  private assetsPath: string;
  private importPath: string;
  constructor() {
    this.assetsPath = FOLDER_PATHS.assets;
    this.importPath = FOLDER_PATHS.import;
  }

  async getAssetImages(): Promise<string[]> {
    return await getImageFileNames(this.assetsPath);
  }

  async getImportFolders(): Promise<string[]> {
    return getFolderNames(this.importPath);
  }

  async getImportPreview(
    folderName: string,
    contentType: ContentType,
  ): Promise<ImportPreviewItem[]> {
    switch (contentType) {
      case "image":
        return this.getImagePreview(folderName);
      case "document":
        return this.getDocumentPreview(folderName);
      default:
        throw new Error(
          `Preview not supported for content type: ${contentType}`,
        );
    }
  }

  private async getImagePreview(
    folderName: string,
  ): Promise<ImportPreviewItem[]> {
    const folderPath = await buildSafePath(this.importPath, folderName);
    const imageNames = await getImageFileNames(folderPath);
    const result: ImportPreviewItem[] = [];

    for (const imageName of imageNames) {
      const baseName = path.basename(imageName, path.extname(imageName));
      const captionFile = `${baseName}.txt`;
      const caption = await readTextFile(folderPath, captionFile);
      const tags = parseTagsFromText(caption);

      result.push({
        id: baseName,
        name: imageName,
        type: "image",
        previewUrl: buildPublicUrl("import", `${folderName}/${imageName}`),
        caption: caption.trim(),
        tags,
      });
    }

    return result;
  }

  private async getDocumentPreview(
    folderName: string,
  ): Promise<ImportPreviewItem[]> {
    const folderPath = await buildSafePath(this.importPath, folderName);
    const { files } = await scanDirectoryNames(folderPath);

    return files
      .filter((file) => file.endsWith(".md") || file.endsWith(".txt"))
      .map((file) => ({
        id: path.basename(file, path.extname(file)),
        name: file,
        type: "document" as const,
      }));
  }

  async uploadToImport(file: File, subfolder?: string): Promise<string> {
    const targetPath = subfolder
      ? path.join(this.importPath, subfolder)
      : this.importPath;

    const filename = `${Date.now()}-${file.name}`;
    const fullPath = path.join(targetPath, filename);

    // Ensure directory exists
    await fs.mkdir(path.dirname(fullPath), { recursive: true });

    // Write file
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(fullPath, buffer);

    return filename;
  }

  async deleteImportFile(filename: string): Promise<void> {
    const filePath = await buildSafePath(this.importPath, filename);
    await fs.unlink(filePath);
  }
}
