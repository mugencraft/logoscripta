import type { TaxonomySystem } from "@/domain/models/taxonomy/system";

import { ViewContainer } from "@/ui/components/layout/ViewContainer";
import { DataTable } from "@/ui/components/table/DataTable";

import { getSystemsActions } from "../../actions/taxonomy/buttons/system";
import { Route } from "../../routes/taxonomy/index";
import { getTaxonomySystemsTable } from "../../tables/columns/taxonomy/systems";
import { useDataTable } from "../../tables/useDataTable";

export function TaxonomyView() {
  const { systems } = Route.useLoaderData();

  const actions = getSystemsActions();

  const dataTable = useDataTable<TaxonomySystem, TaxonomySystem>({
    data: systems,
    config: getTaxonomySystemsTable(actions),
    tableId: "taxonomy-systems-table",
  });

  return (
    <ViewContainer
      title="Taxonomy Systems"
      description="Manage hierarchical taxonomy systems"
      actions={actions}
    >
      <DataTable {...dataTable} />
    </ViewContainer>
  );
}
