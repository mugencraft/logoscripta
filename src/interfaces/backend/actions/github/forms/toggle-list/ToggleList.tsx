import { useState } from "react";

import type { Repository } from "@/domain/models/github/repository";
import type { RepositoryListItem } from "@/domain/models/github/repository-list";
import { createMetadata } from "@/domain/services/shared/metadata";
import { repositoryListMetadataSchema } from "@/domain/validation/github/repository-list";
import { trpc } from "@/interfaces/server-client";

import type { BaseActionProps } from "@/ui/components/actions/types";
import { Button } from "@/ui/components/core/button";

import { useGithubActions } from "../../useGithubActions";
import { useRepositoryToggleActions } from "../../useRepositoryToggleActions";
import { ListSelection } from "./ListSelection";

export function ToggleList<TData extends Repository | RepositoryListItem>({
  selected,
  onSuccess,
  onCancel,
  mode = "add",
}: BaseActionProps<TData> & {
  mode: "add" | "remove";
}) {
  const { data: lists = [] } = trpc.list.findAllWithItems.useQuery();
  const [listId, setListId] = useState<number>();
  const { handleCreateList } = useGithubActions({
    onSuccess,
  });

  const { handleAddToList, handleRemoveFromList } = useRepositoryToggleActions({
    onSuccess,
  });

  if (!selected?.length) return null;

  const handleAction = () => {
    if (!listId) return;

    const data = lists.find((list) => list.id === listId);

    if (!data) return;

    const fullNames = selected.map((item) => item.fullName);

    if (mode === "add") {
      if (selected[0] && "listId" in selected[0]) {
        return handleAddToList(data.id, [], selected as RepositoryListItem[]);
      }

      return handleAddToList(data.id, fullNames);
    }
    return handleRemoveFromList(data.id, fullNames);
  };

  return (
    <div className="space-y-4 max-h-[90vh] flex flex-col">
      <div className="flex-1 min-h-0">
        <ListSelection
          lists={lists}
          selected={selected}
          selectedListId={listId}
          onSelectList={setListId}
          onCreateList={
            mode === "add"
              ? (name) =>
                  handleCreateList({
                    data: {
                      name,
                      metadata: createMetadata(repositoryListMetadataSchema),
                    },
                  })
              : undefined
          }
          mode={mode}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" disabled={!listId} onClick={handleAction}>
          {mode === "add" ? "Add to" : "Remove from"} Selected List
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
