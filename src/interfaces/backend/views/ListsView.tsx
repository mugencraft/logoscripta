import type { ListExtended } from "@/interfaces/server-client";
import { ViewContainer } from "@/ui/components/layout/ViewContainer";
import { DataTable } from "@/ui/components/table/DataTable";
import { useEffect, useMemo, useState } from "react";
import { createExportActions } from "../actions/export";
import { createListsActions } from "../actions/lists";
import { listsConfig } from "../config/columns/lists";
import { useDataTable } from "../hooks/useDataTable";
import { useListActions } from "../hooks/useListActions";
import { Route } from "../routes/lists";

export function ListsView() {
	const lists = Route.useLoaderData() as ListExtended[];
	const data = useMemo(() => lists || [], [lists]);

	const [isLoading, setIsLoading] = useState(true);

	const { handleDeleteList, handleSyncRepositoryData } = useListActions();
	const listsActions = useMemo(() => {
		return createListsActions({
			handleSyncRepositoryData,
			handleDeleteList,
		});
	}, [handleSyncRepositoryData, handleDeleteList]);

	const exportActions = useMemo(() => {
		return createExportActions<ListExtended>({
			fileName: "lists",
		});
	}, []);

	const viewActions = useMemo(
		() => [
			...listsActions.filter((a) => a.contexts?.includes("view")),
			...exportActions.filter((a) => a.contexts?.includes("view")),
		],
		[listsActions, exportActions],
	);

	const memoizedConfig = useMemo(() => {
		return {
			...listsConfig,
			selection: {
				...listsConfig.selection,
				actions: [
					...listsActions.filter((a) => a.contexts?.includes("selection")),
					...exportActions.filter((a) => a.contexts?.includes("selection")),
				],
			},
		};
	}, [listsActions, exportActions]);

	const dataTable = useDataTable<ListExtended>({
		data,
		tableId: "lists-table",
		config: memoizedConfig,
	});

	useEffect(() => {
		if (lists) {
			setIsLoading(false);
		}
	}, [lists]);

	return (
		<ViewContainer
			title="All Lists"
			description="Manage your custom and system lists"
			actions={viewActions}
		>
			{isLoading ? "Loading..." : <DataTable {...dataTable} />}
		</ViewContainer>
	);
}
