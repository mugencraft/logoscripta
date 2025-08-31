import { toast } from "sonner";

import type { ContentItemWithRelations } from "@/domain/models/content/types";
import { trpc } from "@/interfaces/server-client";

import type { TopicAssignmentUpdate } from "@/ui/components/taxonomy/assignment/TaxonomyTopicManager";

export function useContentTopicActions() {
  const utils = trpc.useUtils();

  const updateTopicAssignments = async (
    contentItem: ContentItemWithRelations,
    updates: TopicAssignmentUpdate[],
  ) => {
    let successful = 0;
    let failed = 0;

    for (const update of updates) {
      // Handle removals
      for (const topicId of update.toRemove) {
        try {
          await utils.client.taxonomy.assignments.unassignTopic.mutate({
            contentId: contentItem.id,
            topicId,
          });
          successful++;
        } catch (error) {
          console.error(`Failed to remove topic ${topicId}:`, error);
          failed++;
        }
      }

      // Handle additions
      if (update.toAdd.length > 0) {
        try {
          const assignments = update.toAdd.map((topicId) => ({
            contentId: contentItem.id,
            topicId,
            systemId: update.systemId,
            weight: 1.0,
            source: "manual" as const,
          }));

          await utils.client.taxonomy.assignments.bulkAssignTopics.mutate(
            assignments,
          );
          successful += update.toAdd.length;
        } catch (error) {
          console.error(
            `Failed to add topics for system ${update.systemId}:`,
            error,
          );
          failed += update.toAdd.length;
        }
      }
    }

    // User feedback
    if (successful > 0) {
      toast.success(`Updated ${successful} topic assignments`);
    }
    if (failed > 0) {
      toast.error(`${failed} operations failed`);
    }

    // Refresh data
    await utils.content.items.getWithRelations.invalidate(contentItem.id);
  };

  const getHierarchy = (systemId: number) =>
    utils.taxonomy.topics.getHierarchy.fetch(systemId);

  return { updateTopicAssignments, getHierarchy };
}
