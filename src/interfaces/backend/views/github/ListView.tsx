import { useEffect, useState } from "react";

import type { SystemListType } from "@/domain/models/github/types";

import type { ActionConfig } from "@/ui/components/actions/types";
import { ViewContainer } from "@/ui/components/layout/ViewContainer";
import { DataTable } from "@/ui/components/table/DataTable";
import type { TableConfiguration } from "@/ui/components/table/types";

import { getListActions } from "../../actions/github/buttons/list";
import { getListItemsActions } from "../../actions/github/buttons/list-items";
import { Route } from "../../routes/github/lists/$listId";
import { getListItemsTable } from "../../tables/columns/github/list-items";
import { getArchivedTable } from "../../tables/columns/github/list-items-archived";
import { getObsidianPluginTable } from "../../tables/columns/github/list-items-obsidian-plugin";
import { getObsidianThemeTable } from "../../tables/columns/github/list-items-obsidian-theme";
import { useDataTable } from "../../tables/useDataTable";

export function ListView() {
  const { list, items } = Route.useLoaderData();
  const [isLoading, setIsLoading] = useState(true);

  const isSystemList = list.readOnly;
  const canEdit = !isSystemList;

  const listActions = [
    // Filter actions based on edit permissions
    ...getListActions().filter(
      (action) => !(!canEdit && action.id !== "sync-data"),
    ),
  ];

  const listItemsActions = [
    ...getListItemsActions().filter(
      (action) => !(!canEdit && action.id !== "sync-data"),
    ),
  ];

  const dataTable = useDataTable({
    data: items || [],
    config: useListTableConfig(
      listItemsActions,
      isSystemList ? (list.sourceType as SystemListType) : list.id,
    ),
    tableId: `list-${list.id}`,
  });

  useEffect(() => {
    if (items) {
      setIsLoading(false);
    }
  }, [items]);

  return (
    <ViewContainer
      title={list.name}
      description={list.description || ""}
      actions={listActions}
      data={{ ...list, items }}
    >
      {isLoading ? "Loading..." : <DataTable {...dataTable} />}
    </ViewContainer>
  );
}

function useListTableConfig(
  // biome-ignore lint/suspicious/noExplicitAny: fix this
  actions: ActionConfig<any>[],
  type: SystemListType | number,
  // biome-ignore lint/suspicious/noExplicitAny: fix this
): TableConfiguration<any> {
  // Handle system lists with specialized configurations
  if (typeof type === "string") {
    const systemConfigs = {
      "obsidian-plugin": getObsidianPluginTable,
      "obsidian-theme": getObsidianThemeTable,
      archived: getArchivedTable,
    };

    const config = systemConfigs[type](actions);
    if (!config) {
      throw new Error(`Unknown system list type: ${type}`);
    }

    return config;
  }

  return getListItemsTable(actions);
}
