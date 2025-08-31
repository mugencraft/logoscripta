import type {
  NewTaxonomySystem,
  TaxonomySystem,
} from "@/domain/models/taxonomy/system";
import { trpc } from "@/interfaces/server-client";

import {
  type CrudActionsConfig,
  type EntityConfig,
  useCrudActions,
} from "../useCrudActions";

export function useSystemActions({
  isDetailView,
  callbacks = {},
}: CrudActionsConfig) {
  const mutations = {
    create: trpc.taxonomy.systems.create.useMutation(),
    update: trpc.taxonomy.systems.update.useMutation(),
    delete: trpc.taxonomy.systems.delete.useMutation(),
  };

  const config = {
    getDisplayName: (system: TaxonomySystem) =>
      `Taxonomy System "${system.name}"`,
    routes: {
      list: "/taxonomy",
      shouldRedirect: isDetailView,
    },
  } satisfies EntityConfig<TaxonomySystem>;

  const options = {
    beforeDelete: async (system: TaxonomySystem) => {
      // Warn about cascade deletion of all topics and assignments
      return confirm(
        `Are you sure you want to delete "${system.name}"? This will permanently delete ALL topics in this system and their content assignments. This action cannot be undone.`,
      );
    },
    messages: {
      create: {
        success: (data: NewTaxonomySystem) =>
          `Taxonomy system "${data.name}" created successfully`,
      },
      delete: {
        success: (system: TaxonomySystem) =>
          `Taxonomy system "${system.name}" and all its data deleted successfully`,
      },
    },
  };

  return useCrudActions<TaxonomySystem, NewTaxonomySystem>(
    mutations,
    config,
    options,
    callbacks,
  );
}
