import { access, mkdir } from "node:fs/promises";
import path from "node:path";

import { sanitizeFolderName } from "@/core/utils/format";

/**
 * Utility functions for managing file system paths and directory structures.
 * Provides standardized path generation and validation capabilities.
 */

/**
 * Validates a path segment (filename or directory name) for safe filesystem operations
 * Throws error if segment is invalid
 *
 * @example
 * validatePathSegment("file.json") // OK
 * validatePathSegment("dir/file") // Throws - invalid chars
 * validatePathSegment("..") // Throws - path traversal
 */
export function validatePathSegment(segment: string): void {
  if (!segment || typeof segment !== "string") {
    throw new Error("Path segment must be a non-empty string");
  }

  if (/[<>:"|?*]/.test(segment)) {
    throw new Error("Path segment contains invalid characters");
  }

  if (
    // segment.startsWith("/") || // this disallows absolute paths
    segment.includes("..") ||
    segment.startsWith("\\")
  ) {
    throw new Error("Invalid path segment: path traversal not allowed");
  }

  if (segment.length > 255) {
    throw new Error("Path segment exceeds maximum length");
  }
}

/**
 * Creates a directory if it doesn't exist.
 * Handles path normalization and EEXIST errors.
 */
export async function ensurePath(dirPath: string): Promise<void> {
  const normalizedPath = path.normalize(dirPath);
  try {
    await mkdir(normalizedPath, { recursive: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "EEXIST") {
      throw error;
    }
  }
}

/**
 * Checks if a path exists in the filesystem.
 * Normalizes path before checking.
 */
export async function pathExists(sourcePath: string): Promise<boolean> {
  try {
    await access(path.normalize(sourcePath));
    return true;
  } catch {
    return false;
  }
}

/**
 * Generates a unique path by appending numbers if the path exists.
 * Preserves file extension while generating alternatives.
 */
export async function getUniquePath(sourcePath: string): Promise<string> {
  let counter = 1;
  let newPath = path.normalize(sourcePath);
  const basePath = path.dirname(newPath);
  const ext = path.extname(newPath);
  const baseName = path.basename(newPath, ext);

  while (await pathExists(newPath)) {
    newPath = path.join(basePath, `${baseName}-${counter}${ext}`);
    counter++;
  }

  return newPath;
}

export const buildSafePath = async (
  baseFolder: string,
  folderName: string,
): Promise<string> => {
  const sanitizedFolder = sanitizeFolderName(folderName);

  if (!sanitizedFolder || sanitizedFolder === "." || sanitizedFolder === "..") {
    throw new Error(`Invalid folder name: "${folderName}"`);
  }

  const fullPath = path.join(baseFolder, sanitizedFolder);

  // Resolve both paths to canonical form to detect traversal attempts
  const resolvedPath = path.resolve(fullPath);
  const resolvedBasePath = path.resolve(baseFolder);

  // Ensure the resolved path is within the base directory
  const relativePath = path.relative(resolvedBasePath, resolvedPath);

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    throw new Error(
      `Access denied: path traversal detected in folder name "${folderName}"`,
    );
  }

  return fullPath;
};
