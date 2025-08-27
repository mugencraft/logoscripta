import {
  and,
  asc,
  eq,
  exists,
  getTableColumns,
  ilike,
  type SQL,
  sql,
} from "drizzle-orm";

import type { Commune } from "@/domain/models/location/commune";
import type { POI } from "@/domain/models/location/poi";
import type { Province } from "@/domain/models/location/province";
import type { Region } from "@/domain/models/location/region";
import type {
  CommuneWithPOIs,
  CommuneWithStats,
  CountryWithStats,
  LocationStatistics,
  POIWithLocation,
  ProvinceWithCommunes,
  ProvinceWithStats,
  RegionStatistics,
  RegionWithProvinces,
  RegionWithStats,
} from "@/domain/models/location/types";
import type { LocationQueriesPort } from "@/domain/ports/location/queries";
import type { CommuneSearchFilters } from "@/domain/validation/location/commune";
import type {
  GeographicBounds,
  GeographicRadius,
  POISearchFilters,
} from "@/domain/validation/location/poi";
import type { ProvinceSearchFilters } from "@/domain/validation/location/province";
import type { RegionSearchFilters } from "@/domain/validation/location/region";
import {
  communes,
  countries,
  pois,
  provinces,
  regions,
} from "@/shared/schema/location";

import { db } from "../../db";

export class LocationQueriesAdapter implements LocationQueriesPort {
  async getAllCountries() {
    return db.select().from(countries).orderBy(asc(countries.name));
  }

  async getCountryWithRegions(countryCode: string) {
    return (
      (await db.query.countries.findFirst({
        where: eq(countries.code, countryCode),
        with: {
          regions: true,
        },
      })) || null
    );
  }

  async getAllRegions(countryCode?: string) {
    const regionsQuery = db.select().from(regions).orderBy(asc(regions.name));
    if (countryCode) {
      return regionsQuery.where(eq(regions.countryCode, countryCode));
    }
    return regionsQuery;
  }

  async getAllProvinces() {
    return db.select().from(provinces).orderBy(asc(provinces.name));
  }

  async getRegionWithProvinces(
    regionCode: string,
  ): Promise<RegionWithProvinces | null> {
    return (
      (await db.query.regions.findFirst({
        where: eq(regions.code, regionCode),
        with: {
          provinces: true,
        },
      })) || null
    );
  }

  async getProvinceWithCommunes(
    provinceCode: string,
  ): Promise<ProvinceWithCommunes | null> {
    return (
      (await db.query.provinces.findFirst({
        where: eq(provinces.code, provinceCode),
        with: {
          region: true,
          communes: true,
        },
      })) || null
    );
  }

  async getCommuneWithPOIs(
    communeCode: string,
  ): Promise<CommuneWithPOIs | null> {
    return (
      (await db.query.communes.findFirst({
        where: eq(communes.code, communeCode),
        with: {
          province: { with: { region: true } },
          pois: true,
        },
      })) || null
    );
  }

  async getPOI(poiId: number): Promise<POI | null> {
    return (
      (await db.query.pois.findFirst({ where: eq(pois.id, poiId) })) || null
    );
  }

  async getAllCountriesWithStats(): Promise<CountryWithStats[]> {
    const allCountries = await db
      .select()
      .from(countries)
      .orderBy(asc(countries.name));

    const statsPromises = allCountries.map(async (country) => {
      const [regionsCount, provincesCount, communesCount, poisCount] =
        await Promise.all([
          db.$count(regions, eq(regions.countryCode, country.code)),

          db.$count(
            provinces,
            exists(
              db
                .select()
                .from(regions)
                .where(
                  and(
                    eq(regions.code, provinces.regionCode),
                    eq(regions.countryCode, country.code),
                  ),
                ),
            ),
          ),

          db.$count(
            communes,
            exists(
              db
                .select()
                .from(provinces)
                .innerJoin(regions, eq(provinces.regionCode, regions.code))
                .where(
                  and(
                    eq(provinces.code, communes.provinceCode),
                    eq(regions.countryCode, country.code),
                  ),
                ),
            ),
          ),

          db.$count(
            pois,
            exists(
              db
                .select()
                .from(communes)
                .innerJoin(provinces, eq(communes.provinceCode, provinces.code))
                .innerJoin(regions, eq(provinces.regionCode, regions.code))
                .where(
                  and(
                    eq(communes.code, pois.communeCode),
                    eq(regions.countryCode, country.code),
                  ),
                ),
            ),
          ),
        ]);

      return {
        ...country,
        regionsCount,
        provincesCount,
        communesCount,
        poisCount,
      };
    });

    return Promise.all(statsPromises);
  }

