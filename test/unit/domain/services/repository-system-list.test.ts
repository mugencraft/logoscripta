// test/unit/domain/services/repository-system-list.test.ts
import { RepositorySystemListService } from "@/domain/services/repository-list-system";
import {
	sampleArchivedMetadata,
	sampleListMetadata,
} from "test/fixtures/entities/metadata";
import {
	sampleArchivedList,
	sampleSystemList,
	sampleSystemListItem,
} from "test/fixtures/entities/repository-lists-system";
import { setupTestTime } from "test/helpers/time";
import { createMockRepositoryListCommandsPort } from "test/mocks/domain/ports/repository-list/commands";
import { createMockRepositoryListQueriesPort } from "test/mocks/domain/ports/repository-list/queries";
import { beforeEach, describe, expect, it } from "vitest";

describe("RepositorySystemListService", () => {
	beforeEach(() => {
		setupTestTime("2024-01-01");
	});

	describe("findOrCreateSystemList", () => {
		it("should return existing list when found", async () => {
			const { sut, mocks } = createTestSetup();

			const result = await sut.findOrCreateSystemList("test-system", {
				name: "Test System List",
			});

			expect(result).toEqual(sampleSystemList);
			expect(mocks.queries.findBySourceType).toHaveBeenCalledWith(
				"test-system",
			);
			expect(mocks.commands.create).not.toHaveBeenCalled();
		});

		it("should create a new list when not found", async () => {
			const { sut, mocks } = createTestSetup({
				noExistingSystemList: true,
			});

			const sourceType = "new-system";
			const name = "New System List";

			const result = await sut.findOrCreateSystemList(sourceType, {
				name,
				description: "Description",
			});

			expect(mocks.queries.findBySourceType).toHaveBeenCalledWith(sourceType);
			expect(mocks.commands.create).toHaveBeenCalledWith(
				expect.objectContaining({
					name,
					sourceType,
					readOnly: true,
					metadata: expect.objectContaining({
						system: expect.objectContaining({
							systemType: sourceType,
							version: "1.0",
							createdAt: expect.any(String),
						}),
					}),
				}),
			);
			expect(result).toBeDefined();
		});
	});

	describe("getItems", () => {
		it("should return items from the specified list", async () => {
			const { sut, mocks } = createTestSetup();

			const result = await sut.getItems("test-system", "test-metadata-type");

			expect(result).toEqual([sampleSystemListItem]);
			expect(mocks.queries.findBySourceType).toHaveBeenCalledWith(
				"test-system",
			);
			expect(mocks.queries.findItemsWithRepository).toHaveBeenCalledWith(
				sampleSystemList.id,
			);
		});

		it("should throw error when list not found", async () => {
			const { sut } = createTestSetup({
				noExistingSystemList: true,
			});

			await expect(
				sut.getItems("non-existent", "test-metadata-type"),
			).rejects.toThrow("System list not found: non-existent");
		});
	});

	describe("saveToSystemList", () => {
		it("should create item when it doesn't exist", async () => {
			const { sut, mocks } = createTestSetup({
				noExistingItem: true,
			});

			const item = {
				listId: sampleSystemList.id,
				fullName: "test/repo",
				repositoryId: 123,
				metadata: sampleListMetadata,
			};

			await sut.saveToSystemList(item);

			expect(mocks.queries.findItem).toHaveBeenCalledWith(
				sampleSystemList.id,
				"test/repo",
			);
			expect(mocks.commands.createItem).toHaveBeenCalledWith(item);
			expect(mocks.commands.updateItem).not.toHaveBeenCalled();
		});

		it("should update item when it exists", async () => {
			const { sut, mocks } = createTestSetup();

			const item = {
				listId: sampleSystemList.id,
				fullName: "test/repo",
				repositoryId: 123,
				metadata: sampleListMetadata,
			};

			await sut.saveToSystemList(item);

			expect(mocks.queries.findItem).toHaveBeenCalledWith(
				sampleSystemList.id,
				"test/repo",
			);
			expect(mocks.commands.updateItem).toHaveBeenCalledWith(
				sampleSystemList.id,
				"test/repo",
				item,
			);
			expect(mocks.commands.createItem).not.toHaveBeenCalled();
		});
	});

	describe("moveToArchive", () => {
		it("should move item to archive with proper metadata", async () => {
			const { sut, mocks } = createTestSetup();

			await sut.moveToArchive(sampleArchivedMetadata);

			expect(mocks.queries.findBySourceType).toHaveBeenCalledWith("archived");
			expect(mocks.queries.findItem).toHaveBeenCalledWith(
				sampleArchivedMetadata.listId,
				sampleArchivedMetadata.fullName,
			);
			expect(mocks.commands.createItem).toHaveBeenCalledWith(
				expect.objectContaining({
					listId: sampleArchivedList.id,
					fullName: sampleArchivedMetadata.fullName,
					metadata: expect.objectContaining({
						system: expect.objectContaining({
							systemType: "archived",
							version: "1.0",
						}),
						metadataTypes: ["archived"],
						archived: expect.objectContaining({
							reason: sampleArchivedMetadata.reason,
							removedAt: sampleArchivedMetadata.removedAt,
						}),
					}),
				}),
			);
			expect(mocks.commands.removeItem).toHaveBeenCalledWith(
				sampleArchivedMetadata.listId,
				sampleArchivedMetadata.fullName,
			);
		});

		it("should return repositoryId after archiving", async () => {
			const { sut } = createTestSetup();

			const result = await sut.moveToArchive(sampleArchivedMetadata);

			expect(result).toBe(sampleSystemListItem.repositoryId);
		});
	});
});

interface TestSetupOptions {
	noExistingSystemList?: boolean;
	noExistingItem?: boolean;
	archivedListError?: boolean;
}

function createTestSetup(options: TestSetupOptions = {}) {
	// Create mock ports
	const mockListCommands = createMockRepositoryListCommandsPort({
		responses: {
			create: {
				"New System List": {
					...sampleSystemList,
					id: 999,
					name: "New System List",
					sourceType: "new-system",
				},
			},
		},
	});

	const mockListQueries = createMockRepositoryListQueriesPort({
		responses: {
			findBySourceType: {
				// Return undefined for system list if specified in options
				...(options.noExistingSystemList
					? {}
					: {
							"test-system": sampleSystemList,
							archived: sampleArchivedList,
						}),
			},
			findItem: {
				// Return undefined for item if specified in options
				...(options.noExistingItem
					? {}
					: {
							[`${sampleSystemList.id}-test/repo`]: sampleSystemListItem,
							[`${sampleArchivedMetadata.listId}-${sampleArchivedMetadata.fullName}`]:
								{
									...sampleSystemListItem,
									listId: sampleArchivedMetadata.listId,
									fullName: sampleArchivedMetadata.fullName,
								},
						}),
			},
			findItemsWithRepository: {
				[sampleSystemList.id]: [sampleSystemListItem],
			},
		},
	});

	// Create the service under test
	const sut = new RepositorySystemListService(
		mockListCommands,
		mockListQueries,
	);

	return {
		sut,
		mocks: {
			commands: mockListCommands,
			queries: mockListQueries,
		},
	};
}
