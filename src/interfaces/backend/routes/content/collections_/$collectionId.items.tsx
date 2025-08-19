import { createFileRoute } from "@tanstack/react-router";

import { trpcBase } from "@/interfaces/server-client";

import { RouteErrorComponent } from "@/ui/components/extra/errors";

import { ItemsView } from "../../../views/content/items/ItemsView";

export const Route = createFileRoute(
  "/content/collections_/$collectionId/items",
)({
  loader: async ({ params }) => {
    const collection = await trpcBase.content.collections.get.query(
      Number.parseInt(params.collectionId, 10),
    );
    return { linkToCollection: true, items: collection.items };
  },
  component: () => <ItemsView {...Route.useLoaderData()} />,
  errorComponent: RouteErrorComponent,
});