  async getAllRegionsWithStats(
    countryCode?: string,
  ): Promise<RegionWithStats[]> {
    const conditions: SQL[] = [];

    if (countryCode) {
      conditions.push(eq(regions.countryCode, countryCode));
    }

    const regionsData = await db
      .select()
      .from(regions)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(asc(regions.name));

    const statsPromises = regionsData.map(async (region) => {
      const [provincesCount, communesCount, poisCount] = await Promise.all([
        db.$count(provinces, eq(provinces.regionCode, region.code)),

        db.$count(
          communes,
          exists(
            db
              .select()
              .from(provinces)
              .where(
                and(
                  eq(provinces.code, communes.provinceCode),
                  eq(provinces.regionCode, region.code),
                ),
              ),
          ),
        ),

        db.$count(
          pois,
          exists(
            db
              .select()
              .from(communes)
              .innerJoin(provinces, eq(communes.provinceCode, provinces.code))
              .where(
                and(
                  eq(communes.code, pois.communeCode),
                  eq(provinces.regionCode, region.code),
                ),
              ),
          ),
        ),
      ]);

      return {
        ...region,
        provincesCount,
        communesCount,
        poisCount,
      };
    });

    return Promise.all(statsPromises);
  }

  async getProvincesWithStats(
    regionCode?: string,
    countryCode?: string,
  ): Promise<ProvinceWithStats[]> {
    const conditions: SQL[] = [];

    if (regionCode) {
      conditions.push(eq(provinces.regionCode, regionCode));
    } else if (countryCode) {
      // Filter provinces by country through regions
      conditions.push(
        exists(
          db
            .select()
            .from(regions)
            .where(
              and(
                eq(regions.code, provinces.regionCode),
                eq(regions.countryCode, countryCode),
              ),
            ),
        ),
      );
    }

    const provincesData = await db
      .select({
        ...getTableColumns(provinces),
        regionName: regions.name,
        regionCode: regions.code,
      })
      .from(provinces)
      .innerJoin(regions, eq(provinces.regionCode, regions.code))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(asc(provinces.name));

    const statsPromises = provincesData.map(async (province) => {
      const [communesCount, poisCount] = await Promise.all([
        db.$count(communes, eq(communes.provinceCode, province.code)),

        db.$count(
          pois,
          exists(
            db
              .select()
              .from(communes)
              .where(
                and(
                  eq(communes.code, pois.communeCode),
                  eq(communes.provinceCode, province.code),
                ),
              ),
          ),
        ),
      ]);

      return {
        ...province,
        communesCount,
        poisCount,
      };
    });

    return Promise.all(statsPromises);
  }

