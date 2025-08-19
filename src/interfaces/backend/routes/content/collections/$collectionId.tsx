import { createFileRoute } from "@tanstack/react-router";

import { trpcBase } from "@/interfaces/server-client";

import { RouteErrorComponent } from "@/ui/components/extra/errors";

import { CollectionDetailView } from "../../../views/content/collections/CollectionDetailView";

export const Route = createFileRoute("/content/collections/$collectionId")({
  loader: async ({ params }) =>
    await trpcBase.content.collections.get.query(
      Number.parseInt(params.collectionId, 10),
    ),

  component: CollectionDetailView,
  errorComponent: RouteErrorComponent,
});
