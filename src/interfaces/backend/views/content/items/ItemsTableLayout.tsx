import { useMemo } from "react";

import type { ContentItem } from "@/domain/models/content/item";
import type { ContentItemWithStats } from "@/domain/models/content/types";

import type { ActionConfig } from "@/ui/components/actions/types";
import { DataTable } from "@/ui/components/table/DataTable";

import { getItemsTable } from "../../../tables/columns/content/items";
import { useDataTable } from "../../../tables/useDataTable";

interface ItemsTableLayoutProps {
  items: ContentItemWithStats[];
  actions: ActionConfig<ContentItem>[];
  linkToCollection?: boolean;
}

export function ItemsTableLayout({
  items,
  actions,
  linkToCollection,
}: ItemsTableLayoutProps) {
  const memoizedConfig = useMemo(() => {
    return getItemsTable({
      actions,
      items,
      linkToCollection,
    });
  }, [actions, items, linkToCollection]);

  const dataTable = useDataTable<ContentItem, ContentItemWithStats>({
    data: items,
    tableId: "items-table",
    config: memoizedConfig,
  });

  return <DataTable {...dataTable} />;
}
