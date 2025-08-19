import type {
  ArchivedListItemMetadata,
  RepositoryListItemMetadata,
  RepositoryListMetadata,
} from "@/domain/validation/github/repository-list";
import type { SystemMetadata } from "@/domain/validation/shared";

const sampleSystemMetadata: SystemMetadata = {
  systemType: "test-system",
  version: "1.0",
  createdAt: new Date("2024-01-01T00:00:00Z"),
};

export const sampleListMetadata: RepositoryListMetadata = {
  system: {
    ...sampleSystemMetadata,
    systemType: "test",
  },
};

export const sampleListItemMetadata: RepositoryListItemMetadata = {
  system: {
    ...sampleSystemMetadata,
    systemType: "test",
  },
};

export const sampleArchivedMetadata: ArchivedListItemMetadata["archived"] = {
  reason: "Test removal",
  removedAt: new Date("2024-01-02T00:00:00Z"),
  sourceType: "test-system",
  listId: 1,
  fullName: "test/repo",
};
