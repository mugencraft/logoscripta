import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";

import type { ContentItemWithRelations } from "@/domain/models/content/types";
import type { ContentTaxonomyTopic } from "@/domain/models/taxonomy/assignment";
import type { TaxonomySystem } from "@/domain/models/taxonomy/system";
import type { TaxonomyTopic } from "@/domain/models/taxonomy/topic";
import type {
  ContentTaxonomyTopicWithTopic,
  TaxonomySystemStatistics,
  TaxonomyTopicWithChildren,
  TaxonomyTopicWithHierarchy,
  TopicHierarchy,
  TopicPath,
} from "@/domain/models/taxonomy/types";
import type { TaxonomyQueriesPort } from "@/domain/ports/taxonomy/queries";
import { contentItems } from "@/shared/schema";
import {
  contentTaxonomyTopics,
  taxonomySystems,
  taxonomyTopics,
} from "@/shared/schema/taxonomy";

import { db } from "../../db";

export class TaxonomyQueriesAdapter implements TaxonomyQueriesPort {
  async getSystemById(id: number): Promise<TaxonomySystem | null> {
    return (
      (await db.query.taxonomySystems.findFirst({
        where: eq(taxonomySystems.id, id),
      })) || null
    );
  }

  async getSystemByName(name: string): Promise<TaxonomySystem | null> {
    return (
      (await db.query.taxonomySystems.findFirst({
        where: eq(taxonomySystems.name, name),
      })) || null
    );
  }

  async getAllSystems(): Promise<TaxonomySystem[]> {
    return db.query.taxonomySystems.findMany({
      orderBy: [asc(taxonomySystems.name)],
    });
  }

  async getActiveSystem(type: string): Promise<TaxonomySystem | null> {
    return (
      (await db.query.taxonomySystems.findFirst({
        where: sql`${taxonomySystems.type} = ${type} AND ${taxonomySystems.isActive} = true`,
      })) || null
    );
  }

  async getTopicsBySystem(systemId: number): Promise<TaxonomyTopic[]> {
    return db.query.taxonomyTopics.findMany({
      where: eq(taxonomyTopics.systemId, systemId),
      orderBy: [asc(taxonomyTopics.path)], // Natural hierarchy order
    });
  }

  async getTopicById(id: number): Promise<TaxonomyTopic | null> {
    return (
      (await db.query.taxonomyTopics.findFirst({
        where: eq(taxonomyTopics.id, id),
      })) || null
    );
  }

  async getTopicWithChildren(
    id: number,
  ): Promise<TaxonomyTopicWithChildren | null> {
    const topic = await this.getTopicById(id);
    if (!topic) return null;

    const children = await db.query.taxonomyTopics.findMany({
      where: eq(taxonomyTopics.parentId, id),
      orderBy: [asc(taxonomyTopics.name)],
    });

    return {
      ...topic,
      children,
      childrenCount: children.length,
    };
  }

  async getTopicWithHierarchy(
    id: number,
  ): Promise<TaxonomyTopicWithHierarchy | null> {
    const topic = await this.getTopicById(id);
    if (!topic) return null;

    const [parent, children, ancestors] = await Promise.all([
      topic.parentId
        ? this.getTopicById(topic.parentId)
        : Promise.resolve(null),
      db.query.taxonomyTopics.findMany({
        where: eq(taxonomyTopics.parentId, id),
        orderBy: [asc(taxonomyTopics.name)],
      }),
      this.getTopicAncestors(id),
    ]);

    return {
      ...topic,
      parent,
      children,
      ancestors,
    };
  }

  async buildTopicHierarchy(systemId: number): Promise<TopicHierarchy[]> {
    const allTopics = await this.getTopicsBySystem(systemId);

    // Build hierarchy recursively
    const buildTree = (
      parentId: number | null,
      level: number,
    ): TopicHierarchy[] => {
      return allTopics
        .filter((t) => t.parentId === parentId)
        .map((topic) => ({
          topic,
          level,
          children: buildTree(topic.id, level + 1),
        }));
    };

    return buildTree(null, 0);
  }

