import type { ContentItemWithTags } from "@/domain/models/content/types";

import type {
  CollectionStatistics,
  ContentSearchFilters,
} from "../../models/content/types";

export interface ContentQueriesPort {
  getCollectionStatistics(collectionId: number): Promise<CollectionStatistics>;

  // contentItems

  getItemWithTags(itemId: number): Promise<ContentItemWithTags | null>;

  getItemsForCollection(
    collectionId: number,
  ): Promise<ContentItemWithTags[] | null>;

  searchItems(filters: ContentSearchFilters): Promise<ContentItemWithTags[]>;

  getItemsByTags(
    collectionId: number,
    tagIds: number[],
    systemId?: number,
  ): Promise<ContentItemWithTags[]>;
}
