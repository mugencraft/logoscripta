import type { GitHubProcessorOptions } from "@/domain/config/github";
import { ListItemCommands } from "@/domain/services/github/commands/list-item";
import { RepositoryListService } from "@/domain/services/github/repository-list";

import { RepositoryQueriesAdapter } from "../persistence/adapters/github/repository/queries";
import { RepositoryListCommandsAdapter } from "../persistence/adapters/github/repository-list/command";
import { RepositoryListQueriesAdapter } from "../persistence/adapters/github/repository-list/queries";
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
