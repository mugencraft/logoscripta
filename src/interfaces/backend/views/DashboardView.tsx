import { useDashboardData } from "@/interfaces/backend/hooks/useDashboardData";
import { DashboardGrid } from "@/ui/components/dashboard/DashboardGrid";
import { ViewContainer } from "@/ui/components/layout/ViewContainer";

export function DashboardView() {
	const { data, isLoading } = useDashboardData();

	if (isLoading) {
		return (
			<ViewContainer title="Dashboard">
				<div>Loading...</div>
			</ViewContainer>
		);
	}

	return (
		<ViewContainer
			title="Dashboard"
			description="Overview of your repository collections"
		>
			<DashboardGrid data={data} />
		</ViewContainer>
	);
}
