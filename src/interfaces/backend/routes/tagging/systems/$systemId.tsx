import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/tagging/systems/$systemId")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/tagging/systems/$systemId"!</div>;
}
