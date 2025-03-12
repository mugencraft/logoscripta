import { trpcBase } from "@/interfaces/server-client";
import { RouteErrorComponent } from "@/ui/components/extra/errors";
import { createFileRoute } from "@tanstack/react-router";
import { OwnersView } from "../views/OwnersView";

export const Route = createFileRoute("/owners")({
	loader: async () => await trpcBase.repository.getAllOwners.query(),
	component: OwnersView,
	errorComponent: RouteErrorComponent,
});
