import { vi } from "vitest";

import type { Change } from "@/core/changes/types";
import type { ProcessableChanges } from "@/domain/config/github/obsidian";
import type { ObsidianReleasesIntegrator } from "@/domain/services/github/integration/obsidian-releases";
import type {
  ObsidianPlugin,
  ObsidianPluginsDeprecation,
  ObsidianPluginsStats,
  ObsidianReleases,
  ObsidianReleasesContent,
  ObsidianTheme,
} from "@/shared/obsidian/types";

import {
  sampleObsidianPlugin,
  sampleObsidianPluginRemoved,
  sampleObsidianPluginsStats,
  sampleObsidianTheme,
} from "test/fixtures/api-responses/obsidian";
import {
  sampleObsidianPluginChange,
  sampleObsidianThemeChange,
} from "test/fixtures/entities/changes-obsidian";

interface MockObsidianReleasesIntegratorOptions {
  customReleases?: Partial<{
    [K in keyof ObsidianReleases]: {
      filePath: string;
      content: ObsidianReleasesContent[K];
    };
  }>;
  pluginChanges?: Change<ObsidianPlugin>[];
  themeChanges?: Change<ObsidianTheme>[];
  errorScenarios?: {
    fetchError?: Error;
  };
}

export function createMockObsidianReleasesIntegrator(
  options: MockObsidianReleasesIntegratorOptions = {},
): ObsidianReleasesIntegrator {
  return {
    fetchAndProcessReleases: vi.fn().mockImplementation(async () => {
      if (options.errorScenarios?.fetchError) {
        throw options.errorScenarios.fetchError;
      }

      // Build releases from custom or default values
      const releases: ObsidianReleases = {
        plugins: options.customReleases?.plugins || {
          filePath: "community-plugins.json",
          content: [sampleObsidianPlugin],
        },
        stats: options.customReleases?.stats || {
          filePath: "community-plugin-stats.json",
          content: sampleObsidianPluginsStats as ObsidianPluginsStats,
        },
        removed: options.customReleases?.removed || {
          filePath: "community-plugins-removed.json",
          content: [sampleObsidianPluginRemoved],
        },
        deprecation: options.customReleases?.deprecation || {
          filePath: "community-plugin-deprecation.json",
          content: {} as ObsidianPluginsDeprecation,
        },
        themes: options.customReleases?.themes || {
          filePath: "community-css-themes.json",
          content: [sampleObsidianTheme],
        },
      };

      // Build changes
      const changes: ProcessableChanges = {
        plugins: options.pluginChanges || [sampleObsidianPluginChange],
        themes: options.themeChanges || [sampleObsidianThemeChange],
      };

      return {
        files: releases,
        changes,
        missing: [],
      };
    }),
  } as unknown as ObsidianReleasesIntegrator;
}
