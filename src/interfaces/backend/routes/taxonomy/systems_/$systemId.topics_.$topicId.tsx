import { createFileRoute } from "@tanstack/react-router";

import { trpcBase } from "@/interfaces/server-client";

import { TopicDetailView } from "../../../views/taxonomy/TopicDetailView";

export const Route = createFileRoute(
  "/taxonomy/systems_/$systemId/topics_/$topicId",
)({
  loader: async ({ params }) => {
    const systemId = Number(params.systemId);
    const topicId = Number(params.topicId);

    console.log("systemId", systemId);
    console.log("topicId", topicId);

    const [system, topic, path] = await Promise.all([
      trpcBase.taxonomy.systems.getById.query(systemId),
      trpcBase.taxonomy.topics.getWithHierarchy.query(topicId),
      trpcBase.taxonomy.topics.getPath.query(topicId),
    ]);

    if (!system || !topic) {
      throw new Error(`Topic ${topicId} or system ${systemId} not found`);
    }

    return { system, topic, path };
  },
  component: TopicDetailView,
});
