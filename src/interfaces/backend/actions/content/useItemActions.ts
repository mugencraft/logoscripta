import type { ContentItem, NewContentItem } from "@/domain/models/content/item";
import { trpc } from "@/interfaces/server-client";

import {
  type CrudActionsConfig,
  type EntityConfig,
  useCrudActions,
} from "../useCrudActions";

export function useItemActions({
  isDetailView,
  callbacks = {},
}: CrudActionsConfig) {
  const mutations = {
    create: trpc.content.items.create.useMutation(),
    update: trpc.content.items.update.useMutation(),
    delete: trpc.content.items.delete.useMutation(),
  };

  const config = {
    getDisplayName: (item: ContentItem) =>
      `Item "${item.title || item.identifier}"`,
    routes: {
      list: "/content/items",
      shouldRedirect: isDetailView,
    },
  } satisfies EntityConfig<ContentItem>;

  const options = {
    beforeCreate: async (data: NewContentItem) => {
      // Custom validation or data processing
      if (!data.collectionId) {
        throw new Error("Collection ID is required for item creation");
      }
      if (!data.identifier) {
        throw new Error("Identifier is required for item creation");
      }
      return data;
    },
    beforeDelete: async (item: ContentItem) => {
      // Custom confirmation logic
      return confirm(
        `Are you sure you want to delete "${item.title || item.identifier}"? This will also remove all associated tags.`,
      );
    },
    messages: {
      create: {
        success: (data: NewContentItem) =>
          `Item "${data.title || data.identifier}" created successfully`,
      },
      delete: {
        success: (item: ContentItem) =>
          `Item "${item.title || item.identifier}" and all its tags deleted successfully`,
      },
    },
  };

  return useCrudActions(mutations, config, options, callbacks);
}
