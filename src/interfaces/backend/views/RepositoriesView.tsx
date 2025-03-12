import type { RepositoryExtended } from "@/interfaces/server-client";
import { ViewContainer } from "@/ui/components/layout/ViewContainer";
import { DataTable } from "@/ui/components/table/DataTable";
import { useEffect, useMemo, useState } from "react";
import { createExportActions } from "../actions/export";
import { createRepositoryActions } from "../actions/repository";
import { repositoryConfig } from "../config/columns/repository";
import { useDataTable } from "../hooks/useDataTable";
import { useListActions } from "../hooks/useListActions";
import { Route } from "../routes/repos";

export const RepositoriesView = () => {
	const repositories = Route.useLoaderData() as RepositoryExtended[];
	const data = useMemo(() => repositories || [], [repositories]);

	const [isLoading, setIsLoading] = useState(true);

	const { handleSyncRepositoryData, handleSaveRepository } = useListActions();
	const repositoryActions = useMemo(() => {
		return createRepositoryActions({
			handleSyncRepositoryData,
			handleSaveRepository,
		});
	}, [handleSyncRepositoryData, handleSaveRepository]);

	const exportActions = useMemo(() => {
		return createExportActions<RepositoryExtended>({
			fileName: "lists",
		});
	}, []);

	const viewActions = useMemo(
		() => [
			...repositoryActions.filter((a) => a.contexts?.includes("view")),
			...exportActions.filter((a) => a.contexts?.includes("view")),
		],
		[repositoryActions, exportActions],
	);

	const memoizedConfig = useMemo(() => {
		return {
			...repositoryConfig,
			selection: {
				...repositoryConfig.selection,
				actions: [
					...repositoryActions.filter((a) => a.contexts?.includes("selection")),
					...exportActions.filter((a) => a.contexts?.includes("selection")),
				],
			},
		};
	}, [repositoryActions, exportActions]);

	const dataTable = useDataTable<RepositoryExtended>({
		data,
		tableId: "repositories",
		config: memoizedConfig,
	});

	useEffect(() => {
		if (repositories) {
			setIsLoading(false);
		}
	}, [repositories]);

	return (
		<ViewContainer
			title="All Repositories"
			description="View and manage all tracked repositories"
			actions={viewActions}
		>
			{isLoading ? "Loading..." : <DataTable {...dataTable} />}
		</ViewContainer>
	);
};
