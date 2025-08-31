import type { ContentItemWithRelations } from "@/domain/models/content/types";

import type {
  CollectionStatistics,
  ContentSearchFilters,
} from "../../models/content/types";

export interface ContentQueriesPort {
  getCollectionStatistics(collectionId: number): Promise<CollectionStatistics>;

  // contentItems

  getItemWithRelations(itemId: number): Promise<ContentItemWithRelations>;

  getItemsForCollection(
    collectionId: number,
  ): Promise<ContentItemWithRelations[]>;

  searchItems(
    filters: ContentSearchFilters,
  ): Promise<ContentItemWithRelations[]>;

  getItemsByTags(
    collectionId: number,
    tagIds: number[],
    systemId?: number,
  ): Promise<ContentItemWithRelations[]>;
}
