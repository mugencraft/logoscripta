import { createFileRoute } from "@tanstack/react-router";

import { trpcBase } from "@/interfaces/server-client";

import { TopicsView } from "../../../views/taxonomy/TopicsView";

export const Route = createFileRoute("/taxonomy/systems/$systemId")({
  loader: async ({ params }) => {
    const systemId = Number.parseInt(params.systemId, 10);
    const [system, hierarchies, statistics] = await Promise.all([
      trpcBase.taxonomy.systems.getById.query(systemId),
      trpcBase.taxonomy.topics.getHierarchy.query(systemId),
      trpcBase.taxonomy.systems.getStatistics.query(systemId),
    ]);

    return { system, hierarchies, statistics };
  },
  component: TopicsView,
});
