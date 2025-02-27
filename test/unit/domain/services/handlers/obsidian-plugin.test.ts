// test/unit/domain/services/handlers/obsidian-plugin.test.ts
import { ObsidianPluginHandler } from "@/domain/services/handlers/obsidian-plugin";
import { RepositorySystemListService } from "@/domain/services/repository-list-system";
import {
	sampleObsidianPlugin,
	sampleObsidianPluginDeprecated,
	sampleObsidianPluginRemoved,
	sampleObsidianPluginsStats,
} from "test/fixtures/api-responses/obsidian";
import {
	sampleObsidianPluginChange,
	sampleObsidianPluginChangeNew,
	sampleObsidianPluginChangeSoft,
} from "test/fixtures/entities/changes-obsidian";
import { sampleRepository } from "test/fixtures/entities/repository";
import { sampleSystemList } from "test/fixtures/entities/repository-lists-system";
import { createMockRepositoryListCommandsPort } from "test/mocks/domain/ports/repository-list/commands";
import { createMockRepositoryListQueriesPort } from "test/mocks/domain/ports/repository-list/queries";
import { createMockRepositoryCommandsPort } from "test/mocks/domain/ports/repository/commands";
import { createMockRepositoryQueriesPort } from "test/mocks/domain/ports/repository/queries";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("ObsidianPluginHandler", () => {
	describe("initialization", () => {
		it("should throw error if system list is not set", async () => {
			const { sut } = createTestSetup();
			await expect(sut.handle(sampleObsidianPluginChange)).rejects.toThrow(
				"List not set",
			);
		});

		it("should set list id and source type after initialization", async () => {
			const { sut, mocks } = createTestSetup();

			await sut.setList("obsidian-plugin");

			expect(mocks.listQueries.findBySourceType).toHaveBeenCalledWith(
				"obsidian-plugin",
			);
			// Private fields can't be directly tested, but we can verify behavior
			await expect(
				sut.handle(sampleObsidianPluginChange),
			).resolves.not.toThrow();
		});
	});

	describe("handle", () => {
		let setup: ReturnType<typeof createTestSetup>;

		beforeEach(async () => {
			setup = createTestSetup();
			await setup.sut.setList("obsidian-plugin");
			await setup.sut.initializeState(
				sampleObsidianPluginsStats,
				sampleObsidianPluginDeprecated,
			);
		});

		it("should handle full change for existing repository", async () => {
			await setup.sut.handle(sampleObsidianPluginChange);

			expect(setup.mocks.repoQueries.findByName).toHaveBeenCalledWith(
				"test/obsidian-plugin-repo",
			);
			expect(setup.mocks.listCommands.createItem).toHaveBeenCalledWith(
				expect.objectContaining({
					listId: expect.any(Number),
					fullName: "test/obsidian-plugin-repo",
					repositoryId: expect.any(Number),
					metadata: expect.objectContaining({
						plugin: sampleObsidianPlugin,
						stats: expect.any(Object),
					}),
				}),
			);
		});

		it("should handle soft update for existing repository", async () => {
			const { sut, mocks } = createTestSetup({
				withExistingPluginItem: true,
			});

			await sut.setList("obsidian-plugin");
			await sut.initializeState(
				sampleObsidianPluginsStats,
				sampleObsidianPluginDeprecated,
			);

			await sut.handle(sampleObsidianPluginChangeSoft);

			expect(mocks.repoQueries.findByName).toHaveBeenCalledWith(
				"test/obsidian-plugin-repo",
			);
			expect(mocks.listQueries.findItem).toHaveBeenCalled();
			expect(mocks.listCommands.updateItem).toHaveBeenCalledWith(
				expect.any(Number),
				"test/obsidian-plugin-repo",
				expect.objectContaining({
					metadata: expect.objectContaining({
						stats: expect.any(Object),
						system: expect.objectContaining({
							updatedAt: sampleObsidianPluginChangeSoft.timestamp,
						}),
					}),
				}),
			);
		});

		it("should throw error for missing repository", async () => {
			const { sut } = createTestSetup({
				repositoryNotFound: true,
			});
			await sut.setList("obsidian-plugin");
			await sut.initializeState(
				sampleObsidianPluginsStats,
				sampleObsidianPluginDeprecated,
			);

			await expect(sut.handle(sampleObsidianPluginChangeNew)).rejects.toThrow();
		});
	});

	describe("handleArchival", () => {
		beforeEach(() => {
			vi.useFakeTimers();
			vi.setSystemTime(new Date("2024-01-01"));
		});

		it("should move plugin to archive list", async () => {
			const { sut, mocks } = createTestSetup();
			await sut.setList("obsidian-plugin");

			await sut.handleArchival(
				sampleObsidianPluginRemoved,
				"test/obsidian-plugin-repo",
			);

			expect(mocks.listCommands.removeItem).toHaveBeenCalledWith(
				expect.any(Number),
				"test/obsidian-plugin-repo",
			);
			expect(mocks.listCommands.createItem).toHaveBeenCalledWith(
				expect.objectContaining({
					metadata: expect.objectContaining({
						archived: expect.objectContaining({
							reason: sampleObsidianPluginRemoved.reason,
							removedAt: expect.any(String),
						}),
					}),
				}),
			);
		});
	});
});

