import type { NewPOI, POI } from "@/domain/models/location/poi";
import { trpc } from "@/interfaces/server-client";

import {
  type CrudActionsConfig,
  type EntityConfig,
  useCrudActions,
} from "../useCrudActions";

export function usePOIActions({
  isDetailView,
  callbacks = {},
}: CrudActionsConfig) {
  const mutations = {
    create: trpc.location.pois.create.useMutation(),
    update: trpc.location.pois.update.useMutation(),
    delete: trpc.location.pois.delete.useMutation(),
  };

  const config = {
    getDisplayName: (poi: POI) => `POI "${poi.name}"`,
    routes: {
      list: "/location/pois",
      shouldRedirect: isDetailView,
    },
  } satisfies EntityConfig<POI>;

  const options = {
    beforeCreate: async (data: NewPOI) => {
      if (!data.communeCode) {
        throw new Error("Commune is required for POI creation");
      }
      if (!data.name?.trim()) {
        throw new Error("POI name is required");
      }
      return data;
    },

    beforeDelete: async (poi: POI) => {
      return confirm(`Are you sure you want to delete POI "${poi.name}"?`);
    },

    messages: {
      create: {
        success: (data: NewPOI) => `POI "${data.name}" created successfully`,
      },
      update: {
        success: (poi: POI) => `POI "${poi.name}" updated successfully`,
      },
      delete: {
        success: (poi: POI) => `POI "${poi.name}" deleted successfully`,
      },
    },
  };

  return useCrudActions(mutations, config, options, callbacks);
}
