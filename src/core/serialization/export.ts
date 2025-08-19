import Papa from "papaparse";

import type { CsvOptions } from "./types";

export type ExportFormat = "csv" | "json" | "markdown";

export interface DownloadOptions {
  fileName?: string;
  includeTimestamp?: boolean;
  headers?: Record<string, string>;
  includeColumns?: string[];
}

interface MarkdownOptions {
  headers?: Record<string, string>;
  includeColumns?: string[];
  includeHeaders?: boolean;
}

interface SerializeOptions {
  csvOptions?: CsvOptions;
  headers?: Record<string, string>;
  includeColumns?: string[];
}

/**
 * Triggers browser download of serialized data
 */
export const downloadData = async <T>(
  data: T[],
  format: ExportFormat,
  options: DownloadOptions = {},
): Promise<boolean> => {
  if (!data.length) return false;

  try {
    const fileName = options.fileName || "export";
    const outputFileName = createExportFileName(
      fileName,
      format,
      options.includeTimestamp,
    );

    const content = serializeData(data, format, options);
    const mimeTypes: Record<ExportFormat, string> = {
      csv: "text/csv;charset=utf-8;",
      json: "application/json;charset=utf-8;",
      markdown: "text/markdown;charset=utf-8;",
    };

    const blob = new Blob([content], { type: mimeTypes[format] });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", outputFileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Clean up

    return true;
  } catch (error) {
    console.error(`Export failed: ${error}`);
    return false;
  }
};

/**
 * Copies data in the specified format to clipboard
 */
export const copyToClipboard = async <T>(
  data: T[],
  format: ExportFormat,
  options: SerializeOptions = {},
): Promise<boolean> => {
  if (!data.length) return false;

  try {
    const content = serializeData(data, format, options);
    await navigator.clipboard.writeText(content);
    return true;
  } catch (error) {
    console.error(`Copy to clipboard failed: ${error}`);
    return false;
  }
};

/**
 * Creates a file name for exports with optional timestamp
 */
const createExportFileName = (
  baseName: string,
  format: ExportFormat,
  includeTimestamp = true,
): string => {
  const timestamp = includeTimestamp
    ? `_${new Date().toISOString().split("T")[0]}`
    : "";
  const extension = format === "markdown" ? "md" : format;
  return `${baseName}${timestamp}.${extension}`;
};

/**
 * Serializes data to the specified format
 * @returns Serialized content as string
 */
const serializeData = <T>(
  data: T[],
  format: ExportFormat,
  options: SerializeOptions = {},
): string => {
  if (!data.length) return "";

  // Pre-process data to flatten complex objects and arrays for CSV and Markdown
  const processedData = data.map((item) => {
    const result = { ...item } as Record<string, unknown>;

    // Only preprocess for CSV and Markdown which can't handle nested structures
    if (format === "csv" || format === "markdown") {
      for (const key of Object.keys(result)) {
        const value = result[key];
        // Handle nested objects
        if (value && typeof value === "object" && !Array.isArray(value)) {
          result[key] = JSON.stringify(value);
        }
        // Handle arrays
        else if (Array.isArray(value)) {
          result[key] = value.join(", ");
        }
      }
    }

    return result;
  });

  switch (format) {
    case "csv":
      return Papa.unparse(processedData, {
        delimiter: options.csvOptions?.delimiter || ",",
        header: !options.csvOptions?.noHeaders,
      });

    case "json":
      return JSON.stringify(data, null, 2); // Use original data for JSON

    case "markdown":
      return dataToMarkdown(processedData, {
        headers: options.headers,
        includeColumns: options.includeColumns,
      });

    default:
      throw new Error(`Unsupported format: ${format}`);
  }
};

/**
 * Converts data array to markdown table format
 */
const dataToMarkdown = <T>(data: T[], options?: MarkdownOptions): string => {
  if (!data.length) return "";

  const includeHeaders = options?.includeHeaders !== false;
  const customHeaders = options?.headers || {};

  // Determine which columns to include
  // @ts-expect-error
  const allColumns = Object.keys(data[0]);
  const columns = options?.includeColumns || allColumns;

  // Generate headers
  let markdown = "";
  if (includeHeaders) {
    markdown += `| ${columns.map((col) => customHeaders[col] || col).join(" | ")} |\n`;
    markdown += `| ${columns.map(() => "---").join(" | ")} |\n`;
  }

  // Generate rows
  for (const row of data) {
    const rowValues = columns.map((col) =>
      String((row as Record<string, unknown>)[col] ?? ""),
    );
    markdown += `| ${rowValues.join(" | ")} |\n`;
  }

  return markdown;
};
