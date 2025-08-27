import { join } from "node:path";

import { ConsoleLogger } from "@/core/logging/logger";
import { saveJson } from "@/core/serialization/json";
import { fetchWithRetry } from "@/core/utils/fetch";

import type { AdministrativeDataAdapter } from "./types";

/**
 * Fetches EU administrative data from Eurostat NUTS API.
 */
export class EurostatAdapter implements AdministrativeDataAdapter {
  readonly name = "eurostat-nuts";
  readonly logger = ConsoleLogger.getInstance();

  constructor(private readonly basePath: string) {}

  async fetch(params: Record<string, string>): Promise<string> {
    const {
      year = "2024",
      projection = "4326", // WGS84 for easier processing
      scale = "20M",
      maxLevel = "3", // Fetch all levels up to communes
    } = params;

    // Collect all TopoJSON data by level
    const allLevelsData: Record<string, unknown> = {};

    // Fetch each NUTS level (0=country, 1=region, 2=province, 3=commune)
    for (let level = 0; level <= parseInt(maxLevel, 10); level++) {
      const url = `https://raw.githubusercontent.com/eurostat/Nuts2json/master/pub/v2/${year}/${projection}/${scale}/${level}.json`;

      try {
        const response = await fetchWithRetry(url, undefined, {
          retryCondition: (res) => !res.ok && res.status !== 404,
        });

        const topoJsonData = await response.json();
        allLevelsData[`level_${level}`] = topoJsonData;

        this.logger.info(`Fetched NUTS level ${level} for ${year}`);

        // Small delay to be respectful to GitHub's CDN
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        this.logger.warn(`Failed to fetch NUTS level ${level}: ${error}`);
        // Continue with other levels
      }
    }

    // Save the complete TopoJSON data structure
    const content = JSON.stringify(
      {
        metadata: {
          source: "nuts2json",
          year,
          projection,
          scale,
          fetchedAt: new Date().toISOString(),
        },
        levels: allLevelsData,
      },
      null,
      2,
    );

    await this.saveToFile(content, params);
    return content;
  }

  getDataPath(params: Record<string, string>): string {
    const { year = "2024", projection = "4326", scale = "20M" } = params;
    return join(
      this.basePath,
      "eurostat",
      `nuts-${year}-${projection}-${scale}.json`,
    );
  }

  private async saveToFile(
    content: string,
    params: Record<string, string>,
  ): Promise<void> {
    const filePath = this.getDataPath(params);
    await saveJson(JSON.parse(content), filePath, {
      overwrite: true,
      createFolders: true,
    });
  }
}
