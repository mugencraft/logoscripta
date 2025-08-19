import { useEffect, useState } from "react";

import type { TagCategory } from "@/domain/models/tagging/category";
import type { TagCategoryWithStats } from "@/domain/models/tagging/types";

import { ViewContainer } from "@/ui/components/layout/ViewContainer";
import { DataTable } from "@/ui/components/table/DataTable";

import { getTagCategoriesActions } from "../../actions/tagging/buttons/categories";
import { Route } from "../../routes/tagging/categories";
import { getTagCategoriesTable } from "../../tables/columns/tagging/categories";
import { useDataTable } from "../../tables/useDataTable";

export function TagCategoriesView() {
  const data = Route.useLoaderData() || [];
  const [isLoading, setIsLoading] = useState(true);

  const actions = getTagCategoriesActions();

  const dataTable = useDataTable<TagCategory, TagCategoryWithStats>({
    data,
    config: getTagCategoriesTable(actions),
    tableId: "categories-table",
  });

  useEffect(() => {
    if (data) {
      setIsLoading(false);
    }
  }, [data]);

  return (
    <ViewContainer
      title={"Tag Categories"}
      description="Manage tag categories within this group"
      actions={actions}
      selected={data}
    >
      {isLoading ? "Loading..." : <DataTable {...dataTable} />}
    </ViewContainer>
  );
}
