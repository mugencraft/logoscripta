import type {
  ContentCollection,
  NewContentCollection,
} from "@/domain/models/content/collection";
import { trpc } from "@/interfaces/server-client";

import type { ActionCallbacks } from "@/ui/components/actions/types";

import { useCrudActions } from "../useCrudActions";

export function useCollectionActions(callbacks: ActionCallbacks = {}) {
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
      detail: "/content/collections/$collectionId",
      idName: "collectionId",
    },
  };

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