  async getCommunesWithStats(
    provinceCode?: string,
    regionCode?: string,
    countryCode?: string,
  ): Promise<CommuneWithStats[]> {
    const conditions: SQL[] = [];

    if (provinceCode) {
      conditions.push(eq(communes.provinceCode, provinceCode));
    } else if (regionCode) {
      // Filter communes by region through provinces
      conditions.push(
        exists(
          db
            .select()
            .from(provinces)
            .where(
              and(
                eq(provinces.code, communes.provinceCode),
                eq(provinces.regionCode, regionCode),
              ),
            ),
        ),
      );
    } else if (countryCode) {
      // Filter communes by country through regions->provinces
      conditions.push(
        exists(
          db
            .select()
            .from(regions)
            .innerJoin(provinces, eq(provinces.regionCode, regions.code))
            .where(
              and(
                eq(provinces.code, communes.provinceCode),
                eq(regions.countryCode, countryCode),
              ),
            ),
        ),
      );
    }

    const communesData = await db
      .select({
        ...getTableColumns(communes),
        provinceName: provinces.name,
        provinceCode: provinces.code,
        regionName: regions.name,
        regionCode: regions.code,
      })
      .from(communes)
      .innerJoin(provinces, eq(communes.provinceCode, provinces.code))
      .innerJoin(regions, eq(provinces.regionCode, regions.code))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(asc(communes.name));

    const statsPromises = communesData.map(async (commune) => {
      const poisCount = await db.$count(
        pois,
        eq(pois.communeCode, commune.code),
      );

      return {
        ...commune,
        poisCount,
      };
    });

    return Promise.all(statsPromises);
  }

  async getPOIsWithLocation(
    communeCode?: string,
    provinceCode?: string,
    regionCode?: string,
    countryCode?: string,
  ): Promise<POIWithLocation[]> {
    const conditions: SQL[] = [];

    if (communeCode) {
      conditions.push(eq(pois.communeCode, communeCode));
    } else if (provinceCode) {
      // Filter by province: join communes to get all POIs in province
      conditions.push(
        exists(
          db
            .select()
            .from(communes)
            .where(
              and(
                eq(communes.code, pois.communeCode),
                eq(communes.provinceCode, provinceCode),
              ),
            ),
        ),
      );
    } else if (regionCode) {
      // Filter by region: join through provinces->communes
      conditions.push(
        exists(
          db
            .select()
            .from(provinces)
            .innerJoin(communes, eq(communes.provinceCode, provinces.code))
            .where(
              and(
                eq(provinces.regionCode, regionCode),
                eq(communes.code, pois.communeCode),
              ),
            ),
        ),
      );
    } else if (countryCode) {
      // Filter by country: join through regions->provinces->communes
      conditions.push(
        exists(
          db
            .select()
            .from(regions)
            .innerJoin(provinces, eq(provinces.regionCode, regions.code))
            .innerJoin(communes, eq(communes.provinceCode, provinces.code))
            .where(
              and(
                eq(regions.countryCode, countryCode),
                eq(communes.code, pois.communeCode),
              ),
            ),
        ),
      );
    }

    return db
      .select({
        ...getTableColumns(pois),
        communeName: communes.name,
        provinceName: provinces.name,
        regionName: regions.name,
        provinceCode: communes.provinceCode,
        regionCode: provinces.regionCode,
      })
      .from(pois)
      .innerJoin(communes, eq(pois.communeCode, communes.code))
      .innerJoin(provinces, eq(communes.provinceCode, provinces.code))
      .innerJoin(regions, eq(provinces.regionCode, regions.code))
      .where(conditions.length > 0 ? and(...conditions) : undefined);
  }

  async searchLocations(filters: POISearchFilters) {
    const results = await Promise.all([
      this.searchRegions(filters),
      this.searchProvinces(filters),
      this.searchCommunes(filters),
      this.searchPOIs(filters),
    ]);
    return {
      regions: results[0],
      provinces: results[1],
      communes: results[2],
      pois: results[3],
    };
  }

  async getPOIsInBounds(bounds: GeographicBounds): Promise<POIWithLocation[]> {
    const poisInBounds = await db
      .select()
      .from(pois)
      .where(
        and(
          bounds.north ? sql`${pois.latitude} <= ${bounds.north}` : undefined,
          bounds.south ? sql`${pois.latitude} >= ${bounds.south}` : undefined,
          bounds.east ? sql`${pois.longitude} <= ${bounds.east}` : undefined,
          bounds.west ? sql`${pois.longitude} >= ${bounds.west}` : undefined,
        ),
      );

    return this.enhancePOIsWithLocation(poisInBounds);
  }

