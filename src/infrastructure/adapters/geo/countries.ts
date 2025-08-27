import { join } from "node:path";

import { ConsoleLogger } from "@/core/logging/logger";
import { saveJson } from "@/core/serialization/json";
import { fetchWithRetry } from "@/core/utils/fetch";

import type { AdministrativeDataAdapter, CountryRecord } from "./types";

/**
 * Fetches global country data from REST Countries API.
 */
export class RestCountriesAdapter implements AdministrativeDataAdapter {
  readonly name = "rest-countries";
  readonly logger = ConsoleLogger.getInstance();

  constructor(private readonly basePath: string) {}

  async fetch(params: Record<string, string>): Promise<string> {
    const url =
      "https://restcountries.com/v3.1/all?fields=cca2,name,region,subregion,capital,languages,currencies,timezones,latlng,flag";

    const response = await fetchWithRetry(url, undefined, {
      retryCondition: (res) => !res.ok && res.status !== 404,
    });

    const data = await response.json();
    this.logger.info(`Fetched ${data.length} countries`);

    // Transform to standardized format
    const standardized = this.transformCountryData(data);
    const content = JSON.stringify(standardized, null, 2);

    await this.saveToFile(content, params);
    return content;
  }

  getDataPath(_params: Record<string, string>): string {
    return join(this.basePath, "countries", "all.json");
  }

  // biome-ignore lint/suspicious/noExplicitAny: data from REST API
  private transformCountryData(countries: any[]): CountryRecord[] {
    return countries.map((country) => ({
      code: country.cca2, // ISO 3166-1 alpha-2
      name: country.name.common,
      officialName: country.name.official,
      region: country.region,
      subregion: country.subregion,
      metadata: {
        capital: country.capital?.[0],
        languages: country.languages,
        currencies: country.currencies,
        timezones: country.timezones,
        latlng: country.latlng,
      },
    }));
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
