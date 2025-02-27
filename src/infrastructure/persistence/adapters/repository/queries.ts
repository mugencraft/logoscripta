import type { Repository } from "@/domain/models/repository";
import type { RepositoryQueriesPort } from "@/domain/ports/repository/queries";
import { parseGithubRepoToString } from "@/shared/github/utils";
import {
	owners,
	repositories,
	repositoriesToTopics,
	topics,
} from "@/shared/schema";
import { eq, getTableColumns, like, or, sql } from "drizzle-orm";
import { db } from "../../db";
import type { RepositoryWithInput } from "../../types";

export class RepositoryQueriesAdapter implements RepositoryQueriesPort {
	async findByName(repoString: string): Promise<Repository | undefined> {
		const fullName = parseGithubRepoToString(repoString);
		return await this.findByFullName(fullName);
	}

	async getAll<TWith extends RepositoryWithInput>(withInput?: TWith) {
		return await db.query.repositories.findMany({
			with: withInput,
		});
	}

	async findById(id: number) {
		return await db.query.repositories.findFirst({
			where: eq(repositories.id, id),
		});
	}

	async findByFullName(fullName: string) {
		return await db.query.repositories.findFirst({
			where: eq(repositories.fullName, fullName),
		});
	}

	async findByOwnerId(ownerId: number) {
		return await db.query.repositories.findMany({
			where: eq(repositories.ownerId, ownerId),
		});
	}

	async findByTopic(topicName: string) {
		return await db
			.select({
				...getTableColumns(repositories),
			})
			.from(repositories)
			.leftJoin(
				repositoriesToTopics,
				eq(repositories.id, repositoriesToTopics.repositoryId),
			)
			.leftJoin(topics, eq(repositoriesToTopics.topicId, topics.id))
			.where(eq(topics.topic, topicName));
	}

	async search(query: string) {
		return await db.query.repositories.findMany({
			where: or(
				like(repositories.name, `%${query}%`),
				like(repositories.description, `%${query}%`),
			),
		});
	}

	async getAllOwners() {
		return await db.query.owners.findMany({
			with: {
				repositories: true,
			},
		});
	}

	async getOwnerById(id: number) {
		return await db.query.owners.findFirst({
			where: eq(owners.id, id),
			with: {
				repositories: true,
			},
		});
	}

	async getAllTopics() {
		// Get topics with repository count
		const result = await db
			.select({
				id: topics.id,
				topic: topics.topic,
				repositoryCount: sql<number>`count(${repositoriesToTopics.repositoryId})`,
			})
			.from(topics)
			.leftJoin(
				repositoriesToTopics,
				eq(topics.id, repositoriesToTopics.topicId),
			)
			.groupBy(topics.id)
			.orderBy(topics.topic);

		return result;
	}

	async getTopicRepositories(topicId: number) {
		return await db.query.topics.findFirst({
			where: eq(topics.id, topicId),
			with: {
				repositoriesToTopics: {
					with: {
						repository: true,
					},
				},
			},
		});
	}
}