  async getPOIsNearPoint(radius: GeographicRadius): Promise<POIWithLocation[]> {
    const poisNearby = await db
      .select()
      .from(pois)
      .where(
        sql`(
          6371 * acos(
            cos(radians(${radius.latitude})) *
            cos(radians(${pois.latitude})) *
            cos(radians(${pois.longitude}) - radians(${radius.longitude})) +
            sin(radians(${radius.latitude})) *
            sin(radians(${pois.latitude}))
          )
        ) <= ${radius.kilometers}`,
      );

    return this.enhancePOIsWithLocation(poisNearby);
  }

  async getLocationStatistics(): Promise<LocationStatistics> {
    const [statsResult] = await db
      .select({
        totalCountries: sql<number>`(SELECT COUNT(*) FROM ${countries})`,
        totalRegions: sql<number>`(SELECT COUNT(*) FROM ${regions})`,
        totalProvinces: sql<number>`(SELECT COUNT(*) FROM ${provinces})`,
        totalCommunes: sql<number>`(SELECT COUNT(*) FROM ${communes})`,
        totalPOIs: sql<number>`(SELECT COUNT(*) FROM ${pois})`,
        averagePOIsPerCommune: sql<number>`(
          SELECT AVG(poi_count)
          FROM (
            SELECT COUNT(*) as poi_count
            FROM ${pois}
            GROUP BY ${pois.communeCode}
          )
        )`,
      })
      .from(regions)
      .limit(1);

    return (
      statsResult || {
        totalCountries: 0,
        totalRegions: 0,
        totalProvinces: 0,
        totalCommunes: 0,
        totalPOIs: 0,
        averagePOIsPerCommune: 0,
      }
    );
  }

  async getRegionStatistics(regionCode: string): Promise<RegionStatistics> {
    const [stats] = await db
      .select({
        provincesCount: sql<number>`(
          SELECT COUNT(*)
          FROM ${provinces}
          WHERE ${provinces.regionCode} = ${regionCode}
        )`,
        communesCount: sql<number>`(
          SELECT COUNT(*)
          FROM ${communes}
          INNER JOIN ${provinces} ON ${communes.provinceCode} = ${provinces.code}
          WHERE ${provinces.regionCode} = ${regionCode}
        )`,
        poisCount: sql<number>`(
          SELECT COUNT(*)
          FROM ${pois}
          INNER JOIN ${communes} ON ${pois.communeCode} = ${communes.code}
          INNER JOIN ${provinces} ON ${communes.provinceCode} = ${provinces.code}
          WHERE ${provinces.regionCode} = ${regionCode}
        )`,
      })
      .from(regions)
      .where(eq(regions.code, regionCode))
      .limit(1);

    if (!stats) throw new Error(`Region ${regionCode} not found`);
    return stats;
  }

  // Helper methods adapted for code-based relationships

  private async searchRegions(
    filters: RegionSearchFilters,
  ): Promise<RegionWithStats[]> {
    if (!filters.nameQuery && !filters.countryCode) return [];

    const conditions: SQL[] = [];
    if (filters.countryCode) {
      conditions.push(eq(regions.countryCode, filters.countryCode));
    }
    if (filters.nameQuery) {
      conditions.push(ilike(regions.name, `%${filters.nameQuery}%`));
    }

    const matchingRegions = await db
      .select()
      .from(regions)
      .where(and(...conditions));

    return this.enhanceRegionsWithStats(matchingRegions);
  }

  private async searchProvinces(
    filters: ProvinceSearchFilters,
  ): Promise<ProvinceWithStats[]> {
    const conditions: SQL[] = [];

    if (filters.regionCode) {
      conditions.push(eq(provinces.regionCode, filters.regionCode));
    } else if (filters.countryCode) {
      // Filter provinces by country through regions
      conditions.push(
        exists(
          db
            .select()
            .from(regions)
            .where(
              and(
                eq(regions.code, provinces.regionCode),
                eq(regions.countryCode, filters.countryCode),
              ),
            ),
        ),
      );
    }

    if (filters.nameQuery) {
      conditions.push(ilike(provinces.name, `%${filters.nameQuery}%`));
    }

    if (conditions.length === 0) return [];

    const matchingProvinces = await db
      .select()
      .from(provinces)
      .where(and(...conditions));

    return this.enhanceProvincesWithStats(matchingProvinces);
  }

