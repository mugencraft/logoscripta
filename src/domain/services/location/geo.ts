import { readJson } from "@/core/serialization/json";
import type { AdministrativeRecord } from "@/shared/geo/types";

import { FOLDER_PATHS } from "../../config/paths";
import type {
  CountriesSyncResult,
  CountryCurrencies,
  CountryLanguages,
  IstatTerritorialType,
  ItalySyncResult,
  PreviewStats,
  SyncOptions,
} from "../../models/location/types";
import type { LocationCommandsPort } from "../../ports/location/commands";
import type { LocationQueriesPort } from "../../ports/location/queries";

interface CountryData {
  code: string;
  name: string;
  officialName: string;
  region: string;
  subregion?: string;
  metadata: Record<string, unknown>;
}

/**
 * Orchestrates synchronization of official geographic data with local database.
 * Handles countries from REST API and administrative hierarchies from national sources.
 */
export class GeoSyncService {
  private readonly basePath: string;
  constructor(
    private readonly commands: LocationCommandsPort,
    private readonly queries: LocationQueriesPort,
  ) {
    this.basePath = FOLDER_PATHS.geo;
  }

  async syncCountries(options: SyncOptions = {}): Promise<CountriesSyncResult> {
    const countriesPath = `${this.basePath}/countries/all.json`;

    try {
      const countries = await readJson<CountryData[]>(countriesPath);

      if (options.dryRun) {
        const preview = await this.previewCountriesChanges(countries);
        return {
          countries: countries.length,
          errors: [],
          preview,
        };
      }

      await this.performCountriesSync(countries);
      return {
        countries: countries.length,
        errors: [],
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        countries: 0,
        errors: [`Countries sync failed: ${errorMessage}`],
      };
    }
  }

  private async previewCountriesChanges(
    newCountries: CountryData[],
  ): Promise<PreviewStats> {
    const existingCountries = await this.queries.getAllCountries();
    const existingMap = new Map(existingCountries.map((c) => [c.code, c]));
    const newCodesSet = new Set(newCountries.map((c) => c.code));

    let toAdd = 0;
    let toUpdate = 0;

    for (const newCountry of newCountries) {
      const existing = existingMap.get(newCountry.code);
      if (!existing) {
        toAdd++;
      } else {
        // TODO: check this
        const hasChanges =
          existing.name !== newCountry.name ||
          existing.officialName !== newCountry.officialName ||
          existing.region !== newCountry.region ||
          existing.subregion !== newCountry.subregion ||
          existing.capital !== (newCountry.metadata.capital as string);

        if (hasChanges) {
          toUpdate++;
        }
      }
    }

    const toDeprecate = existingCountries.filter(
      (c) => !newCodesSet.has(c.code),
    ).length;

    return { toAdd, toUpdate, toDeprecate };
  }

  private async performCountriesSync(countries: CountryData[]): Promise<void> {
    const existingCountries = await this.queries.getAllCountries();
    const existingMap = new Map(existingCountries.map((c) => [c.code, c]));
    const newCodesSet = new Set(countries.map((c) => c.code));

    for (const countryData of countries) {
      const countryEntity = {
        code: countryData.code,
        name: countryData.name,
        officialName: countryData.officialName,
        region: countryData.region,
        subregion: countryData.subregion,
        capital: countryData.metadata.capital as string,
        languages: countryData.metadata.languages as CountryLanguages,
        currencies: countryData.metadata.currencies as CountryCurrencies,
        timezones: countryData.metadata.timezones as string[],
        coordinates: countryData.metadata.latlng as [number, number],
        sourceId: "rest-countries",
        sourceVersion: new Date().toISOString().split("T")[0],
        lastSyncAt: new Date(),
      };

      const existing = existingMap.get(countryData.code);
      if (existing) {
        await this.commands.updateCountry(countryData.code, countryEntity);
      } else {
        await this.commands.createCountry(countryEntity);
      }
    }

    const removedCodes = existingCountries
      .filter((c) => !newCodesSet.has(c.code))
      .map((c) => c.code);

    for (const code of removedCodes) {
      await this.commands.updateCountry(code, { deprecatedAt: new Date() });
    }
  }

