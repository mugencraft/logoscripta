import type {
  NewTaxonomyTopic,
  TaxonomyTopic,
} from "@/domain/models/taxonomy/topic";
import { trpc } from "@/interfaces/server-client";

import {
  type CrudActionsConfig,
  type EntityConfig,
  useCrudActions,
} from "../useCrudActions";

export function useTopicActions({
  isDetailView,
  callbacks = {},
}: CrudActionsConfig) {
  const mutations = {
    create: trpc.taxonomy.topics.create.useMutation(),
    update: trpc.taxonomy.topics.update.useMutation(),
    delete: trpc.taxonomy.topics.delete.useMutation(),
  };

  const config = {
    getDisplayName: (topic: TaxonomyTopic) => `Topic "${topic.name}"`,
    routes: {
      list: "/taxonomy",
      shouldRedirect: isDetailView,
    },
  } satisfies EntityConfig<TaxonomyTopic>;

  const options = {
    beforeDelete: async (topic: TaxonomyTopic) => {
      // Check if topic has children before deletion
      return confirm(
        `Are you sure you want to delete "${topic.name}"? This will also move any child topics to the parent level.`,
      );
    },
    messages: {
      create: {
        success: (data: NewTaxonomyTopic) =>
          `Topic "${data.name}" created successfully`,
      },
      delete: {
        success: (topic: TaxonomyTopic) =>
          `Topic "${topic.name}" and all its assignments deleted successfully`,
      },
    },
  };

  return useCrudActions<TaxonomyTopic, NewTaxonomyTopic>(
    mutations,
    config,
    options,
    callbacks,
  );
}
