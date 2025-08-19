import { and, desc, eq, getTableColumns, like, sql } from "drizzle-orm";

import type {
  RelationshipType,
  TagCategoryWithStats,
  TagGroupWithStats,
  TagSearchFilters,
  TagSystemStatistics,
  TagSystemWithStats,
  TagWithStats,
} from "@/domain/models/tagging/types";
import type { TagSystemQueriesPort } from "@/domain/ports/tagging/queries";
import {
  tagCategories,
  tagCategoryAssociation,
  tagGroups,
  tagRelationships,
  tagSystems,
  tags,
} from "@/shared/schema";

import { db } from "../../db";

export class TagSystemQueriesAdapter implements TagSystemQueriesPort {
  // TAG SYSTEMS

  async getAllSystems(): Promise<TagSystemWithStats[]> {
    return db
      .select({
        ...getTableColumns(tagSystems),
        totalTags: sql<number>`(
                SELECT COUNT(*)
                FROM tags t
                WHERE t.system_id = tag_systems.id
            )`,
        totalGroups: sql<number>`(
                SELECT COUNT(*)
                FROM tag_groups tg
                WHERE tg.system_id = tag_systems.id
            )`,
        totalCategories: sql<number>`(
                SELECT COUNT(*)
                FROM tag_categories tc
                JOIN tag_groups tg ON tc.group_id = tg.id
                WHERE tg.system_id = tag_systems.id
            )`,
      })
      .from(tagSystems);
  }

  async findSystemByName(name: string) {
    return (
      (await db.query.tagSystems.findFirst({
        where: eq(tagSystems.name, name),
      })) || null
    );
  }

