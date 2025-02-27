import type {
	RepositoryList,
	RepositoryListItem,
} from "@/domain/models/repository-list";

// test-system

export const sampleSystemList: RepositoryList = {
	id: 101,
	name: "Test System List",
	description: "A test system repository list",
	metadata: null,
	createdAt: new Date("2024-01-01"),
	readOnly: true,
	sourceType: "test-system",
	sourceVersion: "1.0",
};

export const sampleSystemListItem: RepositoryListItem = {
	listId: 1,
	fullName: "test/repo",
	repositoryId: 1,
	metadata: JSON.stringify({
		system: {
			systemType: "test-system",
			version: "1.0",
			createdAt: "2024-01-01T00:00:00Z",
			updatedAt: "2024-01-01T00:00:00Z",
		},
		metadataTypes: ["test-system"],
		testData: { key: "value" },
	}),
};

// archived

export const sampleArchivedList: RepositoryList = {
	id: 2,
	name: "Archived List",
	description: "Archive for removed items",
	metadata: null,
	createdAt: new Date("2024-01-01"),
	readOnly: true,
	sourceType: "archived",
	sourceVersion: "1.0",
};
