import type { Country, NewCountry } from "@/domain/models/location/country";

import type { Commune, NewCommune } from "../../models/location/commune";
import type { NewPOI, POI } from "../../models/location/poi";
import type { NewProvince, Province } from "../../models/location/province";
import type { NewRegion, Region } from "../../models/location/region";

export interface LocationCommandsPort {
  // Country
  createCountry(data: NewCountry): Promise<Country>;
  updateCountry(code: string, data: Partial<Country>): Promise<Country>;
  deleteCountry(code: string): Promise<void>;

  // Region
  createRegion(data: NewRegion): Promise<Region>;
  updateRegion(code: string, data: Partial<Region>): Promise<Region>;
  deleteRegion(code: string): Promise<void>;

  // Province
  createProvince(data: NewProvince): Promise<Province>;
  updateProvince(code: string, data: Partial<Province>): Promise<Province>;
  deleteProvince(code: string): Promise<void>;

  // Commune
  createCommune(data: NewCommune): Promise<Commune>;
  updateCommune(code: string, data: Partial<Commune>): Promise<Commune>;
  deleteCommune(code: string): Promise<void>;

  // POI
  createPOI(data: NewPOI): Promise<POI>;
  updatePOI(id: number, data: Partial<POI>): Promise<POI>;
  deletePOI(id: number): Promise<void>;

  // Bulk
  bulkSyncRegions(regions: NewRegion[]): Promise<void>;
  bulkSyncProvinces(provinces: NewProvince[]): Promise<void>;
  bulkSyncCommunes(communes: NewCommune[]): Promise<void>;
  bulkCreatePOIs(pois: NewPOI[]): Promise<POI[]>;
}
