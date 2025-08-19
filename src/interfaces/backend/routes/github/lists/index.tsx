import { createFileRoute } from "@tanstack/react-router";

import { trpcBase } from "@/interfaces/server-client";

import { RouteErrorComponent } from "@/ui/components/extra/errors";

import { ListsView } from "../../../views/github/ListsView";

export const Route = createFileRoute("/github/lists/")({
  loader: async () => await trpcBase.list.findAllWithItems.query(),
  component: ListsView,
  errorComponent: RouteErrorComponent,
});
