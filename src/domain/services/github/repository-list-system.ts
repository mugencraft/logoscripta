import { ConsoleLogger } from "@/core/logging/logger";

import type {
  NewRepositoryList,
  RepositoryListItem,
} from "../../models/github/repository-list";
import type { RepositoryListCommandsPort } from "../../ports/github/repository-list/commands";
import type { RepositoryListQueriesPort } from "../../ports/github/repository-list/queries";
import {
  type ArchivedListItemMetadata,
  archivedListItemMetadataSchema,
  repositoryListMetadataSchema,
} from "../../validation/github/repository-list";
import { createMetadata } from "../shared/metadata";

/**
 * Handles operations for system repository lists
 */
export class RepositorySystemListService {
  private readonly logger: ConsoleLogger;

  /**
   * Creates a new SystemListService instance.
   * @param listService - Repository list service
   */
  constructor(
    protected readonly commands: RepositoryListCommandsPort,
    protected readonly queries: RepositoryListQueriesPort,
  ) {
    this.logger = ConsoleLogger.getInstance();
  }

  /**
   * Finds or creates a system repository list with the given source type.
   * @param sourceType - Repository list source type
   * @param defaults - Default values if list needs to be created
   * @returns The found or created system list
   */
  async findOrCreateSystemList(
    sourceType: string,
    defaults: {
      name: string;
      description?: string;
    },
  ) {
    const list = await this.queries.findBySourceType(sourceType);
    if (!list) {
      const data: NewRepositoryList = {
        name: defaults.name,
        description: defaults.description,
        sourceType,
        sourceVersion: "1.0",
        readOnly: true,
        metadata: createMetadata(repositoryListMetadataSchema),
      };

      this.logger.info(`Creating list: ${sourceType}`);

      const newList = await this.commands.create(data);

      if (!newList) {
        throw new Error(`Failed to create system list: ${sourceType}`);
      }

      return newList;
    }

    return list;
  }

  async getItems(sourceType: string, _metadataType: string) {
    const list = await this.queries.findBySourceType(sourceType);
    if (!list) {
      throw new Error(`System list not found: ${sourceType}`);
    }

    return await this.queries.findItemsByListWithRelations(list.id);
  }

  async saveToSystemList(data: RepositoryListItem) {
    const existing = await this.queries.findItem(data.listId, data.fullName);

    if (existing) {
      await this.commands.updateItem(data.listId, data.fullName, data);
      return;
    }
    await this.commands.createItem(data);
  }

  async moveToArchive(
    archivedMetadata: ArchivedListItemMetadata["archived"],
  ): Promise<number | null> {
    const { fullName, sourceType, listId } = archivedMetadata;
    this.logger.info(
      `Moving ${fullName} from list "${sourceType || listId}" to "archived" list, `,
    );

    const archivedList = await this.findOrCreateSystemList("archived", {
      name: "Archived repositories",
      description: "System managed list for archived repositories",
    });

    const existingItem = await this.queries.findItem(listId, fullName);

    await this.saveToSystemList({
      listId: archivedList.id,
      fullName,
      repositoryId: existingItem?.repositoryId || null,
      metadata: createMetadata(archivedListItemMetadataSchema, {
        archived: archivedMetadata,
        originalItem: existingItem,
      }),
    });
    await this.commands.removeItem(listId, fullName);

    return existingItem?.repositoryId || null;
  }
}
