import { vi } from "vitest";

import type {
  RepositoryList,
  RepositoryListItem,
} from "@/domain/models/github/repository-list";
import type { RepositoryListQueriesPort } from "@/domain/ports/github/repository-list/queries";

import {
  sampleList,
  sampleListItems,
} from "test/fixtures/entities/repository-lists";

interface MockRepositoryListQueriesOptions {
  /** Custom responses for specific queries */
  responses?: {
    /** Custom lists to return from findAll */
    findAll?: RepositoryList[];
    /** Map of list id to response for findById method */
    findById?: Record<string, RepositoryList | undefined>;
    /** Map of source type to response for findBySourceType method */
    findBySourceType?: Record<string, RepositoryList | undefined>;
    /** Map of "listId-fullName" to response for findItem method */
    findItem?: Record<string, RepositoryListItem | undefined>;
    /** Map of listId to response for findItemsByListWithRelations method */
    findItemsByListWithRelations?: Record<string, RepositoryListItem[]>;
    /** Map of listId to item count for getItemCount method */
    itemCounts?: Record<string, number>;
  };
  /** Configure error scenarios */
  errorScenarios?: {
    /** Should findAll throw an error */
    findAllError?: boolean;
    /** List ids that should trigger findById errors */
    findByIdErrors?: number[];
    /** Source types that should trigger findBySourceType errors */
    findBySourceTypeErrors?: string[];
    /** "listId-fullName" combinations that should trigger findItem errors */
    findItemErrors?: string[];
    /** List ids that should trigger findItems errors */
    findItemsErrors?: number[];
    /** List ids that should trigger findItemsByListWithRelations errors */
    findItemsByListErrors?: number[];
    /** List ids that should trigger getItemCount errors */
    getItemCountErrors?: number[];
  };
  /** Default lists to return if no custom response defined */
  defaultLists?: RepositoryList[];
  /** Default list items to return if no custom response defined */
  defaultListItems?: RepositoryListItem[];
}

/**
 * Creates a mock implementation of the RepositoryListQueriesPort.
 *
 * @param options - Configuration options for the mock
 * @returns Mock implementation of RepositoryListQueriesPort
 */
export function createMockRepositoryListQueriesPort(
  options: MockRepositoryListQueriesOptions = {},
): RepositoryListQueriesPort {
  return {
    getAll: vi.fn().mockImplementation(async () => {
      // Check for error scenarios
      if (options.errorScenarios?.findAllError) {
        throw new Error("Failed to find all lists");
      }

      // Return custom response if provided
      if (options.responses?.findAll) {
        return options.responses.findAll;
      }

      // Return default lists if provided
      if (options.defaultLists) {
        return options.defaultLists;
      }

      // Return sample list as default
      return [sampleList];
    }),

    findById: vi.fn().mockImplementation(async (id: number) => {
      // Check for error scenarios
      if (options.errorScenarios?.findByIdErrors?.includes(id)) {
        throw new Error(`Failed to find list by id: ${id}`);
      }

      // Check for custom responses
      if (
        options.responses?.findById &&
        id.toString() in options.responses.findById
      ) {
        return options.responses.findById[id.toString()];
      }

      // Return default list if provided and matches id
      if (options.defaultLists) {
        const matchingList = options.defaultLists.find(
          (list) => list.id === id,
        );
        if (matchingList) {
          return matchingList;
        }
      }

      // Return sample list with updated id if id matches
      if (id === sampleList.id) {
        return sampleList;
      }

      // Return undefined if no match found
      return undefined;
    }),

    findBySourceType: vi.fn().mockImplementation(async (sourceType: string) => {
      // Check for error scenarios
      if (
        options.errorScenarios?.findBySourceTypeErrors?.includes(sourceType)
      ) {
        throw new Error(`Failed to find list by source type: ${sourceType}`);
      }

      // Check for custom responses
      if (
        options.responses?.findBySourceType &&
        sourceType in options.responses.findBySourceType
      ) {
        return options.responses.findBySourceType[sourceType];
      }

      // Return default list if provided and matches source type
      if (options.defaultLists) {
        const matchingList = options.defaultLists.find(
          (list) => list.sourceType === sourceType,
        );
        if (matchingList) {
          return matchingList;
        }
      }

      // Return undefined if no match found
      return undefined;
    }),

    findItem: vi
      .fn()
      .mockImplementation(async (listId: number, fullName: string) => {
        const key = `${listId}-${fullName}`;

        // Check for error scenarios
        if (options.errorScenarios?.findItemErrors?.includes(key)) {
          throw new Error(`Failed to find item: ${key}`);
        }

        // Check for custom responses
        if (options.responses?.findItem && key in options.responses.findItem) {
          return options.responses.findItem[key];
        }

        // Return default list item if provided and matches listId
        if (options.defaultListItems) {
          const matchingItem = options.defaultListItems.find(
            (item) => item.listId === listId && item.fullName === fullName,
          );
          if (matchingItem) {
            return matchingItem;
          }
        }

        // Return sample item if it matches
        const sampleItem = sampleListItems.find(
          (item) => item.listId === listId && item.fullName === fullName,
        );
        if (sampleItem) {
          return sampleItem;
        }

        // Return undefined if no match found
        return undefined;
      }),

    findItems: vi
      .fn()
      .mockImplementation(async (listIds?: number[], fullNames?: string[]) => {
        // Check for error scenarios for each listId if provided
        if (listIds && options.errorScenarios?.findItemsErrors) {
          for (const listId of listIds) {
            if (options.errorScenarios.findItemsErrors.includes(listId)) {
              throw new Error(`Failed to find items for list: ${listId}`);
            }
          }
        }

        // Filter based on input parameters
        let result: RepositoryListItem[] =
          options.defaultListItems || sampleListItems;

        if (listIds) {
          result = result.filter((item) => listIds.includes(item.listId));
        }

        if (fullNames) {
          result = result.filter((item) => fullNames.includes(item.fullName));
        }

        return result;
      }),

    findItemsByListWithRelations: vi
      .fn()
      .mockImplementation(async (listId: number) => {
        // Check for error scenarios
        if (options.errorScenarios?.findItemsByListErrors?.includes(listId)) {
          throw new Error(
            `Failed to find items with repository for list: ${listId}`,
          );
        }

        // Check for custom responses
        if (
          options.responses?.findItemsByListWithRelations &&
          listId.toString() in options.responses.findItemsByListWithRelations
        ) {
          return options.responses.findItemsByListWithRelations[
            listId.toString()
          ];
        }

        // Try to use default items if provided
        if (options.defaultListItems) {
          return options.defaultListItems.filter(
            (item) => item.listId === listId,
          );
        }

        // Return sample items for the list
        return sampleListItems.filter((item) => item.listId === listId);
      }),

    getItemCount: vi.fn().mockImplementation(async (listId: number) => {
      // Check for error scenarios
      if (options.errorScenarios?.getItemCountErrors?.includes(listId)) {
        throw new Error(`Failed to get item count for list: ${listId}`);
      }

      // Check for custom responses
      if (
        options.responses?.itemCounts &&
        listId.toString() in options.responses.itemCounts
      ) {
        return options.responses.itemCounts[listId.toString()];
      }

      // Count matching items in default list items if provided
      if (options.defaultListItems) {
        return options.defaultListItems.filter((item) => item.listId === listId)
          .length;
      }

      // Count matching items in sample list items
      return sampleListItems.filter((item) => item.listId === listId).length;
    }),
  };
}
