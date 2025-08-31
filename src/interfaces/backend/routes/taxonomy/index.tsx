import { createFileRoute } from "@tanstack/react-router";

import { trpcBase } from "@/interfaces/server-client";

import { TaxonomyView } from "../../views/taxonomy/TaxonomyView";

export const Route = createFileRoute("/taxonomy/")({
  loader: async () => {
    const systems = await trpcBase.taxonomy.systems.getAll.query();
    return { systems };
  },
  component: TaxonomyView,
});
