import { readStream } from "./csv";

interface CsvIdentifiersOptions {
  identifierField: string;
  alternativeFields?: string[];
  transform?: (value: string) => string;
}
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
  options: CsvIdentifiersOptions,
): Promise<string[]> {
  const { identifierField, alternativeFields = [], transform } = options;
  const records = await readStream(sourcePath);

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
