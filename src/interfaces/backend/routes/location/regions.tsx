import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";

import { regionRoutesSchema } from "@/domain/validation/location/region";
import { trpcBase } from "@/interfaces/server-client";

import { RegionsView } from "../../views/location/RegionsView";

export const Route = createFileRoute("/location/regions")({
  validateSearch: zodValidator(regionRoutesSchema.search),
  loaderDeps: ({ search: { countryCode } }) => ({
    countryCode,
  }),
  loader: async ({ deps: { countryCode } }) => {
    return await trpcBase.location.regions.getAllWithStats.query({
      countryCode,
    });
  },
  component: RegionsView,
});
