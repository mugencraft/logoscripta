import { toast } from "sonner";

import { parseTagsFromText } from "@/core/utils/parse";
import type { ContentItem } from "@/domain/models/content/item";
import type { ContentItemTag } from "@/domain/models/content/item-tag";
import type {
  ContentItemWithTags,
  ItemTagOperations,
} from "@/domain/models/content/types";
import type { Tag } from "@/domain/models/tagging/tag";
import { trpc } from "@/interfaces/server-client";

export const useItemTaggingActions = (): ItemTagOperations => {
  const addTagMutation = trpc.content.items.addTag.useMutation();
  const removeTagMutation = trpc.content.items.removeTag.useMutation();
  const updateItemMutation = trpc.content.items.update.useMutation();
  const bulkTagMutation = trpc.content.items.bulkTag.useMutation();

  const actions: ItemTagOperations = {
    bulkUpdateTags: async (item, operations) => {
      try {
        const bulkOperations = operations.map((op) => ({
          contentItemId: item.id,
          systemId: op.systemId,
          tagId: op.tagId,
          source: "manual" as const,
        }));

        await bulkTagMutation.mutateAsync(bulkOperations);

        return { success: true };
      } catch (error: unknown) {
        toast.error(
          `Bulk update failed: ${error instanceof Error ? error.message : error}`,
        );
        return { success: false };
      }
    },
    toggleRawTag: async (item: ContentItem, tagName: string) => {
      try {
        const currentRawTags = parseTagsFromText(item.rawTags);

        const hasTag = currentRawTags.includes(tagName);
        let updatedRawTags: string[];

        if (hasTag) {
          updatedRawTags = currentRawTags.filter((tag) => tag !== tagName);
        } else {
          updatedRawTags = [...currentRawTags, tagName];
        }

        const result = await updateItemMutation.mutateAsync({
          id: item.id,
          data: { rawTags: updatedRawTags.join(", ") },
        });

        return { success: true, data: result };
      } catch (error: unknown) {
        console.error("Raw tag toggle failed:", error);
        return { success: false, data: null };
      }
    },

    toggleSystemTag: async (item: ContentItemWithTags, tag: Tag) => {
      try {
        const hasTag = item.tags?.some((itemTag) => itemTag.tag.id === tag.id);

        if (hasTag) {
          await removeTagMutation.mutateAsync({
            itemId: item.id,
            tagId: tag.id,
          });

          const updatedItem: ContentItemWithTags = {
            ...item,
            tags:
              item.tags?.filter((itemTag) => itemTag.tag.id !== tag.id) || [],
          };

          return { success: true, data: updatedItem };
        }
        const newTag: ContentItemTag = await addTagMutation.mutateAsync({
          contentItemId: item.id,
          systemId: tag.systemId,
          tagId: tag.id,
          source: "manual",
        });

        const updatedItem = {
          ...item,
          tags: [...(item.tags || []), { ...newTag, tag }],
        };

        // router.invalidate();
        return { success: true, data: updatedItem };
      } catch (error: unknown) {
        console.error("System tag toggle failed:", error);
        return { success: false, data: null };
      }
    },
  };

  return actions;
};
