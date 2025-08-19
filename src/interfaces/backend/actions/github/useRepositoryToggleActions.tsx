import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";

import type { RepositoryListItem } from "@/domain/models/github/repository-list";
import type { SyncRepositoryOptions } from "@/domain/services/github/commands/list-item";
import { createMetadata } from "@/domain/services/shared/metadata";
import { repositoryListItemMetadataSchema } from "@/domain/validation/github/repository-list";
import { trpc } from "@/interfaces/server-client";

import type { ActionCallbacks } from "@/ui/components/actions/types";

export function useRepositoryToggleActions({
  onSuccess,
}: ActionCallbacks = {}) {
  const router = useRouter();

  const saveToListMutation = trpc.list.saveToList.useMutation();
  const removeFromListMutation = trpc.list.removeFromList.useMutation();
  const syncRepositoryMutation = trpc.list.syncRepositoryData.useMutation();
  const saveRepositoryMutation = trpc.repository.save.useMutation();

  /** used in RepositoryAdd, ToggleList */
  const handleAddToList = async (
    listId: number,
    fullNames?: string[],
    items?: RepositoryListItem[],
  ) => {
    if (!listId) {
      toast.error("No listId provided");
      return { success: false };
    }

    const totalItems = fullNames?.length || 0 + (items?.length || 0);

    if (!totalItems) {
      toast.error("No items to add");
      return { success: false };
    }

    const errored: string[] = [];

    fullNames?.map(async (fullName) => {
      try {
        await saveToListMutation.mutateAsync({
          listId,
          fullName,
          metadata: createMetadata(repositoryListItemMetadataSchema),
        });
      } catch {
        errored.push(fullName);
      }
    });

    items?.map(async (item) => {
      try {
        await saveToListMutation.mutateAsync({
          listId,
          fullName: item.fullName,
          metadata: item.metadata,
        });
      } catch {
        errored.push(item.fullName);
      }
    });

    await router.invalidate();

    const successCount = totalItems - errored.length;

    if (errored.length === totalItems) {
      toast.error(`Error adding items to list: ${errored.join(", ")}`);
      return { success: false, count: 0 };
    }

    if (errored.length > 0) {
      toast.warning(
        `Error adding ${errored.length} items to list: ${errored.join(", ")}`,
      );
    }

    toast.success(`${successCount} items added successfully`, {
      action: {
        label: "View List",
        onClick: () =>
          router.navigate({
            to: "/github/lists/$listId",
            params: { listId: String(listId) },
          }),
      },
    });

    onSuccess?.();
    return { success: true, count: successCount };
  };

  /** used in getListActions, ToggleList */
  const handleRemoveFromList = async (listId: number, fullNames?: string[]) => {
    if (!listId) {
      toast.error("No listId provided");
      return { success: false };
    }

    if (!fullNames?.length) {
      toast.error("No items to add");
      return { success: false };
    }

    const errored: string[] = [];

    fullNames?.map(async (fullName) => {
      try {
        await removeFromListMutation.mutateAsync({ listId, fullName });
      } catch {
        errored.push(fullName);
      }
    });

    await router.invalidate();

    if (errored.length === fullNames?.length) {
      toast.error(`Error removing items from list: ${errored.join(", ")}`);
      return { success: false, count: 0 };
    }

    if (errored.length > 0) {
      toast.warning(
        `Error removing ${errored.length} items from list: ${errored.join(", ")}`,
      );
    }

    const successCount = fullNames?.length - errored.length;

    toast.success(`${successCount} items removed successfully`);
    onSuccess?.();
    return { success: true, count: successCount };
  };

  /** used in createBaseGithubActions, RepositoryAdd */
  const handleSyncRepositoryData = async (
    fullNames: string[],
    listIds?: number[],
  ) => {
    const options: SyncRepositoryOptions = {};

    if (listIds?.length) options.listIds = listIds;
    if (fullNames?.length) options.fullNames = fullNames;

    try {
      await syncRepositoryMutation.mutateAsync(options);
      toast.success("Repository data synchronized successfully");
      await router.invalidate();
      onSuccess?.();
      return { success: true };
    } catch (error: unknown) {
      toast.error(
        `Error syncing repository data: ${error instanceof Error ? error.message : error}`,
      );
      return { success: false };
    }
  };

  /**  used in createRepositoryActions */
  const handleSaveRepository = async (fullNames: string[]) => {
    if (!fullNames.length) {
      toast.error("No repositories to save");
      return { success: false };
    }

    const errored: string[] = [];

    fullNames?.map(async (fullName) => {
      try {
        await saveRepositoryMutation.mutateAsync(fullName);
      } catch {
        errored.push(fullName);
      }
    });

    if (errored.length === fullNames?.length) {
      toast.error(`Error saving repositories: ${errored.join(", ")}`);
      return { success: false, count: 0 };
    }

    if (errored.length > 0) {
      toast.warning(
        `Error saving ${errored.length} repositories: ${errored.join(", ")}`,
      );
    }

    const successCount = fullNames?.length - errored.length;

    const message =
      fullNames.length === 1
        ? `Repository ${fullNames[0]} saved successfully`
        : `${fullNames.length} repositories saved successfully`;

    toast.success(message);
    onSuccess?.();
    return { success: true, count: successCount };
  };

  return {
    handleAddToList,
    handleRemoveFromList,
    handleSyncRepositoryData,
    handleSaveRepository,
  };
}
