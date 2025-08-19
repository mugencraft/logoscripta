import type { NewTagGroup, TagGroup } from "@/domain/models/tagging/group";
import { trpc } from "@/interfaces/server-client";

import type { ActionCallbacks } from "@/ui/components/actions/types";

import { useCrudActions } from "../useCrudActions";

export function useTagGroupActions(callbacks: ActionCallbacks = {}) {
  const mutations = {
    create: trpc.tagging.groups.create.useMutation(),
    update: trpc.tagging.groups.update.useMutation(),
    delete: trpc.tagging.groups.delete.useMutation(),
  };

  const config = {
    getDisplayName: (group: TagGroup) => `Group "${group.name}"`,
    routes: {
      list: "/tagging/groups",
      detail: "/tagging/groups/$groupId",
      idName: "groupId",
    },
  };

  const options = {
    beforeCreate: async (data: NewTagGroup) => {
      if (!data.systemId) {
        throw new Error("System ID is required for group creation");
      }
      return data;
    },
  };

  return useCrudActions<TagGroup, NewTagGroup>(
    mutations,
    config,
    options,
    callbacks,
  );
}
