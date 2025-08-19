import type { ItemDetailLink } from "@/domain/models/content/types";

export const getItemDetailLink: ItemDetailLink = (item, linkToCollection) => {
  if (linkToCollection) {
    return `/content/collections/${item.collectionId}/items/${item.id}`;
  }
  return `/content/items/${item.id}`;
};
