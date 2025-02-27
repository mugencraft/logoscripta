import type { RepositoryListItem } from "@/domain/models/repository-list";
import type {
	BaseSystemMetadata,
	ListItemMetadata,
} from "@/domain/value-objects/metadata/base";

export interface ArchivedMetadata {
	reason: string;
	removedAt: string;
	sourceType: string;
	listId: number;
	fullName: string;
	originalItem?: RepositoryListItem;
}

export interface ArchivedListItemMetadata extends ListItemMetadata {
	system: BaseSystemMetadata & {
		systemType: "archived";
	};
	metadataTypes: ["archived"];
	archived: ArchivedMetadata;
}
