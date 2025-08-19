import type {
  RepositoryList,
  RepositoryListItem,
} from "@/domain/models/github/repository-list";

const metadata: RepositoryListItem["metadata"] = {
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

export const sampleList: RepositoryList = {
  id: 1,
  name: "Test List",
  description: "A test repository list",
  metadata,
  readOnly: false,
  sourceType: "test",
  sourceVersion: "1.0",
};

// List Items

export const sampleListItem: RepositoryListItem = {
  listId: 1,
  fullName: "test/repo",
  repositoryId: 1,
  metadata,
};

export const sampleListItems: RepositoryListItem[] = [
  sampleListItem,
  {
    ...sampleListItem,
    repositoryId: 2,
    metadata,
  },
];
