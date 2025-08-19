import fs from "node:fs/promises";
import path from "node:path";

export const readTextFile = async (
  basePath: string,
  fileName: string,
): Promise<string> => {
  const captionPath = path.join(basePath, fileName);
  try {
    return await fs.readFile(captionPath, "utf-8");
  } catch {
    return "";
  }
};

export const scanDirectoryNames = async (
  dirPath: string,
): Promise<{ folders: string[]; files: string[] }> => {
  try {
    const items = await fs.readdir(dirPath, { withFileTypes: true });

    return {
      folders: items
        .filter((item) => item.isDirectory())
        .map((item) => item.name),
      files: items.filter((item) => item.isFile()).map((item) => item.name),
    };
  } catch {
    return { folders: [], files: [] };
  }
};

export const getFolderNames = async (dirPath: string): Promise<string[]> => {
  const { folders } = await scanDirectoryNames(dirPath);
  return folders;
};

export const getImageFileNames = async (dirPath: string): Promise<string[]> => {
  const { files } = await scanDirectoryNames(dirPath);
  return files.filter(isImageFile);
};

export const isImageFile = (filename: string): boolean => {
  const imageExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
  return imageExtensions.some((ext) => filename.toLowerCase().endsWith(ext));
};

const getMimeType = (filename: string): string => {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
  };
  return mimeTypes[ext] || "application/octet-stream";
};

export interface FileInfo {
  name: string;
  size: number;
  mimeType: string;
  dimensions?: { width: number; height: number };
}

export const getImageFilesInfo = async (
  dirPath: string,
): Promise<FileInfo[]> => {
  try {
    const items = await fs.readdir(dirPath, { withFileTypes: true });
    const imageFiles: FileInfo[] = [];

    for (const item of items.filter(
      (item) => item.isFile() && isImageFile(item.name),
    )) {
      const filePath = path.join(dirPath, item.name);
      const stat = await fs.stat(filePath);

      imageFiles.push({
        name: item.name,
        size: stat.size,
        mimeType: getMimeType(item.name),
      });
    }

    return imageFiles;
  } catch {
    return [];
  }
};
