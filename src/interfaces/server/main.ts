import { ConsoleLogger } from "@/core/logging/logger";
import { createHTTPServer } from "@trpc/server/adapters/standalone";
import cors from "cors";
import { createContext } from "./context";
import { appRouter } from "./routers";

const logger = ConsoleLogger.getInstance();

const server = createHTTPServer({
	router: appRouter,
	createContext,
	middleware: cors(),
});

const port = process.env.PORT || 3000;

server.listen(port, () => {
	logger.warn(`🚀 Server running on http://localhost:${port}`);
});
