import type { RepositoryCommandsPort } from "@/domain/ports/repository/commands";
import {
	transformToOwner,
	transformToRepository,
} from "@/infrastructure/adapters/github/transformer";
import type { GithubRepository } from "@/shared/github/types";
import {
	owners,
	repositories,
	repositoriesToTopics,
	topics,
} from "@/shared/schema";
import { eq, sql } from "drizzle-orm";
import { db } from "../../db";
import type { DbTransaction } from "../../types";

export class RepositoryCommandsAdapter implements RepositoryCommandsPort {
	/**
	 * Creates or updates repository-related entities from GitHub data
	 * @param repo - GitHub repository data
	 * @param existingId - Optional ID for updates
	 * @returns Created/updated repository record
	 */
	private async upsertRepositoryEntities(
		repo: GithubRepository,
		existingId?: number,
	) {
		return await db.transaction(async (tx) => {
			await this.upsertOwners(tx, repo);

			const topicRecords = await this.upsertTopics(tx, repo.topics || []);

			// Insert or update repository
			const repositoryData = transformToRepository(repo);
			const [repository] = existingId
				? await tx
						.update(repositories)
						.set(repositoryData)
						.where(eq(repositories.id, existingId))
						.returning()
				: await tx.insert(repositories).values(repositoryData).returning();

			// Update topic associations if needed
			if (repository && topicRecords.length > 0) {
				// First remove existing topic associations if updating
				if (existingId) {
					await tx
						.delete(repositoriesToTopics)
						.where(eq(repositoriesToTopics.repositoryId, existingId));
				}

				// Add new topic associations
				for (const topic of topicRecords) {
					if (!topic) continue;
					await tx.insert(repositoriesToTopics).values({
						repositoryId: repository.id,
						topicId: topic.id,
					});
				}
			}

			return repository;
		});
	}

	private async upsertOwners(tx: DbTransaction, repo: GithubRepository) {
		return await tx
			.insert(owners)
			.values(transformToOwner(repo))
			.onConflictDoUpdate({
				target: owners.githubId,
				set: {
					login: repo.owner.login,
					avatarUrl: repo.owner.avatar_url,
					repoCount: sql`${owners.repoCount} + 1`,
				},
			})
			.returning();
	}

	private async upsertTopics(tx: DbTransaction, topicNames: string[]) {
		return await Promise.all(
			topicNames.map(async (topic) => {
				const [record] = await tx
					.insert(topics)
					.values({ topic })
					.onConflictDoNothing()
					.returning();

				return (
					record ||
					(await tx.query.topics.findFirst({
						where: eq(topics.topic, topic),
					}))
				);
			}),
		);
	}

	async create(repo: GithubRepository) {
		return await this.upsertRepositoryEntities(repo);
	}

	async update(id: number, data: GithubRepository) {
		return await this.upsertRepositoryEntities(data, id);
	}

	async delete(id: number): Promise<void> {
		// First delete any topic associations
		await db
			.delete(repositoriesToTopics)
			.where(eq(repositoriesToTopics.repositoryId, id));

		// Then delete the repository
		await db.delete(repositories).where(eq(repositories.id, id));
	}
}
