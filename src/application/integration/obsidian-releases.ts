import { HistoryService } from "@/core/changes/history";
import { ConsoleLogger } from "@/core/logging/logger";
import { OBSIDIAN_ENTITY_TYPES } from "@/domain/config/defaults/change.obsidian";
import type {
	ObsidianReleasesIntegratorOptions,
	ProcessableChanges,
} from "@/domain/config/obsidian";
import type { GitHubApiPort } from "@/domain/ports/github-api";
import {
	OBSIDIAN_FILES,
	OBSIDIAN_FILE_KEYS,
	OBSIDIAN_REPO,
	type ObsidianPlugin,
	type ObsidianReleases,
	type ObsidianReleasesContent,
	type ObsidianTheme,
} from "@/shared/obsidian/types";
import type { GithubCommands } from "../commands/github";

/**
 * Integrates with Obsidian's community releases repository
 * to fetch and process plugin/theme data.
 * Handles raw data fetching, repository verification, and change tracking.
 */
export class ObsidianReleasesIntegrator {
	private readonly logger: ConsoleLogger;
	private readonly pluginHistory: HistoryService<ObsidianPlugin>;
	private readonly themeHistory: HistoryService<ObsidianTheme>;
	/**
	 * Creates a new ObsidianReleasesIntegrator instance.
	 * @param githubAdapter - GitHub API adapter for making authenticated requests
	 * @param githubCommands - Processor for handling GitHub repositories
	 */
	constructor(
		private readonly githubAdapter: GitHubApiPort,
		private readonly githubCommands: GithubCommands,
		private readonly options: ObsidianReleasesIntegratorOptions,
	) {
		this.logger = ConsoleLogger.getInstance();
		this.pluginHistory = new HistoryService<ObsidianPlugin>({
			basePath: options.paths.obsidian,
			entityType: OBSIDIAN_ENTITY_TYPES.PLUGIN,
			changeConfig: { ...options.pluginChangeConfig },
		});

		this.themeHistory = new HistoryService<ObsidianTheme>({
			basePath: options.paths.obsidian,
			entityType: OBSIDIAN_ENTITY_TYPES.THEME,
			changeConfig: { ...options.themeChangeConfig },
		});
	}

	/**
	 * Fetches and processes all community files from Obsidian's releases repository.
	 * Ensures all referenced repositories exist before processing changes.
	 *
	 * @returns Processed release data and tracked changes
	 */
	public async fetchAndProcessReleases(): Promise<{
		files: ObsidianReleases;
		changes: ProcessableChanges;
		missing: string[];
	}> {
		// Fetch raw data
		const files = await this.fetchFiles();

		// Extract repository references
		const repositories = this.extractRepositories(files);

		// Ensure repositories exist
		const missing = await this.ensureRepositories(repositories);

		// Process changes
		const changes = await this.processChanges(files);

		return {
			files,
			changes,
			missing,
		};
	}

	private async processChanges(files: ObsidianReleases) {
		const { changes: plugins } = await this.pluginHistory.processChanges(
			OBSIDIAN_ENTITY_TYPES.PLUGIN,
			files.plugins.content,
		);

		const { changes: themes } = await this.themeHistory.processChanges(
			OBSIDIAN_ENTITY_TYPES.THEME,
			files.themes.content,
		);

		return {
			plugins,
			themes,
		};
	}

	/**
	 * Fetches all community files from Obsidian's releases repository.
	 */
	private async fetchFiles(): Promise<ObsidianReleases> {
		this.logger.info("Fetching Obsidian community files...");
		const results = await Promise.all(
			OBSIDIAN_FILE_KEYS.map((key) =>
				this.githubAdapter.getFile<ObsidianReleasesContent[typeof key]>(
					OBSIDIAN_REPO,
					OBSIDIAN_FILES[key],
				),
			),
		);

		return Object.fromEntries(
			OBSIDIAN_FILE_KEYS.map((key, index) => [
				key,
				{
					filePath: OBSIDIAN_FILES[key],
					content: results[index],
				},
			]),
		) as ObsidianReleases;
	}

	private extractRepositories(files: ObsidianReleases): Set<string> {
		const repositories = new Set<string>();

		// Collect repository references
		if (files.plugins?.content) {
			for (const plugin of files.plugins.content) {
				repositories.add(plugin.repo);
			}
		}
		if (files.themes?.content) {
			for (const theme of files.themes.content) {
				repositories.add(theme.repo);
			}
		}

		return repositories;
	}

	private async ensureRepositories(
		repositories: Set<string>,
	): Promise<string[]> {
		const { skipFetch } = this.options;
		const missingRepositories: string[] = [];

		this.logger.info(
			`Ensuring ${repositories.size} repositories, skipFetch: ${skipFetch}`,
		);

		const progress = this.logger.getProgress({
			text: "Ensuring repositories...",
			color: "blue",
		});

		for (const repo of repositories) {
			try {
				progress.update(`Ensuring repository: ${repo}`);
				await this.githubCommands.saveRepository(repo, {
					skipFetch,
					throwOnMissing: !skipFetch,
				});
			} catch (error) {
				missingRepositories.push(repo);
			}
		}
		progress.complete("Repositories ensured");

		return missingRepositories;
	}
}
