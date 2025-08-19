import type {
  ContentCollection,
  NewContentCollection,
} from "../../models/content/collection";
import type { ContentItem, NewContentItem } from "../../models/content/item";
import type {
  ContentItemTag,
  NewContentItemTag,
} from "../../models/content/item-tag";
import type { TagSource } from "../../models/tagging/types";

export interface ContentCommandsPort {
  createCollection(data: NewContentCollection): Promise<ContentCollection>;

  updateCollection(
    id: number,
    data: Partial<ContentCollection>,
  ): Promise<ContentCollection>;

  deleteCollection(id: number): Promise<void>;

  createItem(data: NewContentItem): Promise<ContentItem>;

  updateItem(id: number, data: Partial<ContentItem>): Promise<ContentItem>;

  deleteItem(id: number): Promise<void>;

  tagItem(data: NewContentItemTag): Promise<ContentItemTag>;

  removeTagFromItem(itemId: number, tagId: number): Promise<void>;

  updateItemTag(
    itemId: number,
    tagId: number,
    updates: { source?: TagSource },
  ): Promise<ContentItemTag>;

  bulkTagItems(items: NewContentItemTag[]): Promise<ContentItemTag[]>;
}
