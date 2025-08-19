import { Edit, Plus, Trash } from "lucide-react";

import type { TagGroup } from "@/domain/models/tagging/group";

import type { ActionConfig } from "@/ui/components/actions/types";

import { TagGroupForm } from "../forms/TagGroupForm";
import { useTagGroupActions } from "../useTagGroupActions";

export const getTagGroupsActions = (): ActionConfig<TagGroup>[] => {
  const { handleDelete } = useTagGroupActions();
  return [
    {
      id: "create-group",
      label: "Create Group",
      icon: Plus,
      contexts: ["view"],
      dialog: {
        title: "Create New Group",
        content: ({ onSuccess, onCancel }) => (
          <TagGroupForm
            mode="create"
            onSuccess={onSuccess}
            onCancel={onCancel}
          />
        ),
      },
    },
    {
      id: "edit-group",
      label: "Edit Group",
      icon: Edit,
      contexts: ["row", "selection"],
      dialog: {
        title: "Edit Group",
        content: ({ data, onSuccess, onCancel }) => (
          <TagGroupForm
            mode="edit"
            data={data}
            onSuccess={onSuccess}
            onCancel={onCancel}
          />
        ),
      },
    },
    {
      id: "delete-group",
      label: "Delete Group",
      icon: Trash,
      variant: "destructive",
      contexts: ["row", "selection"],
      handler: handleDelete,
    },
  ];
};
