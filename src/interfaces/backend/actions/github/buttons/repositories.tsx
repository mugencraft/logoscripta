import { RefreshCw } from "lucide-react";

import type { Repository } from "@/domain/models/github/repository";
import { useRepositoryToggleActions } from "@/interfaces/backend/actions/github/useRepositoryToggleActions";

import type { ActionConfig } from "@/ui/components/actions/types";

export const getRepositoryActions = (): ActionConfig<Repository>[] => {
  const { handleSaveRepository, handleSyncRepositoryData } =
    useRepositoryToggleActions();

  return [
    {
      id: "refresh",
      label: "Refresh Repository Data",
      icon: RefreshCw,
      contexts: ["selection"],
      handler: ({ selected }) => {
        if (selected?.length) {
          handleSaveRepository(selected.map((repo) => repo.fullName));
        }
        return Promise.resolve({ success: true });
      },
    },
    {
      id: "sync-data",
      label: "Sync Repository Data",
      icon: RefreshCw,
      contexts: ["selection"],
      handler: ({ selected }) => {
        if (selected?.length) {
          handleSyncRepositoryData(selected.map((repo) => repo.fullName));
        }
        return Promise.resolve({ success: true });
      },
    },
  ];
};
