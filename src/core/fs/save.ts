import { writeFile } from "node:fs/promises";
import { dirname, normalize } from "node:path";

import { ConsoleLogger } from "../logging/logger";
import { ensurePath, getUniquePath, pathExists } from "./paths";
import type { SaveOptions } from "./types";

/**
 * Saves content to a file, creating directories if needed
 * @param filePath - Path where the file should be saved
 * @param content - String content to write to the file
 * @param options - Configuration options for saving
 * @param options.overwrite - Whether to overwrite existing files
 * @param options.createFolders - Whether to create parent directories
 * @throws {Error} When file operations fail
 */
export const saveFile = async (
  filePath: string,
  content: string,
  options?: SaveOptions,
): Promise<void> => {
  const logger = ConsoleLogger.getInstance();
  const { overwrite = false, createFolders = true } = { ...options };
  const normalizedPath = normalize(filePath);
  const basePath = dirname(normalizedPath);

  if (createFolders && basePath) {
    await ensurePath(basePath);
    logger.info(`Created folder: ${basePath}`);
  }

  const exists = await pathExists(normalizedPath);

  if (exists) {
    if (!overwrite) {
      logger.info(`File already exists: ${normalizedPath}`);
      const newPath = await getUniquePath(normalizedPath);
      await writeFile(newPath, content, { encoding: "utf8" });
      return;
    }
    logger.info(`Overwriting file: ${normalizedPath}`);
    await writeFile(normalizedPath, content, { encoding: "utf8" });
    return;
  }

  logger.info(`Creating file: ${normalizedPath}`);
  await writeFile(normalizedPath, content, { encoding: "utf8" });
};
