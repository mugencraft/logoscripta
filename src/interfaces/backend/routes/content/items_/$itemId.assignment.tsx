import { createFileRoute } from "@tanstack/react-router";

import { trpcBase } from "@/interfaces/server-client";

import { TaxonomyTopicAssignmentView } from "../../../views/content/items/TaxonomyTopicAssignmentView";

export const Route = createFileRoute("/content/items_/$itemId/assignment")({
  loader: async ({ params }) => {
    const itemId = Number(params.itemId);

    const [contentItem, systems] = await Promise.all([
      trpcBase.content.items.getWithRelations.query(itemId),
      trpcBase.taxonomy.systems.getAll.query(),
    ]);

    if (!contentItem) {
      throw new Error(`Content item not found: ${itemId}`);
    }

    return {
      contentItem,
      systems,
    };
  },
  component: TaxonomyTopicAssignmentView,
});
