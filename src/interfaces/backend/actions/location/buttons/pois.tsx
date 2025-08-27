import { Edit, MapPin, Trash } from "lucide-react";

import type { POI } from "@/domain/models/location/poi";

import type { ActionConfig } from "@/ui/components/actions/types";

import { POIForm } from "../forms/POIForm";
import { usePOIActions } from "../usePOIActions";

export const getPOIActions = (isDetailView?: boolean): ActionConfig<POI>[] => {
  const { handleDelete } = usePOIActions({ isDetailView });

  return [
    {
      id: "create-poi",
      label: "Add POI",
      icon: MapPin,
      contexts: ["view"],
      dialog: {
        title: "Add New Point of Interest",
        content: ({ onSuccess, onCancel }) => (
          <POIForm mode="create" onSuccess={onSuccess} onCancel={onCancel} />
        ),
      },
    },
    {
      id: "edit-poi",
      label: "Edit POI",
      icon: Edit,
      contexts: ["row", "selection"],
      dialog: {
        title: "Edit Point of Interest",
        content: ({ data, onSuccess, onCancel }) => (
          <POIForm
            mode="edit"
            data={data}
            onSuccess={onSuccess}
            onCancel={onCancel}
          />
        ),
      },
    },
    {
      id: "delete-poi",
      label: "Delete POI",
      icon: Trash,
      variant: "destructive",
      contexts: ["row", "selection"],
      handler: handleDelete,
    },
  ];
};
