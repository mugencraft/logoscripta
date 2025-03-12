import { RouteErrorComponent } from "@/ui/components/extra/errors";
import { createFileRoute } from "@tanstack/react-router";
import { DashboardView } from "../views/DashboardView";

export const Route = createFileRoute("/")({
	component: DashboardView,
	errorComponent: RouteErrorComponent,
});
