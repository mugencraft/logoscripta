import z from "zod";

import type {
  ImportOptions,
  RelationshipType,
  TagSystemExportResult,
  TagSystemImportResult,
} from "../../models/tagging/types";
import type { TaggingCommandsPort } from "../../ports/tagging/commands";
import type { TagSystemQueriesPort } from "../../ports/tagging/queries";
import { tagCategoryMetadataSchema } from "../../validation/tagging/category";
import { tagGroupMetadataSchema } from "../../validation/tagging/group";
import {
  type TagSystemData,
  tagSystemDataSchema,
  tagSystemMetadataSchema,
} from "../../validation/tagging/system";
import {
  tagMetadataSchema,
  tagRelationshipMetadataSchema,
} from "../../validation/tagging/tag";
import { createMetadata } from "../shared/metadata";
export class TagSystemImportExportService {
  constructor(
    private queries: TagSystemQueriesPort,
    private commands: TaggingCommandsPort,
  ) {}

  async exportSystem(systemId: number): Promise<TagSystemExportResult> {
    const systemStructure = await this.queries.getSystemWithStructure(systemId);
    if (!systemStructure) {
      throw new Error(`Unable to load structure for system '${systemId}'`);
    }

    // Transform to export format using names instead of IDs
    const exportData: TagSystemData = {
      system: {
        name: systemStructure.name,
        label: systemStructure.label || undefined,
        description: systemStructure.description || undefined,
        metadata: systemStructure.metadata,
      },
      groups: [],
      categories: [],
      tags: [],
      tagCategoryAssociations: [],
      relationships: [],
      exportedAt: new Date().toISOString(),
      version: "1.0",
    };

    const stats = {
      groups: 0,
      categories: 0,
      tags: 0,
      relationships: 0,
    };

    // Process groups and categories
    for (const group of systemStructure.groups) {
      exportData.groups.push({
        name: group.name,
        label: group.label || undefined,
        description: group.description || undefined,
        metadata: group.metadata,
      });
      stats.groups++;

      for (const category of group.categories) {
        exportData.categories.push({
          name: category.name,
          groupName: group.name, // Reference by name
          label: category.label || undefined,
          description: category.description || undefined,
          metadata: category.metadata,
        });
        stats.categories++;

        // Process tags and associations
        for (const association of category.tagAssociation) {
          const tag = association.tag;

          // Add tag if not already added
          if (!exportData.tags.find((t) => t.name === tag.name)) {
            exportData.tags.push({
              name: tag.name,
              label: tag.label || undefined,
              description: tag.description || undefined,
              isQuickSelection: tag.isQuickSelection,
              metadata: tag.metadata,
            });
            stats.tags++;

            // Add relationships for this tag
            for (const rel of tag.sourceRelationships) {
              const targetTag = await this.queries.findTagById(rel.targetTagId);
              if (targetTag && targetTag.systemId === systemId) {
                exportData.relationships.push({
                  sourceTagName: tag.name,
                  targetTagName: targetTag.name,
                  relationshipType: rel.relationshipType as RelationshipType,
                  metadata: rel.metadata,
                });
                stats.relationships++;
              }
            }
          }

          // Add category association
          exportData.tagCategoryAssociations.push({
            tagName: tag.name,
            categoryName: category.name,
          });
        }
      }
    }

    return {
      data: exportData,
      stats,
    };
  }

