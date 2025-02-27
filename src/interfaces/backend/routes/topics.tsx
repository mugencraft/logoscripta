import { TopicsView } from "@/interfaces/backend/views/TopicsView";
import { trpcBase } from "@/interfaces/server-client";
import { RouteErrorComponent } from "@/ui/components/extra/errors";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/topics")({
	loader: async () => await trpcBase.repository.getAllTopics.query(),
	component: TopicsView,
	errorComponent: RouteErrorComponent,
});
