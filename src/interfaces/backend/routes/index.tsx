import { DashboardView } from "@/interfaces/backend/views/DashboardView";
import { RouteErrorComponent } from "@/ui/components/extra/errors";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: DashboardView,
	errorComponent: RouteErrorComponent,
});
