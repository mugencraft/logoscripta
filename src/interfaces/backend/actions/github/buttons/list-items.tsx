import { BookmarkMinus, BookmarkPlus, RefreshCw } from "lucide-react";

import type { RepositoryListItem } from "@/domain/models/github/repository-list";

import type { ActionConfig } from "@/ui/components/actions/types";

import { ToggleList } from "../forms/toggle-list/ToggleList";
import { useRepositoryToggleActions } from "../useRepositoryToggleActions";

export const getListItemsActions = (): ActionConfig<RepositoryListItem>[] => {
  const { handleSyncRepositoryData } = useRepositoryToggleActions();

  return [
    {
      id: "add-to-lists",
      label: "Add to Lists",
      icon: BookmarkPlus,
      contexts: ["selection"],
      dialog: {
        title: "Add to List",
        content: (props) => <ToggleList {...props} mode="add" />,
      },
    },
    {
      id: "remove-from-lists",
      label: "Remove from Lists",
      icon: BookmarkMinus,
      variant: "destructive",
      contexts: ["selection"],
      dialog: {
        title: "Remove from List",
        content: (props) => <ToggleList {...props} mode="remove" />,
      },
    },
    {
      id: "sync-data",
      label: "Sync Repository Data",
      icon: RefreshCw,
      contexts: ["selection"],
      handler: ({ selected }) => {
        if (selected?.length) {
          const listIds = [...new Set(selected.map((item) => item.listId))];
          handleSyncRepositoryData(
            selected.map((item) => item.fullName),
            listIds,
          );
        }
        return Promise.resolve({ success: true });
      },
    },
  ];
};
