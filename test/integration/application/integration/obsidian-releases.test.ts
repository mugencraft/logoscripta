import { readdir } from "node:fs/promises";
import { join } from "node:path";

import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import type { Change } from "@/core/changes/types";
import { readJson } from "@/core/serialization/json";
import {
  OBSIDIAN_ENTITY_TYPES,
  obsidianPluginConfig,
  obsidianThemeConfig,
} from "@/domain/config/defaults/change.obsidian";
import { ObsidianReleasesIntegrator } from "@/domain/services/github/integration/obsidian-releases";
import type { ObsidianPlugin, ObsidianTheme } from "@/shared/obsidian/types";

import {
  sampleObsidianPlugin,
  sampleObsidianPluginNew,
  sampleObsidianReleases,
  sampleObsidianTheme,
  sampleObsidianThemeNew,
} from "test/fixtures/api-responses/obsidian";
import { sampleObsidianRepositories } from "test/fixtures/entities/repository-obsidian";
import { IntegrationTestHelper } from "test/helpers/integration";
import { setupTestTime } from "test/helpers/time";
import {
  createMockGithubProcessor,
  type MockGithubProcessorOptions,
} from "test/mocks/application/commands/github";
import {
  createMockGithubAdapter,
  type MockGithubAdapterOptions,
} from "test/mocks/infrastructure/adapters.github";

