import { eq, sql } from "drizzle-orm";

import type {
  ContentTaxonomyTopic,
  NewContentTaxonomyTopic,
} from "@/domain/models/taxonomy/assignment";
import type {
  NewTaxonomySystem,
  TaxonomySystem,
} from "@/domain/models/taxonomy/system";
import type {
  NewTaxonomyTopic,
  TaxonomyTopic,
} from "@/domain/models/taxonomy/topic";
import type { TaxonomyCommandsPort } from "@/domain/ports/taxonomy/commands";
import {
  contentTaxonomyTopics,
  taxonomySystems,
  taxonomyTopics,
} from "@/shared/schema/taxonomy";

import { db } from "../../db";

type TopicDataForCreate = NewTaxonomyTopic;
type TopicDataForUpdate = Partial<TaxonomyTopic> & { id: number };
type EnrichableTopicData = TopicDataForCreate | TopicDataForUpdate;

export class TaxonomyCommandsAdapter implements TaxonomyCommandsPort {
  async createSystem(data: NewTaxonomySystem): Promise<TaxonomySystem> {
    const [created] = await db.insert(taxonomySystems).values(data).returning();
    if (!created) {
      throw new Error("Failed to create taxonomy system");
    }
    return created;
  }

  async updateSystem(
    id: number,
    data: Partial<TaxonomySystem>,
  ): Promise<TaxonomySystem> {
    const [updated] = await db
      .update(taxonomySystems)
      .set(data)
      .where(eq(taxonomySystems.id, id))
      .returning();
    if (!updated) {
      throw new Error(`Taxonomy system ${id} not found`);
    }
    return updated;
  }

  async deleteSystem(id: number): Promise<void> {
    // Cascade delete will handle topics and assignments
    await db.delete(taxonomySystems).where(eq(taxonomySystems.id, id));
  }

  async createTopic(data: NewTaxonomyTopic): Promise<TaxonomyTopic> {
    const enrichedData = await this.enrichTopicData(data);

    return db.transaction(async (tx) => {
      const [created] = await tx
        .insert(taxonomyTopics)
        .values(enrichedData)
        .returning();

      if (!created) {
        throw new Error("Failed to create Taxonomy Topic");
      }

      // Fix placeholder path with real ID
      if (enrichedData.path.includes("/0")) {
        const correctPath = enrichedData.path.replace("/0", `/${created.id}`);
        const [updated] = await tx
          .update(taxonomyTopics)
          .set({ path: correctPath })
          .where(eq(taxonomyTopics.id, created.id))
          .returning();

        if (!updated) {
          throw new Error("Failed to update Taxonomy Topic");
        }

        return updated;
      }

      return created;
    });
  }

  async updateTopic(
    id: number,
    data: Partial<TaxonomyTopic>,
  ): Promise<TaxonomyTopic> {
    // If parentId is changing, recalculate path and level
    if ("parentId" in data) {
      const enrichedData = await this.enrichTopicData({ ...data, id });
      const [updated] = await db
        .update(taxonomyTopics)
        .set(enrichedData)
        .where(eq(taxonomyTopics.id, id))
        .returning();

      if (!updated) {
        throw new Error(`Failed to update topic ${id}`);
      }

      // Update children paths if hierarchy changed
      await this.updateChildrenPaths(id);
      return updated;
    }

    const [updated] = await db
      .update(taxonomyTopics)
      .set(data)
      .where(eq(taxonomyTopics.id, id))
      .returning();
    if (!updated) {
      throw new Error(`Failed to update topic ${id}`);
    }
    return updated;
  }

  async deleteTopic(id: number): Promise<void> {
    // Move children to parent before deletion to avoid orphans
    const topic = await db.query.taxonomyTopics.findFirst({
      where: eq(taxonomyTopics.id, id),
    });

    if (topic?.parentId) {
      await db
        .update(taxonomyTopics)
        .set({ parentId: topic.parentId })
        .where(eq(taxonomyTopics.parentId, id));
    }

    await db.delete(taxonomyTopics).where(eq(taxonomyTopics.id, id));
  }

  async moveTopic(
    topicId: number,
    newParentId: number | null,
  ): Promise<TaxonomyTopic> {
    if (newParentId !== null) {
      await this.validateMoveOperation(topicId, newParentId);
    }
    return this.updateTopic(topicId, { parentId: newParentId });
  }

  async updateMaterializedPaths(systemId: number): Promise<void> {
    const rootTopics = await db.query.taxonomyTopics.findMany({
      where: sql`${taxonomyTopics.systemId} = ${systemId} AND ${taxonomyTopics.parentId} IS NULL`,
    });

    for (const root of rootTopics) {
      await this.updateTopicPathRecursively(root.id, `/${root.id}`, 0);
    }
  }

  async assignTopicToContent(
    data: NewContentTaxonomyTopic,
  ): Promise<ContentTaxonomyTopic> {
    const [result] = await db
      .insert(contentTaxonomyTopics)
      .values({
        ...data,
        weight: data.weight || 1.0,
        source: data.source || "manual",
      })
      .onConflictDoUpdate({
        target: [
          contentTaxonomyTopics.contentId,
          contentTaxonomyTopics.topicId,
        ],
        set: {
          weight: data.weight || 1.0,
          source: data.source || "manual",
          assignedAt: new Date(),
        },
      })
      .returning();
    if (!result) {
      throw new Error(
        `Failed to assign topic ${data.topicId} to content ${data.contentId}`,
      );
    }
    return result;
  }

