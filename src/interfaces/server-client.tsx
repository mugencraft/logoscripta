import { createTRPCClient } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";

import type { appRouter } from "@/interfaces/server/routers";
import { createTRPCLinks } from "@/interfaces/trpc-links";

type AppRouter = typeof appRouter;

export const TRPC_URL = "http://localhost:3000";

// React hooks client
export const trpc = createTRPCReact<AppRouter>();

// Vanilla client for non-React contexts (like loaders)
export const trpcBase = createTRPCClient<AppRouter>({
  links: createTRPCLinks(TRPC_URL),
});
