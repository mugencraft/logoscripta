import { createFileRoute } from "@tanstack/react-router";

import { trpcBase } from "@/interfaces/server-client";

import { RouteErrorComponent } from "@/ui/components/extra/errors";

import { CollectionAnalysisView } from "../../../views/content/collections/CollectionAnalysisView";

export const Route = createFileRoute(
  "/content/collections_/$collectionId/analysis",
)({
  loader: async ({ params }) => {
    const collectionId = Number.parseInt(params.collectionId, 10);
    return {
      collection: await trpcBase.content.collections.get.query(collectionId),
      analysis:
        await trpcBase.content.collections.getAnalysis.query(collectionId),
    };
  },
  component: CollectionAnalysisView,
  errorComponent: RouteErrorComponent,
});
