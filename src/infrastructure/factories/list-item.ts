import { ListItemCommands } from "@/application/commands/list-item";
import type { GitHubProcessorOptions } from "@/domain/config/github";
import { RepositoryListService } from "@/domain/services/repository-list";
import { RepositoryListCommandsAdapter } from "../persistence/adapters/repository-list/command";
import { RepositoryListQueriesAdapter } from "../persistence/adapters/repository-list/queries";
import { RepositoryQueriesAdapter } from "../persistence/adapters/repository/queries";
import { createGithubProcessor } from "./github";

/**
 * Creates and configures a list maintenance pipeline
 */
export function createListItemProcessor(options: GitHubProcessorOptions) {
	const repositoryQueriesAdapter = new RepositoryQueriesAdapter();
	const repositoryListStorage = new RepositoryListCommandsAdapter();
	const repositoryListQueries = new RepositoryListQueriesAdapter();
	const repositoryListService = new RepositoryListService(
		repositoryListStorage,
		repositoryListQueries,
	);

	const githubProcessor = createGithubProcessor(options).processor;
	const listItemProcessor = new ListItemCommands(
		repositoryListQueries,
		repositoryListService,
		repositoryQueriesAdapter,
		githubProcessor,
	);

	return { listItemProcessor, githubProcessor };
}
