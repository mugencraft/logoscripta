import { EntityNotFoundError, SecurityError } from "../../models/errors";
import type {
  NewRepositoryList,
  NewRepositoryListItem,
  RepositoryList,
} from "../../models/github/repository-list";
import type { RepositoryListCommandsPort } from "../../ports/github/repository-list/commands";
import type { RepositoryListQueriesPort } from "../../ports/github/repository-list/queries";
import { repositoryListItemMetadataSchema } from "../../validation/github/repository-list";
import { createMetadata } from "../shared/metadata";

export class RepositoryListService {
  constructor(
    protected readonly commands: RepositoryListCommandsPort,
    protected readonly queries: RepositoryListQueriesPort,
  ) {}

  async create(data: NewRepositoryList) {
    return await this.commands.create(data);
  }

  async delete(listId: number) {
    await this.checkReadOnly(listId);

    return await this.commands.delete(listId);
  }

  async update(listId: number, data: Partial<RepositoryList>) {
    await this.checkReadOnly(listId);
    return await this.commands.update(listId, data);
  }

  async saveToList(data: NewRepositoryListItem) {
    await this.checkReadOnly(data.listId);

    try {
      const existingItem = await this.queries.findItem(
        data.listId,
        data.fullName,
      );

      if (existingItem) {
        await this.commands.updateItem(data.listId, data.fullName, {
          ...data,
          metadata: { ...existingItem.metadata, ...data.metadata },
        });
      } else {
        await this.commands.createItem({
          ...data,
          metadata: createMetadata(
            repositoryListItemMetadataSchema,
            data.metadata,
          ),
        });
      }
    } catch (error) {
      if (
        error instanceof EntityNotFoundError ||
        error instanceof SecurityError
      ) {
        throw error;
      }

      throw new Error(
        `Failed to save item ${data.fullName} to list ${data.listId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  async removeFromList(listId: number, fullName: string) {
    await this.checkReadOnly(listId);
    await this.commands.removeItem(listId, fullName);
  }

  private async getList(id: number) {
    const list = await this.queries.findById(id);
    if (!list) {
      throw new EntityNotFoundError(`List ${id} not found`);
    }
    return list;
  }

  private async checkReadOnly(listId: number) {
    const list = await this.getList(listId);

    if (list.readOnly) {
      throw new SecurityError(`Cannot modify read-only list ${listId}`);
    }
  }
}
