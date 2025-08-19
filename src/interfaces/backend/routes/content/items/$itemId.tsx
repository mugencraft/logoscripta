import { createFileRoute } from "@tanstack/react-router";

import { trpcBase } from "@/interfaces/server-client";

import { RouteErrorComponent } from "@/ui/components/extra/errors";

import { ItemDetailView } from "../../../views/content/items/ItemDetailView";

export const Route = createFileRoute("/content/items/$itemId")({
  loader: async ({ params }) => {
    const item = await trpcBase.content.items.get.query(
      Number.parseInt(params.itemId, 10),
    );
    if (!item) throw new Error(`Item not found: ${params.itemId}`);

    const collection = await trpcBase.content.collections.get.query(
      item.collectionId,
    );

    // For standalone item, get all items for navigation
    const itemIds = await trpcBase.content.items.getNavigationIds.query();

    const tagSystems = await trpcBase.tagging.systems.getAll.query();
    return {
      item,
      itemIds,
      collection,
      tagSystems,
    };
  },
  component: () => <ItemDetailView {...Route.useLoaderData()} />,
  errorComponent: RouteErrorComponent,
});
