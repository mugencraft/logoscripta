// Config
import type { ProcessingOptions } from "@/domain/config/processing";
import { useConfig } from "@/domain/config/useConfig";
import { ContentImportExportService } from "@/domain/services/content/import-export";
// Services
import type { GithubCommands } from "@/domain/services/github/commands/github";
import type { ListItemCommands } from "@/domain/services/github/commands/list-item";
import { RepositoryListService } from "@/domain/services/github/repository-list";
import { FileSystemService } from "@/domain/services/shared/file-system";
import { TagSystemImportExportService } from "@/domain/services/tagging/import-export";
import { TagSystemService } from "@/domain/services/tagging/tag";
import { TagValidationService } from "@/domain/services/tagging/validation";
// Factories
import { createListItemProcessor } from "@/infrastructure/factories/list-item";
// Persistence
import { ContentCommandsAdapter } from "@/infrastructure/persistence/adapters/content/commands";
import { ContentQueriesAdapter } from "@/infrastructure/persistence/adapters/content/queries";
import { RepositoryQueriesAdapter } from "@/infrastructure/persistence/adapters/github/repository/queries";
import { RepositoryListCommandsAdapter } from "@/infrastructure/persistence/adapters/github/repository-list/command";
import { RepositoryListQueriesAdapter } from "@/infrastructure/persistence/adapters/github/repository-list/queries";
import { TaggingCommandsAdapter } from "@/infrastructure/persistence/adapters/tagging/commands";
import { TagSystemQueriesAdapter } from "@/infrastructure/persistence/adapters/tagging/queries";

export interface TRPCContext {
  options: ProcessingOptions;
  fileSystemService: FileSystemService;

  // Github
  repositoriesQueries: RepositoryQueriesAdapter;
  listQueries: RepositoryListQueriesAdapter;
  listService: RepositoryListService;
  listProcessor: ListItemCommands;
  githubProcessor: GithubCommands;

  // Tagging
  taggingQueries: TagSystemQueriesAdapter;
  taggingCommands: TaggingCommandsAdapter;
  taggingImportExport: TagSystemImportExportService;
  taggingService: TagSystemService;

  // Content
  contentQueries: ContentQueriesAdapter;
  contentCommands: ContentCommandsAdapter;
  contentImportExport: ContentImportExportService;

  // Tag inference
  tagValidationService: TagValidationService;
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

  const fileSystemService = new FileSystemService();

  const repositoryListCommands = new RepositoryListCommandsAdapter();
  const repositoryListQueries = new RepositoryListQueriesAdapter();

  const listService = new RepositoryListService(
    repositoryListCommands,
    repositoryListQueries,
  );

  const { listItemProcessor, githubProcessor } =
    createListItemProcessor(options);

  // Initialize tag system adapters
  const tagSystemQueries = new TagSystemQueriesAdapter();
  const tagSystemCommands = new TaggingCommandsAdapter();
  const tagSystemService = new TagSystemService(
    tagSystemQueries,
    tagSystemCommands,
  );

  const taggingImportExport = new TagSystemImportExportService(
    tagSystemQueries,
    tagSystemCommands,
  );

  // Initialize content adapters
  const contentQueries = new ContentQueriesAdapter();
  const contentCommands = new ContentCommandsAdapter();

  // Initialize inference service
  const tagValidationService = new TagValidationService(tagSystemQueries);

  const contentImportExport = new ContentImportExportService(
    contentCommands,
    contentQueries,
  );

  return {
    options,
    fileSystemService,
    repositoriesQueries: new RepositoryQueriesAdapter(),
    listQueries: repositoryListQueries,
    listService: listService,
    listProcessor: listItemProcessor,
    githubProcessor,
    taggingQueries: tagSystemQueries,
    taggingCommands: tagSystemCommands,
    taggingService: tagSystemService,
    taggingImportExport,
    contentQueries,
    contentCommands,
    contentImportExport,
    tagValidationService,
  };
}
