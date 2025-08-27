import { useEffect, useState } from "react";

import type { Region } from "@/domain/models/location/region";
import type { RegionWithStats } from "@/domain/models/location/types";

import { ViewContainer } from "@/ui/components/layout/ViewContainer";
import { DataTable } from "@/ui/components/table/DataTable";

import { Route } from "../../routes/location/regions";
import { getRegionsTable } from "../../tables/columns/location/regions";
import { useDataTable } from "../../tables/useDataTable";

export function RegionsView() {
  const data = Route.useLoaderData() || [];
  const [isLoading, setIsLoading] = useState(true);

  const dataTable = useDataTable<Region, RegionWithStats>({
    data,
    config: getRegionsTable([]),
    tableId: "regions-table",
  });

  useEffect(() => {
    if (data) {
      setIsLoading(false);
    }
  }, [data]);

  return (
    <ViewContainer
      title="Regions"
      description="Administrative regions with statistics on provinces, communes, and POIs"
    >
      {isLoading ? "Loading..." : <DataTable {...dataTable} />}
    </ViewContainer>
  );
}
