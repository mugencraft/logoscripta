import { ObsidianReleasesCommands } from "@/application/commands/obsidian-releases";
import {
	sampleObsidianPlugin,
	sampleObsidianPluginNew,
	sampleObsidianPluginRemoved,
	sampleObsidianReleasesIntegration,
} from "test/fixtures/api-responses/obsidian";
import {
	sampleObsidianPluginChange,
	sampleObsidianPluginChangeNew,
} from "test/fixtures/entities/changes-obsidian";
import { createMockObsidianReleasesIntegrator } from "test/mocks/application/integrators/obsidian-releases";
import {
	createMockObsidianPluginHandler,
	createMockObsidianThemeHandler,
} from "test/mocks/domain/services/handlers";
import { describe, expect, it } from "vitest";

interface TestSetupOptions {
	integrator?: Parameters<typeof createMockObsidianReleasesIntegrator>[0];
	pluginHandler?: Parameters<typeof createMockObsidianPluginHandler>[0];
	themeHandler?: Parameters<typeof createMockObsidianThemeHandler>[0];
}

function createTestSetup(options: TestSetupOptions = {}) {
	const integrator = createMockObsidianReleasesIntegrator(options.integrator);
	const pluginHandler = createMockObsidianPluginHandler(options.pluginHandler);
	const themeHandler = createMockObsidianThemeHandler(options.themeHandler);

	const sut = new ObsidianReleasesCommands(
		integrator,
		pluginHandler,
		themeHandler,
	);

	return {
		sut,
		handlers: {
			plugin: pluginHandler,
			theme: themeHandler,
		},
	};
}

describe("ObsidianReleasesCommands Unit", () => {
	describe("Basic Release Processing", () => {
		it("processes releases and initializes handlers successfully", async () => {
			const { sut, handlers } = createTestSetup();

			const result = await sut.syncReleases();

			// Verify initialization
			expect(handlers.plugin.setList).toHaveBeenCalledWith("obsidian-plugin");
			expect(handlers.theme.setList).toHaveBeenCalledWith("obsidian-theme");
			expect(handlers.plugin.initializeState).toHaveBeenCalledWith(
				sampleObsidianReleasesIntegration.stats.content,
				sampleObsidianReleasesIntegration.deprecation.content,
			);

			// Verify processing results
			expect(result.processed).toEqual({ plugins: 1, themes: 1 });
			expect(result.missing).toHaveLength(0);
			expect(handlers.plugin.handle).toHaveBeenCalledWith(
				expect.objectContaining({
					id: "test/obsidian-plugin-repo",
					type: "full",
					entityType: "obsidian-plugin",
				}),
			);
			expect(handlers.theme.handle).toHaveBeenCalledWith(
				expect.objectContaining({
					id: "test/obsidian-theme-repo",
					type: "full",
					entityType: "obsidian-theme",
				}),
			);
		});

		it("handles new plugin additions", async () => {
			const { sut, handlers } = createTestSetup({
				integrator: {
					customReleases: {
						plugins: {
							filePath: "community-plugins.json",
							content: [sampleObsidianPlugin, sampleObsidianPluginNew],
						},
					},
					pluginChanges: [
						sampleObsidianPluginChange,
						sampleObsidianPluginChangeNew,
					],
				},
			});

			const result = await sut.syncReleases();

			expect(result.processed.plugins).toBe(2);
			expect(handlers.plugin.handle).toHaveBeenCalledTimes(2);
		});

		it("processes plugin removals", async () => {
			const removedRepo = sampleObsidianPlugin.repo;
			const { sut, handlers } = createTestSetup({
				integrator: {
					customReleases: {
						removed: {
							filePath: "community-plugins-removed.json",
							content: [sampleObsidianPluginRemoved],
						},
					},
				},
				pluginHandler: {
					removal: {
						handleImplementation: async () => removedRepo,
					},
				},
			});

			const result = await sut.syncReleases();

			expect(result.changes.removed).toBe(1);
			expect(handlers.plugin.handleArchival).toHaveBeenCalledWith(
				sampleObsidianPluginRemoved,
				removedRepo,
			);
		});
	});

	describe("Error Handling", () => {
		it("handles integrator fetch errors", async () => {
			const { sut } = createTestSetup({
				integrator: {
					errorScenarios: {
						fetchError: new Error("Fetch failed"),
					},
				},
			});

			await expect(sut.syncReleases()).rejects.toThrow("Fetch failed");
		});

		it("handles plugin handler initialization errors", async () => {
			const { sut } = createTestSetup({
				pluginHandler: {
					initialization: {
						listError: new Error("Plugin handler initialization failed"),
					},
				},
			});

			await expect(sut.syncReleases()).rejects.toThrow(
				"Plugin handler initialization failed",
			);
		});

		it("handles theme handler initialization errors", async () => {
			const { sut } = createTestSetup({
				themeHandler: {
					initialization: {
						listError: new Error("Theme handler initialization failed"),
					},
				},
			});

			await expect(sut.syncReleases()).rejects.toThrow(
				"Theme handler initialization failed",
			);
		});

		it("handles plugin processing errors", async () => {
			const { sut } = createTestSetup({
				pluginHandler: {
					changeHandling: {
						handleImplementation: async () => {
							throw new Error("Plugin processing failed");
						},
					},
				},
			});

			await expect(sut.syncReleases()).rejects.toThrow(
				"Plugin processing failed",
			);
		});

		it("handles theme processing errors", async () => {
			const { sut } = createTestSetup({
				themeHandler: {
					changeHandling: {
						handleImplementation: async () => {
							throw new Error("Theme processing failed");
						},
					},
				},
			});

			await expect(sut.syncReleases()).rejects.toThrow(
				"Theme processing failed",
			);
		});

		it("handles plugin removal errors", async () => {
			const { sut } = createTestSetup({
				integrator: {
					customReleases: {
						removed: {
							filePath: "community-plugins-removed.json",
							content: [sampleObsidianPluginRemoved],
						},
					},
				},
				pluginHandler: {
					removal: {
						handleImplementation: async () => {
							throw new Error("Plugin removal failed");
						},
					},
				},
			});

			await expect(sut.syncReleases()).rejects.toThrow("Plugin removal failed");
		});
	});
});