  async getTopicPath(topicId: number): Promise<TopicPath | null> {
    const topic = await this.getTopicById(topicId);
    if (!topic) return null;

    const ancestors = await this.getTopicAncestors(topicId);

    return {
      topic,
      ancestors,
      fullPath: [...ancestors.map((a) => a.name), topic.name].join(" > "),
    };
  }

  async getTopicAncestors(topicId: number): Promise<TaxonomyTopic[]> {
    // Use materialized path for efficient ancestor lookup
    const topic = await this.getTopicById(topicId);
    if (!topic || !topic.path) return [];

    // Extract ancestor IDs from path: "/1/15/23" -> [1, 15]
    const pathIds = topic.path
      .split("/")
      .filter(Boolean)
      .map(Number)
      .slice(0, -1); // Remove self

    if (pathIds.length === 0) return [];

    const ancestors = await db.query.taxonomyTopics.findMany({
      where: inArray(taxonomyTopics.id, pathIds),
    });

    // Sort by level to maintain order
    return ancestors.sort((a, b) => a.level - b.level);
  }

  async getTopicDescendants(topicId: number): Promise<TaxonomyTopic[]> {
    const topic = await this.getTopicById(topicId);
    if (!topic) return [];

    return db.query.taxonomyTopics.findMany({
      where: sql`${taxonomyTopics.path} LIKE ${`${topic.path}/%`}`,
      orderBy: [asc(taxonomyTopics.path)],
    });
  }

  async getTopicsForContent(
    contentIds: number[],
    systemId?: number,
  ): Promise<ContentTaxonomyTopic[]> {
    if (contentIds.length === 0) return [];

    const whereClause = systemId
      ? sql`${contentTaxonomyTopics.contentId} IN ${contentIds} AND ${contentTaxonomyTopics.systemId} = ${systemId}`
      : inArray(contentTaxonomyTopics.contentId, contentIds);

    return db.query.contentTaxonomyTopics.findMany({
      where: whereClause,
      orderBy: [
        asc(contentTaxonomyTopics.contentId),
        desc(contentTaxonomyTopics.weight),
      ],
    });
  }

  async getContentByTopic(topicId: number): Promise<number[]> {
    const assignments = await db.query.contentTaxonomyTopics.findMany({
      where: eq(contentTaxonomyTopics.topicId, topicId),
      columns: { contentId: true },
    });

    return assignments.map((a) => a.contentId);
  }

  async getSystemStatistics(
    systemId: number,
  ): Promise<TaxonomySystemStatistics> {
    const [topicStats, levelStats, assignmentStats] = await Promise.all([
      // Total topics count
      db
        .select({ count: sql<number>`count(*)`.mapWith(Number) })
        .from(taxonomyTopics)
        .where(eq(taxonomyTopics.systemId, systemId)),

      // Max depth calculation
      db
        .select({
          level: taxonomyTopics.level,
          count: sql<number>`count(*)`.mapWith(Number),
        })
        .from(taxonomyTopics)
        .where(eq(taxonomyTopics.systemId, systemId))
        .groupBy(taxonomyTopics.level),

      // Assignment count
      db
        .select({ count: sql<number>`count(*)`.mapWith(Number) })
        .from(contentTaxonomyTopics)
        .where(eq(contentTaxonomyTopics.systemId, systemId)),
    ]);

    const totalTopics = topicStats[0]?.count || 0;
    const assignmentsCount = assignmentStats[0]?.count || 0;
    const maxDepth = Math.max(...levelStats.map((l) => l.level), 0);

    const topicsPerLevel = Object.fromEntries(
      levelStats.map((stat) => [stat.level, stat.count]),
    );

    return {
      totalTopics,
      maxDepth,
      topicsPerLevel,
      assignmentsCount,
    };
  }

