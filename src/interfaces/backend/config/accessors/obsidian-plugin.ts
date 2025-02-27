// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const getPluginItem = (items: any[]) => {
	return items.find(
		(item) =>
			item.metadata?.system?.systemType === "obsidian-plugin" ||
			item.list?.sourceType === "obsidian-plugin",
	);
};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const getPluginStats = (row: any) => {
	const pluginItem = getPluginItem(row.repositoryListItems);
	return pluginItem?.metadata?.stats;
};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const getPluginInfo = (row: any) => {
	const pluginItem = getPluginItem(row.repositoryListItems);
	return pluginItem?.metadata?.plugin;
};
