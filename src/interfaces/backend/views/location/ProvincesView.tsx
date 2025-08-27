import { useEffect, useState } from "react";

import type { Province } from "@/domain/models/location/province";
import type { ProvinceWithStats } from "@/domain/models/location/types";

import { Badge } from "@/ui/components/core/badge";
import { ViewContainer } from "@/ui/components/layout/ViewContainer";
import { DataTable } from "@/ui/components/table/DataTable";

import { Route } from "../../routes/location/provinces";
import { getProvincesTable } from "../../tables/columns/location/provinces";
import { useDataTable } from "../../tables/useDataTable";

export function ProvincesView() {
  const data = Route.useLoaderData() || [];
  const [isLoading, setIsLoading] = useState(true);
  const { regionCode } = Route.useSearch();

  const dataTable = useDataTable<Province, ProvinceWithStats>({
    data,
    config: getProvincesTable([]),
    tableId: "provinces-table",
  });

  useEffect(() => {
    if (data) {
      setIsLoading(false);
    }
  }, [data]);

  const getViewMeta = () => {
    if (regionCode) {
      const regionName = data[0]?.regionName || "Selected Region";
      return {
        title: `Provinces in ${regionName}`,
        description: `Administrative provinces with commune and POI statistics for ${regionName}`,
      };
    }
    return {
      title: "Provinces",
      description:
        "Administrative provinces with statistics on communes and POIs",
    };
  };

  const viewMeta = getViewMeta();

  return (
    <ViewContainer title={viewMeta.title} description={viewMeta.description}>
      {regionCode && (
        <div className="mb-4">
          <Badge variant="outline">Filtered by Region ID: {regionCode}</Badge>
        </div>
      )}
      {isLoading ? "Loading..." : <DataTable {...dataTable} />}
    </ViewContainer>
  );
}
