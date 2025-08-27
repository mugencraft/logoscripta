import { createFileRoute } from "@tanstack/react-router";

import { trpcBase } from "@/interfaces/server-client";

import { RegionDetailView } from "../../views/location/RegionDetailView";

export const Route = createFileRoute("/location/regions/$regionCode")({
  loader: async ({ params: { regionCode } }) => {
    const [region, statistics] = await Promise.all([
      trpcBase.location.regions.get.query(regionCode),
      trpcBase.location.regions.getStatistics.query(regionCode),
    ]);
    return { region, statistics };
  },
  component: RegionDetailView,
});
