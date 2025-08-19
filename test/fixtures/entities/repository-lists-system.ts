import type {
  RepositoryList,
  RepositoryListItem,
} from "@/domain/models/github/repository-list";

// test-system

const metadata: RepositoryList["metadata"] = {
  system: {
    systemType: "test-system",
    version: "1.0",
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z"),
  },
  user: {},
  import: {
    source: "import",
    importedAt: new Date("2024-01-01T00:00:00Z"),
    lastSyncAt: new Date("2024-01-01T00:00:00Z"),
    stats: {
      totalFiles: 1,
      processedFiles: 1,
      errors: [],
    },
  },
};

export const sampleSystemList: RepositoryList = {
  id: 101,
  name: "Test System List",
  description: "A test system repository list",
  metadata,
  readOnly: true,
  sourceType: "test-system",
  sourceVersion: "1.0",
};

export const sampleSystemListItem: RepositoryListItem = {
  listId: 1,
  fullName: "test/repo",
  repositoryId: 1,
  metadata,
};

// archived

export const sampleArchivedList: RepositoryList = {
  id: 2,
  name: "Archived List",
  description: "Archive for removed items",
  metadata,
  readOnly: true,
  sourceType: "archived",
  sourceVersion: "1.0",
};
