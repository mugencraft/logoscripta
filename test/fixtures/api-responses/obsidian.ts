import type {
	ObsidianPlugin,
	ObsidianPluginRemoved,
	ObsidianPluginsStats,
	ObsidianReleases,
	ObsidianTheme,
} from "@/shared/obsidian/types";

export const sampleObsidianPlugin: ObsidianPlugin = {
	id: "obsidian-plugin-repo",
	name: "Test Plugin",
	description: "A test plugin",
	author: "Test Author",
	repo: "test/obsidian-plugin-repo",
};
export const sampleObsidianPluginNew: ObsidianPlugin = {
	...sampleObsidianPlugin,
	id: "obsidian-plugin-repo-new",
	repo: "test/obsidian-plugin-repo-new",
};

export const sampleObsidianTheme: ObsidianTheme = {
	name: "Test Theme",
	author: "Test Author",
	repo: "test/obsidian-theme-repo",
	screenshot: "screenshot.png",
	modes: ["dark", "light"],
};

export const sampleObsidianThemeNew: ObsidianTheme = {
	...sampleObsidianTheme,
	name: "Test New Theme",
	repo: "test/new-theme-repo",
};

export const sampleObsidianPluginsStats: ObsidianPluginsStats = {
	"obsidian-plugin-repo": {
		downloads: 1000,
		updated: 1643673600,
		"1.0.0": 500,
		"1.1.0": 500,
	},
	"obsidian-plugin-repo-new": {
		downloads: 1000,
		updated: 1643673600,
		"1.0.0": 500,
		"1.1.0": 500,
	},
};

export const sampleObsidianPluginDeprecated = {
	"obsidian-plugin-repo": ["deprecated-reason"],
	"obsidian-plugin-repo-new": ["deprecated-reason"],
};

export const sampleObsidianPluginRemoved: ObsidianPluginRemoved = {
	id: "obsidian-plugin-repo",
	name: "Removed Plugin",
	reason: "Test removal reason",
};

export const sampleObsidianReleases = {
	"community-plugins.json": [sampleObsidianPlugin],
	"community-css-themes.json": [sampleObsidianTheme],
	"community-plugin-stats.json": sampleObsidianPluginsStats,
	"community-plugin-deprecation.json": [sampleObsidianPluginRemoved],
	"community-plugins-removed.json": {},
} as const;

export const sampleObsidianReleasesIntegration: ObsidianReleases = {
	plugins: {
		filePath: "community-plugins.json",
		content: [sampleObsidianPlugin],
	},
	themes: {
		filePath: "community-css-themes.json",
		content: [sampleObsidianTheme],
	},
	stats: {
		filePath: "community-plugin-stats.json",
		content: sampleObsidianPluginsStats,
	},
	removed: {
		filePath: "community-plugins-removed.json",
		content: [sampleObsidianPluginRemoved],
	},
	deprecation: {
		filePath: "community-plugin-deprecation.json",
		content: {},
	},
};
