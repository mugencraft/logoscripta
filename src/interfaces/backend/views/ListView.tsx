import type { SystemListType } from "@/domain/models/repository-list";
import { DialogStyled } from "@/ui/components/extra/dialog-styled";
import { ViewContainer } from "@/ui/components/layout/ViewContainer";
import { AddRepositoriesDialog } from "@/ui/components/lists/AddRepositoriesDialog";
import { DataTable } from "@/ui/components/table/DataTable";
import { BookPlus, Pencil, RefreshCw, Trash, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ListEditForm } from "../forms/ListEditForm";
import { useDataTable } from "../hooks/useDataTable";
import { useListActions } from "../hooks/useListActions";
import {
	type AnyListItem,
	useListTableConfig,
} from "../hooks/useListTableConfig";
import { Route } from "../routes/lists/$id";

export function ListView() {
	const { handleSyncRepositoryData, handleRemoveFromList, handleDeleteList } =
		useListActions();

	const { list, items } = Route.useLoaderData();

	const canEdit = !list.readOnly;
	const tableId = `list-${list.id}`;

	const listConfig = useListTableConfig(
		list.readOnly ? (list.sourceType as SystemListType) : list.id,
	);

	const [isLoading, setIsLoading] = useState(true);
	const [isEditing, setIsEditing] = useState(false);
	const [isAdding, setIsAdding] = useState(false);

	const data = useMemo(() => (items as AnyListItem[]) || [], [items]);

	const viewActions = useMemo(() => {
		const baseAction = [
			{
				label: "Sync Repository Data",
				icon: RefreshCw,
				onClick: () => {
					handleSyncRepositoryData({ listIds: [list.id] });
				},
			},
		];

		if (!canEdit) {
			return baseAction;
		}

		return [
			...baseAction,
			{
				label: "Edit List Details",
				icon: Pencil,
				onClick: () => {
					setIsEditing(true);
				},
			},
			{
				label: "Delete List",
				icon: Trash,
				onClick: () => {
					handleDeleteList(list.id);
				},
			},
			{
				label: "Add Repositories",
				icon: BookPlus,
				onClick: () => {
					// Open dialog to add repositories
					setIsAdding(true);
				},
			},
		];
	}, [handleDeleteList, handleSyncRepositoryData, list.id, canEdit]);

	const memoizedConfig = useMemo(() => {
		const config = { ...listConfig };

		// Create a new actions array instead of pushing to the existing one
		const actions = [...config.selection.actions];

		// Add sync action
		actions.push({
			label: "Sync Repository Data",
			icon: RefreshCw,
			onClick: async (selectedIds) => {
				handleSyncRepositoryData({
					listIds: [list.id],
					fullNames: selectedIds,
				});
			},
		});

		// Add remove action if editable
		if (canEdit) {
			actions.push({
				label: "Remove Selected",
				icon: X,
				onClick: async (selectedIds) => {
					handleRemoveFromList(list.id, selectedIds);
				},
			});
		}

		return {
			...config,
			selection: {
				...config.selection,
				actions,
			},
		};
	}, [
		handleSyncRepositoryData,
		handleRemoveFromList,
		listConfig,
		list.id,
		canEdit,
	]);

	const dataTable = useDataTable({
		data,
		config: memoizedConfig,
		tableId,
	});

	useEffect(() => {
		if (items) {
			setIsLoading(false);
		}
	}, [items]);

	return (
		<ViewContainer
			title={list.name}
			description={list.description || ""}
			actions={viewActions}
		>
			{isLoading ? "Loading..." : <DataTable {...dataTable} />}

			{/* Edit Dialog */}
			{canEdit && (
				<DialogStyled
					open={isEditing}
					onOpenChange={setIsEditing}
					title="Edit List Details"
				>
					<ListEditForm
						listId={list.id}
						initialName={list.name}
						initialDescription={list.description || ""}
						onSuccess={() => setIsEditing(false)}
						onCancel={() => setIsEditing(false)}
					/>
				</DialogStyled>
			)}
			{canEdit && (
				<DialogStyled
					open={isAdding}
					onOpenChange={setIsAdding}
					title="Add Repositories to List"
				>
					<AddRepositoriesDialog
						listId={list.id}
						onSuccess={() => setIsAdding(false)}
						onCancel={() => setIsAdding(false)}
					/>
				</DialogStyled>
			)}
		</ViewContainer>
	);
}
