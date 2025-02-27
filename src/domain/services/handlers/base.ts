import type { Change } from "@/core/changes/types";
import { ConsoleLogger } from "@/core/logging/logger";
import { parseGithubRepoToString } from "@/shared/github/utils";
import type { ObsidianPluginRemoved } from "@/shared/obsidian/types";
import type { Repository } from "../../models/repository";
import type { RepositoryListItem } from "../../models/repository-list";
import type { RepositoryCommandsPort } from "../../ports/repository/commands";
import type { RepositoryQueriesPort } from "../../ports/repository/queries";
import type { ArchivedMetadata } from "../../value-objects/metadata/archived";
import type { ListItemMetadata } from "../../value-objects/metadata/base";
import type { RepositorySystemListService } from "../repository-list-system";

/**
 * Base class for handling metadata changes for system repository lists.
 * Provides common functionality for handling changes for system lists.
 *
 * @template T - Type of entity being tracked
 * @template M - Type of metadata for the entity
 */
export abstract class BaseSystemListHandler<T, M extends ListItemMetadata> {
	protected readonly logger: ConsoleLogger;
	protected sourceType?: string;
	protected listId?: number;

	/**
	 * Creates a new BaseSystemListHandler instance.
	 * @param repositoryCommandsPort - Repository service
	 * @param listService - System list service
	 */
	constructor(
		protected readonly repositoryCommandsPort: RepositoryCommandsPort,
		protected readonly repositoryQueriesPort: RepositoryQueriesPort,
		protected readonly listService: RepositorySystemListService,
	) {
		this.logger = ConsoleLogger.getInstance();
	}

	/**
	 * Sets the list for the handler.
	 * Create one if the list is not found.
	 *
	 * @param systemType - System list type
	 */
	async setList(systemType: string): Promise<void> {
		this.logger.info(`Set list: ${systemType}`);
		const list = await this.listService.findOrCreateSystemList(systemType, {
			name: `List of ${systemType} repositories`,
			description: `System managed list for ${systemType}`,
		});

		this.sourceType = list?.sourceType as string;
		this.listId = list?.id;
	}

	/**
	 * Public method for handling all standard changes.
	 *
	 * @param change - Change to handle, change.id is the repository full name
	 */
	async handle(change: Change<T>): Promise<void> {
		if (!this.listId) {
			throw new Error("List not set");
		}

		switch (change.type) {
			case "add":
			case "full":
			case "soft": {
				const repository = await this.getRepository(change.id);
				const metadata = await this.createMetadata(change, repository);

				const item: RepositoryListItem = {
					listId: this.listId,
					fullName: change.id,
					repositoryId: repository?.id || null,
					metadata,
				};

				await this.listService.saveToSystemList(item);
				break;
			}
			case "removal": {
				const archivedMetadata = this.getArchivedMetadata(
					"Removed from source files",
					change.id,
				);

				await this.listService.moveToArchive(archivedMetadata);
				break;
			}
		}
	}

	async handleArchival(
		pluginRemoval: ObsidianPluginRemoved,
		fullName: string,
	): Promise<number | undefined> {
		const archivedMetadata = this.getArchivedMetadata(
			pluginRemoval.reason,
			fullName,
		);

		return await this.listService.moveToArchive(archivedMetadata);
	}

	private getArchivedMetadata(
		reason: string,
		fullName: string,
	): ArchivedMetadata {
		if (this.sourceType && this.listId) {
			const archivedMetadata = {
				fullName,
				reason,
				removedAt: new Date().toISOString(),
				sourceType: this.sourceType,
				listId: this.listId,
			};

			return archivedMetadata;
		}

		throw new Error("List not set");
	}

	protected async getRepository(
		repoString: string,
	): Promise<Repository | undefined> {
		const fullRepoString = parseGithubRepoToString(repoString);
		return await this.repositoryQueriesPort.findByName(fullRepoString);
	}

	protected abstract createMetadata(
		change: Change<T>,
		repository?: Repository,
	): Promise<M>;
}
