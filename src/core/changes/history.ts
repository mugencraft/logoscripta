import { join } from "node:path";
import { getFirstCharacter, validatePathSegment } from "../fs/paths";
import { SnapshotService } from "./snapshot";
import { ChangeTracker } from "./tracker";
import type { Change, HistoryOptions, HistoryResult } from "./types";

/**
 * Manages entity history through coordinated snapshots and change tracking.
 * Provides a unified interface for maintaining historical entity state.
 */
export class HistoryService<T extends object> {
	private readonly snapshot: SnapshotService;
	private readonly changelog: ChangeTracker<T>;

	/**
	 * Creates a new HistoryService instance.
	 * @param options - Configuration for history tracking behavior
	 */
	constructor(private readonly options: HistoryOptions) {
		// Initialize snapshot service
		this.snapshot = new SnapshotService({
			retainCount: options.snapshotRetention,
		});

		// Initialize change tracker
		this.changelog = new ChangeTracker<T>(
			options.changeConfig,
			options.entityType,
		);
	}

	async processChanges(identifier: string, newEntity: T | T[]) {
		const oldEntity = await this.getLatestSnapshot(identifier);

		return await this.trackChanges(identifier, newEntity, oldEntity);
	}

	/**
	 * Updates entity history by creating snapshots and tracking changes.
	 * @param identifier - Unique entity identifier
	 * @returns History tracking results including snapshot and change information
	 */
	async trackChanges(
		identifier: string,
		newEntity: T | T[],
		oldEntity?: T | T[],
	): Promise<HistoryResult<T>> {
		const entityPath = this.getEntityPath(identifier);

		// Create snapshot
		const snapshotResult = await this.snapshot.updateSnapshots(
			entityPath,
			newEntity,
		);

		// Track changes
		let changes: Change<T>[] | null = null;
		const changelogPath = join(entityPath, "changelog.json");

		changes = await this.changelog.trackChanges(
			newEntity,
			oldEntity,
			changelogPath,
		);

		return {
			identifier,
			snapshot: snapshotResult,
			changes,
		};
	}

	/**
	 * Gets the entity-specific directory path
	 */
	private getEntityPath(identifier: string): string {
		validatePathSegment(identifier);
		return this.options.useEntityFolder
			? join(this.options.basePath, getFirstCharacter(identifier), identifier)
			: join(this.options.basePath, identifier);
	}
	/**
	 * Retrieves the most recent snapshot for an entity.
	 * @param identifier - Unique entity identifier
	 * @returns Latest entity snapshot or undefined if none exists
	 */
	async getLatestSnapshot(identifier: string): Promise<T | T[] | undefined> {
		const entityPath = this.getEntityPath(identifier);
		return this.snapshot.getLatestSnapshot<T | T[]>(entityPath);
	}

	/**
	 * Determines if an entity's snapshot needs refreshing.
	 * @param identifier - Unique entity identifier
	 * @returns True if snapshot should be refreshed
	 */
	async shouldRefresh(identifier: string): Promise<boolean> {
		const entityPath = this.getEntityPath(identifier);
		return this.snapshot.shouldRefresh(entityPath);
	}
}