  async syncItalyAdministrative(
    options: SyncOptions = {},
  ): Promise<ItalySyncResult> {
    const result: ItalySyncResult = {
      regions: 0,
      provinces: 0,
      communes: 0,
      errors: [],
    };

    try {
      const italyDataPath = `${this.basePath}/istat/italy-communes.json`;
      const data = await readJson<{ data: AdministrativeRecord[] }>(
        italyDataPath,
      );

      const regionRecords = data.data.filter((r) => r.level === 1);
      const provinceRecords = data.data.filter((r) => r.level === 2);
      const communeRecords = data.data.filter((r) => r.level === 3);

      if (options.dryRun) {
        const [regionsPreview, provincesPreview, communesPreview] =
          await Promise.all([
            this.previewRegionsChanges(regionRecords),
            this.previewProvincesChanges(provinceRecords),
            this.previewCommunesChanges(communeRecords),
          ]);

        return {
          regions: regionRecords.length,
          provinces: provinceRecords.length,
          communes: communeRecords.length,
          errors: [],
          preview: {
            regions: regionsPreview,
            provinces: provincesPreview,
            communes: communesPreview,
          },
        };
      }

      try {
        await this.syncRegions(regionRecords);
        result.regions = regionRecords.length;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        result.errors.push(`Regions sync failed: ${errorMessage}`);
      }

      try {
        await this.syncProvinces(provinceRecords);
        result.provinces = provinceRecords.length;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        result.errors.push(`Provinces sync failed: ${errorMessage}`);
      }

      try {
        await this.syncCommunes(communeRecords);
        result.communes = communeRecords.length;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        result.errors.push(`Communes sync failed: ${errorMessage}`);
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      result.errors.push(`Italy data loading failed: ${errorMessage}`);
    }

    return result;
  }

  private async previewRegionsChanges(
    regionRecords: AdministrativeRecord[],
  ): Promise<PreviewStats> {
    const existingRegions = await this.queries.getAllRegions("IT");
    const existingCodes = new Set(existingRegions.map((r) => r.code));
    const newCodes = new Set(regionRecords.map((r) => r.code));

    return {
      toAdd: regionRecords.filter((r) => !existingCodes.has(r.code)).length,
      toUpdate: regionRecords.filter((r) => existingCodes.has(r.code)).length,
      toDeprecate: existingRegions.filter((r) => !newCodes.has(r.code)).length,
    };
  }

  private async previewProvincesChanges(
    provinceRecords: AdministrativeRecord[],
  ): Promise<PreviewStats> {
    const existingProvinces = await this.queries.getAllProvinces();
    const existingCodes = new Set(existingProvinces.map((p) => p.code));
    const newCodes = new Set(provinceRecords.map((p) => p.code));

    return {
      toAdd: provinceRecords.filter((p) => !existingCodes.has(p.code)).length,
      toUpdate: provinceRecords.filter((p) => existingCodes.has(p.code)).length,
      toDeprecate: existingProvinces.filter((p) => !newCodes.has(p.code))
        .length,
    };
  }

  private async previewCommunesChanges(
    communeRecords: AdministrativeRecord[],
  ): Promise<PreviewStats> {
    // Only capitals for preview
    const capitalCommunes = await this.queries.getCommunesWithStats(
      undefined,
      undefined,
      "IT",
    );
    const capitals = capitalCommunes.filter((c) => c.isCapital);

    const existingCodes = new Set(capitals.map((c) => c.code));
    const newCapitalRecords = communeRecords.filter(
      (r) => r.metadata.capoluogo,
    );
    const newCodes = new Set(newCapitalRecords.map((r) => r.code));

    return {
      toAdd: newCapitalRecords.filter((c) => !existingCodes.has(c.code)).length,
      toUpdate: newCapitalRecords.filter((c) => existingCodes.has(c.code))
        .length,
      toDeprecate: capitals.filter((c) => !newCodes.has(c.code)).length,
    };
  }

  //! Note Currently bound to italian ISTAT data
  private async syncRegions(records: AdministrativeRecord[]): Promise<void> {
    const entities = records.map((record) => ({
      name: record.name,
      code: record.code,
      countryCode: "IT",
      codesPath: `/IT/${record.code}`,
      namesPath: `/Italia/${record.name}`,
      areaName: record.metadata.areaName || "",
      nuts1Code: record.metadata.nuts1 || "",
      nuts2Code: record.metadata.nuts2 || "",
      sourceId: "istat",
      sourceVersion: record.metadata.sourceVersion || "",
      lastSyncAt: new Date(),
    }));

    await this.commands.bulkSyncRegions(entities);
  }

  private async syncProvinces(records: AdministrativeRecord[]): Promise<void> {
    // Map parentCode to regionCode
    const regions = await this.queries.getAllRegions();
    const validRegionCodes = new Set(regions.map((r) => r.code));
    const regionCodesPathMap = new Map(
      regions.map((r) => [r.code, r.codesPath]),
    );
    const regionNamesPathMap = new Map(
      regions.map((r) => [r.code, r.namesPath]),
    );

    const entities = records
      // Skip orphaned provinces
      .filter(
        (record) =>
          record.parentCode && validRegionCodes.has(record.parentCode),
      )
      .map((record) => {
        const provinceName = record.name;
        // biome-ignore lint/style/noNonNullAssertion: valid
        const parentCodesPath = regionCodesPathMap.get(record.parentCode!);
        // biome-ignore lint/style/noNonNullAssertion: valid
        const parentNamesPath = regionNamesPathMap.get(record.parentCode!);

        return {
          name: provinceName,
          code: record.code,
          // biome-ignore lint/style/noNonNullAssertion: valid
          regionCode: record.parentCode!,
          codesPath: `${parentCodesPath}/${record.code}`,
          namesPath: `${parentNamesPath}/${provinceName}`,
          abbreviation: record.metadata.abbreviation || "",
          territorialType: (record.metadata.territorialType ||
            "1") as IstatTerritorialType,
          nuts1Code: record.metadata.nuts1 || "",
          nuts2Code: record.metadata.nuts2 || "",
          nuts3Code: record.metadata.nuts3 || "",
          sourceId: "istat",
          sourceVersion: record.metadata.sourceVersion || "",
          lastSyncAt: new Date(),
        };
      });

    await this.commands.bulkSyncProvinces(entities);
  }

  private async syncCommunes(records: AdministrativeRecord[]): Promise<void> {
    // Map parentCode to provinceCode
    const provinces = await this.queries.getAllProvinces();
    const validProvinceCodes = new Set(provinces.map((p) => p.code));
    const provinceCodesPathMap = new Map(
      provinces.map((p) => [p.code, p.codesPath]),
    );
    const provinceNamesPathMap = new Map(
      provinces.map((p) => [p.code, p.namesPath]),
    );

    const entities = records
      .filter(
        (record) =>
          record.parentCode && validProvinceCodes.has(record.parentCode),
      )
      .map((record) => {
        // biome-ignore lint/style/noNonNullAssertion: valid
        const parentCodesPath = provinceCodesPathMap.get(record.parentCode!);
        // biome-ignore lint/style/noNonNullAssertion: valid
        const parentNamesPath = provinceNamesPathMap.get(record.parentCode!);
        const communeName = record.name;

        return {
          name: communeName,
          code: record.code,
          // biome-ignore lint/style/noNonNullAssertion: valid
          provinceCode: record.parentCode!,
          codesPath: `${parentCodesPath}/${record.code}`,
          namesPath: `${parentNamesPath}/${communeName}`,
          isCapital: record.metadata.isCapital === "true",
          cadastralCode: record.metadata.cadastralCode as string,
          nuts1Code: record.metadata.nuts1 || "",
          nuts2Code: record.metadata.nuts2 || "",
          nuts3Code: record.metadata.nuts3 || "",
          sourceId: "istat",
          sourceVersion: record.metadata.sourceVersion || "",
          lastSyncAt: new Date(),
        };
      });

    await this.commands.bulkSyncCommunes(entities);
  }
}
