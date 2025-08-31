import { Edit, Plus, Trash } from "lucide-react";

import type { TaxonomySystem } from "@/domain/models/taxonomy/system";
import { TaxonomySystemForm } from "@/interfaces/backend/actions/taxonomy/forms/TaxonomySystemForm";
import { useSystemActions } from "@/interfaces/backend/actions/taxonomy/useSystemActions";

import type { ActionConfig } from "@/ui/components/actions/types";

export const getSystemsActions = (
  isDetailView = false,
): ActionConfig<TaxonomySystem>[] => {
  const { handleDelete } = useSystemActions({ isDetailView });

  return [
    {
      id: "create-system",
      label: "Create System",
      icon: Plus,
      contexts: ["view"],
      dialog: {
        title: "Create New Taxonomy System",
        content: ({ onSuccess, onCancel }) => (
          <TaxonomySystemForm
            mode="create"
            onSuccess={onSuccess}
            onCancel={onCancel}
          />
        ),
      },
    },
    {
      id: "edit-system",
      label: "Edit System",
      icon: Edit,
      contexts: ["row", "selection"],
      dialog: {
        title: "Edit Taxonomy System",
        content: ({ data, onSuccess, onCancel }) => (
          <TaxonomySystemForm
            mode="edit"
            data={data}
            onSuccess={onSuccess}
            onCancel={onCancel}
          />
        ),
      },
    },
    {
      id: "delete-system",
      label: "Delete System",
      icon: Trash,
      variant: "destructive",
      contexts: ["row", "selection"],
      handler: handleDelete,
    },
  ];
};
