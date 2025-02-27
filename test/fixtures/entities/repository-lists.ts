import type {
	RepositoryList,
	RepositoryListItem,
} from "@/domain/models/repository-list";

export const sampleList: RepositoryList = {
	id: 1,
	name: "Test List",
	description: "A test repository list",
	metadata: null,
	createdAt: new Date("2024-01-01"),
	readOnly: false,
	sourceType: "test",
	sourceVersion: "1.0",
};

// List Items

export const sampleListItem: RepositoryListItem = {
	listId: 1,
	fullName: "test/repo",
	repositoryId: 1,
	metadata: JSON.stringify({
		system: {
			systemType: "test",
			version: "1.0",
			createdAt: "2024-01-01T00:00:00Z",
			updatedAt: "2024-01-01T00:00:00Z",
		},
		metadataTypes: ["test"],
		testData: { key: "value" },
	}),
};

export const sampleListItems: RepositoryListItem[] = [
	sampleListItem,
	{
		...sampleListItem,
		repositoryId: 2,
		metadata: JSON.stringify({
			system: {
				systemType: "other",
				version: "1.0",
				createdAt: "2024-01-01T00:00:00Z",
			},
			metadataTypes: ["other-type"],
		}),
	},
];
