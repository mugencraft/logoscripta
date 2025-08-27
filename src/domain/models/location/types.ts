import type { Commune } from "./commune";
import type { Country } from "./country";
import type { POI } from "./poi";
import type { Province } from "./province";
import type { Region } from "./region";

export type CountryLanguages = Record<string, string>;

type CountryCurrency = {
  name: string;
  symbol: string;
};

export type CountryCurrencies = Record<string, CountryCurrency>;

// Enums

export const POI_TYPES_HISTORICAL = [
  "castle",
  "fort",
  "church",
  "monastery",
  "museum",
];

export const POI_TYPES = [
  ...POI_TYPES_HISTORICAL,
  "restaurant",
  "landmark",
  "park",
  "hospital",
  "school",
  "shopping",
  "accommodation",
  "transportation",
  "entertainment",
  "business",
  "government",
  "cultural",
  "sports",
  "other",
] as const;

export const ISTAT_TERRITORIAL_TYPE_NAMES = {
  1: "Provincia",
  2: "Provincia autonoma",
  3: "Città metropolitana",
  4: "Libero consorzio di comuni",
  5: "Unità non amministrativa",
};

export const ISTAT_TERRITORIAL_TYPE = ["1", "2", "3", "4", "5"] as const;

export type IstatTerritorialType = (typeof ISTAT_TERRITORIAL_TYPE)[number];

// Sync-related types

export interface SyncOptions {
  force?: boolean;
  dryRun?: boolean;
  country?: string;
}

export interface PreviewStats {
  toAdd: number;
  toUpdate: number;
  toDeprecate: number;
}

export interface CountriesSyncResult {
  countries: number;
  errors: string[];
  preview?: PreviewStats;
}

export interface ItalySyncResult {
  regions: number;
  provinces: number;
  communes: number;
  errors: string[];
  preview?: {
    regions: PreviewStats;
    provinces: PreviewStats;
    communes: PreviewStats;
  };
}

// Import/Export types

export interface LocationImportResult {
  poisCreated: number;
  errors: string[];
}

// Extended types with computed statistics
export type CountryWithStats = Country & {
  regionsCount: number;
  provincesCount: number;
  communesCount: number;
  poisCount: number;
};

export type RegionWithStats = Region & {
  provincesCount: number;
  communesCount: number;
  poisCount: number;
};

export type ProvinceWithStats = Province & {
  communesCount: number;
  poisCount: number;
  regionName: string;
  regionCode: string;
};

export type CommuneWithStats = Commune & {
  poisCount: number;
};

// TODO: check and remove if not needed
export type POIWithLocation = POI & {
  communeName: string;
};

// Hierarchical types for nested data representation

export type CountryWithRegions = Country & {
  regions: Region[];
};

export type RegionWithProvinces = Region & {
  provinces: Province[];
};

export type ProvinceWithCommunes = Province & {
  region: Region;
  communes: Commune[];
};

export type ProvinceWithRegion = Province & {
  region: Region;
};

export type CommuneWithPOIs = Commune & {
  province: ProvinceWithRegion;
  pois: POI[];
};

// Statistics aggregation interfaces

export interface LocationStatistics {
  totalCountries: number;
  totalRegions: number;
  totalProvinces: number;
  totalCommunes: number;
  totalPOIs: number;
  averagePOIsPerCommune: number;
}

export interface RegionStatistics {
  provincesCount: number;
  communesCount: number;
  poisCount: number;
}
