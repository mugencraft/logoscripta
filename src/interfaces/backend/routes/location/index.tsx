import { createFileRoute } from "@tanstack/react-router";

import { LocationsView } from "../../views/location/LocationsView";

export const Route = createFileRoute("/location/")({
  component: LocationsView,
});