describe("ObsidianReleasesIntegrator Integration", () => {
  let helper: IntegrationTestHelper;
  let testPath: string;

  beforeAll(async () => {
    helper = new IntegrationTestHelper("obsidian-releases-integrator");
    await helper.beforeAll();
  });

  beforeEach(async () => {
    testPath = await helper.createTestCaseDir("test-case");
    setupTestTime();
  });

  afterAll(async () => {
    await helper.afterAll();
  });

  describe("Release History Management", () => {
    it("should properly store and track plugin history", async () => {
      const { sut, paths } = createTestSetup(testPath);
      const result = await sut.fetchAndProcessReleases();

      expect(result.files.plugins.content).toEqual([sampleObsidianPlugin]);

      const snapshotDate = "2024-01-01";
      const snapshotContent = await readJson<ObsidianPlugin[]>(
        join(paths.plugins, `${snapshotDate}.json`),
      );

      expect(snapshotContent).toEqual([sampleObsidianPlugin]);
    });

    it("should track changes in plugins across releases", async () => {
      const initial = createTestSetup(testPath);
      // First release
      await initial.sut.fetchAndProcessReleases();

      // Update mock for second release
      const { sut, paths } = createTestSetup(testPath, {
        adapter: {
          customFileContent: {
            "community-plugins.json": [
              { ...sampleObsidianPlugin, author: "Author Change" },
              sampleObsidianPluginNew,
            ],
          },
        },
      });

      setupTestTime("2024-01-02");
      const result = await sut.fetchAndProcessReleases();

      const changes = await readJson<Change<ObsidianPlugin[]>[]>(
        join(paths.plugins, "changelog.json"),
      );

      expect(result.changes.plugins).toHaveLength(2);
      expect(changes).toHaveLength(3);
      expect(changes[0]).toMatchObject({
        type: "add",
        entityType: OBSIDIAN_ENTITY_TYPES.PLUGIN,
        data: sampleObsidianPlugin,
      });
      expect(changes[1]).toMatchObject({
        type: "full",
        entityType: OBSIDIAN_ENTITY_TYPES.PLUGIN,
        data: { ...sampleObsidianPlugin, author: "Author Change" },
      });
      expect(changes[2]).toMatchObject({
        type: "add",
        entityType: OBSIDIAN_ENTITY_TYPES.PLUGIN,
        data: sampleObsidianPluginNew,
      });
    });

    it("should maintain snapshot history with retention", async () => {
      const { sut, paths } = createTestSetup(testPath);

      // Create multiple snapshots over time
      for (let i = 1; i <= 4; i++) {
        setupTestTime(`2024-01-0${i}`);
        await sut.fetchAndProcessReleases();
      }

      const snapshotFiles = await readdir(paths.plugins);

      // Should retain only latest snapshots (default retention: 2)
      expect(snapshotFiles).toContain("2024-01-04.json");
      expect(snapshotFiles).toContain("2024-01-03.json");
      expect(snapshotFiles).not.toContain("2024-01-02.json");
      expect(snapshotFiles).not.toContain("2024-01-01.json");
    });

    it("should track theme changes independently", async () => {
      const initial = createTestSetup(testPath);
      await initial.sut.fetchAndProcessReleases();

      // Update mock for second release with theme changes
      const { sut, paths } = createTestSetup(testPath, {
        adapter: {
          customFileContent: {
            "community-css-themes.json": [
              sampleObsidianTheme,
              sampleObsidianThemeNew,
            ],
          },
        },
      });

      setupTestTime("2024-01-02");
      const result = await sut.fetchAndProcessReleases();

      const changes = await readJson<Change<ObsidianTheme[]>[]>(
        join(paths.themes, "changelog.json"),
      );

      expect(changes).toHaveLength(2);
      expect(changes[0]).toMatchObject({
        type: "add",
        entityType: OBSIDIAN_ENTITY_TYPES.THEME,
        data: sampleObsidianTheme,
      });
      expect(changes[1]).toMatchObject({
        type: "add",
        entityType: OBSIDIAN_ENTITY_TYPES.THEME,
        data: sampleObsidianThemeNew,
      });
      expect(result.changes.themes).toHaveLength(1);
    });
  });

  describe("Error Handling and Recovery", () => {
    describe("API Error Handling", () => {
      it("should handle API errors while preserving history", async () => {
        // First, let's do a successful fetch to establish baseline
        const initial = createTestSetup(testPath);
        const initialResult = await initial.sut.fetchAndProcessReleases();
        expect(initialResult.files.plugins.content).toEqual([
          sampleObsidianPlugin,
        ]);

        // Now create a new setup with API error simulation
        const { sut, paths } = createTestSetup(testPath, {
          adapter: {
            errorScenarios: {
              fileErrors: ["community-plugins.json"],
            },
          },
        });

        // Attempt update and verify error is thrown
        await expect(sut.fetchAndProcessReleases()).rejects.toThrow(
          "File not found",
        );

        // Most importantly, verify our original snapshots are preserved
        const snapshotContent = await readJson<ObsidianPlugin[]>(
          join(paths.plugins, "2024-01-01.json"),
        );
        expect(snapshotContent).toEqual([sampleObsidianPlugin]);
      });

      it("should handle rate limit errors appropriately", async () => {
        const { sut } = createTestSetup(testPath, {
          adapter: {
            errorScenarios: {
              apiErrors: ["community-plugins.json"],
            },
          },
        });

        await expect(sut.fetchAndProcessReleases()).rejects.toThrow(
          "API rate limit exceeded",
        );
      });
    });

    describe("Repository Processing", () => {
      it("should track missing repositories during processing", async () => {
        // Create setup with a processor that fails for specific repos
        const { sut } = createTestSetup(testPath, {
          processor: {
            errorScenarios: {
              saveErrors: ["test/obsidian-plugin-repo"],
            },
          },
        });

        const result = await sut.fetchAndProcessReleases();

        // Verify tracking of missing repositories
        expect(result.missing).toContain("test/obsidian-plugin-repo");
        expect(result.missing).toHaveLength(1);

        // Verify other processing continues
        expect(result.files.plugins.content).toHaveLength(1);
      });

      it("should handle multiple repository failures gracefully", async () => {
        const { sut } = createTestSetup(testPath, {
          adapter: {
            customFileContent: {
              // Add multiple plugins to test batch processing
              "community-plugins.json": [
                sampleObsidianPlugin,
                sampleObsidianPluginNew,
              ],
            },
          },
          processor: {
            errorScenarios: {
              saveErrors: [
                "test/obsidian-plugin-repo",
                "test/obsidian-plugin-repo-new",
              ],
            },
          },
        });

        const result = await sut.fetchAndProcessReleases();

        expect(result.missing).toHaveLength(2);
        expect(result.missing).toContain("test/obsidian-plugin-repo");
        expect(result.missing).toContain("test/obsidian-plugin-repo-new");
      });
    });
  });
});

function createTestSetup(
  testPath: string,
  options: {
    adapter?: MockGithubAdapterOptions;
    processor?: MockGithubProcessorOptions;
  } = {},
) {
  const mockAdapter = createMockGithubAdapter({
    ...options.adapter,
    customFileContent: {
      ...sampleObsidianReleases,
      ...options.adapter?.customFileContent,
    },
  });

  const mockProcessor = createMockGithubProcessor({
    ...options.processor,
    repositoryResponses: {
      ...sampleObsidianRepositories,
      ...options.processor?.repositoryResponses,
    },
  });

  const sut = new ObsidianReleasesIntegrator(mockAdapter, mockProcessor, {
    paths: {
      obsidian: testPath,
      github: testPath,
    },
    pluginChangeConfig: obsidianPluginConfig,
    themeChangeConfig: obsidianThemeConfig,
  });

  return {
    sut,
    mocks: {
      adapter: mockAdapter,
      processor: mockProcessor,
    },
    paths: {
      plugins: join(testPath, OBSIDIAN_ENTITY_TYPES.PLUGIN),
      themes: join(testPath, OBSIDIAN_ENTITY_TYPES.THEME),
    },
  };
}