  async searchCommunes(
    options: CommuneSearchFilters,
  ): Promise<CommuneWithStats[]> {
    const conditions: SQL[] = [];

    if (options.onlyCapitals) {
      conditions.push(eq(communes.isCapital, true));
    }

    if (options.provinceCode) {
      conditions.push(eq(communes.provinceCode, options.provinceCode));
    }
    if (options.regionCode) {
      conditions.push(
        exists(
          db
            .select()
            .from(provinces)
            .where(
              and(
                eq(provinces.code, communes.provinceCode),
                eq(provinces.regionCode, options.regionCode),
              ),
            ),
        ),
      );
    }
    if (options.countryCode) {
      conditions.push(
        exists(
          db
            .select()
            .from(regions)
            .innerJoin(provinces, eq(provinces.regionCode, regions.code))
            .where(
              and(
                eq(provinces.code, communes.provinceCode),
                eq(regions.countryCode, options.countryCode),
              ),
            ),
        ),
      );
    }

    if (options.nameQuery && options.nameQuery.trim().length > 0) {
      conditions.push(ilike(communes.name, `%${options.nameQuery}%`));
    }

    const communesData = await db
      .select({
        ...getTableColumns(communes),
        provinceCode: provinces.code,
        regionCode: regions.code,
      })
      .from(communes)
      .innerJoin(provinces, eq(communes.provinceCode, provinces.code))
      .innerJoin(regions, eq(provinces.regionCode, regions.code))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(asc(communes.name))
      .limit(options.limit);

    return this.enhanceCommunesWithStats(communesData);
  }

  async getMostUsedCommunes(options: {
    limit: number;
    countryCode?: string;
  }): Promise<CommuneWithStats[]> {
    const conditions: SQL[] = [];

    if (options.countryCode) {
      conditions.push(
        exists(
          db
            .select()
            .from(regions)
            .innerJoin(provinces, eq(provinces.regionCode, regions.code))
            .where(
              and(
                eq(provinces.code, communes.provinceCode),
                eq(regions.countryCode, options.countryCode),
              ),
            ),
        ),
      );
    }

    // Sort by number of POIs descending
    const communesData = await db
      .select({
        ...getTableColumns(communes),
        provinceCode: provinces.code,
        regionCode: regions.code,
        poisCount: sql<number>`COUNT(${pois.id})`.as("poisCount"),
      })
      .from(communes)
      .innerJoin(provinces, eq(communes.provinceCode, provinces.code))
      .innerJoin(regions, eq(provinces.regionCode, regions.code))
      .leftJoin(pois, eq(pois.communeCode, communes.code))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(communes.code, provinces.code, regions.code)
      .having(sql`COUNT(${pois.id}) > 0`) // only include communes with POIs
      .orderBy(sql`COUNT(${pois.id}) DESC`)
      .limit(options.limit);

    return communesData as CommuneWithStats[];
  }

  async getRecentlyUsedCommunes(options: {
    limit: number;
  }): Promise<CommuneWithStats[]> {
    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 30);

    const communesData = await db
      .select({
        ...getTableColumns(communes),
        provinceCode: provinces.code,
        regionCode: regions.code,
        lastPoiCreated:
          sql<Date>`MAX(${pois.metadata}->>'$.system.createdAt')`.as(
            "lastPoiCreated",
          ),
      })
      .from(communes)
      .innerJoin(provinces, eq(communes.provinceCode, provinces.code))
      .innerJoin(regions, eq(provinces.regionCode, regions.code))
      .innerJoin(pois, eq(pois.communeCode, communes.code))
      .where(
        sql`${pois.metadata}->>'$.system.createdAt' > ${recentDate.toISOString()}`,
      )
      .groupBy(communes.code, provinces.code, regions.code)
      .orderBy(sql`MAX(${pois.metadata}->>'$.system.createdAt') DESC`)
      .limit(options.limit);

