import { and, eq, sql } from "drizzle-orm";

import type { Commune, NewCommune } from "@/domain/models/location/commune";
import type { Country, NewCountry } from "@/domain/models/location/country";
import type { NewPOI, POI } from "@/domain/models/location/poi";
import type { NewProvince, Province } from "@/domain/models/location/province";
import type { NewRegion, Region } from "@/domain/models/location/region";
import type { LocationCommandsPort } from "@/domain/ports/location/commands";
import { updateMetadataTimestamp } from "@/domain/services/shared/metadata";
import {
  communes,
  countries,
  pois,
  provinces,
  regions,
} from "@/shared/schema/location";

import { db } from "../../db";

export class LocationCommandsAdapter implements LocationCommandsPort {
  // Country operations
  async createCountry(data: NewCountry): Promise<Country> {
    const [created] = await db.insert(countries).values(data).returning();
    if (!created) throw new Error("Failed to create country");
    return created;
  }

  async updateCountry(code: string, data: Partial<Country>): Promise<Country> {
    const [updated] = await db
      .update(countries)
      .set(data)
      .where(eq(countries.code, code))
      .returning();
    if (!updated) throw new Error(`Country ${code} not found`);
    return updated;
  }

  async deleteCountry(code: string): Promise<void> {
    await db.delete(countries).where(eq(countries.code, code));
  }

  // Region operations
  async createRegion(data: NewRegion): Promise<Region> {
    const [created] = await db.insert(regions).values(data).returning();
    if (!created) {
      throw new Error("Failed to create region");
    }
    return created;
  }

  async updateRegion(code: string, data: Partial<Region>): Promise<Region> {
    const [updated] = await db
      .update(regions)
      .set(data)
      .where(eq(regions.code, code))
      .returning();

    if (!updated) {
      throw new Error(`Region ${code} not found`);
    }
    return updated;
  }

  async deleteRegion(code: string): Promise<void> {
    await db.delete(regions).where(eq(regions.code, code));
  }

  // Province operations
  async createProvince(data: NewProvince): Promise<Province> {
    const [created] = await db.insert(provinces).values(data).returning();
    if (!created) {
      throw new Error("Failed to create province");
    }
    return created;
  }

  async updateProvince(
    code: string,
    data: Partial<Province>,
  ): Promise<Province> {
    const [updated] = await db
      .update(provinces)
      .set(data)
      .where(eq(provinces.code, code))
      .returning();

    if (!updated) {
      throw new Error(`Province ${code} not found`);
    }
    return updated;
  }

  async deleteProvince(code: string): Promise<void> {
    await db.delete(provinces).where(eq(provinces.code, code));
  }

  // Commune operations
  async createCommune(data: NewCommune): Promise<Commune> {
    const [created] = await db.insert(communes).values(data).returning();
    if (!created) {
      throw new Error("Failed to create commune");
    }
    return created;
  }

  async updateCommune(code: string, data: Partial<Commune>): Promise<Commune> {
    const [updated] = await db
      .update(communes)
      .set(data)
      .where(eq(communes.code, code))
      .returning();

    if (!updated) {
      throw new Error(`Commune ${code} not found`);
    }
    return updated;
  }

  async deleteCommune(code: string): Promise<void> {
    await db.delete(communes).where(eq(communes.code, code));
  }

  // POI operations
  async createPOI(data: NewPOI): Promise<POI> {
    const [created] = await db.insert(pois).values(data).returning();
    if (!created) {
      throw new Error("Failed to create POI");
    }
    return created;
  }

  async updatePOI(id: number, data: Partial<POI>): Promise<POI> {
    const [updated] = await db
      .update(pois)
      .set(updateMetadataTimestamp(data))
      .where(eq(pois.id, id))
      .returning();

    if (!updated) {
      throw new Error(`POI ${id} not found`);
    }
    return updated;
  }

  async deletePOI(id: number): Promise<void> {
    await db.delete(pois).where(eq(pois.id, id));
  }

