import { ListsView } from "@/interfaces/backend/views/ListsView";
import { trpcBase } from "@/interfaces/server-client";
import { RouteErrorComponent } from "@/ui/components/extra/errors";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/lists/")({
	loader: async () => await trpcBase.list.getAll.query(),
	component: ListsView,
	errorComponent: RouteErrorComponent,
});
