import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";

import { communeRoutesSchema } from "@/domain/validation/location/commune";
import { trpcBase } from "@/interfaces/server-client";

import { CommunesView } from "../../views/location/CommunesView";

export const Route = createFileRoute("/location/communes")({
  validateSearch: zodValidator(communeRoutesSchema.search),
  loaderDeps: ({ search: { countryCode, provinceCode, regionCode } }) => ({
    countryCode,
    provinceCode,
    regionCode,
  }),
  loader: async ({ deps: { countryCode, provinceCode, regionCode } }) => {
    return await trpcBase.location.communes.getAllWithStats.query({
      provinceCode,
      regionCode,
      countryCode,
    });
  },
  component: CommunesView,
});
