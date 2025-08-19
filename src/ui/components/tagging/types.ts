import type {
  ContentItemWithTags,
  ItemTagOperations,
} from "@/domain/models/content/types";
import type { TagGroup } from "@/domain/models/tagging/group";
import type { Tag } from "@/domain/models/tagging/tag";
import type {
  TagCategoryWithTags,
  TagLayout,
} from "@/domain/models/tagging/types";

// Base interface for tag operations
interface BaseTaggingProps {
  item: ContentItemWithTags;
  systemId: number;
  selectedSystemTags: Tag[];
  toggleSystemTag: ItemTagOperations["toggleSystemTag"];
}

// Extended for category-specific props
export interface CategoryTaggingProps extends BaseTaggingProps {
  category: TagCategoryWithTags;
  layout?: TagLayout;
}

// Extended for section-specific props
export interface CategorySectionProps extends BaseTaggingProps {
  title: string;
  categories: TagCategoryWithTags[];
  layout?: TagLayout;
}

// Group renderer props
export interface TagGroupManagerProps extends BaseTaggingProps {
  group: TagGroup;
  categories: TagCategoryWithTags[];
}