  async unassignTopicFromContent(
    contentId: number,
    topicId: number,
  ): Promise<void> {
    const result = await db
      .delete(contentTaxonomyTopics)
      .where(
        sql`${contentTaxonomyTopics.contentId} = ${contentId} AND ${contentTaxonomyTopics.topicId} = ${topicId}`,
      );

    if (!result) {
      throw new Error(
        `Failed to unassign topic ${topicId} from content ${contentId}`,
      );
    }
  }

  async updateTopicAssignment(
    contentId: number,
    topicId: number,
    updates: Partial<ContentTaxonomyTopic>,
  ): Promise<ContentTaxonomyTopic> {
    const [result] = await db
      .update(contentTaxonomyTopics)
      .set(updates)
      .where(
        sql`${contentTaxonomyTopics.contentId} = ${contentId} AND ${contentTaxonomyTopics.topicId} = ${topicId}`,
      )
      .returning();
    if (!result) {
      throw new Error(
        `Failed to update topic assignment for content ${contentId} and topic ${topicId}`,
      );
    }
    return result;
  }

  async bulkAssignTopics(
    assignments: NewContentTaxonomyTopic[],
  ): Promise<ContentTaxonomyTopic[]> {
    if (assignments.length === 0) return [];

    return db.transaction(async (tx) => {
      const results: ContentTaxonomyTopic[] = [];

      for (const assignment of assignments) {
        try {
          const [result] = await tx
            .insert(contentTaxonomyTopics)
            .values({
              ...assignment,
              weight: assignment.weight || 1.0,
              source: assignment.source || "manual",
            })
            .onConflictDoUpdate({
              target: [
                contentTaxonomyTopics.contentId,
                contentTaxonomyTopics.topicId,
              ],
              set: {
                weight: assignment.weight || 1.0,
                source: assignment.source || "manual",
                assignedAt: new Date(),
              },
            })
            .returning();

          if (result) {
            results.push(result);
          }
        } catch (error) {
          // Log individual failures but continue with transaction
          console.warn(
            `Failed to assign topic ${assignment.topicId} to content ${assignment.contentId}:`,
            error,
          );
        }
      }

      return results;
    });
  }

  async bulkUnassignTopics(
    contentId: number,
    topicIds: number[],
  ): Promise<void> {
    if (topicIds.length === 0) return;

    await db
      .delete(contentTaxonomyTopics)
      .where(
        sql`${contentTaxonomyTopics.contentId} = ${contentId} AND ${contentTaxonomyTopics.topicId} IN ${topicIds}`,
      );
  }

  // Private helper methods

  private async enrichTopicData(
    data: TopicDataForCreate,
  ): Promise<NewTaxonomyTopic & { path: string; level: number }>;
  private async enrichTopicData(
    data: TopicDataForUpdate,
  ): Promise<Partial<TaxonomyTopic> & { path: string; level: number }>;
  private async enrichTopicData(data: EnrichableTopicData): Promise<
    (NewTaxonomyTopic | Partial<TaxonomyTopic>) & {
      path: string;
      level: number;
    }
  > {
    const isUpdateData = (d: EnrichableTopicData): d is TopicDataForUpdate =>
      "id" in d;
    const tempId = isUpdateData(data) ? data.id : 0;

    if (!data.parentId) {
      return { ...data, path: `/${tempId}`, level: 0 };
    }

    const parent = await db.query.taxonomyTopics.findFirst({
      where: eq(taxonomyTopics.id, data.parentId),
    });

    if (!parent) {
      throw new Error(`Parent topic ${data.parentId} not found`);
    }

    return {
      ...data,
      path: `${parent.path}/${tempId}`,
      level: parent.level + 1,
    };
  }

  private async updateChildrenPaths(parentId: number): Promise<void> {
    const parent = await db.query.taxonomyTopics.findFirst({
      where: eq(taxonomyTopics.id, parentId),
    });

    if (!parent) return;

    const children = await db.query.taxonomyTopics.findMany({
      where: eq(taxonomyTopics.parentId, parentId),
    });

    for (const child of children) {
      const newPath = `${parent.path}/${child.id}`;
      const newLevel = parent.level + 1;

      await db
        .update(taxonomyTopics)
        .set({ path: newPath, level: newLevel })
        .where(eq(taxonomyTopics.id, child.id));

      // Recursively update descendants
      await this.updateChildrenPaths(child.id);
    }
  }

  private async updateTopicPathRecursively(
    topicId: number,
    path: string,
    level: number,
  ): Promise<void> {
    await db
      .update(taxonomyTopics)
      .set({ path, level })
      .where(eq(taxonomyTopics.id, topicId));

    const children = await db.query.taxonomyTopics.findMany({
      where: eq(taxonomyTopics.parentId, topicId),
    });

    for (const child of children) {
      await this.updateTopicPathRecursively(
        child.id,
        `${path}/${child.id}`,
        level + 1,
      );
    }
  }

  /**
   * Move validation with circular reference detection
   */
  private async validateMoveOperation(
    topicId: number,
    newParentId: number,
  ): Promise<void> {
    const [topic, targetParent] = await Promise.all([
      db.query.taxonomyTopics.findFirst({
        where: eq(taxonomyTopics.id, topicId),
      }),
      db.query.taxonomyTopics.findFirst({
        where: eq(taxonomyTopics.id, newParentId),
      }),
    ]);

    if (!topic) throw new Error(`Topic ${topicId} not found`);
    if (!targetParent)
      throw new Error(`Target parent ${newParentId} not found`);

    if (topic.systemId !== targetParent.systemId) {
      throw new Error("Cannot move topic across different taxonomy systems");
    }

    // Efficient circular reference check using materialized paths
    // If target parent's path starts with current topic's path, it would create a cycle
    if (
      targetParent.path.startsWith(`${topic.path}/`) ||
      targetParent.path === topic.path
    ) {
      throw new Error("Move operation would create circular reference");
    }
  }
}
