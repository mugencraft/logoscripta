import { createFileRoute } from "@tanstack/react-router";

import { trpcBase } from "@/interfaces/server-client";

import { RouteErrorComponent } from "@/ui/components/extra/errors";

import { TagsView } from "../../../views/tagging/TagsView";

export const Route = createFileRoute("/tagging/tags/")({
  loader: async () => await trpcBase.tagging.tags.getAll.query(),
  component: TagsView,
  errorComponent: RouteErrorComponent,
});
