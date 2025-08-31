# Backlog

- update Readme

## Areas

### Dev

- fix knip once useTagValidation, date-picker and calendar are implemented
- dependency cruiser: add @/interfaces/backend error (app imports should not be used)

### Server

- Rename interfaces/server to api
- TRPCContext: review and consolidate naming

### Content

- check getAnalysisSelectedTags in getFacetedUniqueValuesCustom, should work with columns which id is tags
- views:
  - CollectionDetailView: review
  - ItemDetailView:
    - fix multiple renderings
    - make a backend component for TagSystemSelector, move to @ui if possible
- model:
  - ItemTagOperations: implement bulkUpdateTags
- services:
  - ContentCommandsAdapter: check deleteCollection, there is no error handling
  - ContentQueriesAdapter:
    - review and split in several Adapters and maybe services
    - refactor: getItemsByTags, searchItems
    - check: getOverallStatistics, getTagUsageAcrossSystems, getCollectionStatistics
  - ContentImportExportService: implement preserveStructure, see ImportOptions
- server:
  - contentItemRouter: implement SEARCH AND FILTERING routes
  - taggingSystemRouter: implement TAG VALIDATION routes
- ui:
  - ItemForm:
    - rawTags: should be validated as a comma-separated list
    - implement: collectionId, tagIds (get collectionId to tag to filter tags by collection)
  - ItemPreview: getPreviewUrl should be an helper, we should rethink metadata.content about images and thumbs, there could be a local image handling and a remote image handling, and there could be a resize service which will get the needed image from the same image path (instead of item.metadata.content.thumbnail)
  - ItemDetails: implement linkToCollection
  - ItemsGrid: fix handleItemClick noStaticElementInteractions

### Tagging

- views:
  - ItemDetailView:add groups navigation, also get selected group state from local storage
  - implement tagging/systems/$systemId
- getItemsActions: implement handleRemoveDuplicateTags
ui:
  - TagButton: remove item if not needed
  - BaseTaggingProps: remove systemId if not needed

#### TagManager

- implement collection toggle trigger
  - tags that toggles categories should be highlighted and the tooltip should show what lists will be showed if selected
- TagLayouts: improve, check also gridClass
- TagGroupForm: check if we need to pass onUpdate to TagGroupVisualizerManager, remove if unneeded
- TagGroupVisualizerManager: fix bugs and improve
  - check why we have to set metadata.display defaults, if it's needed then better to use an helper function for consistency
  - ImagePreview:
    - fix label and buttons for top aligned elements
    - fix area selector for overlapping areas
  - useVisualizerConfig: addMapping, get color from helper
  - TagImageMapping, TagCombinationSelector: be DRY and consistent with the Badge
- RawTagsAnalysis bulkAddToSystem: use bulk action

#### System Editing

- Forms: improve tag selection (group by groups and categories)
- TagValidationService: implement and check also useTagValidation, implement actual relationship checking in tagConflicts, and TagCategoryGrid
- Tag System Forms: Checkbox indeterminate state: on category partial selected the select all checkbox should show partial selection
- tagSystemDataSchema: add types to metadata, maybe move to another file, and test

### Github

- RepositoryListCommandsPort: convert return, remove undefined throwing errors
- metadata: check handling
- useGithubActions: use new useCrudActions
- ListForm:
  - update to include metadata
  - check validators: in content and tagging forms we do it differently
- ToggleList: check handleCreateList, maybe we have to get listId and call handleAddToList
- ListView: fix use of any in useListTableConfig
- obsidian-plugin.test, obsidian-theme.test: fix findItem, system list should not use ListQueries or it should not return a generic ListItem, this has a different  metadata

## UI

- Fix dark mode `--mono-` variable issues in globals.css
- implement date-picker and calendar
- Action: review onSuccess, it seems to be called too many times
- FileUploadDropzone: fix noStaticElementInteractions, use draggable component

### Forms

- add select and multiselect with search component
- Checkbox indeterminate state
- check validators onChangeAsync, in every form we do as any but in ListForm we do newRepositoryListSchema.required()
- BaseFormProps:
  - mode: is not really used to change the handler but it's still required
  - data: we are using data to determine if is create or edit/update mode, check this ambiguity
- SubmitButton: improve isDisabled, should be disabled if dirty but with no real changes

### Table

- Make headerStyle sticky (currently only columns are sticky)
- useDataTable: check baseConfig merge, it was using lodash merge
- fix table scrolling areas
- add a special order cell, it will let to be drag and dropped, on drop items order change to reflect current tanstack table ordering
- improve getFacetedUniqueValuesCustom:
  - customizations by column IDs it's not solid and clean, it's not clear what kind of customizations are in place
- ExportMenu, SelectionControl, TableControls: exportOptions, check that these options are used, implement customOptions in defaultOptions
- getFilterType: using the column.id here bound the filtering system to the schema implementation, this should at least be well documented
- SortableHeader: fix noStaticElementInteractions
- Check colspan calculation logic: `config.features?.enableRowSelection ? 2 : 0`

## Other

- check youtube command and YoutubeAdapter
- implement CategoryPanel as metadata.user field
- improve components organization (entity related, features, extra)
- improve models/**/types.ts
- check config.paths and FOLDER_PATHS, should we remove config.paths and only use FOLDER_PATHS?

## UI Upgrade Shadcn + use Sidebar
