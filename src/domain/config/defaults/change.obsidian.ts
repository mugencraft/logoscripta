import type { ChangeDetectorConfig } from "@/core/changes/types";

export const OBSIDIAN_ENTITY_TYPES = {
	PLUGIN: "obsidian-plugin",
	THEME: "obsidian-theme",
} as const;

/**
 * Change detection configuration for Obsidian plugins
 */
export const obsidianPluginConfig: ChangeDetectorConfig = {
	/** Field used as unique identifier */
	idField: "repo",
	/** Fields that trigger full updates */
	trackedFields: ["name", "author", "description", "repo"],
	/** Fields that trigger state updates */
	updateFields: ["name", "author", "description", "repo"],
	/** Fields that trigger soft updates */
	softUpdateFields: [],
};

/**
 * Change detection configuration for Obsidian themes
 */
export const obsidianThemeConfig: ChangeDetectorConfig = {
	/** Field used as unique identifier */
	idField: "repo",
	/** Fields that trigger full updates */
	trackedFields: ["name", "author", "repo", "modes"],
	/** Fields that trigger state updates */
	updateFields: ["name", "author", "repo", "modes"],
	/** Fields that trigger soft updates */
	softUpdateFields: [],
};
