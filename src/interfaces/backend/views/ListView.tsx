import type { SystemListType } from "@/domain/models/repository-list";
import type { ListItemExtended } from "@/interfaces/server-client";
import { ViewContainer } from "@/ui/components/layout/ViewContainer";
import { DataTable } from "@/ui/components/table/DataTable";
import { useEffect, useMemo, useState } from "react";
import { createExportActions } from "../actions/export";
import { createListActions } from "../actions/list";
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

	const data = useMemo(() => (items as AnyListItem[]) || [], [items]);

	const listActions = useMemo(() => {
		const actions = createListActions({
			handleSyncRepositoryData,
			handleRemoveFromList,
			handleDeleteList,
		});

		// Filter actions based on edit permissions
		return actions.filter((action) => {
			if (!canEdit && action.id !== "sync-data") return false;
			return true;
		});
	}, [
		canEdit,
		handleDeleteList,
		handleRemoveFromList,
		handleSyncRepositoryData,
	]);

	const exportActions = useMemo(() => {
		return createExportActions<ListItemExtended>({
			fileName: `list_${list.id}_${list.name.replace(/\s+/g, "_")}`,
		});
	}, [list.id, list.name]);

	const viewActions = useMemo(() => {
		return [
			...listActions.filter((a) => a.contexts?.includes("view")),
			...exportActions.filter((a) => a.contexts?.includes("view")),
		];
	}, [listActions, exportActions]);

	// Update table config with row/selection actions
	const memoizedConfig = useMemo(() => {
		const config = { ...listConfig };

		// Set selection actions
		config.selection = {
			...config.selection,
			actions: [
				...listActions.filter((a) => a.contexts?.includes("selection")),
				...exportActions.filter((a) => a.contexts?.includes("selection")),
			],
		};

		return config;
	}, [listConfig, listActions, exportActions]);

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
			data={{ list }}
		>
			{isLoading ? "Loading..." : <DataTable {...dataTable} />}
		</ViewContainer>
	);
}
