import type {
	List,
	ListItemExtended,
	RepositoryExtended,
} from "@/interfaces/server-client";
import type { ActionConfig } from "@/ui/components/actions/types";
import { RefreshCw } from "lucide-react";
import type { SyncRepositoryDataOptions } from "../hooks/useListActions";

export const createBaseActions = <
	TData extends RepositoryExtended | List | ListItemExtended,
>(handlers: {
	handleSyncRepositoryData: (
		options: SyncRepositoryDataOptions,
	) => Promise<void>;
}) => {
	const actions: ActionConfig<TData>[] = [
		{
			id: "sync-data",
			label: "Sync Repository Data",
			icon: RefreshCw,
			contexts: ["view", "selection"],
			handler: ({ data, selected }) => {
				const options: SyncRepositoryDataOptions = {};

				// Handle ListExtended entities
				if (data && !("fullName" in data)) options.listIds = [data.id];

				if (selected && selected.length > 0) {
					const fullNames = selected
						.map((item) => ("fullName" in item ? item.fullName : undefined))
						.filter(Boolean) as string[];

					if (fullNames.length > 0) {
						options.fullNames = fullNames;
					}
				}

				return handlers.handleSyncRepositoryData(options);
			},
		},
	];

	return actions;
};
