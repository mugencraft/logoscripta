import type { Country } from "../../models/location/country";
import type { POI } from "../../models/location/poi";
import type { Province } from "../../models/location/province";
import type { Region } from "../../models/location/region";
import type {
  CommuneWithPOIs,
  CommuneWithStats,
  CountryWithRegions,
  CountryWithStats,
  LocationStatistics,
  POIWithLocation,
  ProvinceWithCommunes,
  ProvinceWithStats,
  RegionStatistics,
  RegionWithProvinces,
  RegionWithStats,
} from "../../models/location/types";
import type { CommuneSearchFilters } from "../../validation/location/commune";
import type {
  GeographicBounds,
  GeographicRadius,
  POISearchFilters,
} from "../../validation/location/poi";

export interface LocationQueriesPort {
  getAllCountries(): Promise<Country[]>;
  getAllRegions(countryCode?: string): Promise<Region[]>;
  getAllProvinces(): Promise<Province[]>;

  // Hierarchical queries - leverages geographic containment
  getCountryWithRegions: (
    countryCode: string,
  ) => Promise<CountryWithRegions | null>;
  getRegionWithProvinces(
    regionCode: string,
  ): Promise<RegionWithProvinces | null>;
  getProvinceWithCommunes(
    provinceCode: string,
  ): Promise<ProvinceWithCommunes | null>;
  getCommuneWithPOIs(communeCode: string): Promise<CommuneWithPOIs | null>;
  getPOI(poiId: number): Promise<POI | null>; // POI keeps numeric ID

  // Statistics queries
  getAllCountriesWithStats(): Promise<CountryWithStats[]>;
  getAllRegionsWithStats(countryCode?: string): Promise<RegionWithStats[]>;
  getProvincesWithStats(
    regionCode?: string,
    countryCode?: string,
  ): Promise<ProvinceWithStats[]>;
  getCommunesWithStats(
    provinceCode?: string,
    regionCode?: string,
    countryCode?: string,
  ): Promise<CommuneWithStats[]>;

  // Search and filtering

  searchCommunes(filters: CommuneSearchFilters): Promise<CommuneWithStats[]>;
  getMostUsedCommunes(options: {
    limit: number;
    countryCode?: string;
  }): Promise<CommuneWithStats[]>;
  getRecentlyUsedCommunes: (options: {
    limit: number;
  }) => Promise<CommuneWithStats[]>;

  searchLocations(filters: POISearchFilters): Promise<{
    regions: RegionWithStats[];
    provinces: ProvinceWithStats[];
    communes: CommuneWithStats[];
    pois: POIWithLocation[];
  }>;

  getPOIsWithLocation(
    communeCode?: string,
    provinceCode?: string,
    regionCode?: string,
    countryCode?: string,
  ): Promise<POIWithLocation[]>;

  // Geographic queries - spatial operations for mapping/proximity
  getPOIsInBounds(bounds: GeographicBounds): Promise<POIWithLocation[]>;
  getPOIsNearPoint(radius: GeographicRadius): Promise<POIWithLocation[]>;

  // Statistical aggregations
  getLocationStatistics(): Promise<LocationStatistics>;
  getRegionStatistics(regionCode: string): Promise<RegionStatistics>;
}
