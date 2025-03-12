import type { SystemListType } from "@/domain/models/repository-list";
import type {
	ListItemArchived,
	ListItemExtended,
	ListItemObsidianPlugin,
	ListItemObsidianTheme,
} from "@/interfaces/server-client";
import type { TableConfiguration } from "@/ui/components/table/types";
import { listItemsConfig } from "../config/columns/list-item";
import { archivedConfig } from "../config/columns/list-item-archived";
import { obsidianPluginConfig } from "../config/columns/list-item-obsidian-plugin";
import { obsidianThemeConfig } from "../config/columns/list-item-obsidian-theme";

export type AnyListItem =
	| ListItemExtended
	| ListItemArchived
	| ListItemObsidianPlugin
	| ListItemObsidianTheme;

export function useListTableConfig(
	type: SystemListType | number,
): TableConfiguration<AnyListItem> {
	// Handle system lists with specialized configurations
	if (typeof type === "string") {
		const systemConfigs = {
			"obsidian-plugin": obsidianPluginConfig,
			"obsidian-theme": obsidianThemeConfig,
			archived: archivedConfig,
		};

		const config = systemConfigs[type];
		if (!config) {
			throw new Error(`Unknown system list type: ${type}`);
		}

		return config as unknown as TableConfiguration<AnyListItem>;
	}

	return listItemsConfig;
}
