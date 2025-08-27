import { createFileRoute } from "@tanstack/react-router";

import { trpcBase } from "@/interfaces/server-client";

import { POIDetailView } from "../../views/location/POIDetailView";

export const Route = createFileRoute("/location/pois/$poiId")({
  loader: async ({ params }) => {
    const poiId = Number(params.poiId);
    return await trpcBase.location.pois.get.query(poiId);
  },
  component: POIDetailView,
});
