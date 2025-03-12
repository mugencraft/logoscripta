import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/ui/components/core/card";
import {
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

export interface DashboardStats {
	repositories: number;
	customLists: number;
	owners: number;
	topics: number;
}

export interface LanguageStats {
	language: string;
	count: number;
	percentage: number;
}

export interface ActivityDataPoint {
	date: string;
	updates: number;
}

export interface DashboardData {
	stats: DashboardStats;
	languages: LanguageStats[];
	activity: ActivityDataPoint[];
}

interface ActivityChartProps {
	activity: DashboardData["activity"];
}

export const ActivityChart = ({ activity }: ActivityChartProps) => (
	<Card>
		<CardHeader>
			<CardTitle>Repository Activity</CardTitle>
		</CardHeader>
		<CardContent>
			<div className="h-[200px]">
				<ResponsiveContainer width="100%" height="100%">
					<LineChart data={activity}>
						<XAxis
							dataKey="date"
							stroke="#888888"
							fontSize={12}
							tickLine={false}
							axisLine={false}
						/>
						<YAxis
							stroke="#888888"
							fontSize={12}
							tickLine={false}
							axisLine={false}
							tickFormatter={(value) => `${value}`}
						/>
						<Tooltip />
						<Line
							type="monotone"
							dataKey="updates"
							stroke="#8884d8"
							strokeWidth={2}
							dot={false}
						/>
					</LineChart>
				</ResponsiveContainer>
			</div>
		</CardContent>
	</Card>
);
