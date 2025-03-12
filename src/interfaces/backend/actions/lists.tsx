import type { ListExtended } from "@/interfaces/server-client";
import type { ActionConfig } from "@/ui/components/actions/types";
import { Link } from "@tanstack/react-router";
import { CirclePlus, Trash } from "lucide-react";
import type { SyncRepositoryDataOptions } from "../hooks/useListActions";
import { createBaseActions } from "./base";

export const createListsActions = (handlers: {
	handleSyncRepositoryData: (
		options: SyncRepositoryDataOptions,
	) => Promise<void>;
	handleDeleteList: (listId: number) => Promise<void>;
}) => {
	const baseActions = createBaseActions<ListExtended>(handlers);

	const listsActions: ActionConfig<ListExtended>[] = [
		{
			id: "delete-list",
			label: "Delete List",
			icon: Trash,
			variant: "destructive",
			contexts: ["view"],
			handler: ({ data }) => {
				return data && handlers.handleDeleteList(data.id);
			},
		},
		{
			id: "create-list",
			label: "new-list",
			icon: CirclePlus,
			contexts: ["view"],
			element: <Link to="/lists/new">Create New List</Link>,
		},
	];

	return [...baseActions, ...listsActions];
};
