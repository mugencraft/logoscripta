import { useState } from "react";

import type { RepositoryListWithItems } from "@/domain/models/github/types";

import { Button } from "@/ui/components/core/button";
import { Checkbox } from "@/ui/components/core/checkbox";
import { Input } from "@/ui/components/core/input";
import { Label } from "@/ui/components/core/label";
import { ScrollArea } from "@/ui/components/core/scroll-area";

interface ListSelectionProps {
  lists: RepositoryListWithItems[];
  selectedListId?: number;
  onSelectList: (id: number) => void;
  onCreateList?: (name: string) => void;
  mode: "add" | "remove";
  selected: { fullName: string }[];
}

export function ListSelection({
  lists,
  selectedListId,
  onSelectList,
  onCreateList,
  mode,
  selected,
}: ListSelectionProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newListName, setNewListName] = useState("");

  // Filter to only show custom, non-readonly lists
  const customLists = lists.filter(
    (list) => !list.sourceType && !list.readOnly,
  );

  // Determine which lists are valid targets based on mode
  const getListStatus = (list: RepositoryListWithItems) => {
    if (mode === "add") {
      // For adding: disable if list contains ALL selected items
      const hasAllItems = selected.every((item) =>
        list.items?.some((listItem) => listItem.fullName === item.fullName),
      );
      return {
        disabled: hasAllItems,
        message: hasAllItems ? "All selected items already in list" : undefined,
      };
    }
    // For removing: disable if list contains NO selected items
    const hasNoItems = selected.every(
      (item) =>
        !list.items?.some((listItem) => listItem.fullName === item.fullName),
    );
    return {
      disabled: hasNoItems,
      message: hasNoItems ? "No selected items in list" : undefined,
    };
  };

  if (isCreating && mode === "add") {
    return (
      <div className="flex gap-2">
        <Input
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          placeholder="Enter new list name"
          className="flex-1"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter" && newListName.trim()) {
              onCreateList?.(newListName.trim());
              setNewListName("");
              setIsCreating(false);
            }
            if (e.key === "Escape") {
              setIsCreating(false);
              setNewListName("");
            }
          }}
        />
        <Button variant="secondary" onClick={() => setIsCreating(false)}>
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ScrollArea className="h-[calc(70vh-220px)] min-h-[200px] max-h-[600px] pr-4">
        <div className="space-y-2">
          {customLists.map((list) => {
            const { disabled, message } = getListStatus(list);

            return (
              <div
                key={list.id}
                className={`p-3 rounded-lg border ${
                  disabled ? "opacity-50" : "hover:bg-accent/5"
                } ${selectedListId === list.id ? "border-accent" : "border-border"}`}
              >
                <Label
                  htmlFor={`list-${list.id}`}
                  className="flex items-start gap-3 cursor-pointer"
                >
                  <Checkbox
                    name={`list-${list.id}`}
                    checked={selectedListId === list.id}
                    disabled={disabled}
                    onCheckedChange={() => onSelectList(list.id)}
                  />
                  <div className="space-y-1 flex-1">
                    <div className="font-medium">{list.name}</div>
                    {list.description && (
                      <div className="text-sm text-muted-foreground line-clamp-2">
                        {list.description}
                      </div>
                    )}
                    <div className="text-sm text-muted-foreground">
                      {list.items?.length || 0} items
                      {message && (
                        <span className="ml-2 text-destructive">{message}</span>
                      )}
                    </div>
                  </div>
                </Label>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {mode === "add" && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setIsCreating(true)}
        >
          Create New List
        </Button>
      )}
    </div>
  );
}
