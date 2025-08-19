import { EntityNotFoundError } from "../../models/errors";
import type { Tag } from "../../models/tagging/tag";
import type { TaggingCommandsPort } from "../../ports/tagging/commands";
import type { TagSystemQueriesPort } from "../../ports/tagging/queries";
import { tagMetadataSchema } from "../../validation/tagging/tag";
import { createMetadata } from "../shared/metadata";

export class TagSystemService {
  constructor(
    private queries: TagSystemQueriesPort,
    private commands: TaggingCommandsPort,
  ) {}

  /**
   * Find or create tag across systems
   * Handles the case where same tag name exists in multiple systems
   */
  async findOrCreateTagInSystem(
    systemId: number,
    categoryId: number,
    tagName: string,
    createIfMissing = false,
  ): Promise<Tag | null> {
    // First try to find in the specific system
    let tag = await this.queries.findTagByName(systemId, tagName);

    if (!tag && createIfMissing) {
      tag = await this.commands.createTag({
        systemId,
        name: tagName,
        metadata: createMetadata(tagMetadataSchema),
      });

      // Create the category association
      await this.commands.createTagCategoryAssociation({
        tagId: tag.id,
        categoryId,
      });
    } else if (tag) {
      // Check if tag is already associated with this category
      const hasCategory = await this.queries.hasTagCategoryAssociation(
        tag.id,
        categoryId,
      );
      if (!hasCategory) {
        await this.commands.createTagCategoryAssociation({
          tagId: tag.id,
          categoryId,
        });
      }
    }

    return tag;
  }

  /**
   * Copy tag from one system to another
   */
  async copyTagBetweenSystems(
    sourceSystemId: number,
    targetSystemId: number,
    tagName: string,
    targetCategoryId: number,
  ): Promise<Tag> {
    const sourceTag = await this.queries.findTagByName(sourceSystemId, tagName);
    if (!sourceTag) {
      throw new EntityNotFoundError(
        `Tag "${tagName}" not found in source system ${sourceSystemId}`,
      );
    }

    // Check if tag already exists in target system
    const existingTag = await this.queries.findTagByName(
      targetSystemId,
      tagName,
    );

    if (existingTag) {
      // Associate with the target category if not already associated
      const hasCategory = await this.queries.hasTagCategoryAssociation(
        existingTag.id,
        targetCategoryId,
      );
      if (!hasCategory) {
        await this.commands.createTagCategoryAssociation({
          tagId: existingTag.id,
          categoryId: targetCategoryId,
        });
      }
      return existingTag;
    }

    // Create new tag in target system
    const newTag = await this.commands.createTag({
      systemId: targetSystemId,
      name: sourceTag.name,
      label: sourceTag.label,
      description: sourceTag.description,
      isQuickSelection: sourceTag.isQuickSelection,
      metadata: createMetadata(tagMetadataSchema),
    });

    // Create the category association
    await this.commands.createTagCategoryAssociation({
      tagId: newTag.id,
      categoryId: targetCategoryId,
    });

    return newTag;
  }
}
