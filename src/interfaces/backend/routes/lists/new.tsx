import { ListViewNew } from "@/interfaces/backend/views/ListViewNew";
import { RouteErrorComponent } from "@/ui/components/extra/errors";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/lists/new")({
	component: ListViewNew,
	errorComponent: RouteErrorComponent,
});
