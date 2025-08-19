import { githubRepositoryConfig } from "@/domain/config/defaults/change.github";
import type {
  GitHubProcessorOptions,
  GithubIntegratorOptions,
} from "@/domain/config/github";
import { GithubCommands } from "@/domain/services/github/commands/github";
import { GithubIntegrator } from "@/domain/services/github/integration/github";

import { GithubAdapter } from "../adapters/github/adapter";
import { RepositoryCommandsAdapter } from "../persistence/adapters/github/repository/commands";
import { RepositoryQueriesAdapter } from "../persistence/adapters/github/repository/queries";

/**
 * Creates and configures a GitHub integration pipeline
 */
export function createGithubProcessor(options: GitHubProcessorOptions): {
  adapter: GithubAdapter;
  integrator: GithubIntegrator;
  processor: GithubCommands;
} {
  const { paths, token, snapshotRetention = 2 } = options;

  // Initialize adapter with authentication
  const adapter = new GithubAdapter(token);

  const integratorOptions: GithubIntegratorOptions = {
    paths,
    changeConfig: githubRepositoryConfig,
    snapshotRetention,
  };

  // Create integrator with all dependencies
  const integrator = new GithubIntegrator(adapter, integratorOptions);

  // Initialize storage and processor
  const repositoryCommandsAdapter = new RepositoryCommandsAdapter();
  const repositoryQueriesAdapter = new RepositoryQueriesAdapter();
  const processor = new GithubCommands(
    integrator,
    repositoryCommandsAdapter,
    repositoryQueriesAdapter,
  );

  return {
    adapter,
    integrator,
    processor,
  };
}
