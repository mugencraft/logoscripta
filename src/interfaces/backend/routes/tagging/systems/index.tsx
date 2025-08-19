import { createFileRoute } from "@tanstack/react-router";

import { trpcBase } from "@/interfaces/server-client";

import { RouteErrorComponent } from "@/ui/components/extra/errors";

import { TagSystemsView } from "../../../views/tagging/TagSystemsView";

export const Route = createFileRoute("/tagging/systems/")({
  loader: async () => await trpcBase.tagging.systems.getAll.query(),
  component: TagSystemsView,
  errorComponent: RouteErrorComponent,
});
