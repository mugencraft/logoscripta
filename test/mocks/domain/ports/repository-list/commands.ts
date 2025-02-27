import type {
	NewRepositoryList,
	NewRepositoryListItem,
	RepositoryList,
	RepositoryListItem,
} from "@/domain/models/repository-list";
import type { RepositoryListCommandsPort } from "@/domain/ports/repository-list/commands";
import { sampleList } from "test/fixtures/entities/repository-lists";
import { vi } from "vitest";

interface MockRepositoryListCommandsOptions {
	/** Custom responses for specific list operations */
	responses?: {
		/** Map of list id to response for create method */
		create?: Record<string, RepositoryList | undefined>;
		/** Map of list id to response for update method */
		update?: Record<string, RepositoryList | undefined>;
		/** Map of list id to response for delete method */
		delete?: Record<string, RepositoryList | undefined>;
	};
	/** Configure error scenarios */
	errorScenarios?: {
		/** List data triggers that should trigger create errors */
		createErrors?: string[]; // Match on list name
		/** List ids that should trigger update errors */
		updateErrors?: number[];
		/** List ids that should trigger delete errors */
		deleteErrors?: number[];
		/** List ids that should trigger item creation errors */
		createItemErrors?: number[];
		/** List ids that should trigger item update errors */
		updateItemErrors?: number[];
		/** List ids that should trigger item removal errors */
		removeItemErrors?: number[];
	};
	/** Default repository list to return if no custom response defined */
	defaultList?: RepositoryList;
}

/**
 * Creates a mock implementation of the RepositoryListCommandsPort.
 *
 * @param options - Configuration options for the mock
 * @returns Mock implementation of RepositoryListCommandsPort
 */
export function createMockRepositoryListCommandsPort(
	options: MockRepositoryListCommandsOptions = {},
): RepositoryListCommandsPort {
	return {
		create: vi.fn().mockImplementation(async (data: NewRepositoryList) => {
			// Check for error scenarios
			if (options.errorScenarios?.createErrors?.includes(data.name)) {
				throw new Error(`Failed to create list: ${data.name}`);
			}

			// Check for custom responses if name is provided in data
			if (
				data.name &&
				options.responses?.create &&
				data.name in options.responses.create
			) {
				return options.responses.create[data.name];
			}

			// Create a new list based on the input data
			const newList: RepositoryList = {
				id: Math.floor(Math.random() * 1000) + 1, // Generate a random id
				name: data.name,
				description: data.description || null,
				metadata: data.metadata || null,
				createdAt: new Date(),
				readOnly: data.readOnly || false,
				sourceType: data.sourceType || null,
				sourceVersion: data.sourceVersion || null,
			};

			// Return the new list or the default list if one is provided
			return options.defaultList
				? { ...options.defaultList, ...data }
				: newList;
		}),

		update: vi
			.fn()
			.mockImplementation(
				async (listId: number, data: Partial<NewRepositoryList>) => {
					// Check for error scenarios
					if (options.errorScenarios?.updateErrors?.includes(listId)) {
						throw new Error(`Failed to update list: ${listId}`);
					}

					// Check for custom responses
					if (
						options.responses?.update &&
						listId.toString() in options.responses.update
					) {
						return options.responses.update[listId.toString()];
					}

					// Return an updated list
					const updatedList: RepositoryList = {
						...(options.defaultList || sampleList),
						...data,
						id: listId,
					};

					return updatedList;
				},
			),

		delete: vi.fn().mockImplementation(async (listId: number) => {
			// Check for error scenarios
			if (options.errorScenarios?.deleteErrors?.includes(listId)) {
				throw new Error(`Failed to delete list: ${listId}`);
			}

			// Check for custom responses
			if (
				options.responses?.delete &&
				listId.toString() in options.responses.delete
			) {
				return options.responses.delete[listId.toString()];
			}

			// Return the deleted list (options.defaultList or sampleList with the specified id)
			return {
				...(options.defaultList || sampleList),
				id: listId,
			};
		}),

		createItem: vi
			.fn()
			.mockImplementation(async (data: NewRepositoryListItem) => {
				// Check for error scenarios
				if (options.errorScenarios?.createItemErrors?.includes(data.listId)) {
					throw new Error(`Failed to create item in list: ${data.listId}`);
				}

				// This method returns void according to the port interface
				return undefined;
			}),

		updateItem: vi
			.fn()
			.mockImplementation(
				async (listId: number, fullName: string, data: RepositoryListItem) => {
					// Check for error scenarios
					if (options.errorScenarios?.updateItemErrors?.includes(listId)) {
						throw new Error(`Failed to update item in list: ${listId}`);
					}

					// This method returns void according to the port interface
					return undefined;
				},
			),

		removeItem: vi
			.fn()
			.mockImplementation(async (listId: number, fullName: string) => {
				// Check for error scenarios
				if (options.errorScenarios?.removeItemErrors?.includes(listId)) {
					throw new Error(`Failed to remove item from list: ${listId}`);
				}

				// This method returns void according to the port interface
				return undefined;
			}),
	};
}
