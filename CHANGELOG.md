# Changelog
<!-- markdownlint-disable MD024 -->

## v0.2.1 - URL Content

Implement URL content type with client-side import support

### Global

#### repomix

- **CHANGED**: Simplify configuration

#### packages

- **ADDED**: fast-csv for CSV parsing

### core

#### serialization

- **CHANGED**: `readCsv` renamed to `readStream` and migrated from papaparse to fast-csv
- **REMOVED**: `serialization/types.ts`
- **MOVED**: `serialization/export.ts` to `ui/components/table/controls`

#### utils

- **MOVED**: `getFirstCharacter` to `utils/format.ts`

### domain

#### services

- **CHANGED**: `FileSystemService`
  - Renamed `getImportImagesWithCaptions` to `getImportPreview`
  - Added document preview support
  - Added `uploadToImport` and `deleteImportFile` methods (not implemented)

#### content

- **ADDED**: URL import types and validation
- **CHANGED**: `ContentImportExportService`
  - Renamed `importFromFileSystem` to `importFromServer`
  - Added `importFromClient` for client-side imports
- **ADDED**: `services/content/parser.ts` - URL import utilities

#### validation

- **ADDED**: `originalId` field to `importMetadataSchema`

### interfaces

#### backend

- **CHANGED**: `ContentView` - Enhanced import wizard with URL support

### ui

#### core

- **UPDATED**: `command`, `dialog` components

#### content

- **CHANGED**: `ItemPreview` - Added URL content type support
- **ADDED**: `parseImportData` utility to `content/import/wizard`
- **CHANGED**: `ImportWizard`
  - Added back button support
  - Enhanced to handle different import source types

#### import-export

- **ADDED**: `parseCsvToJson` using papaparse for CSV processing
- **ADDED**: `FileContentParser` for file upload and text parsing
- **ADDED**: `ImportResult` component for import completion feedback

## v0.2.0 - Content and Tagging

### Content, Tagging and Lora Training Captioning

#### scripts

- **NEW**: `applyCaptions` Script to apply captions from JSON file to image.txt files

#### Content

##### Content Services

- **NEW**: `ContentImportExportService`

##### Content Views

###### Collections

- **NEW**: Collections view with `CollectionForm`
- **NEW**: Collection detail view
- **NEW**: Collection tag analysis view
- **NEW**: Items view with table and grid layouts (collection related)
- **NEW**: Item view with tagging

###### Items (all)

- **NEW**: Items view with `ItemForm`
- **NEW**: Item view with tagging

##### Content Special Components

- **NEW**: `collection/analysis/`
  - `CollectionStatsCard`
  - `ContentTypeBreakdown`
  - `TagDistributionChart`
- **NEW**: `import/`
  - `ContentImport`
  - `wizard/`
    - `ImportWizard`
    - `ImportSourceSelector`
    - `ImportOptions`
    - `ImportPreview`
- **NEW**: `dashboard/ContentStatisticsBanner`
- **NEW**: `item/`
  - `details/`
    - `ItemDetails`
    - `ItemMetadata`
    - `ItemTags`
    - `useItemsNavigator`
  - `grid/`
    - `ItemsGrid`
    - `ItemInfo`
  - `ItemPreview`

#### Tagging

##### Tagging Services

- **NEW**: `TagSystemImportExportService`
- **NEW**: `TagSystemService`
- **NEW**: `TagValidationService`

##### Tagging Views

- **NEW**: Tags view with `TagForm`
  - `TagCategoryAssociationsManager`
  - `TagRelationshipsManager`
- **NEW**: TagSystems view with `TagSystemForm`
- **NEW**: TagGroups view with `TagGroupForm`
  - `TagGroupVisualizerManager`
- **NEW**: TagCategories view with `TagCategoryForm`

##### Tagging Special Components

- **NEW**: `categories/`
  - `CategorySection`
  - `CategoryValidationBanner`
  - `TagCategoryGrid`
- **NEW**: `groups/`
  - `visualizer-config/`
    - `editor/`
      - `coordinateTransforms`
      - `ImagePreview` (with **react-rnd**)
      - `ImageSelector`
      - `MappingConfig`
      - `TagCombinationSelector`
      - `TagConfigEditor`
      - `TagImageMapping`
      - `useContainerDimensions`
      - `ValidationErrors`
    - `CategorySelector`
    - `LayoutConfigSection`
    - `TagsConfigSection`
    - `useTagManagement`
    - `useVisualizerConfig`
  - `GroupHeader`
  - `TagGroupManager`
  - `TagsVisualizer`
  - `useCategoryGrouping`
- **NEW**: `import/`
  - `TagSystemStructurePreview`
  - `TagSystemUploader`
- **NEW**: `manager/`
  - `RawTagsAnalysis`
  - `RawTagSection`
  - `TagSystemManager`
- **NEW**: `TagButton`
- **NEW**: `useTagValidation` (not implemented)

---

### Global

#### Features

- **CHANGED**: Move to folders (github, content, tagging)

#### tsconfig

- **CHANGED**: Disable declaration to fix type limits issues with `createTRPCReact<AppRouter>`

#### biome

- **CHANGED**: Update to v2 (sort imports, spaces instead of tabs, strict checks)

#### drizzle

- **CHANGED**: Move schema out of domain in a shared layer

#### tailwind

- **ADDED**: `fontSize.xxs` style

#### vite

- **CHANGED**: Update tanstack router
- **ADDED**: `VITE_PATHS` server alias

