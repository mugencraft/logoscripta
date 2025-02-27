import RootLayout from "@/interfaces/backend/layouts/RootLayout";
import { RootErrorComponent } from "@/ui/components/extra/errors";
import { createRootRoute } from "@tanstack/react-router";

export const Route = createRootRoute({
	component: RootLayout,
	errorComponent: RootErrorComponent,
});
