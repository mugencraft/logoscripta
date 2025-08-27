import { RestCountriesAdapter } from "../adapters/geo/countries";
import { EurostatAdapter } from "../adapters/geo/euro";
import { ISTATAdapter } from "../adapters/geo/istat";
import type { AdministrativeDataAdapter } from "../adapters/geo/types";

/**
 * Factory for creating appropriate adapter instances.
 * Centralizes adapter configuration and dependencies.
 */
export const createAdapter = (
  type: "countries" | "eurostat" | "istat",
  basePath: string,
): AdministrativeDataAdapter => {
  switch (type) {
    case "countries":
      return new RestCountriesAdapter(basePath);
    case "eurostat":
      return new EurostatAdapter(basePath);
    case "istat":
      return new ISTATAdapter(basePath);
    default:
      throw new Error(`Unknown adapter type: ${type}`);
  }
};
