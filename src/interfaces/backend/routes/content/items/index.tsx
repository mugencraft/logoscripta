import { createFileRoute } from "@tanstack/react-router";

import { trpcBase } from "@/interfaces/server-client";

import { RouteErrorComponent } from "@/ui/components/extra/errors";

import { ItemsView } from "../../../views/content/items/ItemsView";

export const Route = createFileRoute("/content/items/")({
  loader: async () => await trpcBase.content.items.getAll.query(),
  component: () => <ItemsView items={Route.useLoaderData()} />,
  errorComponent: RouteErrorComponent,
});
