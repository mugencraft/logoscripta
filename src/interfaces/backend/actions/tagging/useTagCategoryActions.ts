import type {
  NewTagCategory,
  TagCategory,
} from "@/domain/models/tagging/category";
import { trpc } from "@/interfaces/server-client";

import type { ActionCallbacks } from "@/ui/components/actions/types";

import { useCrudActions } from "../useCrudActions";

export function useTagCategoryActions(callbacks: ActionCallbacks = {}) {
  const mutations = {
    create: trpc.tagging.categories.create.useMutation(),
    update: trpc.tagging.categories.update.useMutation(),
    delete: trpc.tagging.categories.delete.useMutation(),
  };
  const config = {
    getDisplayName: (category: TagCategory) => `Category "${category.name}"`,
    routes: {
      list: "/tagging/categories",
      detail: "/tagging/categories/$categoryId",
      idName: "categoryId",
    },
  };

  const options = {
    beforeCreate: async (data: NewTagCategory) => {
      if (!data.groupId) {
        throw new Error("Group ID is required for category creation");
      }
      return data;
    },
    beforeDelete: async (category: TagCategory) => {
      return confirm(
        `Are you sure you want to delete "${category.name}"? This will also affect all tags in this category.`,
      );
    },
  };

  return useCrudActions<TagCategory, NewTagCategory>(
    mutations,
    config,
    options,
    callbacks,
  );
}