  async getSystemWithStructure(systemId: number) {
    return (
      (await db.query.tagSystems.findFirst({
        where: eq(tagSystems.id, systemId),
        with: {
          groups: {
            with: {
              categories: {
                with: {
                  tagAssociation: {
                    with: {
                      tag: {
                        with: {
                          sourceRelationships: true,
                          targetRelationships: true,
                          categoryAssociations: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      })) || null
    );
  }

  // TAG GROUPS

  async getAllGroups(): Promise<TagGroupWithStats[]> {
    return db
      .select({
        ...getTableColumns(tagGroups),
        totalCategories: sql<number>`(
                SELECT COUNT(*)
                FROM tag_categories tc
                WHERE tc.group_id = tag_groups.id
            )`,
        totalTags: sql<number>`(
                SELECT COUNT(*)
                FROM tag_categories tc
                JOIN tag_category_association tcm ON tc.id = tcm.category_id
                WHERE tc.group_id = tag_groups.id
            )`,
        systemName: sql<string>`(
							SELECT name
							FROM tag_systems
							WHERE id = tag_groups.system_id
						)`,
      })
      .from(tagGroups);
  }

  async getGroupWithCategories(groupId: number) {
    return (
      (await db.query.tagGroups.findFirst({
        where: eq(tagGroups.id, groupId),
        with: {
          categories: {
            with: {
              tagAssociation: {
                with: {
                  tag: {
                    with: {
                      sourceRelationships: true,
                      targetRelationships: true,
                      categoryAssociations: true,
                    },
                  },
                },
              },
            },
          },
        },
      })) || null
    );
  }

  // TAG CATEGORIES

  async getAllCategories(systemId?: number): Promise<TagCategoryWithStats[]> {
    const conditions = [];
    if (systemId) {
      conditions.push(eq(tagCategories.systemId, systemId));
    }

    return db
      .select({
        ...getTableColumns(tagCategories),
        totalTags: sql<number>`(
					SELECT COUNT(*)
					FROM ${tagCategoryAssociation}
					WHERE ${tagCategoryAssociation.categoryId} = ${tagCategories.id}
				)`,
        groupName: sql<string>`(
							SELECT name
							FROM tag_groups
							WHERE id = tag_categories.group_id
						)`,
      })
      .from(tagCategories)
      .where(conditions.length > 0 ? and(...conditions) : undefined);
  }

  async getCategoryWithTags(categoryId: number) {
    const category = await db.query.tagCategories.findFirst({
      where: eq(tagCategories.id, categoryId),
      with: {
        tagAssociation: {
          with: {
            tag: true,
          },
        },
      },
    });

    if (!category) return null;

    // Transform to match expected structure
    const tagsWithRelations = [];

    for (const association of category.tagAssociation) {
      const relationships = await this.getTagRelationships(association.tag.id);
      tagsWithRelations.push({
        ...association.tag,
        ...relationships,
      });
    }

    return {
      ...category,
      tags: tagsWithRelations,
    };
  }

  // TAGS

  async getAllTags(): Promise<TagWithStats[]> {
    return db
      .select({
        ...getTableColumns(tags),
        usageCount: sql<number>`(
                SELECT COALESCE(COUNT(*), 0)
                FROM content_item_tags cit
                WHERE cit.tag_id = tags.id
            )`,
        categoryCount: sql<number>`(
                SELECT COALESCE(COUNT(*), 0)
                FROM tag_category_association tcm
                WHERE tcm.tag_id = tags.id
            )`,
        systemCount: sql<number>`(
								SELECT COUNT(DISTINCT t.system_id)
								FROM tags t
								WHERE t.name = tags.name
						)`,
      })
      .from(tags);
  }

  async findTagById(tagId: number) {
    return (
      (await db.query.tags.findFirst({
        where: eq(tags.id, tagId),
      })) || null
    );
  }

  async findTagsByNameAcrossSystems(name: string) {
    return await db.query.tags.findMany({
      where: eq(tags.name, name),
      with: {
        system: true,
        categoryAssociations: {
          with: {
            category: {
              with: {
                group: true,
              },
            },
          },
        },
      },
    });
  }

  async hasTagCategoryAssociation(
    tagId: number,
    categoryId: number,
  ): Promise<boolean> {
    const association = await db.query.tagCategoryAssociation.findFirst({
      where: and(
        eq(tagCategoryAssociation.tagId, tagId),
        eq(tagCategoryAssociation.categoryId, categoryId),
      ),
    });
    return !!association;
  }

  async searchTags(filters: TagSearchFilters) {
    const conditions = [];

    if (filters.systemId) {
      conditions.push(eq(tags.systemId, filters.systemId));
    }

    if (filters.categoryId) {
      // Need to join through association
      conditions.push(
        eq(tagCategoryAssociation.categoryId, filters.categoryId),
      );
    }

    if (filters.groupId) {
      // Need to join through categories to association
      conditions.push(eq(tagCategories.groupId, filters.groupId));
    }

    if (filters.query) {
      conditions.push(like(tags.name, `%${filters.query}%`));
    }

    if (filters.isQuickSelection !== undefined) {
      conditions.push(eq(tags.isQuickSelection, filters.isQuickSelection));
    }

    // Build query with proper joins when filtering by category or group
    const query = db.select().from(tags);

    if (filters.categoryId || filters.groupId) {
      query
        .innerJoin(
          tagCategoryAssociation,
          eq(tags.id, tagCategoryAssociation.tagId),
        )
        .innerJoin(
          tagCategories,
          eq(tagCategoryAssociation.categoryId, tagCategories.id),
        );
    }

    const results = await query.where(and(...conditions));

    // Transform results to include relationships
    return Promise.all(
      results.map(async (tag) => {
        const association = await db.query.tagCategoryAssociation.findMany({
          where: eq(tagCategoryAssociation.tagId, tag.id),
          with: {
            category: {
              with: {
                group: true,
              },
            },
          },
        });

        return {
          ...tag,
          categoryAssociations: association,
        };
      }),
    );
  }

  async getTagsBySystem(systemId: number) {
    return await db.query.tags.findMany({
      where: eq(tags.systemId, systemId),
      with: {
        categoryAssociations: {
          with: {
            category: {
              with: {
                group: true,
              },
            },
          },
        },
      },
    });
  }

  async findTagByName(systemId: number, name: string) {
    return (
      (await db.query.tags.findFirst({
        where: and(eq(tags.systemId, systemId), eq(tags.name, name)),
        with: {
          categoryAssociations: {
            with: {
              category: {
                with: {
                  group: {
                    with: {
                      system: true,
                    },
                  },
                },
              },
            },
          },
        },
      })) || null
    );
  }

  async getTagsByCategory(categoryId: number) {
    const association = await db.query.tagCategoryAssociation.findMany({
      where: eq(tagCategoryAssociation.categoryId, categoryId),
      with: {
        tag: true,
      },
    });

    return association.map((m) => m.tag);
  }

  async getRelationships(tagId: number) {
    // Get relationships where this tag is the source
    const sourceRelationships = await db.query.tagRelationships.findMany({
      where: eq(tagRelationships.sourceTagId, tagId),
      with: {
        targetTag: true,
      },
    });

    // Get relationships where this tag is the target
    const targetRelationships = await db.query.tagRelationships.findMany({
      where: eq(tagRelationships.targetTagId, tagId),
      with: {
        sourceTag: true,
      },
    });

    // Combine and transform to consistent format
    const allRelationships = [
      ...sourceRelationships.map((rel) => ({
        ...rel,
        tag: rel.targetTag,
      })),
      ...targetRelationships.map((rel) => ({
        ...rel,
        tag: rel.sourceTag,
      })),
    ];

    return allRelationships || [];
  }

  async getAssociationsForTag(tagId: number) {
    return await db.query.tagCategoryAssociation.findMany({
      where: eq(tagCategoryAssociation.tagId, tagId),
      with: {
        category: true,
      },
    });
  }

  async getRelationshipsByType(tagId: number, type: RelationshipType) {
    return db.query.tagRelationships.findMany({
      where: and(
        eq(tagRelationships.sourceTagId, tagId),
        eq(tagRelationships.relationshipType, type),
      ),
      with: {
        targetTag: true,
      },
    });
  }

  async getTagStatistics(systemId: number): Promise<TagSystemStatistics> {
    // Update queries to work with new structure
    const [
      totalTagsResult,
      totalGroupsResult,
      totalCategoriesResult,
      tagsByGroup,
      categoriesByGroup,
    ] = await Promise.all([
      db
        .select({ count: sql<number>`count(*)` })
        .from(tags)
        .where(eq(tags.systemId, systemId))
        .get(),

      db
        .select({ count: sql<number>`count(*)` })
        .from(tagGroups)
        .where(eq(tagGroups.systemId, systemId))
        .get(),

      db
        .select({ count: sql<number>`count(*)` })
        .from(tagCategories)
        .innerJoin(tagGroups, eq(tagCategories.groupId, tagGroups.id))
        .where(eq(tagGroups.systemId, systemId))
        .get(),

      // Tags by group - through association
      db
        .select({
          groupName: tagGroups.name,
          groupId: tagGroups.id,
          tagCount: sql<number>`count(distinct ${tags.id})`,
        })
        .from(tagGroups)
        .leftJoin(tagCategories, eq(tagCategories.groupId, tagGroups.id))
        .leftJoin(
          tagCategoryAssociation,
          eq(tagCategoryAssociation.categoryId, tagCategories.id),
        )
        .leftJoin(tags, eq(tags.id, tagCategoryAssociation.tagId))
        .where(eq(tagGroups.systemId, systemId))
        .groupBy(tagGroups.id, tagGroups.name)
        .orderBy(desc(sql`count(distinct ${tags.id})`)),

      // Categories by group
      db
        .select({
          groupName: tagGroups.name,
          groupId: tagGroups.id,
          categoryCount: sql<number>`count(${tagCategories.id})`,
        })
        .from(tagGroups)
        .leftJoin(tagCategories, eq(tagCategories.groupId, tagGroups.id))
        .where(eq(tagGroups.systemId, systemId))
        .groupBy(tagGroups.id, tagGroups.name)
        .orderBy(desc(sql`count(${tagCategories.id})`)),
    ]);

    return {
      totalTags: totalTagsResult?.count || 0,
      totalGroups: totalGroupsResult?.count || 0,
      totalCategories: totalCategoriesResult?.count || 0,
      tagsByGroup,
      categoriesByGroup,
    };
  }

  async getTagRelationships(
    tagId: number,
    type: "sourceTagId" | "targetTagId" = "sourceTagId",
  ) {
    return db.query.tagRelationships.findMany({
      where: eq(tagRelationships[type], tagId),
    });
  }
}
