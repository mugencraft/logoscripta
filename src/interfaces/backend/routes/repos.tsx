import { trpcBase } from "@/interfaces/server-client";
import { RouteErrorComponent } from "@/ui/components/extra/errors";
import { createFileRoute } from "@tanstack/react-router";
import { RepositoriesView } from "../views/RepositoriesView";

export const Route = createFileRoute("/repos")({
	loader: async () => await trpcBase.repository.getAll.query(),
	component: RepositoriesView,
	errorComponent: RouteErrorComponent,
});
