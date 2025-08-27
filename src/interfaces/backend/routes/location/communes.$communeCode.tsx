import { createFileRoute } from "@tanstack/react-router";

import { trpcBase } from "@/interfaces/server-client";

import { CommuneDetailView } from "../../views/location/CommuneDetailView";

export const Route = createFileRoute("/location/communes/$communeCode")({
  loader: async ({ params: { communeCode } }) => {
    return await trpcBase.location.communes.get.query(communeCode);
  },
  component: CommuneDetailView,
});
