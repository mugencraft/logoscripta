import {
  and,
  asc,
  desc,
  eq,
  getTableColumns,
  inArray,
  type SQL,
  sql,
} from "drizzle-orm";

import type {
  CollectionStatistics,
  ContentCollectionWithStats,
  ContentItemWithStats,
  ContentItemWithTags,
  ContentSearchFilters,
  ContentStatistics,
} from "@/domain/models/content/types";
import type { TagSource } from "@/domain/models/tagging/types";
import type { ContentQueriesPort } from "@/domain/ports/content/queries";
import {
  contentCollections,
  contentItems,
  contentItemTags,
  tagSystems,
  tags,
} from "@/shared/schema";

import { db } from "../../db";

const withItemTags = {
  with: {
    collection: true,
    tags: {
      with: { tag: true },
    },
  },
} as const;

export class ContentQueriesAdapter implements ContentQueriesPort {
  // contentCollections

  async getAllCollections(): Promise<ContentCollectionWithStats[]> {
    return db
      .select({
        ...getTableColumns(contentCollections),
        totalItems: sql<number>`(
                SELECT COUNT(*)
                FROM content_items ci
                WHERE ci.collection_id = content_collections.id
            )`,
        totalTags: sql<number>`(
                SELECT COUNT(DISTINCT cit.tag_id)
                FROM content_items ci
                JOIN content_item_tags cit ON ci.id = cit.content_item_id
                WHERE ci.collection_id = content_collections.id
            )`,
      })
      .from(contentCollections);
  }

  async getCollection(id: number) {
    return (
      (await db.query.contentCollections.findFirst({
        where: eq(contentCollections.id, id),
        with: {
          items: withItemTags,
        },
      })) || null
    );
  }

  // contentItems

  async getAllItems(): Promise<ContentItemWithStats[]> {
    return db
      .select({
        ...getTableColumns(contentItems),
        collectionName: sql<string>`(SELECT ${contentCollections.name} FROM ${contentCollections} WHERE ${contentCollections.id} = ${contentItems.collectionId})`,
        totalTags: sql<number>`(
					SELECT COUNT(*)
					FROM ${contentItemTags}
					WHERE ${contentItemTags.contentItemId} = ${contentItems.id}
				)`,
      })
      .from(contentItems);
  }

  async getItemIdsForNavigation(collectionId?: number): Promise<number[]> {
    const query = db.select({ id: contentItems.id }).from(contentItems);

    if (collectionId) {
      query.where(eq(contentItems.collectionId, collectionId));
    }

    query.orderBy(asc(contentItems.identifier));

    const result = await query;
    return result.map((row) => row.id);
  }

  async getItemsForCollection(collectionId: number) {
    return (await db.query.contentItems.findMany({
      where: eq(contentItems.collectionId, collectionId),
      orderBy: [asc(contentItems.identifier)],
      with: withItemTags.with,
    })) as ContentItemWithTags[];
  }

  async getItem(itemId: number) {
    return (
      (await db.query.contentItems.findFirst({
        where: eq(contentItems.id, itemId),
        with: withItemTags.with,
      })) || null
    );
  }

  async getItemWithTags(itemId: number) {
    return ((await db.query.contentItems.findFirst({
      where: eq(contentItems.id, itemId),
      with: withItemTags.with,
    })) || null) as ContentItemWithTags | null;
  }

