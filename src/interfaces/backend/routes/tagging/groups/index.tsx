import { createFileRoute } from "@tanstack/react-router";

import { trpcBase } from "@/interfaces/server-client";

import { RouteErrorComponent } from "@/ui/components/extra/errors";

import { TagGroupsView } from "../../../views/tagging/TagGroupsView";

export const Route = createFileRoute("/tagging/groups/")({
  loader: async () => await trpcBase.tagging.groups.getAll.query(),
  component: TagGroupsView,
  errorComponent: RouteErrorComponent,
});
