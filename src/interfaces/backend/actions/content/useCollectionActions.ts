import type {
  ContentCollection,
  NewContentCollection,
} from "@/domain/models/content/collection";
import { trpc } from "@/interfaces/server-client";

import {
  type CrudActionsConfig,
  type EntityConfig,
  useCrudActions,
} from "../useCrudActions";

export function useCollectionActions({
  isDetailView,
  callbacks = {},
}: CrudActionsConfig) {
  const mutations = {
    create: trpc.content.collections.create.useMutation(),
    update: trpc.content.collections.update.useMutation(),
    delete: trpc.content.collections.delete.useMutation(),
  };

  const config = {
    getDisplayName: (collection: ContentCollection) =>
      `Collection "${collection.name}"`,
    routes: {
      list: "/content/collections",
      shouldRedirect: isDetailView,
    },
  } satisfies EntityConfig<ContentCollection>;

  const options = {
    beforeDelete: async (collection: ContentCollection) => {
      return confirm(`Are you sure you want to delete "${collection.name}"?`);
    },
    messages: {
      create: {
        success: (data: NewContentCollection) =>
          `Collection "${data.name}" created successfully`,
      },
    },
  };

  return useCrudActions<ContentCollection, NewContentCollection>(
    mutations,
    config,
    options,
    callbacks,
  );
}
