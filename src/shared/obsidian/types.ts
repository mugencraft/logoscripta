// Base Constants
export const OBSIDIAN_REPO = "obsidianmd/obsidian-releases";
export const OBSIDIAN_FILE_KEYS = [
  "plugins",
  "stats",
  "removed",
  "deprecation",
  "themes",
] as const;
export const OBSIDIAN_FILES = {
  plugins: "community-plugins.json",
  stats: "community-plugin-stats.json",
  removed: "community-plugins-removed.json",
  deprecation: "community-plugin-deprecation.json",
  themes: "community-css-themes.json",
} as const;

// Types

export type ObsidianFilesKeys = (typeof OBSIDIAN_FILE_KEYS)[number];

export type ObsidianReleasesContent = {
  plugins: ObsidianPlugin[];
  stats: ObsidianPluginsStats;
  removed: ObsidianPluginRemoved[];
  deprecation: ObsidianPluginsDeprecation;
  themes: ObsidianTheme[];
};

export type ObsidianReleases = {
  [K in ObsidianFilesKeys]: {
    filePath: string;
    content: ObsidianReleasesContent[K];
  };
};

interface CommunityItem extends Record<string, unknown> {
  author: string;
  name: string;
  repo: string;
}

export interface ObsidianPlugin extends CommunityItem {
  description: string;
  id: string;
}

export interface ObsidianTheme extends CommunityItem {
  screenshot: string;
  modes: ("dark" | "light")[];
  legacy?: string | undefined;
}

export interface ObsidianPluginRemoved {
  id: string;
  name: string;
  reason: string;
}

export type ObsidianPluginStats = {
  [version: string]: number;
  downloads: number;
  updated: number;
};

export type ObsidianPluginsStats = {
  [pluginName: string]: ObsidianPluginStats;
};

export type ObsidianPluginsDeprecation = {
  [pluginName: string]: string[];
};
