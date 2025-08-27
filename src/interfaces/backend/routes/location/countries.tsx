import { createFileRoute } from "@tanstack/react-router";

import { trpcBase } from "@/interfaces/server-client";

import { CountriesView } from "../../views/location/CountriesView";

export const Route = createFileRoute("/location/countries")({
  loader: async () => {
    return await trpcBase.location.countries.getAll.query();
  },
  component: CountriesView,
});
