import { Edit, Plus, Trash } from "lucide-react";

import type { TagCategory } from "@/domain/models/tagging/category";

import type { ActionConfig } from "@/ui/components/actions/types";

import { TagCategoryForm } from "../forms/TagCategoryForm";
import { useTagCategoryActions } from "../useTagCategoryActions";

export const getTagCategoriesActions = (
  isDetailView?: boolean,
): ActionConfig<TagCategory>[] => {
  const { handleDelete } = useTagCategoryActions({ isDetailView });
  return [
    {
      id: "create-category",
      label: "Create Category",
      icon: Plus,
      contexts: ["view"],
      dialog: {
        title: "Create New Category",
        content: ({ onSuccess, onCancel }) => (
          <TagCategoryForm
            mode="create"
            onSuccess={onSuccess}
            onCancel={onCancel}
          />
        ),
      },
    },
    {
      id: "edit-category",
      label: "Edit Category",
      icon: Edit,
      contexts: ["row", "selection"],
      dialog: {
        title: "Edit Category",
        content: ({ data, onSuccess, onCancel }) => (
          <TagCategoryForm
            mode="edit"
            data={data}
            onSuccess={onSuccess}
            onCancel={onCancel}
          />
        ),
      },
    },
    {
      id: "delete-category",
      label: "Delete Category",
      icon: Trash,
      variant: "destructive",
      contexts: ["row", "selection"],
      handler: handleDelete,
    },
  ];
};
