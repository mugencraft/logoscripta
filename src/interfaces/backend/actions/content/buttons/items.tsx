import { Edit, Plus, TicketX, Trash } from "lucide-react";

import type { ContentItem } from "@/domain/models/content/item";

import type { ActionConfig } from "@/ui/components/actions/types";

import { ItemForm } from "../forms/ItemForm";
import { useItemActions } from "../useItemActions";

export const getItemsActions = (
  isDetailView?: boolean,
): ActionConfig<ContentItem>[] => {
  const { handleDelete } = useItemActions({ isDetailView });
  return [
    {
      id: "create-item",
      label: "Create Item",
      icon: Plus,
      contexts: ["view"],
      dialog: {
        title: "Create New Item",
        content: ({ onSuccess, onCancel }) => (
          <ItemForm mode="create" onSuccess={onSuccess} onCancel={onCancel} />
        ),
      },
    },
    {
      id: "edit-item",
      label: "Edit Item",
      icon: Edit,
      contexts: ["row", "selection"],
      dialog: {
        title: "Edit Item",
        content: ({ data, onSuccess, onCancel }) => (
          <ItemForm
            mode="edit"
            data={data}
            onSuccess={onSuccess}
            onCancel={onCancel}
          />
        ),
      },
    },
    {
      id: "remove-duplicate-tags",
      label: "Remove Duplicate Tags",
      icon: TicketX,
      variant: "outline",
      contexts: ["selection"],
      // handler: handleRemoveDuplicateTags,
    },
    {
      id: "delete-item",
      label: "Delete Item",
      icon: Trash,
      variant: "destructive",
      contexts: ["row", "selection"],
      handler: handleDelete,
    },
  ];
};
