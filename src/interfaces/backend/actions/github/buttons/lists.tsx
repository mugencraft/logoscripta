import { Plus, Trash } from "lucide-react";

import type { RepositoryList } from "@/domain/models/github/repository-list";

import type { ActionConfig } from "@/ui/components/actions/types";

import { ListForm } from "../forms/ListForm";
import { useGithubActions } from "../useGithubActions";

export const getListsActions = (): ActionConfig<RepositoryList>[] => {
  const { handleDeleteList } = useGithubActions();

  return [
    {
      id: "create-List",
      label: "Create List",
      icon: Plus,
      contexts: ["view"],
      dialog: {
        title: "Create New List",
        content: ({ onSuccess, onCancel }) => (
          <ListForm mode="create" onSuccess={onSuccess} onCancel={onCancel} />
        ),
      },
    },
    {
      id: "delete-list",
      label: "Delete List",
      icon: Trash,
      variant: "destructive",
      contexts: ["row"],
      handler: handleDeleteList,
    },
  ];
};
