import { Edit, Plus, Trash } from "lucide-react";

import type { Tag } from "@/domain/models/tagging/tag";

import type { ActionConfig } from "@/ui/components/actions/types";

import { TagForm } from "../forms/TagForm";
import { useTagActions } from "../useTagActions";

export const getTagsActions = (isDetailView?: boolean): ActionConfig<Tag>[] => {
  const { handleDelete } = useTagActions({ isDetailView });
  return [
    {
      id: "create-tag",
      label: "Create Tag",
      icon: Plus,
      contexts: ["view"],
      dialog: {
        title: "Create New Tag",
        content: ({ onSuccess, onCancel }) => (
          <TagForm mode="create" onSuccess={onSuccess} onCancel={onCancel} />
        ),
      },
    },
    {
      id: "edit-tag",
      label: "Edit Tag",
      icon: Edit,
      contexts: ["row", "selection"],
      dialog: {
        title: "Edit Tag",
        content: ({ data, onSuccess, onCancel }) => (
          <TagForm
            mode="edit"
            data={data}
            onSuccess={onSuccess}
            onCancel={onCancel}
          />
        ),
      },
    },
    {
      id: "delete-tag",
      label: "Delete Tag",
      icon: Trash,
      variant: "destructive",
      contexts: ["row", "selection"],
      handler: handleDelete,
    },
  ];
};
