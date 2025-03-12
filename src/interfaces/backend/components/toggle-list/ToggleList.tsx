import {
	type ListItem,
	type Repository,
	trpc,
} from "@/interfaces/server-client";
import { Button } from "@/ui/components/core/button";
import type { InteractionProps } from "@/ui/components/table/types";
import { useState } from "react";
import { useListActions } from "../../hooks/useListActions";
import { ListSelection } from "./ListSelection";

export function ToggleList<T extends ListItem | Repository>({
	selected,
	onSuccess,
	onCancel,
	mode = "add",
}: InteractionProps<T> & {
	mode: "add" | "remove";
}) {
	const { data: lists = [] } = trpc.list.getAll.useQuery();
	const [selectedListId, setSelectedListId] = useState<number>();
	const { handleAddToList, handleCreateList, handleRemoveFromList } =
		useListActions({
			onSuccess,
		});

	if (!selected?.length) return null;

	const selectedIds = selected.map((item) => item.fullName);

	const handleAction = () => {
		if (!selectedListId) return;

		if (mode === "add") {
			return handleAddToList(selectedListId, selectedIds);
		}
		return handleRemoveFromList(selectedListId, selectedIds);
	};

	return (
		<div className="space-y-4 max-h-[90vh] flex flex-col">
			<div className="flex-1 min-h-0">
				<ListSelection
					lists={lists}
					selectedItems={selectedIds}
					selectedListId={selectedListId}
					onSelectList={setSelectedListId}
					onCreateList={
						mode === "add"
							? (name) => handleCreateList(name, "", selectedIds)
							: undefined
					}
					mode={mode}
				/>
			</div>
			<div className="flex justify-end gap-2">
				<Button
					variant="secondary"
					disabled={!selectedListId}
					onClick={handleAction}
				>
					{mode === "add" ? "Add to" : "Remove from"} Selected List
				</Button>
				<Button variant="outline" onClick={onCancel}>
					Cancel
				</Button>
			</div>
		</div>
	);
}
