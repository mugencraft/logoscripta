import type { ListItemExtended } from "@/interfaces/server-client";
import type { ActionConfig } from "@/ui/components/actions/types";
import { BookPlus, Pencil, Trash, X } from "lucide-react";
import { toast } from "sonner";
import { AddRepositories } from "../components/AddRepositories";
import { ListEditForm } from "../components/ListEditForm";
import type { SyncRepositoryDataOptions } from "../hooks/useListActions";
import { createBaseActions } from "./base";
import { createBaseListActions } from "./base-list";
import { createBaseListItemActions } from "./base-list-item";

export const createListActions = (handlers: {
	handleSyncRepositoryData: (
		options: SyncRepositoryDataOptions,
	) => Promise<void>;
	handleRemoveFromList: (listId: number, fullNames: string[]) => Promise<void>;
	handleDeleteList: (listId: number) => Promise<void>;
}) => {
	const { handleRemoveFromList, handleDeleteList } = handlers;

	const baseActions = createBaseActions<ListItemExtended>(handlers);
	const listBaseActions = createBaseListActions<ListItemExtended>();
	const listItemBaseActions = createBaseListItemActions<ListItemExtended>();

	const listItemActions: ActionConfig<ListItemExtended>[] = [
		{
			id: "edit-list",
			label: "Edit",
			icon: Pencil,
			contexts: ["view"],
			dialog: {
				title: "Edit List Details",
				content: ({ data, onSuccess, onCancel }) =>
					data && (
						<ListEditForm
							listId={data.list.id}
							initialName={data.list.name}
							initialDescription={data.list.description || ""}
							onSuccess={onSuccess}
							onCancel={onCancel}
						/>
					),
			},
		},
		{
			id: "delete-list",
			label: "Delete",
			icon: Trash,
			variant: "destructive",
			contexts: ["view"],
			handler: ({ data }) => {
				if (data?.list.readOnly) {
					toast.error("Cannot delete read-only list");
					return;
				}
				return data && handleDeleteList(data.list.id);
			},
		},
		{
			id: "add-repositories",
			label: "Add",
			icon: BookPlus,
			contexts: ["view"],
			dialog: {
				title: "Add Repositories to List",
				content: ({ data, onSuccess, onCancel }) =>
					data && (
						<AddRepositories
							listId={data.list.id}
							onSuccess={onSuccess}
							onCancel={onCancel}
						/>
					),
			},
		},
		{
			id: "remove-from-list",
			label: "Remove Selected",
			icon: X,
			variant: "destructive",
			contexts: ["selection"],
			handler: ({ data, selected }) => {
				if (!selected || selected.length === 0 || !data) return;
				return handleRemoveFromList(
					data.list.id,
					selected.map((item) => item.fullName),
				);
			},
		},
	];

	return [
		...baseActions,
		...listBaseActions,
		...listItemBaseActions,
		...listItemActions,
	];
};
