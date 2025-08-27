import { useEffect, useState } from "react";

import type { POI } from "@/domain/models/location/poi";
import type { POIWithLocation } from "@/domain/models/location/types";

import { Badge } from "@/ui/components/core/badge";
import { ViewContainer } from "@/ui/components/layout/ViewContainer";
import { DataTable } from "@/ui/components/table/DataTable";

import { getPOIActions } from "../../actions/location/buttons/pois";
import { Route } from "../../routes/location/pois";
import { getPOIsTable } from "../../tables/columns/location/pois";
import { useDataTable } from "../../tables/useDataTable";

export function POIsView() {
  const data = Route.useLoaderData() || [];
  const [isLoading, setIsLoading] = useState(true);
  const { communeCode } = Route.useSearch();

  const actions = getPOIActions();

  const dataTable = useDataTable<POI, POIWithLocation>({
    data,
    config: getPOIsTable(actions),
    tableId: "pois-table",
  });

  useEffect(() => {
    if (data) {
      setIsLoading(false);
    }
  }, [data]);

  // Hierarchical context resolution for filtered views
  const resolveViewContext = () => {
    if (!communeCode || data.length === 0) {
      return {
        title: "Points of Interest",
        description:
          "Manage and explore points of interest across all locations",
        hierarchyPath: null,
      };
    }

    const firstPOI = data[0];

    // TODO: check this
    if (!firstPOI)
      return {
        title: "Points of Interest",
        description:
          "Manage and explore points of interest across all locations",
        hierarchyPath: null,
      };

    const hierarchyPath = firstPOI.codesPath.split("/").slice(1).join(" › ");

    return {
      title: `POIs in ${firstPOI.communeName}`,
      description: `Points of interest in ${firstPOI.communeName}`,
      hierarchyPath,
    };
  };

  const viewContext = resolveViewContext();

  return (
    <ViewContainer
      title={viewContext.title}
      description={viewContext.description}
      actions={actions}
      selected={data}
    >
      {viewContext.hierarchyPath && (
        <div className="mb-4">
          <Badge variant="outline" className="text-xs">
            {viewContext.hierarchyPath}
          </Badge>
        </div>
      )}
      {isLoading ? "Loading..." : <DataTable {...dataTable} />}
    </ViewContainer>
  );
}
