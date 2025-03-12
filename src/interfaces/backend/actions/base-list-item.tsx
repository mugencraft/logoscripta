import type { ListItemExtended } from "@/interfaces/server-client";
import type { ActionConfig } from "@/ui/components/actions/types";
import { FileEdit } from "lucide-react";
import { MetadataEditor } from "../components/metadata-editor/MetadataEditor";

export const createBaseListItemActions = <TData extends ListItemExtended>() => {
	const actions: ActionConfig<TData>[] = [
		{
			id: "edit-metadata",
			label: "Edit Metadata",
			icon: FileEdit,
			contexts: ["row", "selection"],
			dialog: {
				title: "Edit Repository Metadata",
				content: ({ data, selected, onSuccess }) => {
					const listId = data?.listId || selected?.[0]?.listId;
					if (!listId) return null;
					return (
						<MetadataEditor
							row={data}
							selected={selected}
							listId={listId}
							onSuccess={onSuccess}
						/>
					);
				},
			},
		},
	];

	return actions;
};