    return this.enhanceCommunesWithStats(communesData);
  }

  private async searchPOIs(
    filters: POISearchFilters,
  ): Promise<POIWithLocation[]> {
    const conditions: SQL[] = [];

    if (filters.communeCode) {
      conditions.push(eq(pois.communeCode, filters.communeCode));
    } else if (filters.provinceCode) {
      // Filter POIs by province through communes
      conditions.push(
        exists(
          db
            .select()
            .from(communes)
            .where(
              and(
                eq(communes.code, pois.communeCode),
                eq(communes.provinceCode, filters.provinceCode),
              ),
            ),
        ),
      );
    } else if (filters.regionCode) {
      // Filter POIs by region through provinces->communes
      conditions.push(
        exists(
          db
            .select()
            .from(provinces)
            .innerJoin(communes, eq(communes.provinceCode, provinces.code))
            .where(
              and(
                eq(provinces.regionCode, filters.regionCode),
                eq(communes.code, pois.communeCode),
              ),
            ),
        ),
      );
    } else if (filters.countryCode) {
      // Filter POIs by country through regions->provinces->communes
      conditions.push(
        exists(
          db
            .select()
            .from(regions)
            .innerJoin(provinces, eq(provinces.regionCode, regions.code))
            .innerJoin(communes, eq(communes.provinceCode, provinces.code))
            .where(
              and(
                eq(regions.countryCode, filters.countryCode),
                eq(communes.code, pois.communeCode),
              ),
            ),
        ),
      );
    }

    if (filters.poiType) {
      conditions.push(eq(pois.type, filters.poiType));
    }
    if (filters.nameQuery) {
      conditions.push(ilike(pois.name, `%${filters.nameQuery}%`));
    }

    if (conditions.length === 0) return [];

    const poisResult = await db
      .select()
      .from(pois)
      .where(and(...conditions));

    return this.enhancePOIsWithLocation(poisResult);
  }

  // Helper methods for enhancing data with stats

  private async enhanceRegionsWithStats(
    regions: Region[],
  ): Promise<RegionWithStats[]> {
    const regionsWithStats = await this.getAllRegionsWithStats();
    return regions.map((region) => {
      const withStats = regionsWithStats.find((r) => r.code === region.code);
      return (
        withStats || {
          ...region,
          provincesCount: 0,
          communesCount: 0,
          poisCount: 0,
        }
      );
    });
  }

  private async enhanceProvincesWithStats(
    provinces: Province[],
  ): Promise<ProvinceWithStats[]> {
    const provincesWithStats = await this.getProvincesWithStats();
    return provinces.map((province) => {
      const withStats = provincesWithStats.find(
        (p) => p.code === province.code,
      );
      return (
        withStats || {
          ...province,
          regionName: "",
          regionCode: "",
          communesCount: 0,
          poisCount: 0,
        }
      );
    });
  }

  private async enhanceCommunesWithStats(
    communes: Commune[],
  ): Promise<CommuneWithStats[]> {
    const communesWithStats = await this.getCommunesWithStats();
    return communes.map((commune) => {
      const withStats = communesWithStats.find((c) => c.code === commune.code);
      return (
        withStats || {
          ...commune,
          poisCount: 0,
          provinceCode: "",
          regionCode: "",
        }
      );
    });
  }

  private async enhancePOIsWithLocation(
    pois: POI[],
  ): Promise<POIWithLocation[]> {
    const poisWithLocation = await this.getPOIsWithLocation();
    return pois.map((poi) => {
      const withLocation = poisWithLocation.find((p) => p.id === poi.id);
      return (
        withLocation || {
          ...poi,
          communeName: "",
          provinceCode: "",
          regionCode: "",
        }
      );
    });
  }
}
