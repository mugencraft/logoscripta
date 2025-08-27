import type { NewTagSystem, TagSystem } from "@/domain/models/tagging/system";
import { trpc } from "@/interfaces/server-client";

import {
  type CrudActionsConfig,
  type EntityConfig,
  useCrudActions,
} from "../useCrudActions";

export function useTagSystemActions({
  isDetailView,
  callbacks = {},
}: CrudActionsConfig) {
  const mutations = {
    create: trpc.tagging.systems.create.useMutation(),
    update: trpc.tagging.systems.update.useMutation(),
    delete: trpc.tagging.systems.delete.useMutation(),
  };

  const config = {
    getDisplayName: (system: TagSystem) => `System "${system.name}"`,
    routes: {
      list: "/tagging/systems",
      shouldRedirect: isDetailView,
    },
  } satisfies EntityConfig<TagSystem>;

  const options = {
    messages: {
      delete: {
        success: (system: TagSystem) =>
          `System "${system.name}" and all its content deleted successfully`,
      },
    },
    beforeDelete: async (system: TagSystem) => {
      return confirm(
        `Are you sure you want to delete "${system.name}"? This will also delete all groups, categories, and tags in this system.`,
      );
    },
    afterCreate: async (_data: NewTagSystem, result: TagSystem) => {
      console.log(`Created system with ID: ${result.id}`);
    },
  };

  return useCrudActions<TagSystem, NewTagSystem>(
    mutations,
    config,
    options,
    callbacks,
  );
}
