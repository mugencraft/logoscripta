import { readFile } from "node:fs/promises";
import Papa from "papaparse";
import { saveFile } from "../fs/save";
import { ConsoleLogger } from "../logging/logger";
import type { CSVRecord } from "../types";
import type { CsvOptions } from "./types";

const DEFAULT_OPTIONS: CsvOptions = {
	delimiter: ",",
	noHeaders: false,
	encoding: "utf8",
	forceQsv: false,
};

/**
 * Reads CSV file and parses content into records
 * @param path - Path to CSV file
 * @param options - CSV parsing options
 * @returns Array of parsed CSV records
 */
export const readCsv = async (
	path: string,
	options: CsvOptions = {},
): Promise<CSVRecord[]> => {
	const opts = { ...DEFAULT_OPTIONS, ...options };

	return readWithPapa(path, opts);
};

/**
 * Writes data array to CSV file
 * @param data - Array of objects to write as CSV
 * @param path - Output file path
 * @param options - CSV writing options
 * @returns Success status
 */
export const writeCsv = async (
	data: unknown[],
	path: string,
	options: CsvOptions = {},
): Promise<boolean> => {
	const logger = ConsoleLogger.getInstance();
	const opts = { ...DEFAULT_OPTIONS, ...options };

	logger.info(`Writing CSV file: ${path}`);
	return writeWithPapa(data, path, opts);
};

const readWithPapa = async (
	path: string,
	options: CsvOptions,
): Promise<CSVRecord[]> => {
	const content = await readFile(path, "utf8");
	return new Promise((resolve, reject) => {
		Papa.parse(content, {
			delimiter: options.delimiter || ",",
			header: !options.noHeaders,
			dynamicTyping: true,
			skipEmptyLines: true,
			encoding: "utf8",
			complete: (results) => resolve(results.data as CSVRecord[]),
			error: (error: Error) => reject(error),
		});
	});
};

const writeWithPapa = async (
	data: unknown[],
	path: string,
	options: CsvOptions,
): Promise<boolean> => {
	try {
		const csv = Papa.unparse(data, {
			delimiter: options.delimiter || ",",
			header: !options.noHeaders,
		});
		await saveFile(path, csv, options.saveOptions);
		return true;
	} catch {
		return false;
	}
};
