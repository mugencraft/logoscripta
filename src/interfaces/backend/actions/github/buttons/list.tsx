import { BookPlus, Pencil, RefreshCw, Trash } from "lucide-react";

import type { RepositoryListWithItemsAndRelations } from "@/domain/models/github/types";

import type { ActionConfig } from "@/ui/components/actions/types";

import { ListForm } from "../forms/ListForm";
import { RepositoryAdd } from "../forms/RepositoryAdd";
import { useGithubActions } from "../useGithubActions";
import { useRepositoryToggleActions } from "../useRepositoryToggleActions";

export const getListActions =
  (): ActionConfig<RepositoryListWithItemsAndRelations>[] => {
    const { handleDeleteList } = useGithubActions();
    const { handleSyncRepositoryData } = useRepositoryToggleActions();

    return [
      {
        id: "edit-list",
        label: "Edit",
        icon: Pencil,
        contexts: ["view"],
        dialog: {
          title: "Edit List Details",
          content: ({ data, onSuccess, onCancel }) =>
            data && (
              <ListForm
                data={data}
                onSuccess={onSuccess}
                onCancel={onCancel}
                mode="edit"
              />
            ),
        },
      },
      {
        id: "delete-list",
        label: "Delete",
        icon: Trash,
        variant: "destructive",
        contexts: ["view"],
        handler: async ({ data }) => {
          const result = await handleDeleteList({ data });
          if (result.success) {
            return Promise.resolve({ success: true, data });
          }
          return await Promise.resolve({ success: false });
        },
      },
      {
        id: "add-repositories",
        label: "Add",
        icon: BookPlus,
        contexts: ["view"],
        dialog: {
          title: "Add Repositories to List",
          content: ({ data, onSuccess, onCancel }) =>
            data && (
              <RepositoryAdd
                data={data}
                onSuccess={onSuccess}
                onCancel={onCancel}
              />
            ),
        },
      },
      {
        id: "sync-data",
        label: "Sync Repository Data",
        icon: RefreshCw,
        contexts: ["view"],
        handler: ({ data }) => {
          if (data?.items?.length) {
            handleSyncRepositoryData(
              data?.items?.map((item) => item.fullName),
              [data.id],
            );
          }
          return Promise.resolve({ success: true });
        },
      },
    ];
  };
