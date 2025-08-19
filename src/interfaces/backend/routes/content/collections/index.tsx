import { createFileRoute } from "@tanstack/react-router";

import { trpcBase } from "@/interfaces/server-client";

import { RouteErrorComponent } from "@/ui/components/extra/errors";

import { CollectionsView } from "../../../views/content/collections/CollectionsView";

export const Route = createFileRoute("/content/collections/")({
  loader: async () => await trpcBase.content.collections.getAll.query(),
  component: CollectionsView,
  errorComponent: RouteErrorComponent,
});
