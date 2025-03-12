import type {
	ListItemExtended,
	RepositoryExtended,
} from "@/interfaces/server-client";
import type { ActionConfig } from "@/ui/components/actions/types";
import { BookmarkMinus, BookmarkPlus } from "lucide-react";
import { ToggleList } from "../components/toggle-list/ToggleList";

export const createBaseListActions = <
	TData extends RepositoryExtended | ListItemExtended,
>() => {
	const actions: ActionConfig<TData>[] = [
		{
			id: "add-to-lists",
			label: "Add to Lists",
			icon: BookmarkPlus,
			contexts: ["selection"],
			dialog: {
				title: "Add to List",
				content: (props) => <ToggleList {...props} mode="add" />,
			},
		},
		{
			id: "remove-from-lists",
			label: "Remove from Lists",
			icon: BookmarkMinus,
			variant: "destructive",
			contexts: ["selection"],
			dialog: {
				title: "Remove from List",
				content: (props) => <ToggleList {...props} mode="remove" />,
			},
		},
	];

	return actions;
};
