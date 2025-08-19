import { and, eq, inArray } from "drizzle-orm";

import type {
  NewRepositoryList,
  NewRepositoryListItem,
  RepositoryListItem,
} from "@/domain/models/github/repository-list";
import type { RepositoryListCommandsPort } from "@/domain/ports/github/repository-list/commands";
import { updateMetadataTimestamp } from "@/domain/services/shared/metadata";
import { repositoryListItems, repositoryLists } from "@/shared/schema";

import { db } from "../../../db";

export class RepositoryListCommandsAdapter
  implements RepositoryListCommandsPort
{
  async create(data: NewRepositoryList) {
    const [created] = await db.insert(repositoryLists).values(data).returning();
    return created;
  }

  async update(listId: number, data: Partial<NewRepositoryList>) {
    const [updated] = await db
      .update(repositoryLists)
      .set(updateMetadataTimestamp(data))
      .where(eq(repositoryLists.id, listId))
      .returning();

    return updated;
  }

  async delete(listId: number) {
    const [deleted] = await db
      .delete(repositoryLists)
      .where(eq(repositoryLists.id, listId))
      .returning();

    return deleted;
  }

  async createItem(data: NewRepositoryListItem) {
    const [created] = await db
      .insert(repositoryListItems)
      .values(data)
      .returning();

    return created;
  }

  async updateItem(listId: number, fullName: string, data: RepositoryListItem) {
    const [updated] = await db
      .update(repositoryListItems)
      .set(updateMetadataTimestamp(data))
      .where(this.itemConditions.byListAndFullName(listId, fullName))
      .returning();

    return updated;
  }

  async removeItem(listId: number, fullName: string) {
    const [deleted] = await db
      .delete(repositoryListItems)
      .where(this.itemConditions.byListAndFullName(listId, fullName))
      .returning();

    return deleted;
  }

  async removeItems(listId: number, repositoryNames: string[]) {
    await db
      .delete(repositoryListItems)
      .where(
        and(
          eq(repositoryListItems.listId, listId),
          inArray(repositoryListItems.fullName, repositoryNames),
        ),
      )
      .returning();
  }

  private readonly itemConditions = {
    byListAndRepositoryId: (listId: number, repoId: number) =>
      and(
        eq(repositoryListItems.listId, listId),
        eq(repositoryListItems.repositoryId, repoId),
      ),
    byListAndFullName: (listId: number, fullName: string) =>
      and(
        eq(repositoryListItems.listId, listId),
        eq(repositoryListItems.fullName, fullName),
      ),
  };
}
