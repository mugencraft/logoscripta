import {
  obsidianPluginConfig,
  obsidianThemeConfig,
} from "@/domain/config/defaults/change.obsidian";
import type { GitHubProcessorOptions } from "@/domain/config/github";
import type { ObsidianReleasesIntegratorOptions } from "@/domain/config/github/obsidian";
import { ObsidianReleasesCommands } from "@/domain/services/github/commands/obsidian-releases";
import { ObsidianPluginHandler } from "@/domain/services/github/handlers/obsidian-plugin";
import { ObsidianThemeHandler } from "@/domain/services/github/handlers/obsidian-theme";
import { ObsidianReleasesIntegrator } from "@/domain/services/github/integration/obsidian-releases";
import { RepositorySystemListService } from "@/domain/services/github/repository-list-system";

import { RepositoryCommandsAdapter } from "../persistence/adapters/github/repository/commands";
import { RepositoryQueriesAdapter } from "../persistence/adapters/github/repository/queries";
import { RepositoryListCommandsAdapter } from "../persistence/adapters/github/repository-list/command";
import { RepositoryListQueriesAdapter } from "../persistence/adapters/github/repository-list/queries";
import { createGithubProcessor } from "./github";

/**
 * Creates and configures an Obsidian releases integration pipeline
 */
export function createObsidianReleasesProcessor(
  options: GitHubProcessorOptions,
): ObsidianReleasesCommands {
  // Create the integrator with all dependencies

  const { adapter, processor } = createGithubProcessor(options);

  const integratorOptions: ObsidianReleasesIntegratorOptions = {
    paths: options.paths,
    pluginChangeConfig: obsidianPluginConfig,
    themeChangeConfig: obsidianThemeConfig,
    skipFetch: options.skipFetch,
  };

  const integrator = new ObsidianReleasesIntegrator(
    adapter,
    processor,
    integratorOptions,
  );

  // Initialize repository and list services

  const repositoryCommandsAdapter = new RepositoryCommandsAdapter();
  const repositoryQueriesAdapter = new RepositoryQueriesAdapter();

  const repositoryListCommands = new RepositoryListCommandsAdapter();
  const repositoryListQueries = new RepositoryListQueriesAdapter();

  const systemListService = new RepositorySystemListService(
    repositoryListCommands,
    repositoryListQueries,
  );

  // Initialize handlers with services

  const pluginHandler = new ObsidianPluginHandler(
    repositoryCommandsAdapter,
    repositoryQueriesAdapter,
    systemListService,
  );

  const themeHandler = new ObsidianThemeHandler(
    repositoryCommandsAdapter,
    repositoryQueriesAdapter,
    systemListService,
  );

  // Create the processor with the integrator and handlers

  const obsidianProcessor = new ObsidianReleasesCommands(
    integrator,
    pluginHandler,
    themeHandler,
  );
  return obsidianProcessor;
}
