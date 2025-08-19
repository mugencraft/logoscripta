import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";

import type {
  NewRepositoryList,
  RepositoryList,
} from "@/domain/models/github/repository-list";
import { trpc } from "@/interfaces/server-client";

import type {
  ActionCallbacks,
  ActionHandler,
} from "@/ui/components/actions/types";

export function useGithubActions({ onSuccess }: ActionCallbacks = {}) {
  const router = useRouter();

  const createListMutation = trpc.list.create.useMutation();
  const updateListMutation = trpc.list.update.useMutation();
  const deleteListMutation = trpc.list.delete.useMutation();

  /** used in NewListForm and ToggleList */
  const handleCreateList: ActionHandler<NewRepositoryList> = async ({
    data,
  }) => {
    if (!data) {
      toast.error("No data provided");
      return { success: false };
    }

    try {
      const list = await createListMutation.mutateAsync(data);
      if (!list) {
        toast.error("List creation returned no data");
        return { success: false };
      }

      await router.invalidate();

      toast.success(`Created list ${list.name}`, {
        action: {
          label: "View List",
          onClick: () =>
            router.navigate({
              to: "/github/lists/$listId",
              params: { listId: list.id.toString() },
            }),
        },
      });

      onSuccess?.();
      return { success: true, data: list };
    } catch (error: unknown) {
      toast.error(
        `Error creating list: ${error instanceof Error ? error.message : error}`,
      );
      return { success: false };
    }
  };

  /** Used in ListEditForm */
  const handleUpdateList: ActionHandler<RepositoryList> = async ({ data }) => {
    if (!data) {
      toast.error("No data provided");
      return { success: false };
    }
    try {
      const result = await updateListMutation.mutateAsync({
        id: data.id,
        data: {
          name: data.name,
          description: data.description,
        },
      });

      if (!result) {
        toast.error("List update returned no data");
        return { success: false };
      }

      await router.invalidate();

      toast.success(`List ${data.name} updated successfully!`);
      onSuccess?.();
      return { success: true, data };
    } catch (error: unknown) {
      toast.error(
        `Error updating list: ${error instanceof Error ? error.message : error}`,
      );
      return { success: false };
    }
  };

  /** used in createListActions, createListsActions */
  const handleDeleteList: ActionHandler<RepositoryList> = async ({ data }) => {
    if (!data) {
      toast.error("No data provided");
      return { success: false };
    }

    if (!data.id) {
      toast.error("No list selected");
      return { success: false };
    }

    if (data.readOnly) {
      toast.error("Cannot delete read-only list");
      return { success: false };
    }

    try {
      await deleteListMutation.mutateAsync(data.id);
      await router.invalidate();
      toast.success("List deleted successfully");
      onSuccess?.();

      if (
        router.matchRoute({
          to: "/github/lists/$listId",
          params: { listId: data.id.toString() },
        })
      )
        await router.navigate({ to: "/github/lists" });
      return { success: true, data };
    } catch (error: unknown) {
      toast.error(
        `Error deleting list: ${error instanceof Error ? error.message : error}`,
      );
      return { success: false };
    }
  };

  return {
    handleCreateList,
    handleUpdateList,
    handleDeleteList,
  };
}
