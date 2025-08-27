import { useEffect, useState } from "react";

import type { Country } from "@/domain/models/location/country";

import { ViewContainer } from "@/ui/components/layout/ViewContainer";
import { DataTable } from "@/ui/components/table/DataTable";

import { Route } from "../../routes/location/countries";
import { getCountriesTable } from "../../tables/columns/location/countries";
import { useDataTable } from "../../tables/useDataTable";

export function CountriesView() {
  const data = Route.useLoaderData() || [];
  const [isLoading, setIsLoading] = useState(true);

  const dataTable = useDataTable<Country>({
    data,
    config: getCountriesTable([]),
    tableId: "countries-table",
  });

  useEffect(() => {
    if (data) {
      setIsLoading(false);
    }
  }, [data]);

  return (
    <ViewContainer
      title="Countries"
      description="Browse countries with administrative data from official sources"
    >
      {isLoading ? "Loading..." : <DataTable {...dataTable} />}
    </ViewContainer>
  );
}
