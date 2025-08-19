import { Edit, Plus, Trash } from "lucide-react";

import type { ContentCollection } from "@/domain/models/content/collection";

import type { ActionConfig } from "@/ui/components/actions/types";

import { CollectionForm } from "../forms/CollectionForm";
import { useCollectionActions } from "../useCollectionActions";

export const getCollectionsActions = (): ActionConfig<ContentCollection>[] => {
  const { handleDelete } = useCollectionActions();
  return [
    {
      id: "create-collection",
      label: "Create Collection",
      icon: Plus,
      contexts: ["view"],
      dialog: {
        title: "Create New Collection",
        content: ({ onSuccess, onCancel }) => (
          <CollectionForm
            mode="create"
            onSuccess={onSuccess}
            onCancel={onCancel}
          />
        ),
      },
    },
    {
      id: "edit-collection",
      label: "Edit Collection",
      icon: Edit,
      contexts: ["row", "selection"],
      dialog: {
        title: "Edit Collection",
        content: ({ data, onSuccess, onCancel }) => (
          <CollectionForm
            mode="edit"
            data={data}
            onSuccess={onSuccess}
            onCancel={onCancel}
          />
        ),
      },
    },
    {
      id: "delete-collection",
      label: "Delete Collection",
      icon: Trash,
      variant: "destructive",
      contexts: ["row", "selection"],
      handler: handleDelete,
    },
  ];
};
