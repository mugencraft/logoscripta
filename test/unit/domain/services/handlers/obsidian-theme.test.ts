import { beforeEach, describe, expect, it } from "vitest";

import { ObsidianThemeHandler } from "@/domain/services/github/handlers/obsidian-theme";
import { RepositorySystemListService } from "@/domain/services/github/repository-list-system";

import { sampleObsidianTheme } from "test/fixtures/api-responses/obsidian";
import {
  sampleObsidianThemeChange,
  sampleObsidianThemeChangeNew,
  sampleObsidianThemeChangeSoft,
} from "test/fixtures/entities/changes-obsidian";
import { sampleRepository } from "test/fixtures/entities/repository";
import { sampleSystemList } from "test/fixtures/entities/repository-lists-system";
import { createMockRepositoryCommandsPort } from "test/mocks/domain/ports/repository/commands";
import { createMockRepositoryQueriesPort } from "test/mocks/domain/ports/repository/queries";
import { createMockRepositoryListCommandsPort } from "test/mocks/domain/ports/repository-list/commands";
import { createMockRepositoryListQueriesPort } from "test/mocks/domain/ports/repository-list/queries";

describe("ObsidianThemeHandler", () => {
  describe("initialization", () => {
    it("should throw error if system list is not set", async () => {
      const { sut } = createTestSetup();
      await expect(sut.handle(sampleObsidianThemeChange)).rejects.toThrow(
        "List not set",
      );
    });

    it("should throw error if system list is not found", async () => {
      const { sut } = createTestSetup({
        missingSystemList: true,
      });

      await expect(sut.setList("not-found-obsidian-theme")).rejects.toThrow();
    });
  });

  describe("handle", () => {
    let setup: ReturnType<typeof createTestSetup>;

    beforeEach(async () => {
      setup = createTestSetup();
      await setup.sut.setList("obsidian-theme");
    });

    it.skip("should handle full theme update with correct metadata structure", async () => {
      await setup.sut.handle(sampleObsidianThemeChange);

      expect(setup.mocks.repoQueries.findByName).toHaveBeenCalledWith(
        "test/obsidian-theme-repo",
      );
      expect(setup.mocks.listCommands.createItem).toHaveBeenCalledWith(
        expect.objectContaining({
          listId: expect.any(Number),
          fullName: "test/obsidian-theme-repo",
          repositoryId: expect.any(Number),
          metadata: expect.objectContaining({
            system: expect.objectContaining({
              systemType: "obsidian-theme",
              version: "1.0",
              createdAt: expect.any(String),
              updatedAt: sampleObsidianThemeChange.timestamp,
            }),
            theme: sampleObsidianTheme,
          }),
        }),
      );
    });

    it.skip("should handle soft update for existing theme", async () => {
      const setup = createTestSetup({
        withExistingItem: true,
      });

      await setup.sut.setList("obsidian-theme");
      await setup.sut.handle(sampleObsidianThemeChangeSoft);

      expect(setup.mocks.listCommands.updateItem).toHaveBeenCalledWith(
        expect.any(Number),
        "test/obsidian-theme-repo",
        expect.objectContaining({
          metadata: expect.objectContaining({
            system: expect.objectContaining({
              updatedAt: sampleObsidianThemeChangeSoft.timestamp,
            }),
          }),
        }),
      );
    });

    it("should throw error for missing repository", async () => {
      const { sut } = createTestSetup({
        repositoryNotFound: true,
      });
      await sut.setList("obsidian-theme");

      await expect(sut.handle(sampleObsidianThemeChangeNew)).rejects.toThrow();
    });

    it("should handle malformed repository paths", async () => {
      const invalidChange = {
        ...sampleObsidianThemeChange,
        id: "invalid-repo-path",
      };

      await expect(setup.sut.handle(invalidChange)).rejects.toThrow(
        /Invalid repository string/,
      );
    });

    it.skip("should create metadata with correct timestamps", async () => {
      const timestamp = "2024-01-02T00:00:00Z";
      const change = {
        ...sampleObsidianThemeChange,
        timestamp,
      };

      await setup.sut.handle(change);

      expect(setup.mocks.listCommands.createItem).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            system: expect.objectContaining({
              createdAt: expect.any(String),
              updatedAt: timestamp,
            }),
          }),
        }),
      );
    });
  });
});

type TestSetupOptions = {
  missingSystemList?: boolean;
  withExistingItem?: boolean;
  repositoryNotFound?: boolean;
};

function createTestSetup(
  options: TestSetupOptions = {
    missingSystemList: false,
    withExistingItem: false,
    repositoryNotFound: false,
  },
) {
  // Create mock ports
  const mockRepoCommands = createMockRepositoryCommandsPort();
  const mockRepoQueries = createMockRepositoryQueriesPort({
    responses: {
      findByName: options.repositoryNotFound
        ? {}
        : {
            "test/obsidian-theme-repo": sampleRepository,
            "test/new-theme-repo": sampleRepository,
          },
    },
    errorScenarios: {
      findByNameErrors: options.repositoryNotFound
        ? ["test/new-theme-repo"]
        : [],
    },
    defaultRepository: undefined,
  });

  const mockListCommands = createMockRepositoryListCommandsPort();
  const mockListQueries = createMockRepositoryListQueriesPort({
    responses: {
      findBySourceType: options.missingSystemList
        ? {
            "not-found-obsidian-theme": undefined,
          }
        : {
            "obsidian-theme": {
              ...sampleSystemList,
              sourceType: "obsidian-theme",
            },
            archived: {
              ...sampleSystemList,
              id: 2,
              sourceType: "archived",
            },
          },
      // findItem: options.withExistingItem
      // 	? {
      // 			[`${sampleSystemList.id}-test/obsidian-theme-repo`]: {
      // 				listId: sampleSystemList.id,
      // 				fullName: "test/obsidian-theme-repo",
      // 				repositoryId: sampleRepository.id,
      // 				metadata: {
      // 					system: {
      // 						systemType: "obsidian-theme",
      // 						version: "1.0",
      // 						createdAt: "2024-01-01T00:00:00Z",
      // 						updatedAt: "2024-01-01T00:00:00Z",
      // 					},
      // 					theme: sampleObsidianTheme,
      // 				},
      // 			},
      // 		}
      // 	: {},
    },
    errorScenarios: {
      findBySourceTypeErrors: options.missingSystemList
        ? ["not-found-obsidian-theme"]
        : [],
    },
  });

  // Create system list service
  const systemListService = new RepositorySystemListService(
    mockListCommands,
    mockListQueries,
  );

  // Create handler
  const sut = new ObsidianThemeHandler(
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
