import path from "node:path";

import {
  getFolderNames,
  getImageFileNames,
  readTextFile,
} from "@/core/fs/files";
import { buildSafePath } from "@/core/fs/paths";
import { parseTagsFromText } from "@/core/utils/parse";
import { buildPublicUrl, FOLDER_PATHS } from "@/domain/config/paths";

import type { ImageCaptioned } from "../../models/content/types";

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

  async getImportImagesWithCaptions(
    folderName: string,
  ): Promise<ImageCaptioned[]> {
    const folderPath = await buildSafePath(this.importPath, folderName);
    const imageNames = await getImageFileNames(folderPath);
    const result: ImageCaptioned[] = [];

    for (const imageName of imageNames) {
      const baseName = path.basename(imageName, path.extname(imageName));
      const captionFile = `${baseName}.txt`;
      const caption = await readTextFile(folderPath, captionFile);
      const tags = parseTagsFromText(caption);

      result.push({
        id: baseName,
        imageUrl: buildPublicUrl("import", `${folderName}/${imageName}`),
        // imageUrl: `/cdn/import/${encodeURIComponent(folderName)}/${encodeURIComponent(imageName)}`,
        caption: caption.trim(),
        tags,
      });
    }

    return result;
  }
}