  async validateHierarchy(systemId: number): Promise<boolean> {
    const allTopics = await db.query.taxonomyTopics.findMany({
      where: eq(taxonomyTopics.systemId, systemId),
      columns: { id: true, parentId: true, path: true },
    });

    if (allTopics.length === 0) return true;

    // Check for orphaned nodes (parent references non-existent topics)
    const topicIds = new Set(allTopics.map((t) => t.id));
    const orphanedNodes = allTopics.filter(
      (topic) => topic.parentId && !topicIds.has(topic.parentId),
    );

    if (orphanedNodes.length > 0) return false;

    // Check for circular references using path validation
    for (const topic of allTopics) {
      if (topic.parentId && this.hasCircularReferenceInPath(topic, allTopics)) {
        return false;
      }
    }

    return true;
  }

  hasCircularReferenceInPath(
    topic: { id: number; parentId: number | null; path: string },
    allTopics: Array<{ id: number; parentId: number | null; path: string }>,
  ): boolean {
    const visited = new Set<number>();
    let current = topic;

    while (current.parentId) {
      if (visited.has(current.id)) return true; // Circular reference detected
      visited.add(current.id);

      const parent = allTopics.find((t) => t.id === current.parentId);
      if (!parent) break; // Parent not found, not circular but invalid

      current = parent;
    }

    return false;
  }

  async getItemWithTagsAndTopics(
    itemId: number,
  ): Promise<ContentItemWithRelations> {
    const item = await db.query.contentItems.findFirst({
      where: eq(contentItems.id, itemId),
      with: {
        collection: true,
        tags: {
          with: { tag: true },
        },
        topics: { with: { topic: true } },
      },
    });

    if (!item) {
      throw new Error(`Content item not found: ${itemId}`);
    }

    return item;
  }

  async getItemsByTopics(
    collectionId: number,
    topicIds: number[],
    systemId?: number,
  ): Promise<ContentItemWithRelations[]> {
    if (topicIds.length === 0) return [];

    // Find items that have ALL specified topics (similar to tags logic)
    const conditions = [
      eq(contentItems.collectionId, collectionId),
      inArray(contentTaxonomyTopics.topicId, topicIds),
    ];

    if (systemId) {
      conditions.push(eq(contentTaxonomyTopics.systemId, systemId));
    }

    const itemsWithAllTopics = await db
      .select({ itemId: contentTaxonomyTopics.contentId })
      .from(contentTaxonomyTopics)
      .innerJoin(
        contentItems,
        eq(contentTaxonomyTopics.contentId, contentItems.id),
      )
      .where(and(...conditions))
      .groupBy(contentTaxonomyTopics.contentId)
      .having(
        sql`count(distinct ${contentTaxonomyTopics.topicId}) = ${topicIds.length}`,
      );

    const itemIds = itemsWithAllTopics.map((row) => row.itemId);
    if (itemIds.length === 0) return [];

    return (await db.query.contentItems.findMany({
      where: inArray(contentItems.id, itemIds),
      with: {
        collection: true,
        tags: { with: { tag: true } },
      },
      orderBy: [asc(contentItems.identifier)],
    })) as ContentItemWithRelations[];
  }

  async getContentTopics(
    contentId: number,
    systemId?: number,
  ): Promise<ContentTaxonomyTopicWithTopic[]> {
    const whereClause = systemId
      ? sql`${contentTaxonomyTopics.contentId} = ${contentId} AND ${contentTaxonomyTopics.systemId} = ${systemId}`
      : eq(contentTaxonomyTopics.contentId, contentId);

    return db.query.contentTaxonomyTopics.findMany({
      where: whereClause,
      with: {
        topic: true,
      },
      orderBy: [desc(contentTaxonomyTopics.weight), asc(taxonomyTopics.name)],
    });
  }
}
