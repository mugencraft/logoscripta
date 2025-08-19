import { createFileRoute } from "@tanstack/react-router";

import { trpcBase } from "@/interfaces/server-client";

import { RouteErrorComponent } from "@/ui/components/extra/errors";

import { OwnersView } from "../../views/github/OwnersView";

export const Route = createFileRoute("/github/owners")({
  loader: async () =>
    await trpcBase.repository.getAllOwnersWithRepositories.query(),
  component: OwnersView,
  errorComponent: RouteErrorComponent,
});
