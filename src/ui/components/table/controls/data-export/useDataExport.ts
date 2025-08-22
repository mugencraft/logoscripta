import { useCallback, useState } from "react";

import {
  copyToClipboard,
  type DownloadOptions,
  downloadData,
  type ExportFormat,
} from "./utils";

interface UseDataExportOptions<T> {
  data: T[];
  defaultOptions?: DownloadOptions;
}

interface UseDataExportResult<T> {
  exportData: (
    format: ExportFormat,
    customOptions?: DownloadOptions,
    filteredData?: T[],
  ) => Promise<boolean>;
  copyData: (
    format: ExportFormat,
    customOptions?: DownloadOptions,
    filteredData?: T[],
  ) => Promise<boolean>;
  isExporting: boolean;
  error: string | null;
}

export function useDataExport<T>({
  data,
  defaultOptions = {},
}: UseDataExportOptions<T>): UseDataExportResult<T> {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performOperation = useCallback(
    async (
      operation: (
        data: T[],
        format: ExportFormat,
        options: DownloadOptions,
      ) => Promise<boolean>,
      format: ExportFormat,
      customOptions: DownloadOptions = {},
      filteredData?: T[],
    ) => {
      setIsExporting(true);
      setError(null);

      try {
        // Merge default and custom options
        const options = { ...defaultOptions, ...customOptions };
        return await operation(filteredData || data, format, options);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        return false;
      } finally {
        setIsExporting(false);
      }
    },
    [data, defaultOptions],
  );

  const exportData = useCallback(
    (
      format: ExportFormat,
      customOptions: DownloadOptions = {},
      filteredData?: T[],
    ) => performOperation(downloadData, format, customOptions, filteredData),
    [performOperation],
  );

  const copyData = useCallback(
    (
      format: ExportFormat,
      customOptions: DownloadOptions = {},
      filteredData?: T[],
    ) => performOperation(copyToClipboard, format, customOptions, filteredData),
    [performOperation],
  );

  return {
    exportData,
    copyData,
    isExporting,
    error,
  };
}
