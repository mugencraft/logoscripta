import { trpc } from "@/interfaces/server-client";
import type {
	ActivityDataPoint,
	DashboardData,
	DashboardStats,
	LanguageStats,
} from "@/ui/components/dashboard/ActivityChart";
import { format } from "date-fns";

export function useDashboardData(): {
	data: DashboardData;
	isLoading: boolean;
} {
	const { data: repositories = [], isLoading: loadingRepos } =
		trpc.repository.getAll.useQuery();
	const { data: lists = [], isLoading: loadingLists } =
		trpc.list.getAll.useQuery();
	const { data: owners = [], isLoading: loadingOwners } =
		trpc.repository.getAllOwners.useQuery();
	const { data: topics = [], isLoading: loadingTopics } =
		trpc.repository.getAllTopics.useQuery();

	const isLoading =
		loadingRepos || loadingLists || loadingOwners || loadingTopics;

	const stats: DashboardStats = {
		repositories: repositories.length,
		customLists: lists.filter((l) => !l.sourceType).length,
		owners: owners.length,
		topics: topics.length,
	};

	// Process language statistics
	const languageCount = repositories.reduce(
		(acc, repo) => {
			if (repo.language) {
				acc[repo.language] = (acc[repo.language] || 0) + 1;
			}
			return acc;
		},
		{} as Record<string, number>,
	);

	const languages: LanguageStats[] = Object.entries(languageCount)
		.map(([language, count]) => ({
			language,
			count,
			percentage: (count / repositories.length) * 100,
		}))
		.sort((a, b) => b.count - a.count)
		.slice(0, 5);

	// Process activity data
	const activity: ActivityDataPoint[] = repositories
		.sort(
			(a, b) =>
				new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
		)
		.map((repo) => ({
			date: format(new Date(repo.updatedAt), "MMM d"),
			updates: 1,
		}));

	return {
		data: { stats, languages, activity },
		isLoading,
	};
}
