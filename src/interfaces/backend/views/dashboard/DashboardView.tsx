import { DashboardGrid } from "@/ui/components/dashboard/DashboardGrid";
import { ViewContainer } from "@/ui/components/layout/ViewContainer";

import { useDashboardData } from "./useDashboardData";

export function DashboardView() {
  const { data, isLoading } = useDashboardData();

  return (
    <ViewContainer
      title="Dashboard"
      description="Overview of your repository collections"
    >
      {isLoading ? "Loading..." : <DashboardGrid data={data} />}
    </ViewContainer>
  );
}
