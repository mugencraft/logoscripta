import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/tagging/groups/$groupId")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/tagging/groups/$groupId"!</div>;
}
