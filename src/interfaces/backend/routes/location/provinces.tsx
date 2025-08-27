import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";

import { provinceRoutesSchema } from "@/domain/validation/location/province";
import { trpcBase } from "@/interfaces/server-client";

import { ProvincesView } from "../../views/location/ProvincesView";

export const Route = createFileRoute("/location/provinces")({
  validateSearch: zodValidator(provinceRoutesSchema.search),
  loaderDeps: ({ search: { countryCode, regionCode } }) => ({
    regionCode,
    countryCode,
  }),
  loader: async ({ deps: { countryCode, regionCode } }) => {
    return await trpcBase.location.provinces.getAllWithStats.query({
      regionCode,
      countryCode,
    });
  },
  component: ProvincesView,
});
