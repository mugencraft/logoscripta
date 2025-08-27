import { createFileRoute } from "@tanstack/react-router";

import { trpcBase } from "@/interfaces/server-client";

import { CountryDetailView } from "../../views/location/CountryDetailView";

export const Route = createFileRoute("/location/countries/$countryCode")({
  loader: async ({ params }) => {
    return await trpcBase.location.countries.get.query(params.countryCode);
  },
  component: CountryDetailView,
});
