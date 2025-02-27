import { repositoryConfig } from "@/interfaces/backend/config/columns/repository";
import { useDataTable } from "@/interfaces/backend/hooks/useDataTable";
import { useListActions } from "@/interfaces/backend/hooks/useListActions";
import { Route } from "@/interfaces/backend/routes/repos";
import type { Repository } from "@/interfaces/server-client";
import { ViewContainer } from "@/ui/components/layout/ViewContainer";
import { DataTable } from "@/ui/components/table/DataTable";
import { Link, RefreshCcwDot, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export const RepositoriesView = () => {
	const { handleSyncRepositoryData, handleSaveRepository } = useListActions();

	const repositories = Route.useLoaderData();

	const [isLoading, setIsLoading] = useState(true);

	const data = useMemo(() => repositories || [], [repositories]);

	const memoizedConfig = useMemo(() => {
		return {
			...repositoryConfig,
			selection: {
				...repositoryConfig.selection,
				actions: [
					...repositoryConfig.selection.actions,
					{
						label: "Sync Repository Data",
						icon: Link,
						onClick: (fullNames) => {
							handleSyncRepositoryData({ fullNames });
						},
					},
					{
						label: "Refresh Repository Data",
						icon: RefreshCw,
						onClick: async (fullNames) => {
							for (const fullName of fullNames) {
								await handleSaveRepository(fullName);
							}
						},
					},
				],
			},
		};
	}, [handleSyncRepositoryData, handleSaveRepository]);

	const dataTable = useDataTable<Repository, string>({
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
		>
			{isLoading ? "Loading..." : <DataTable {...dataTable} />}
		</ViewContainer>
	);
};