  /**
   * Import a tag system with conflict resolution
   */
  async importSystem(
    systemData: TagSystemData,
    options: ImportOptions = {},
  ): Promise<TagSystemImportResult> {
    try {
      // Validate the import data
      tagSystemDataSchema.parse(systemData);

      const { overwrite = false, renameIfExists = true } = options;
      let resolvedSystemName = systemData.system.name;

      // Handle existing system conflicts
      const existingSystem =
        await this.queries.findSystemByName(resolvedSystemName);

      if (existingSystem) {
        if (overwrite) {
          // Delete existing system completely
          await this.commands.deleteSystem(existingSystem.id);
        } else if (renameIfExists) {
          // Find a unique name
          resolvedSystemName = await this.findUniqueSystemName(
            systemData.system.name,
          );
        } else {
          throw new Error(
            `System with name '${systemData.system.name}' already exists`,
          );
        }
      }

      // Create the new system
      const system = await this.commands.createSystem({
        name: resolvedSystemName,
        label: systemData.system.label,
        description: systemData.system.description,
        metadata: createMetadata(tagSystemMetadataSchema, {
          ...systemData.system.metadata,
          import: {
            source: "system-export",
            importedAt: new Date(),
            originalName:
              systemData.system.name !== resolvedSystemName
                ? systemData.system.name
                : undefined,
          },
        }),
      });

      const stats = {
        groups: 0,
        categories: 0,
        tags: 0,
        relationships: 0,
      };

      try {
        // Create groups
        const groupIdMap = new Map<string, number>();
        for (const groupData of systemData.groups) {
          const group = await this.commands.createGroup({
            systemId: system.id,
            name: groupData.name,
            label: groupData.label,
            description: groupData.description,
            metadata: createMetadata(
              tagGroupMetadataSchema,
              groupData.metadata,
            ),
          });
          groupIdMap.set(groupData.name, group.id);
          stats.groups++;
        }

        // Create categories
        const categoryIdMap = new Map<string, number>();
        for (const categoryData of systemData.categories) {
          const groupId = groupIdMap.get(categoryData.groupName);
          if (!groupId) {
            throw new Error(
              `Group '${categoryData.groupName}' not found for category '${categoryData.name}'`,
            );
          }

          const category = await this.commands.createCategory({
            systemId: system.id,
            groupId,
            name: categoryData.name,
            label: categoryData.label,
            description: categoryData.description,
            metadata: createMetadata(
              tagCategoryMetadataSchema,
              categoryData.metadata,
            ),
          });
          categoryIdMap.set(categoryData.name, category.id);
          stats.categories++;
        }

        // Create tags
        const tagIdMap = new Map<string, number>();
        for (const tagData of systemData.tags) {
          const tag = await this.commands.createTag({
            systemId: system.id,
            name: tagData.name,
            label: tagData.label,
            description: tagData.description,
            isQuickSelection: tagData.isQuickSelection,
            metadata: createMetadata(tagMetadataSchema, tagData.metadata),
          });
          tagIdMap.set(tagData.name, tag.id);
          stats.tags++;
        }

        // Create tag-category associations
        for (const associationData of systemData.tagCategoryAssociations) {
          const tagId = tagIdMap.get(associationData.tagName);
          const categoryId = categoryIdMap.get(associationData.categoryName);

          if (tagId && categoryId) {
            await this.commands.createTagCategoryAssociation({
              tagId,
              categoryId,
            });
          }
        }

        // Create relationships
        for (const relationshipData of systemData.relationships) {
          const sourceTagId = tagIdMap.get(relationshipData.sourceTagName);
          const targetTagId = tagIdMap.get(relationshipData.targetTagName);

          if (sourceTagId && targetTagId) {
            await this.commands.createRelationship({
              sourceTagId,
              targetTagId,
              relationshipType: relationshipData.relationshipType,
              metadata: createMetadata(
                tagRelationshipMetadataSchema,
                relationshipData.metadata,
              ),
            });
            stats.relationships++;
          }
        }

        return {
          system,
          stats,
          resolvedSystemName,
        };
      } catch (error) {
        // Cleanup on failure
        await this.commands.deleteSystem(system.id);
        throw error;
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = this.formatZodErrors(error);
        throw new Error(`Import validation failed:\n${formattedErrors}`);
      }
      throw error;
    }
  }

  /**
   * Find a unique system name by appending a number
   */
  private async findUniqueSystemName(baseName: string): Promise<string> {
    let counter = 1;
    let candidateName = `${baseName}_${counter}`;

    while (await this.queries.findSystemByName(candidateName)) {
      counter++;
      candidateName = `${baseName}_${counter}`;
    }

    return candidateName;
  }

  private formatZodErrors(error: z.ZodError): string {
    return error.issues
      .map((issue) => {
        const path = issue.path.join(" → ");
        return `• ${path}: ${issue.message}`;
      })
      .join("\n");
  }
}
