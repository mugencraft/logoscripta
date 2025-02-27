import { readFile } from "node:fs/promises";
import { normalize } from "node:path";
import { saveFile } from "../fs/save";
import type { SaveOptions } from "../fs/types";

/**
 * Reads and parses JSON file into specified type
 * @param filePath - Path to JSON file
 * @returns Parsed content as type T
 * @throws {Error} If file read or JSON parse fails
 */
export const readJson = async <T>(filePath: string): Promise<T> => {
	const content = await readFile(normalize(filePath), "utf-8");
	return JSON.parse(content) as T;
};

/**
 * Saves data as JSON file
 * @param data - Data to save
 * @param filePath - Output file path
 * @param saveOptions - File saving options
 */
export const saveJson = async <T>(
	data: T,
	filePath: string,
	saveOptions?: SaveOptions,
): Promise<void> => {
	const content = JSON.stringify(data, null, 2);
	await saveFile(filePath, content, saveOptions);
};
