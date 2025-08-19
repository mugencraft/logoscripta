import { createFileRoute } from "@tanstack/react-router";

import { trpcBase } from "@/interfaces/server-client";

import { RouteErrorComponent } from "@/ui/components/extra/errors";

import { TagCategoriesView } from "../../../views/tagging/TagCategoriesView";

export const Route = createFileRoute("/tagging/categories/")({
  loader: async () => await trpcBase.tagging.categories.getAll.query(),
  component: TagCategoriesView,
  errorComponent: RouteErrorComponent,
});
