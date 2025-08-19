import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/tagging/categories/$categoryId")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/tagging/categories/$categoryId"!</div>;
}
