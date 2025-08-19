import { Edit, Plus, Trash } from "lucide-react";

import type { TagSystem } from "@/domain/models/tagging/system";

import type { ActionConfig } from "@/ui/components/actions/types";

import { TagSystemForm } from "../forms/TagSystemForm";
import { useTagSystemActions } from "../useTagSystemActions";

export const getTagSystemActions = (): ActionConfig<TagSystem>[] => {
  const { handleDelete } = useTagSystemActions();
  return [
    {
      id: "create-system",
      label: "Create System",
      icon: Plus,
      contexts: ["view"],
      dialog: {
        title: "Create New Tag System",
        content: ({ onSuccess, onCancel }) => (
          <TagSystemForm
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
      contexts: ["row"],
      dialog: {
        title: "Edit Tag System",
        content: ({ data, onSuccess, onCancel }) => (
          <TagSystemForm
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
