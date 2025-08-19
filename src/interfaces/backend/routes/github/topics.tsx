import { createFileRoute } from "@tanstack/react-router";

import { trpcBase } from "@/interfaces/server-client";

import { RouteErrorComponent } from "@/ui/components/extra/errors";

import { TopicsView } from "../../views/github/TopicsView";

export const Route = createFileRoute("/github/topics")({
  loader: async () => await trpcBase.repository.getAllTopicsWithCount.query(),
  component: TopicsView,
  errorComponent: RouteErrorComponent,
});
