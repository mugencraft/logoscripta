import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode, useState } from "react";
import "@smastrom/react-rating/style.css";

import { TRPC_URL, trpc } from "@/interfaces/server-client";
import { createTRPCLinks } from "@/interfaces/trpc-links";

import { TooltipProvider } from "@/ui/components/core/tooltip";
import { Toaster } from "@/ui/components/extra/toaster";
import { ThemeProvider } from "@/ui/theme/ThemeProvider";
import "@/ui/theme/globals.css";

import { routeTree } from "./routeTree.gen";

// Set up a Router instance
const router = createRouter({
  routeTree,
  defaultPreload: "intent",
});

// Register things for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export function App() {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: createTRPCLinks(TRPC_URL),
    }),
  );
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <StrictMode>
          <ThemeProvider defaultTheme="light" storageKey="app-theme">
            <TooltipProvider>
              <RouterProvider router={router} />
              <Toaster />
            </TooltipProvider>
          </ThemeProvider>
        </StrictMode>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
