import type { GithubCommands } from "@/application/commands/github";
import type { ListItemCommands } from "@/application/commands/list-item";
import type { ProcessingOptions } from "@/domain/config/processing";
import { useConfig } from "@/domain/config/useConfig";
import { RepositoryListService } from "@/domain/services/repository-list";
import { createListItemProcessor } from "@/infrastructure/factories/list-item";
import { RepositoryListCommandsAdapter } from "@/infrastructure/persistence/adapters/repository-list/command";
import { RepositoryListQueriesAdapter } from "@/infrastructure/persistence/adapters/repository-list/queries";
import { RepositoryQueriesAdapter } from "@/infrastructure/persistence/adapters/repository/queries";

export interface TRPCContext {
	repositoriesQueries: RepositoryQueriesAdapter;
	listQueries: RepositoryListQueriesAdapter;
	listService: RepositoryListService;
	listProcessor: ListItemCommands;
	githubProcessor: GithubCommands;
	options: ProcessingOptions;
}

export async function createContext(): Promise<TRPCContext> {
	const { config } = await useConfig();

	const options = {
		paths: config.paths,
		token: config.github?.token,
		// forceFetch: false,
		// skipFetch: false,
		// throwOnMissing: false,
		// batchSize: 50,
	};

	const repositoryListCommands = new RepositoryListCommandsAdapter();
	const repositoryListQueries = new RepositoryListQueriesAdapter();

	const listService = new RepositoryListService(
		repositoryListCommands,
		repositoryListQueries,
	);

	const { listItemProcessor, githubProcessor } =
		createListItemProcessor(options);

	return {
		repositoriesQueries: new RepositoryQueriesAdapter(),
		listQueries: repositoryListQueries,
		listService: listService,
		listProcessor: listItemProcessor,
		githubProcessor,
		options,
	};
}
