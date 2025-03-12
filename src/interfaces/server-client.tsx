import type { ArchivedListItemMetadata } from "@/domain/value-objects/metadata/archived";
import type { ListItemMetadata } from "@/domain/value-objects/metadata/base";
import type {
	ObsidianPluginMetadata,
	ObsidianThemeMetadata,
} from "@/domain/value-objects/metadata/obsidian";
import type { appRouter } from "@/interfaces/server/routers";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import type { inferRouterOutputs } from "@trpc/server";

type AppRouter = typeof appRouter;

export const TRPC_URL = "http://localhost:3000";

// React hooks client
export const trpc = createTRPCReact<AppRouter>();

// Vanilla client for non-React contexts (like loaders)
export const trpcBase = createTRPCClient<AppRouter>({
	links: [
		httpBatchLink({
			url: TRPC_URL,
		}),
	],
});

// Type inference helpers
// type ReactQueryOptions = inferReactQueryProcedureOptions<AppRouter>;
// type RouterInputs = inferRouterInputs<AppRouter>;
type RouterOutputs = inferRouterOutputs<AppRouter>;

export type Repository = RouterOutputs["repository"]["getAll"][0];
export type List = RouterOutputs["list"]["getById"];
export type ListItem = RouterOutputs["list"]["getItems"][0];
export type Owner = RouterOutputs["repository"]["getAllOwners"][0];
export type Topic = RouterOutputs["repository"]["getAllTopics"][0];

export interface ListItemExtended extends ListItem {
	metadata: ListItemMetadata;
	repository: Repository;
	list: List;
}

export interface ListExtended extends List {
	items: ListItemExtended[];
}

export interface ListItemArchived extends ListItemExtended {
	metadata: ArchivedListItemMetadata;
}

export interface ListItemObsidianPlugin extends ListItemExtended {
	metadata: ObsidianPluginMetadata;
}

export interface ListItemObsidianTheme extends ListItemExtended {
	metadata: ObsidianThemeMetadata;
}

export interface RepositoryExtended extends Repository {
	owner: Owner;
	repositoryListItems: ListItemExtended[];
}
