import { useEffect, useState } from "react";

import type { Commune } from "@/domain/models/location/commune";
import type { CommuneWithStats } from "@/domain/models/location/types";

import { ViewContainer } from "@/ui/components/layout/ViewContainer";
import { DataTable } from "@/ui/components/table/DataTable";

import { Route } from "../../routes/location/communes";
import { getCommunesTable } from "../../tables/columns/location/communes";
import { useDataTable } from "../../tables/useDataTable";

export function CommunesView() {
  const data = Route.useLoaderData() || [];
  const [isLoading, setIsLoading] = useState(true);
  const { provinceCode } = Route.useSearch();

  const dataTable = useDataTable<Commune, CommuneWithStats>({
    data,
    config: getCommunesTable([]),
    tableId: "communes-table",
  });

  useEffect(() => {
    if (data) {
      setIsLoading(false);
    }
  }, [data]);

  const getViewContext = () => {
    if (provinceCode) {
      return {
        title: "Communes in Selected Province",
        description:
          "Municipal communes with POI statistics for selected province",
      };
    }
    return {
      title: "Communes",
      description: "Municipal communes with points of interest statistics",
    };
  };

  const viewContext = getViewContext();

  return (
    <ViewContainer
      title={viewContext.title}
      description={viewContext.description}
    >
      {isLoading ? "Loading..." : <DataTable {...dataTable} />}
    </ViewContainer>
  );
}
