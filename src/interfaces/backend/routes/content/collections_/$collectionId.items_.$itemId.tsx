import { createFileRoute } from "@tanstack/react-router";

import { trpcBase } from "@/interfaces/server-client";

import { RouteErrorComponent } from "@/ui/components/extra/errors";

import { ItemDetailView } from "../../../views/content/items/ItemDetailView";

export const Route = createFileRoute(
  "/content/collections_/$collectionId/items_/$itemId",
)({
  loader: async ({ params }) => {
    const collection = await trpcBase.content.collections.get.query(
      Number.parseInt(params.collectionId, 10),
    );
    const item = collection.items.find(
      (item) => item.id === Number.parseInt(params.itemId, 10),
    );
    if (!item) throw new Error(`Item not found: ${params.itemId}`);

    const tagSystems = await trpcBase.tagging.systems.getAll.query();

    return {
      collection,
      item,
      itemIds: collection.items.map((item) => item.id),
      linkToCollection: true,
      tagSystems,
    };
  },
  component: () => <ItemDetailView {...Route.useLoaderData()} />,
  errorComponent: RouteErrorComponent,
});
