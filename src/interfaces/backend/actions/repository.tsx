import type { RepositoryExtended } from "@/interfaces/server-client";
import type { ActionConfig } from "@/ui/components/actions/types";
import { RefreshCw } from "lucide-react";
import type { SyncRepositoryDataOptions } from "../hooks/useListActions";
import { createBaseActions } from "./base";
import { createBaseListActions } from "./base-list";

export const createRepositoryActions = (handlers: {
	handleSyncRepositoryData: (
		options: SyncRepositoryDataOptions,
	) => Promise<void>;
	handleSaveRepository: (fullName: string) => Promise<void>;
}) => {
	const baseActions = createBaseActions<RepositoryExtended>(handlers);
	const listBaseActions = createBaseListActions<RepositoryExtended>();

	const repositoryActions: ActionConfig<RepositoryExtended>[] = [
		{
			id: "refresh",
			label: "Refresh Repository Data",
			icon: RefreshCw,
			contexts: ["selection"],
			handler: async ({ selected }) => {
				for (const repository of selected || []) {
					await handlers.handleSaveRepository(repository.fullName);
				}
			},
		},
	];

	return [...baseActions, ...listBaseActions, ...repositoryActions];
};
