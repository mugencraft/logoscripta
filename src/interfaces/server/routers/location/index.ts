import { router } from "../../trpc";
import { locationCommunesRouter } from "./communes";
import { locationCountriesRouter } from "./countries";
import { locationImportExportRouter } from "./import-export";
import { locationPOIsRouter } from "./pois";
import { locationProvincesRouter } from "./provinces";
import { locationRegionsRouter } from "./regions";

export const locationRouter = router({
  countries: locationCountriesRouter,
  regions: locationRegionsRouter,
  provinces: locationProvincesRouter,
  communes: locationCommunesRouter,
  pois: locationPOIsRouter,
  importExport: locationImportExportRouter,
});
