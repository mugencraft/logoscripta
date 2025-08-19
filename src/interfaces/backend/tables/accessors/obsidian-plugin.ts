import type {
  RepositoryExtended,
  RepositoryListItemObsidianPlugin,
  RepositoryListItemWithList,
} from "@/domain/models/github/types";

const getPluginItem = (items: RepositoryListItemWithList[] | null) => {
  if (!items) return undefined;
  return items.find(
    (item) =>
      item.metadata.system?.systemType === "obsidian-plugin" ||
      item.list?.sourceType === "obsidian-plugin",
  ) as RepositoryListItemObsidianPlugin | undefined;
};

export const getPluginStats = (row: RepositoryExtended) => {
  const pluginItem = getPluginItem(row.repositoryListItems);
  return pluginItem?.metadata.stats;
};

export const getPluginInfo = (row: RepositoryExtended) => {
  const pluginItem = getPluginItem(row.repositoryListItems);
  return pluginItem?.metadata.plugin;
};
