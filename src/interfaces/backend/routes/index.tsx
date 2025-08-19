import { createFileRoute } from "@tanstack/react-router";

import { RouteErrorComponent } from "@/ui/components/extra/errors";

import { DashboardView } from "../views/dashboard/DashboardView";

export const Route = createFileRoute("/")({
  component: DashboardView,
  errorComponent: RouteErrorComponent,
});
