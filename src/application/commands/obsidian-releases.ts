import { ConsoleLogger } from "@/core/logging/logger";
import type {
	ProcessableChanges,
	ProcessingSummary,
} from "@/domain/config/obsidian";
import type { ObsidianPluginHandler } from "@/domain/services/handlers/obsidian-plugin";
import type { ObsidianThemeHandler } from "@/domain/services/handlers/obsidian-theme";
import type { ObsidianReleases } from "@/shared/obsidian/types";
import type { ObsidianReleasesIntegrator } from "../integration/obsidian-releases";

export class ObsidianReleasesCommands {
	private readonly logger: ConsoleLogger;

	constructor(
		private readonly integrator: ObsidianReleasesIntegrator,
		private readonly pluginHandler: ObsidianPluginHandler,
		private readonly themeHandler: ObsidianThemeHandler,
	) {
		this.logger = ConsoleLogger.getInstance();
	}

	/**
	 * Syncs releases data from Obsidian.
	 * Coordinates the full process from data fetching to storage.
	 *
	 * @returns Summary of processed changes
	 */
	public async syncReleases(): Promise<ProcessingSummary> {
		// Fetch and process data through integrator
		const releases = await this.integrator.fetchAndProcessReleases();
		const { files, changes, missing } = releases;

		// Process all changes in store
		const removed = await this.processAllChanges(changes, files);

		return this.createSummary(files, changes, missing, removed);
	}

	private async processAllChanges(
		changes: ProcessableChanges,
		files: ObsidianReleases,
	): Promise<string[]> {
		// Initialize handlers with list IDs
		await this.pluginHandler.setList("obsidian-plugin");
		await this.themeHandler.setList("obsidian-theme");

		// Initialize plugin handler with stats and deprecation data
		if (files.stats && files.deprecation) {
			await this.pluginHandler.initializeState(
				files.stats.content,
				files.deprecation.content,
			);
		}

		const progress = this.logger.getProgress({
			text: "ObsidianReleasesProcessor Processing changes...",
			color: "red",
		});

		for (const change of changes.plugins || []) {
			progress.update(`plugin change: (${change.type}) ${change.id}`);

			await this.pluginHandler.handle(change);
		}

		for (const change of changes.themes || []) {
			progress.update(`theme change: (${change.type}) ${change.id}`);

			await this.themeHandler.handle(change);
		}

		const archivedRepos = [];
		for (const removal of files.removed.content) {
			progress.update(`plugin removal: ${removal.id} (${removal.reason})`);

			const plugin = files.plugins.content.find((p) => p.id === removal.id);
			if (!plugin) continue;

			const removedId = await this.pluginHandler.handleArchival(
				removal,
				plugin.repo,
			);

			if (removedId) archivedRepos.push(plugin.repo);
		}

		progress.complete("Changes processed");

		return archivedRepos;
	}

	/**
	 * Creates a summary of the processing operation.
	 */
	private createSummary(
		files: ObsidianReleases,
		changes: ProcessableChanges,
		missing: string[],
		removed: string[],
	): ProcessingSummary {
		return {
			processed: {
				plugins: files.plugins?.content?.length ?? 0,
				themes: files.themes?.content?.length ?? 0,
			},
			changes: {
				plugins: changes.plugins?.length ?? 0,
				themes: changes.themes?.length ?? 0,
				removed: removed?.length ?? 0,
			},
			missing,
		};
	}
}
