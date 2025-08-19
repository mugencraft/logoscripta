import { createFileRoute } from "@tanstack/react-router";

import { RouteErrorComponent } from "@/ui/components/extra/errors";

import { TaggingView } from "../../views/tagging/TaggingView";

export const Route = createFileRoute("/tagging/")({
  component: TaggingView,
  errorComponent: RouteErrorComponent,
});
