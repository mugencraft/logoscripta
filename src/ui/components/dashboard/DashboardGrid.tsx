import { ActivityChart, type DashboardData } from "./ActivityChart";
import { LanguageChart } from "./LanguageChart";
import { StatCard } from "./StatCard";

interface DashboardGridProps {
	data: DashboardData;
}

export const DashboardGrid = ({ data }: DashboardGridProps) => (
	<div className="space-y-8">
		{/* Summary Stats */}
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
			<StatCard title="Total Repositories" value={data.stats.repositories} />
			<StatCard title="Custom Lists" value={data.stats.customLists} />
			<StatCard title="Repository Owners" value={data.stats.owners} />
			<StatCard title="Topics" value={data.stats.topics} />
		</div>

		{/* Charts Row */}
		<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
			<LanguageChart languages={data.languages} />
			<ActivityChart activity={data.activity} />
		</div>
	</div>
);
