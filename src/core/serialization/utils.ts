import type { CsvParserOptions } from "@/core/serialization/types";
import { readCsv } from "./csv";
/**
 * Extracts unique identifiers from CSV file using specified field
 * @param sourcePath - Path to CSV file
 * @param options - Parser configuration
 * @param options.identifierField - Primary field to use as identifier
 * @param options.alternativeFields - Backup fields if primary is empty
 * @param options.transform - Optional transform function for identifiers
 * @returns Array of extracted identifiers
 */
export async function getIdentifiersFromCsv(
	sourcePath: string,
	options: CsvParserOptions,
): Promise<string[]> {
	const { identifierField, alternativeFields = [], transform } = options;
	const records = await readCsv(sourcePath);

	return records
		.map((row) => {
			const value =
				row[identifierField] ||
				alternativeFields.find((field) => row[field]) ||
				"";

			const identifier = String(value).trim();
			return transform ? transform(identifier) : identifier;
		})
		.filter(Boolean);
}
