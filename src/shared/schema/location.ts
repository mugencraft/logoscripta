import { relations, sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

import {
  type CountryCurrencies,
  type CountryLanguages,
  ISTAT_TERRITORIAL_TYPE,
} from "@/domain/models/location/types";
import type { POIMetadata } from "@/domain/validation/location/poi";

export const countries = sqliteTable(
  "countries",
  {
    code: text("code").primaryKey(), // ISO 3166-1 alpha-2 (IT, FR, DE, etc.)
    name: text("name").notNull(),
    officialName: text("official_name").notNull(),
    region: text("region").notNull(), // Europe, Asia, etc.
    subregion: text("subregion"), // Southern Europe, Western Europe, etc.
    capital: text("capital"),
    languages: text("languages", { mode: "json" }).$type<CountryLanguages>(),
    currencies: text("currencies", { mode: "json" }).$type<CountryCurrencies>(),
    timezones: text("timezones", { mode: "json" }).$type<string[]>(),
    coordinates: text("coordinates", { mode: "json" }).$type<
      [number, number]
    >(), // [lat, lng]
    // Sync tracking
    lastSyncAt: integer("last_sync_at", { mode: "timestamp" }),
    deprecatedAt: integer("deprecated_at", { mode: "timestamp" }),
  },
  () => [check("country_name_check", sql`LENGTH(name) >= 2`)],
);

export const regions = sqliteTable(
  "regions",
  {
    name: text("name").notNull().unique(),
    code: text("code").primaryKey(), // e.g., "CAM" for Campania
    countryCode: text("country_code")
      .notNull()
      .references(() => countries.code),
    codesPath: text("codes_path").notNull(), // "/IT/15" - for joins and queries performance
    namesPath: text("names_path").notNull(), // "/Italia/Lazio" - for display and
    areaName: text("area_name").notNull(), // e.g., "North-West"
    nuts1Code: text("nuts1_code"), // European NUTS1 code
    nuts2Code: text("nuts2_code"), // European NUTS2 code
    // Sync tracking
    sourceId: text("source_id").notNull(), // "istat", etc.
    sourceVersion: text("source_version").notNull(),
    lastSyncAt: integer("last_sync_at", { mode: "timestamp" }),
    deprecatedAt: integer("deprecated_at", { mode: "timestamp" }),
  },
  (table) => [
    index("idx_regions_country").on(table.countryCode),
    index("idx_regions_country_code").on(table.countryCode, table.code),
    check("region_name_check", sql`LENGTH(name) >= 2`),
  ],
);

export const provinces = sqliteTable(
  "provinces",
  {
    name: text("name").notNull(),
    code: text("code").primaryKey(), // Provincial code (001, 002, etc.)
    regionCode: text("region_code")
      .notNull()
      .references(() => regions.code),
    codesPath: text("codes_path").notNull(), // "/IT/15/063"
    namesPath: text("names_path").notNull(), // "/Italia/Lazio/Roma"
    abbreviation: text("abbreviation"), // TO, MI, RM for Italy
    territorialType: text("territorial_type", {
      enum: ISTAT_TERRITORIAL_TYPE,
    }),
    nuts1Code: text("nuts1_code"), // European NUTS1 code
    nuts2Code: text("nuts2_code"), // European NUTS2 code
    nuts3Code: text("nuts3_code"), // European NUTS3 code
    // Sync tracking
    sourceId: text("source_id").notNull(),
    sourceVersion: text("source_version").notNull(),
    lastSyncAt: integer("last_sync_at", { mode: "timestamp" }),
    deprecatedAt: integer("deprecated_at", { mode: "timestamp" }),
  },
  (table) => [
    index("idx_provinces_region").on(table.regionCode),
    index("idx_provinces_region_code").on(table.regionCode, table.code),
    check("province_name_check", sql`LENGTH(name) >= 2`),
  ],
);

export const communes = sqliteTable(
  "communes",
  {
    name: text("name").notNull(),
    altName: text("alt_name"),
    code: text("code").primaryKey(), // ISTAT code, etc
    provinceCode: text("province_code")
      .notNull()
      .references(() => provinces.code),
    codesPath: text("codes_path").notNull(), // "/IT/15/063/015146"
    namesPath: text("names_path").notNull(), // "/Italia/Lazio/Roma/Ostia"
    isCapital: integer("is_capital", { mode: "boolean" })
      .notNull()
      .default(false),
    cadastralCode: text("cadastral_code"), // "codiceCatastale" from ISTAT
    nuts1Code: text("nuts1_code"), // European NUTS1 code
    nuts2Code: text("nuts2_code"), // European NUTS2 code
    nuts3Code: text("nuts3_code"), // "nuts3" from ISTAT
    // Sync tracking
    sourceId: text("source_id").notNull(),
    sourceVersion: text("source_version"),
    lastSyncAt: integer("last_sync_at", { mode: "timestamp" }),
    deprecatedAt: integer("deprecated_at", { mode: "timestamp" }),
  },
  (table) => [
    index("idx_communes_province").on(table.provinceCode),
    check("commune_name_check", sql`LENGTH(name) >= 2`),
  ],
);

export const pois = sqliteTable(
  "pois",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    type: text("type").notNull(), // museum, restaurant, landmark, etc.
    communeCode: text("commune_code")
      .notNull()
      .references(() => communes.code),
    codesPath: text("codes_path").notNull(), // "/IT/15/063/015146/123"
    namesPath: text("names_path").notNull(), // "/Italia/Lazio/Roma/Ostia/Piazza del Duomo"
    latitude: real("latitude"),
    longitude: real("longitude"),
    address: text("address"),
    metadata: text("metadata", { mode: "json" }).$type<POIMetadata>().notNull(),
  },
  (table) => [
    index("idx_pois_commune").on(table.communeCode),
    index("idx_pois_type").on(table.type),
    index("idx_pois_location").on(table.latitude, table.longitude),
    check("poi_name_check", sql`LENGTH(name) >= 2`),
  ],
);

// Relations

export const countriesRelations = relations(countries, ({ many }) => ({
  regions: many(regions),
}));

export const regionsRelations = relations(regions, ({ one, many }) => ({
  country: one(countries, {
    fields: [regions.countryCode],
    references: [countries.code],
  }),
  provinces: many(provinces),
}));

export const provincesRelations = relations(provinces, ({ one, many }) => ({
  region: one(regions, {
    fields: [provinces.regionCode],
    references: [regions.code],
  }),
  communes: many(communes),
}));

export const communesRelations = relations(communes, ({ one, many }) => ({
  province: one(provinces, {
    fields: [communes.provinceCode],
    references: [provinces.code],
  }),
  pois: many(pois),
}));

export const poisRelations = relations(pois, ({ one }) => ({
  commune: one(communes, {
    fields: [pois.communeCode],
    references: [communes.code],
  }),
}));
