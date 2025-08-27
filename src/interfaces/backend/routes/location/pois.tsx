import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";

import { poiRoutesSchema } from "@/domain/validation/location/poi";
import { trpcBase } from "@/interfaces/server-client";

import { POIsView } from "../../views/location/POIsView";

export const Route = createFileRoute("/location/pois")({
  validateSearch: zodValidator(poiRoutesSchema.getAll),
  loaderDeps: ({
    search: { communeCode, countryCode, provinceCode, regionCode },
  }) => ({
    communeCode,
    countryCode,
    provinceCode,
    regionCode,
  }),
  loader: async ({
    deps: { communeCode, countryCode, regionCode, provinceCode },
  }) => {
    return await trpcBase.location.pois.getAll.query({
      communeCode,
      provinceCode,
      regionCode,
      countryCode,
    });
  },
  component: POIsView,
});
