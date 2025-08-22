import { createReadStream } from "node:fs";

import * as csv from "fast-csv";

export const readStream = async (
  filePath: string,
): Promise<Record<string, unknown>[]> => {
  return new Promise((resolve, reject) => {
    const results: Record<string, unknown>[] = [];

    createReadStream(filePath)
      .pipe(
        csv.parse({
          headers: true,
          ignoreEmpty: true,
          trim: true,
        }),
      )
      .on("data", (row) => results.push(row))
      .on("end", () => resolve(results))
      .on("error", reject);
  });
};
