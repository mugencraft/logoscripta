import { ChangeDetector } from "@/core/changes/detector";
import { JsonChangeStore } from "@/core/changes/store";
import type { ChangeDetectorConfig } from "@/core/changes/types";
import type { Change } from "@/core/changes/types";

/**
 * Coordinates change detection and persistence for entity updates.
 * Combines ChangeDetector and JsonChangeStore to track meaningful changes
 * to entity state over time.
 */
export class ChangeTracker<T extends object> {
	private detector: ChangeDetector<T>;
	private store: JsonChangeStore<T>;

	/**
	 * Creates a new ChangeTracker instance.
	 * @param config - Configuration for change detection
	 * @param entityType - Type identifier for the tracked entity
	 * @param changelogPath - Optional path for change log storage
	 */
	constructor(
		config: ChangeDetectorConfig,
		readonly entityType: string,
		private readonly changelogPath?: string,
	) {
		this.detector = new ChangeDetector<T>(config, entityType);
		this.store = new JsonChangeStore<T>();
	}

	/**
	 * Detects and records changes between entity states.
	 * @returns Detected change or null if no meaningful changes found
	 */
	async trackChanges(
		newEntity: T | T[],
		oldEntity?: T | T[],
		changelogPathOverride?: string,
	): Promise<Change<T>[] | null> {
		const changelogPath = changelogPathOverride || this.changelogPath;
		if (!changelogPath) {
			throw new Error("Changelog path not provided");
		}

		const changes = this.detector.detectChanges(newEntity, oldEntity);
		if (!changes) return null;

		await this.store.append(changes, changelogPath);
		return changes;
	}
}
