import { createRootRoute } from "@tanstack/react-router";

import { RootErrorComponent } from "@/ui/components/extra/errors";

import RootLayout from "../layouts/RootLayout";

export const Route = createRootRoute({
  component: RootLayout,
  errorComponent: RootErrorComponent,
});