  // TODO: check this, who is using it?
  // should we change it to findItemsByTags?
  // should we add a matchAll flag to support different behaviors?
  // what's the need for systemId? consider that a tagId is bound to a systemId.
  async getItemsByTags(
    collectionId: number,
    tagIds: number[],
    systemId?: number,
  ) {
    if (tagIds.length === 0) {
      return [];
    }

    // Find items that have ALL specified tags
    const itemsWithAllTags = await db
      .select({ itemId: contentItemTags.contentItemId })
      .from(contentItemTags)
      .innerJoin(
        contentItems,
        eq(contentItemTags.contentItemId, contentItems.id),
      )
      .where(
        and(
          eq(contentItems.collectionId, collectionId),
          inArray(contentItemTags.tagId, tagIds),
          systemId ? eq(contentItemTags.systemId, systemId) : undefined,
        ),
      )
      .groupBy(contentItemTags.contentItemId)
      .having(sql`count(distinct ${contentItemTags.tagId}) = ${tagIds.length}`);

    const itemIds = itemsWithAllTags.map((row) => row.itemId);
    if (itemIds.length === 0) return [];

    // Fetch complete items
    return (await db.query.contentItems.findMany({
      where: inArray(contentItems.id, itemIds),
      with: {
        tags: {
          with: { tag: true },
        },
      },
      orderBy: [asc(contentItems.identifier)],
    })) as ContentItemWithTags[];
  }

  // SEARCH

  async searchItems(
    filters: ContentSearchFilters,
  ): Promise<ContentItemWithTags[]> {
    const conditions = [eq(contentItems.collectionId, filters.collectionId)];

    // Basic content filtering
    if (filters.contentType) {
      conditions.push(eq(contentItems.contentType, filters.contentType));
    }

    // If no tag filtering, return basic results
    if (
      !filters.tags?.length &&
      !filters.excludeTags?.length &&
      !filters.source
    ) {
      return (await db.query.contentItems.findMany({
        where: and(...conditions),
        with: {
          tags: {
            with: { tag: true },
          },
        },
        orderBy: [asc(contentItems.identifier)],
      })) as ContentItemWithTags[];
    }

    // Complex tag filtering - more efficient approach
    let candidateItemIds = await this.getItemIdsWithBasicFilters(conditions);

    if (filters.tags?.length) {
      candidateItemIds = await this.filterItemsByRequiredTags(
        candidateItemIds,
        filters.tags,
        filters.source,
      );
    }

    if (filters.excludeTags?.length && candidateItemIds.length > 0) {
      candidateItemIds = await this.filterItemsByExcludedTags(
        candidateItemIds,
        filters.excludeTags,
      );
    }

    if (candidateItemIds.length === 0) return [];

    // Single query to get all results with relations
    return (await db.query.contentItems.findMany({
      where: inArray(contentItems.id, candidateItemIds),
      with: {
        tags: {
          with: { tag: true },
        },
      },
      orderBy: [asc(contentItems.identifier)],
    })) as ContentItemWithTags[];
  }

  // Helper methods for better organization
  private async getItemIdsWithBasicFilters(
    conditions: SQL<unknown>[],
  ): Promise<number[]> {
    const items = await db
      .select({ id: contentItems.id })
      .from(contentItems)
      .where(and(...conditions));
    return items.map((item) => item.id);
  }

  private async filterItemsByRequiredTags(
    itemIds: number[],
    tagIds: number[],
    source?: TagSource,
  ): Promise<number[]> {
    const tagConditions = [
      inArray(contentItemTags.contentItemId, itemIds),
      inArray(contentItemTags.tagId, tagIds),
    ];

    if (source) {
      tagConditions.push(eq(contentItemTags.source, source));
    }

    const itemsWithRequiredTags = await db
      .select({ itemId: contentItemTags.contentItemId })
      .from(contentItemTags)
      .where(and(...tagConditions))
      .groupBy(contentItemTags.contentItemId)
      .having(sql`count(distinct ${contentItemTags.tagId}) = ${tagIds.length}`);

    return itemsWithRequiredTags.map((row) => row.itemId);
  }

  private async filterItemsByExcludedTags(
    itemIds: number[],
    excludeTagIds: number[],
  ): Promise<number[]> {
    const itemsWithExcludedTags = await db
      .select({ itemId: contentItemTags.contentItemId })
      .from(contentItemTags)
      .where(
        and(
          inArray(contentItemTags.contentItemId, itemIds),
          inArray(contentItemTags.tagId, excludeTagIds),
        ),
      );

    const excludedItemIds = new Set(
      itemsWithExcludedTags.map((row) => row.itemId),
    );
    return itemIds.filter((id) => !excludedItemIds.has(id));
  }

  // STATS

