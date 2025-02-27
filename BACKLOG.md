# Project Backlog

This document tracks known issues, planned features, and technical improvements. Items will be moved to GitHub Projects for formal tracking and assignment.

## Project Features

- Full-Stack Development Extensions:
  - Static Site Generation (SSG/SSR): Next.js/Astro
  - Content management patterns
  - SEO optimization
  - Mobile Development: React Native

- Browser & Platform Integration:
  - Browser Extensions
  - VS Code Extensions
  - Obsidian Plugin
  - Desktop Apps: Electron/Tauri implementation
  - AI/ML Integration

- patterns:
  - WebSocket/SSE implementation
  - Push notifications
  - Live collaboration
  - Microservices Architecture
    - Service decomposition
    - API gateway patterns
    - Message queues
    - Service discovery

## Interfaces Layer

### Services and API

Bugs:

- Fix typing issue in `RepositoryQueriesAdapter.getAll<TWith extends RepositoryWithInput>`
  - check TRPCContext: it fails in typing the extended rows as in repositoryRouter.getAll
- Add missing owner and repositoryListItems in `RouterOutputs["repository"]["getAll"][0]`

Improvements:

- Rename interfaces/server to api
- Create a factory for the list service in TRPCContext

### CLI

Improvements:

- Make `-v`, `-F`, `-S` options shared options across commands (check app config options)
- Simplify metadataCommand by delegating logic to command and factory

### UI

Bugs:

- Resolve duplication in useListOperations and useListActions (toast duplication)
- Fix dark mode `--mono-` variable issues in globals.css
- Fix prettier formatter for globals.css

Features:

- Enhance Dashboard functionality
- Persist useLayout values in localStorage

### DataTable Component

Features:

- Make headerStyle sticky (currently only columns are sticky)

Improvements:

- Review type propagation in useDataTable (T = string | number)
- Check colspan calculation logic: `config.features?.enableRowSelection ? 2 : 0`

#### Cells

Bugs:

- Fix OwnerCell filter behavior and alignment issues:
  - on toggle, if no Owner is selected, remove the whole filter
  - button content should align to start

Features:

- Enhance LanguageCell with icons library
- Add Obsidian resource linking to pluginName and themeName
- In owners and topics tables, add links to repository, and active filter by entity, to single cells and to rows actions.

#### Resizing

Bugs:

- Fix popup visibility in TopicsCell and ListIdsCell
- Fix incorrect resizing in SizeCell

Features:

- Improve ResizableHeader double-click behavior

#### Controls

Bugs:

- Improve AddRepositoriesDialog error handling
- Fix Pagination SelectContent width is not as SelectTrigger

Features:

- Enhance AddRepositoriesDialog with counts and additional parsing (packages.json, pyproject.toml, cargo.toml)
- Improve ColumnVisibilityControl functionality: set sticky columns, hide Obsidian columns
- Add export capabilities (clipboard, CSV, XLS, SQL)
- Enhance Active Filters visualization for multiple values, allow partial removing.
- Implement saved filters
- Improve FacetedFilter styling and functionality
- Add Row Controls: set line-clamp height
- SortableHeaders: add sort or filter by checked

Improvements:

- Consolidate ViewAction and ActionButtons components
  - improve link and element handling
  - include dialog in component element
- Address ToggleListDialog missing selectedIds

### Forms

Improvements:

- Review default handling approach
- Consider zod for validation
- Explore DRY principles in form generation

## Core Layer

Bugs:

- Fix ChangeDetector.createChange to track diffs only (not the whole `entity`)
- Enhance Logger implementation and progress tracking

Features:

- Integrate changelog analysis
- Move changelog recording to database

## Application Layer

Improvements:

- Create list service factory (check TRPCContext)
- Standardize configuration options (check ProcessingOptionsBase, ProcessingOptions, GithubIntegratorOptions and SyncRepositoryOptions)
- Find better location for SyncSummaryResult like interfaces
- Improve operation result type handling
- Split commands into isolated files

## Domain Layer

Bugs:

- Fix snapshot not updated in GithubProcessor.saveRepository

Features:

- Add Drizzle dump and load scripts
- Implement metadata type filtering in RepositorySystemListService.getItems
- Extend Repository model with removal and fullNames history tracking

Improvements:

- Standardize configuration and option handling
- Improve update of ListItem fullName on repository fullName change
- Enhance ListItem metadata handling (check ListItemCommands, ListItemProcessor, RepositoryListCommandsAdapter.update)
  - add default metadata to custom list items (system.updatedAt, etc)
  - implement baseSystemMetadataSchema, obsidianPluginSchema, obsidianThemeSchema

## Infrastructure Layer

Features:

- Add support for GitLab and other systems

Improvements:

- Fix infrastructure/persistence/db singleton importing from domain/config

### Github

Bugs:

- Verify last update tracking functionality, is it last commit date?

## Dev

Improvements:

- Review Vite config server and preview proxies
- Standardize file naming conventions

## Tests

Features:

- Implement skipped tests for GitHub utils and repository list
