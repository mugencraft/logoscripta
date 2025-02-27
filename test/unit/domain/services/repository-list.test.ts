import { EntityNotFoundError, SecurityError } from "@/domain/models/errors";
import { RepositoryListService } from "@/domain/services/repository-list";
import {
	sampleList,
	sampleListItem,
} from "test/fixtures/entities/repository-lists";
import { createMockRepositoryListCommandsPort } from "test/mocks/domain/ports/repository-list/commands";
import { createMockRepositoryListQueriesPort } from "test/mocks/domain/ports/repository-list/queries";
import { describe, expect, it } from "vitest";

describe("RepositoryListService", () => {
	describe("create", () => {
		it("should create a new list", async () => {
			const { sut, mocks } = createTestSetup();

			const newList = {
				name: "New List",
				description: "A new list",
			};

			await sut.create(newList);

			expect(mocks.commands.create).toHaveBeenCalledWith(newList);
		});
	});

	describe("delete", () => {
		it("should delete a list if not read-only", async () => {
			const { sut, mocks } = createTestSetup();

			await sut.delete(sampleList.id);

			expect(mocks.queries.findById).toHaveBeenCalledWith(sampleList.id);
			expect(mocks.commands.delete).toHaveBeenCalledWith(sampleList.id);
		});

		it("should throw error when deleting a read-only list", async () => {
			const { sut } = createTestSetup({
				readOnlyList: true,
			});

			await expect(sut.delete(sampleList.id)).rejects.toThrow(
				`Cannot modify read-only list ${sampleList.id}`,
			);
		});

		it("should throw error when list is not found", async () => {
			const { sut } = createTestSetup({
				listNotFound: true,
			});

			await expect(sut.delete(999)).rejects.toThrow("List 999 not found");
		});
	});

	describe("update", () => {
		it("should update a list if not read-only", async () => {
			const { sut, mocks } = createTestSetup();

			const updates = {
				name: "Updated List",
				description: "Updated description",
			};

			await sut.update(sampleList.id, updates);

			expect(mocks.queries.findById).toHaveBeenCalledWith(sampleList.id);
			expect(mocks.commands.update).toHaveBeenCalledWith(
				sampleList.id,
				updates,
			);
		});

		it("should throw error when updating a read-only list", async () => {
			const { sut } = createTestSetup({
				readOnlyList: true,
			});

			const updates = { name: "Updated List" };

			await expect(sut.update(sampleList.id, updates)).rejects.toThrow(
				`Cannot modify read-only list ${sampleList.id}`,
			);
		});
	});

	describe("saveToList", () => {
		it("should create a new item if it doesn't exist", async () => {
			const { sut, mocks } = createTestSetup({
				itemNotFound: true,
			});

			const item = {
				listId: sampleList.id,
				fullName: "test/new-repo",
				repositoryId: 456,
				metadata: {},
			};

			await sut.saveToList(item);

			expect(mocks.queries.findById).toHaveBeenCalledWith(sampleList.id);
			expect(mocks.queries.findItem).toHaveBeenCalledWith(
				sampleList.id,
				"test/new-repo",
			);
			expect(mocks.commands.createItem).toHaveBeenCalledWith(item);
		});

		it("should update an existing item", async () => {
			const { sut, mocks } = createTestSetup();

			const item = {
				listId: sampleList.id,
				fullName: "test/repo",
				repositoryId: 123,
				metadata: {},
			};

			await sut.saveToList(item);

			expect(mocks.queries.findById).toHaveBeenCalledWith(sampleList.id);
			expect(mocks.queries.findItem).toHaveBeenCalledWith(
				sampleList.id,
				"test/repo",
			);
			expect(mocks.commands.updateItem).toHaveBeenCalledWith(
				sampleList.id,
				"test/repo",
				item,
			);
		});

		it("should throw EntityNotFoundError when list not found", async () => {
			const { sut } = createTestSetup({
				listNotFound: true,
			});

			const item = {
				listId: 999,
				fullName: "test/repo",
				repositoryId: 123,
				metadata: {},
			};

			await expect(sut.saveToList(item)).rejects.toThrow(EntityNotFoundError);
		});

		it("should throw SecurityError when list is read-only", async () => {
			const { sut } = createTestSetup({
				readOnlyList: true,
			});

			const item = {
				listId: sampleList.id,
				fullName: "test/repo",
				repositoryId: 123,
				metadata: {},
			};

			await expect(sut.saveToList(item)).rejects.toThrow(SecurityError);
		});

		it("should throw error when data validation fails", async () => {
			const { sut } = createTestSetup();

			const invalidItem = {
				listId: sampleList.id,
				// Missing required fullName
				repositoryId: 123,
				metadata: {},
			};

			// @ts-ignore - intentionally passing invalid data for test
			await expect(sut.saveToList(invalidItem)).rejects.toThrow();
		});
	});

	describe("removeFromList", () => {
		it("should remove an item from list", async () => {
			const { sut, mocks } = createTestSetup();

			await sut.removeFromList(sampleList.id, "test/repo");

			expect(mocks.queries.findById).toHaveBeenCalledWith(sampleList.id);
			expect(mocks.commands.removeItem).toHaveBeenCalledWith(
				sampleList.id,
				"test/repo",
			);
		});

		it("should throw error when list is read-only", async () => {
			const { sut } = createTestSetup({
				readOnlyList: true,
			});

			await expect(
				sut.removeFromList(sampleList.id, "test/repo"),
			).rejects.toThrow(`Cannot modify read-only list ${sampleList.id}`);
		});
	});
});

interface TestSetupOptions {
	readOnlyList?: boolean;
	listNotFound?: boolean;
	itemNotFound?: boolean;
}

function createTestSetup(options: TestSetupOptions = {}) {
	// Create mock ports
	const mockListCommands = createMockRepositoryListCommandsPort();

	const mockListQueries = createMockRepositoryListQueriesPort({
		responses: {
			findById: {
				[sampleList.id.toString()]: options.listNotFound
					? undefined
					: {
							...sampleList,
							readOnly: options.readOnlyList || false,
						},
				"999": undefined,
			},
			findItem: {
				[`${sampleList.id}-test/repo`]: options.itemNotFound
					? undefined
					: sampleListItem,
				[`${sampleList.id}-test/new-repo`]: undefined,
			},
		},
	});

	// Create the service under test
	const sut = new RepositoryListService(mockListCommands, mockListQueries);

	return {
		sut,
		mocks: {
			commands: mockListCommands,
			queries: mockListQueries,
		},
	};
}