  async bulkSyncRegions(regionsData: NewRegion[]): Promise<void> {
    if (regionsData.length === 0) return;

    await db.transaction(async (tx) => {
      const countryCode = regionsData[0]?.countryCode;
      if (!countryCode)
        throw new Error("Country code required for region sync");

      // Mark existing regions as potentially deprecated
      const existingRegions = await tx
        .select({ code: regions.code })
        .from(regions)
        .where(eq(regions.countryCode, countryCode));

      const existingCodes = new Set(existingRegions.map((r) => r.code));
      const incomingCodes = new Set(regionsData.map((r) => r.code));

      for (const regionData of regionsData) {
        const existing = existingRegions.find(
          (r) => r.code === regionData.code,
        );

        if (existing) {
          await tx
            .update(regions)
            .set({
              ...regionData,
              lastSyncAt: new Date(),
            })
            .where(eq(regions.code, existing.code));
        } else {
          await tx.insert(regions).values({
            ...regionData,
            lastSyncAt: new Date(),
          });
        }
      }

      // Deprecate removed regions
      const removedCodes = [...existingCodes].filter(
        (code) => !incomingCodes.has(code),
      );
      if (removedCodes.length > 0) {
        await tx
          .update(regions)
          .set({
            deprecatedAt: new Date(),
          })
          .where(
            and(
              eq(regions.countryCode, countryCode),
              sql`${regions.code} IN ${removedCodes}`,
            ),
          );
      }
    });
  }

  async bulkSyncProvinces(provincesData: NewProvince[]): Promise<void> {
    if (provincesData.length === 0) return;

    await db.transaction(async (tx) => {
      // GROUP by regionCode to handle partial updates correctly
      const regionCodes = [...new Set(provincesData.map((p) => p.regionCode))];

      for (const regionCode of regionCodes) {
        const regionProvinces = provincesData.filter(
          (p) => p.regionCode === regionCode,
        );

        const existingProvinces = await tx
          .select({ code: provinces.code })
          .from(provinces)
          .where(eq(provinces.regionCode, regionCode));

        const existingCodes = new Set(existingProvinces.map((p) => p.code));
        const incomingCodes = new Set(regionProvinces.map((p) => p.code));

        // Upsert provinces for this region
        for (const provinceData of regionProvinces) {
          const existing = existingProvinces.find(
            (p) => p.code === provinceData.code,
          );

          if (existing) {
            await tx
              .update(provinces)
              .set({
                ...provinceData,
                lastSyncAt: new Date(),
              })
              .where(eq(provinces.code, existing.code));
          } else {
            await tx.insert(provinces).values({
              ...provinceData,
              lastSyncAt: new Date(),
            });
          }
        }

        // Deprecate removed provinces
        const removedCodes = [...existingCodes].filter(
          (code) => !incomingCodes.has(code),
        );
        if (removedCodes.length > 0) {
          await tx
            .update(provinces)
            .set({ deprecatedAt: new Date() })
            .where(
              and(
                eq(provinces.regionCode, regionCode),
                sql`${provinces.code} IN ${removedCodes}`,
              ),
            );
        }
      }
    });
  }

  async bulkSyncCommunes(communesData: NewCommune[]): Promise<void> {
    if (communesData.length === 0) return;

    await db.transaction(async (tx) => {
      // GROUP by provinceCode to handle partial updates correctly
      const provinceCodes = [
        ...new Set(communesData.map((c) => c.provinceCode)),
      ];

      for (const provinceCode of provinceCodes) {
        const provinceCommunes = communesData.filter(
          (c) => c.provinceCode === provinceCode,
        );

        const existingCommunes = await tx
          .select({ code: communes.code })
          .from(communes)
          .where(eq(communes.provinceCode, provinceCode));

        const existingCodes = new Set(existingCommunes.map((c) => c.code));
        const incomingCodes = new Set(provinceCommunes.map((c) => c.code));

        // Upsert communes for this province
        for (const communeData of provinceCommunes) {
          const existing = existingCommunes.find(
            (c) => c.code === communeData.code,
          );

          if (existing) {
            await tx
              .update(communes)
              .set({
                ...communeData,
                lastSyncAt: new Date(),
              })
              .where(eq(communes.code, existing.code));
          } else {
            await tx.insert(communes).values({
              ...communeData,
              lastSyncAt: new Date(),
            });
          }
        }

        // Deprecate removed communes
        const removedCodes = [...existingCodes].filter(
          (code) => !incomingCodes.has(code),
        );
        if (removedCodes.length > 0) {
          await tx
            .update(communes)
            .set({ deprecatedAt: new Date() })
            .where(
              and(
                eq(communes.provinceCode, provinceCode),
                sql`${communes.code} IN ${removedCodes}`,
              ),
            );
        }
      }
    });
  }

  async bulkCreatePOIs(poisData: NewPOI[]): Promise<POI[]> {
    if (poisData.length === 0) return [];
    return db.insert(pois).values(poisData).returning();
  }
}