  async getOverallStatistics(): Promise<ContentStatistics> {
    const [collectionsResult, itemsResult, taggedResult, avgResult] =
      await Promise.all([
        db
          .select({ count: sql<number>`count(*)` })
          .from(contentCollections)
          .get(),
        db.select({ count: sql<number>`count(*)` }).from(contentItems).get(),
        db
          .select({
            count: sql<number>`count(distinct ${contentItems.id})`,
          })
          .from(contentItems)
          .innerJoin(
            contentItemTags,
            eq(contentItemTags.contentItemId, contentItems.id),
          )
          .get(),
        db
          .select({
            avg: sql<number>`avg(tag_count)`,
          })
          .from(
            db
              .select({
                tagCount: sql<number>`count(*)`.as("tag_count"),
              })
              .from(contentItemTags)
              .groupBy(contentItemTags.contentItemId)
              .as("item_tag_counts"),
          )
          .get(),
      ]);

    return {
      totalCollections: collectionsResult?.count || 0,
      totalItems: itemsResult?.count || 0,
      taggedItems: taggedResult?.count || 0,
      averageTagsPerItem: avgResult?.avg || 0,
    };
  }

  async getTagUsageAcrossSystems(tagName: string) {
    return await db
      .select({
        systemId: tags.systemId,
        systemName: tagSystems.name,
        tagId: tags.id,
        usageCount: sql<number>`count(${contentItemTags.tagId})`,
      })
      .from(tags)
      .innerJoin(tagSystems, eq(tags.systemId, tagSystems.id))
      .leftJoin(contentItemTags, eq(contentItemTags.tagId, tags.id))
      .where(eq(tags.name, tagName))
      .groupBy(tags.systemId, tags.id)
      .orderBy(desc(sql`count(${contentItemTags.tagId})`));
  }

  async getCollectionStatistics(
    collectionId: number,
  ): Promise<CollectionStatistics> {
    // Use Promise.all for concurrent queries where possible
    const [
      totalItemsResult,
      totalTagsResult,
      avgTagsResult,
      tagDistributionResult,
    ] = await Promise.all([
      // Total items
      db
        .select({ count: sql<number>`count(*)` })
        .from(contentItems)
        .where(eq(contentItems.collectionId, collectionId))
        .get(),

      // Total unique tags
      db
        .select({
          count: sql<number>`count(distinct ${contentItemTags.tagId})`,
        })
        .from(contentItemTags)
        .innerJoin(
          contentItems,
          eq(contentItemTags.contentItemId, contentItems.id),
        )
        .where(eq(contentItems.collectionId, collectionId))
        .get(),

      // Average tags per item
      db
        .select({ avg: sql<number>`avg(tag_count)` })
        .from(
          db
            .select({
              itemId: contentItemTags.contentItemId,
              tagCount: sql<number>`count(*)`.as("tag_count"),
            })
            .from(contentItemTags)
            .innerJoin(
              contentItems,
              eq(contentItemTags.contentItemId, contentItems.id),
            )
            .where(eq(contentItems.collectionId, collectionId))
            .groupBy(contentItemTags.contentItemId)
            .as("item_tag_counts"),
        )
        .get(),

      // Tag distribution
      db
        .select({
          tagName: tags.name,
          count: sql<number>`count(*)`,
        })
        .from(contentItemTags)
        .innerJoin(
          contentItems,
          eq(contentItemTags.contentItemId, contentItems.id),
        )
        .innerJoin(tags, eq(contentItemTags.tagId, tags.id))
        .where(eq(contentItems.collectionId, collectionId))
        .groupBy(tags.name)
        .orderBy(desc(sql`count(*)`))
        .limit(20),
    ]);

    // Process results
    const tagDistribution: Record<string, number> = {};
    for (const row of tagDistributionResult) {
      tagDistribution[row.tagName] = row.count;
    }

    return {
      totalItems: totalItemsResult?.count || 0,
      totalTags: totalTagsResult?.count || 0,
      averageTagsPerItem: avgTagsResult?.avg || 0,
      tagDistribution,
    };
  }
}
