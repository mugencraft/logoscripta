import type { ArchivedMetadata } from "@/domain/value-objects/metadata/archived";
import type {
	BaseSystemMetadata,
	ListItemMetadata,
} from "@/domain/value-objects/metadata/base";
import { sampleSystemListItem } from "./repository-lists-system";

const sampleSystemMetadata: BaseSystemMetadata = {
	systemType: "test-system",
	version: "1.0",
	createdAt: "2024-01-01T00:00:00Z",
};

export const sampleListMetadata: ListItemMetadata = {
	system: {
		...sampleSystemMetadata,
		systemType: "test",
	},
	metadataTypes: ["test-system"],
	testData: { key: "value" },
};

export const sampleArchivedMetadata: ArchivedMetadata = {
	reason: "Test removal",
	removedAt: "2024-01-02T00:00:00Z",
	sourceType: "test-system",
	listId: 1,
	fullName: "test/repo",
};