type TestSetupOptions = {
	repositoryNotFound?: boolean;
	withExistingPluginItem?: boolean;
};

function createTestSetup(
	options: TestSetupOptions = {
		repositoryNotFound: false,
		withExistingPluginItem: false,
	},
) {
	// Create mock ports
	const mockRepoCommands = createMockRepositoryCommandsPort();
	const mockRepoQueries = createMockRepositoryQueriesPort({
		responses: {
			findByName: {
				"test/obsidian-plugin-repo": options.repositoryNotFound
					? undefined
					: sampleRepository,
				"test/obsidian-plugin-repo-new": options.repositoryNotFound
					? undefined
					: sampleRepository,
			},
		},
		errorScenarios: {
			findByNameErrors: options.repositoryNotFound
				? ["test/obsidian-plugin-repo-new"]
				: [],
		},
		defaultRepository: undefined,
	});

	const mockListCommands = createMockRepositoryListCommandsPort();
	const mockListQueries = createMockRepositoryListQueriesPort({
		responses: {
			findBySourceType: {
				"obsidian-plugin": {
					...sampleSystemList,
					sourceType: "obsidian-plugin",
				},
				archived: {
					...sampleSystemList,
					id: 2,
					sourceType: "archived",
				},
			},
			findItem: options.withExistingPluginItem
				? {
						[`${sampleSystemList.id}-test/obsidian-plugin-repo`]: {
							listId: sampleSystemList.id,
							fullName: "test/obsidian-plugin-repo",
							repositoryId: sampleRepository.id,
							metadata: {
								system: {
									systemType: "obsidian-plugin",
									version: "1.0",
									createdAt: "2024-01-01T00:00:00Z",
									updatedAt: "2024-01-01T00:00:00Z",
								},
								metadataTypes: [
									"obsidian-plugin",
									"obsidian-stats",
									"deprecation",
								],
								plugin: sampleObsidianPlugin,
								stats: { downloads: 100, updated: 200 },
							},
						},
					}
				: {},
		},
	});

	// Create system list service
	const systemListService = new RepositorySystemListService(
		mockListCommands,
		mockListQueries,
	);

	// Create handler
	const sut = new ObsidianPluginHandler(
		mockRepoCommands,
		mockRepoQueries,
		systemListService,
	);

	return {
		sut,
		mocks: {
			repoCommands: mockRepoCommands,
			repoQueries: mockRepoQueries,
			listCommands: mockListCommands,
			listQueries: mockListQueries,
		},
		services: {
			systemListService,
		},
	};
}
