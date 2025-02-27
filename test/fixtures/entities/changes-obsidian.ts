import type { Change, ChangeType } from "@/core/changes/types";
import type { ObsidianPlugin, ObsidianTheme } from "@/shared/obsidian/types";
import {
	sampleObsidianPlugin,
	sampleObsidianPluginNew,
	sampleObsidianTheme,
	sampleObsidianThemeNew,
} from "../api-responses/obsidian";

// Plugin

export const sampleObsidianPluginChange: Change<ObsidianPlugin> = {
	id: "test/obsidian-plugin-repo",
	timestamp: "2024-01-01T00:00:00Z",
	type: "full",
	entityType: "obsidian-plugin",
	data: sampleObsidianPlugin,
};

export const sampleObsidianPluginChangeNew: Change<ObsidianPlugin> = {
	...sampleObsidianPluginChange,
	id: "test/obsidian-plugin-repo-new",
	data: sampleObsidianPluginNew,
};

export const sampleObsidianPluginChangeSoft = {
	...sampleObsidianPluginChange,
	type: "soft" as ChangeType,
};

// Theme

export const sampleObsidianThemeChange: Change<ObsidianTheme> = {
	id: "test/obsidian-theme-repo",
	timestamp: "2024-01-01T00:00:00Z",
	type: "full",
	entityType: "obsidian-theme",
	data: sampleObsidianTheme,
};

export const sampleObsidianThemeChangeNew: Change<ObsidianTheme> = {
	id: "test/new-theme-repo",
	timestamp: "2024-01-01T00:00:00Z",
	type: "full",
	entityType: "obsidian-theme",
	data: sampleObsidianThemeNew,
};

export const sampleObsidianThemeChangeSoft = {
	...sampleObsidianThemeChange,
	type: "soft" as ChangeType,
};
