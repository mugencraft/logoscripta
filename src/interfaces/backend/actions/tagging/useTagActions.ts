import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";

import type {
  NewTag,
  NewTagCategoryAssociation,
  NewTagRelationship,
  Tag,
} from "@/domain/models/tagging/tag";
import { trpc } from "@/interfaces/server-client";

import {
  type CrudActionsConfig,
  type EntityConfig,
  useCrudActions,
} from "../useCrudActions";

export function useTagActions({
  isDetailView,
  callbacks = {},
}: CrudActionsConfig) {
  const router = useRouter();
  const mutations = {
    create: trpc.tagging.tags.create.useMutation(),
    update: trpc.tagging.tags.update.useMutation(),
    delete: trpc.tagging.tags.delete.useMutation(),
  };

  const createRelationshipMutation =
    trpc.tagging.tags.createRelationship.useMutation();

  const deleteRelationshipMutation =
    trpc.tagging.tags.deleteRelationship.useMutation();

  const createAssociationMutation =
    trpc.tagging.tags.createAssociation.useMutation();

  const deleteAssociationMutation =
    trpc.tagging.tags.deleteAssociation.useMutation();

  const config = {
    getDisplayName: (tag: Tag) => `Tag "${tag.name}"`,
    routes: {
      list: "/tagging/tags",
      shouldRedirect: isDetailView,
    },
  } satisfies EntityConfig<Tag>;

  const options = {
    beforeCreate: async (data: NewTag) => {
      if (!data.systemId) {
        throw new Error("System ID is required for tag creation");
      }
      return data;
    },
    beforeDelete: async (tag: Tag) => {
      return confirm(
        `Are you sure you want to delete "${tag.name}"? This will remove it from all tagged items.`,
      );
    },
    messages: {
      delete: {
        success: (tag: Tag) =>
          `Tag "${tag.name}" deleted and removed from all items`,
      },
    },
  };

  const handleCreateRelationship = async ({
    data,
  }: {
    data: NewTagRelationship;
  }) => {
    if (!data) {
      toast.error("No data provided");
      return { success: false };
    }
    try {
      const result = await createRelationshipMutation.mutateAsync(data);
      toast.success("Relationship created successfully");
      await router.invalidate();
      callbacks.onSuccess?.();
      return { success: true, data: result };
    } catch (error: unknown) {
      toast.error(
        `Failed to create relationship: ${error instanceof Error ? error.message : error}`,
      );
      return { success: false };
    }
  };

  const handleDeleteRelationship = async ({
    data,
  }: {
    data: NewTagRelationship;
  }) => {
    try {
      const result = await deleteRelationshipMutation.mutateAsync(data);
      await router.invalidate();
      callbacks.onSuccess?.();
      return { success: true, data: result };
    } catch (error: unknown) {
      toast.error(
        `Failed to delete relationship: ${error instanceof Error ? error.message : error}`,
      );
      return { success: false };
    }
  };

  const handleCreateAssociation = async ({
    data,
  }: {
    data: NewTagCategoryAssociation;
  }) => {
    if (!data) {
      toast.error("No data provided");
      return { success: false };
    }
    try {
      const result = await createAssociationMutation.mutateAsync(data);
      toast.success("Association created successfully");
      await router.invalidate();
      callbacks.onSuccess?.();
      return { success: true, data: result };
    } catch (error: unknown) {
      toast.error(
        `Failed to create association: ${error instanceof Error ? error.message : error}`,
      );
      return { success: false };
    }
  };

  const handleDeleteAssociation = async ({
    data,
  }: {
    data: NewTagCategoryAssociation;
  }) => {
    if (!data) {
      toast.error("No data provided");
      return { success: false };
    }
    try {
      const result = await deleteAssociationMutation.mutateAsync(data);
      toast.success("Association deleted successfully");
      await router.invalidate();
      callbacks.onSuccess?.();
      return { success: true, data: result };
    } catch (error: unknown) {
      toast.error(
        `Failed to delete association: ${error instanceof Error ? error.message : error}`,
      );
      return { success: false };
    }
  };

  return {
    ...useCrudActions<Tag, NewTag>(mutations, config, options, callbacks),
    handleCreateRelationship,
    handleDeleteRelationship,
    handleCreateAssociation,
    handleDeleteAssociation,
  };
}
