import { RouteErrorComponent } from "@/ui/components/extra/errors";
import { createFileRoute } from "@tanstack/react-router";
import { ListViewNew } from "../../views/ListViewNew";

export const Route = createFileRoute("/lists/new")({
	component: ListViewNew,
	errorComponent: RouteErrorComponent,
});
