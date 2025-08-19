import { createHTTPServer } from "@trpc/server/adapters/standalone";
import cors from "cors";

import { ConsoleLogger } from "@/core/logging/logger";

import { createContext } from "./context";
import { appRouter } from "./routers";

const logger = ConsoleLogger.getInstance();

const server = createHTTPServer({
  router: appRouter,
  createContext,
  middleware: cors(),
  responseMeta({ type }) {
    if (type === "subscription") {
      return {
        headers: {
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          "Content-Type": "text/event-stream",
        },
      };
    }
    return {};
  },
});

const port = process.env.PORT || 3000;

server.listen(port, () => {
  logger.warn(`🚀 Server running on http://localhost:${port}`);
});
