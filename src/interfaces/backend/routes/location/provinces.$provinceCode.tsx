import { createFileRoute } from "@tanstack/react-router";

import { trpcBase } from "@/interfaces/server-client";

import { ProvinceDetailView } from "../../views/location/ProvinceDetailView";

export const Route = createFileRoute("/location/provinces/$provinceCode")({
  loader: async ({ params: { provinceCode } }) => {
    return await trpcBase.location.provinces.get.query(provinceCode);
  },
  component: ProvinceDetailView,
});
