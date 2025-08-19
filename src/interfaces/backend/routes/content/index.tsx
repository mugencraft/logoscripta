import { createFileRoute } from "@tanstack/react-router";

import { ContentView } from "../../views/content/ContentView";

export const Route = createFileRoute("/content/")({
  component: ContentView,
});
