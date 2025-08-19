import { createFileRoute } from "@tanstack/react-router";

import { trpcBase } from "@/interfaces/server-client";

import { RouteErrorComponent } from "@/ui/components/extra/errors";

import { RepositoriesView } from "../../views/github/RepositoriesView";

export const Route = createFileRoute("/github/repos")({
  loader: async () => await trpcBase.repository.getAll.query(),
  component: RepositoriesView,
  errorComponent: RouteErrorComponent,
});
