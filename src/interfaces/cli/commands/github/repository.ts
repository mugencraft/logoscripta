import { ConsoleLogger } from "@/core/logging/logger";
import { getIdentifiersFromCsv } from "@/core/serialization/utils";
import type { MetadataCommandOptions } from "@/domain/config/github";
import type { ProcessingOptionsBase } from "@/domain/config/processing";
import { useConfig } from "@/domain/config/useConfig";
import { GitHubRateLimitError } from "@/infrastructure/adapters/github/error";
import { createGithubProcessor } from "@/infrastructure/factories/github";
import { parseGithubRepoToString } from "@/shared/github/utils";
import { Command } from "commander";

export const metadataCommand = () => {
	return new Command("metadata")
		.description("Get repository metadata")
		.option("-v, --verbose", "enable verbose logging")
		.option("-F, --force-fetch", "force repository update")
		.option("-S, --skip-fetch", "skip repository updates")
		.option("-t, --token <token>", "GitHub API token")
		.option("-s, --source <path>", "CSV source file path")
		.option("-r, --repo <repository>", "Single repository to fetch")
		.action(async (options: MetadataCommandOptions) => {
			const logger = ConsoleLogger.getInstance({ verbose: options.verbose });

			try {
				// Load configuration and initialize processor
				const { config } = await useConfig();
				const token = options.token || config.github?.token;

				if (!token) {
					logger.warn(
						"No GitHub token provided. Using unauthenticated requests with lower rate limits.",
					);
				}

				if (!options.source && !options.repo) {
					logger.error(
						"No repository source specified. Use --source or --repo",
					);
					process.exit(1);
				}

				// Initialize GitHub processor using the factory
				const { processor } = createGithubProcessor({
					paths: config.paths,
					token,
					forceFetch: options.forceFetch,
					skipFetch: options.skipFetch,
				});

				// Get repositories list
				const repositories = options.source
					? await getIdentifiersFromCsv(options.source, {
							identifierField: "repo",
							alternativeFields: ["repository", "github", "git", "url", "link"],
							transform: parseGithubRepoToString,
						})
					: [options.repo as string];

				logger.info(`Found ${repositories.length} repositories to process`);

				const results = {
					processed: 0,
					failed: 0,
					remaining: repositories.length,
				};

				for (const repoPath of repositories) {
					try {
						await processor.saveRepository(repoPath, {
							forceFetch: options.forceFetch,
							skipFetch: options.skipFetch,
							throwOnMissing: true,
						});
						logger.success(`Processed ${repoPath}`);
						results.processed++;
						results.remaining--;
					} catch (error) {
						if (error instanceof GitHubRateLimitError) {
							logger.error("GitHub API rate limit reached. Stopping process.");
							break;
						}

						logger.error(`Failed to process ${repoPath}: ${error}`);
						results.failed++;
						results.remaining--;
					}
				}

				logger.info("\nSummary:");
				logger.info(`- Processed: ${results.processed}`);
				logger.info(`- Failed: ${results.failed}`);
				logger.info(`- Remaining: ${results.remaining}`);
			} catch (error) {
				logger.error(`Unexpected error: ${error}`);
				process.exit(1);
			}
		});
};

export const syncCommand = () => {
	return new Command("sync")
		.description("Sync local repository metadata to DB")
		.option("-v, --verbose", "enable verbose logging")
		.option("-F, --force-fetch", "force repository update")
		.option("-S, --skip-fetch", "skip repository updates")
		.action(async (options: ProcessingOptionsBase) => {
			const logger = ConsoleLogger.getInstance({ verbose: options.verbose });

			try {
				const { config } = await useConfig();
				const { processor } = createGithubProcessor({
					paths: config.paths,
					forceFetch: options.forceFetch,
					skipFetch: options.skipFetch,
				});

				await processor.syncFromSnapshots();
			} catch (error) {
				logger.error(`Unexpected error: ${error}`);
				process.exit(1);
			}
		});
};
