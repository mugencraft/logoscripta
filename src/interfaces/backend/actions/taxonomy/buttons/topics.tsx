import { Edit, Plus, Trash } from "lucide-react";

import type { TaxonomyTopic } from "@/domain/models/taxonomy/topic";
import { TopicForm } from "@/interfaces/backend/actions/taxonomy/forms/TopicForm";
import { useTopicActions } from "@/interfaces/backend/actions/taxonomy/useTopicActions";

import type { ActionConfig } from "@/ui/components/actions/types";

export const getTopicsActions = (
  isDetailView?: boolean,
): ActionConfig<TaxonomyTopic>[] => {
  const { handleDelete } = useTopicActions({ isDetailView });

  return [
    {
      id: "create-topic",
      label: "Create Topic",
      icon: Plus,
      contexts: ["view"],
      dialog: {
        title: "Create New Topic",
        content: ({ onSuccess, onCancel }) => (
          <TopicForm mode="create" onSuccess={onSuccess} onCancel={onCancel} />
        ),
      },
    },
    {
      id: "edit-topic",
      label: "Edit Topic",
      icon: Edit,
      contexts: ["row", "selection"],
      dialog: {
        title: "Edit Topic",
        content: ({ data, onSuccess, onCancel }) => (
          <TopicForm
            mode="edit"
            data={data}
            onSuccess={onSuccess}
            onCancel={onCancel}
          />
        ),
      },
    },
    {
      id: "delete-topic",
      label: "Delete Topic",
      icon: Trash,
      variant: "destructive",
      contexts: ["row", "selection"],
      handler: handleDelete,
    },
  ];
};
