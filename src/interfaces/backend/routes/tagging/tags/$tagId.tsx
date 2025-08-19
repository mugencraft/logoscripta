import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/tagging/tags/$tagId")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/tagging/tags/$tagId"!</div>;
}