#### repomix

- **CHANGED**: Simplify config

#### zod

- **CHANGED**: Update to official v4

#### dependency-cruiser

- **CHANGED**: Moved to .config folder

#### lodash

- **REMOVED**: Dependency removed

---

### core

#### changes

- **CHANGED**: Signature changes to existing functions

#### fs

- **ADDED**: `path.ts` - `buildSafePath`
- **ADDED**: `files.ts` - `readTextFile`, `getMimeType`, `scanDirectoryNames`, `getFolderNames`, `getImageFileNames`, `isImageFile`, `getImageFilesInfo`

#### utils

- **ADDED**: `array.ts` - `chunk`
- **ADDED**: `format.ts` - `normalizePath`, `getFilenameWithoutExt`, `sanitizeFolderName`, `upperFirst`, `startCase`
- **ADDED**: `object.ts` - `getValueAtPath`
- **ADDED**: `parse.ts` - `parseTagsFromText`

### domain

#### models

- **ADDED**: `shared.ts` - shared types for base metadata
- **CHANGED**: move non-drizzle inferred types to `models/**/types.ts`

#### services

- **ADDED**: `createMetadata`
- **ADDED**: `FileSystemService`

#### validation

- **CHANGED**: move routes validation here
- **CHANGED**: move value-objects to metadata validation and use it in $typed drizzle schema
- **CHANGED**: rename base metadata operation to import
- **ADDED**: form validation

### infrastructure

- **CHANGED**: `RepositoryQueriesAdapter` - rename some methods, add `getRepositoriesByTopic`
- **CHANGED**: `RepositoryListCommandsAdapter` - refactor to use `createMetadata`

### interfaces

#### server-client

- **REMOVED**: Route types, now inferred from drizzle and zod validation
- **ADDED**: `createTRPCLinks` to set up trpc links
  - `loggerLink`
  - `splitLink` with `httpSubscriptionLink` and `httpBatchLink`
- **CHANGED**: `createHTTPServer` - add `responseMeta` for subscription requests
- **CHANGED**: `initTRPC` - add **superjson** as transformer

---

#### backend

##### Backend Layout

- **CHANGED**: Get sidebar collapsed status from local storage
- **CHANGED**: Move `SidebarNavigation` to `config/navigation`

##### Backend Actions

- **ADDED**: `useCrudActions`

##### Backend Table

- **CHANGED**: Export action moved to table controls
- **CHANGED**: Improve shared table config
- **ADDED**: `GetTableConfiguration` for table configurations

##### Github

- **CHANGED**: Table columns - remove edit-metadata
- **CHANGED**: Actions - fix actions
- **CHANGED**: `RepositoryAdd` - renamed and refactored
- **CHANGED**: `ToggleList` - refactored

---

### ui

#### Actions

- **CHANGED**: Simplify types, Remove table as dependency
- **ADDED**: Filter actions by type
- **CHANGED**: `ActionConfig` - remove `action.component` and `action.element`
- **CHANGED**: `ActionConfig` - get variants from Button
- **CHANGED**: Move `ActionButtons` from table to actions

#### Annotation

- **ADDED**: `AlignmentControls`
- **ADDED**: `QuickPresets`
- **ADDED**: `RectangleControls`
- **ADDED**: `RecentCollections`

#### Core

- **CHANGED**: Improve customization handling with comments
- **ADDED**: `Alert`, `Collapsible`, `Progress`, `Switch`
- **CHANGED**: `Badge`, `Button`, `Calendar`, `Checkbox`, `Popover`, `RadioGroup`, `ScrollArea`, `Select`, `Separator`, `Tabs`, `Tooltip`
- **ADDED**: Badge new variants
- **CHANGED**: Button improve cursor pointer handling

#### Extra

- **ADDED**: `MultiSelect` from **sersavan/shadcn-multi-select-component**

#### Forms

- **NEW**: Built on top of @tanstack/react-form
- **ADDED**: Fields
  - `TextField`
  - `TextAreaField`
  - `SelectField`
  - `CheckboxField`
  - `NumberField`
  - `ColorField` (with **@uiw/react-color**)
  - `IconField` (with **lucide-react**)
  - `RelationSelectField`
- **ADDED**: Elements - `SubmitButton`

#### Import-Export

- **ADDED**: `FileUploadDropzone`
- **ADDED**: `ImportOptionsForm`
- **ADDED**: `ImportProgress`
- **ADDED**: `StatsPreview`
- **ADDED**: `ValidationFeedback`

#### Layout

- **CHANGED**: `SidebarNavigation`
  - Link to @tanstack/react-router `RegisteredRouter`
  - Use external config for navigation elements
  - Add `ScrollArea`
- **CHANGED**: `ViewContainer`
  - Add `TTableData` type
  - Pass selected to `ActionGroup`

#### Metadata

- **ADDED**: `SystemMetadata` for createdAt and updatedAt rendering

#### Table

- **ADDED**: `TTableData` type to components
- **REMOVED**: `ActionsCellProps`
- **CHANGED**: Improve `BaseCell`, `BooleanCell`, `DateCell`
- **CHANGED**: `SelectionControl`
  - Implement exportAction
  - Use refactored `ActionButtons`
- **CHANGED**: `TableControls`
  - Implement exportAction
- **CHANGED**: `SelectableRow` - improve click handling

## v 0.1.0 - Github Repositories and Obsidian Sources

## v 0.0.1 - Setup
