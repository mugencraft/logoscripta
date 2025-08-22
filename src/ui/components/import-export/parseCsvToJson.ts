import Papa from "papaparse";

export const parseCsvToJson = (
  file: File,
): Promise<Record<string, unknown>[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(
            new Error(`CSV parsing failed: ${results.errors[0]?.message}`),
          );
        } else {
          resolve(results.data as Record<string, unknown>[]);
        }
      },
      error: reject,
    });
  });
};
