import { listsConfig } from "@/interfaces/backend/config/columns/lists";
import { useDataTable } from "@/interfaces/backend/hooks/useDataTable";
import { useListActions } from "@/interfaces/backend/hooks/useListActions";
import { Route } from "@/interfaces/backend/routes/lists";
import type { List } from "@/interfaces/server-client";
import { ViewContainer } from "@/ui/components/layout/ViewContainer";
import { DataTable } from "@/ui/components/table/DataTable";
import { Link } from "@tanstack/react-router";
import { BookUp, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export function ListsView() {
	const { handleDeleteList, handleSyncRepositoryData } = useListActions();

	const lists = Route.useLoaderData();

	const [isLoading, setIsLoading] = useState(true);

	const data = useMemo(() => lists || [], [lists]);

	const viewActions = [
		{
			element: <Link to="/lists/new">Create New List</Link>,
			label: "new-list",
		},
	];

	const memoizedConfig = useMemo(() => {
		return {
			...listsConfig,
			selection: {
				...listsConfig.selection,
				actions: [
					...listsConfig.selection.actions,
					{
						label: "Delete Selected",
						icon: X,
						onClick: (selectedElements) => {
							for (const list of selectedElements) {
								if (list.readOnly) {
									toast.error("Cannot delete read-only list");
									continue;
								}
								handleDeleteList(list.id);
							}
						},
					},
					{
						label: "Sync Repository Data",
						icon: BookUp,
						onClick: (selectedElements) => {
							handleSyncRepositoryData({
								listIds: selectedElements.map((row) => row.id),
							});
						},
					},
				],
			},
		};
	}, [handleDeleteList, handleSyncRepositoryData]);

	const dataTable = useDataTable<List, List>({
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
