import { router } from "../trpc";
import { contentCollectionRouter } from "./content/collections";
import { contentImportExportRouter } from "./content/import-export";
import { contentItemRouter } from "./content/items";
import { listRouter } from "./github/lists";
import { repositoryRouter } from "./github/repositories";
import { locationRouter } from "./location";
import { fileSystemRouter } from "./system/file-system";
import { taggingCategoryRouter } from "./tagging/categories";
import { taggingGroupRouter } from "./tagging/groups";
import { taggingImportExportRouter } from "./tagging/import-export";
import { taggingSystemRouter } from "./tagging/systems";
import { taggingTagRouter } from "./tagging/tags";
import { taxonomyRouter } from "./taxonomy";

export const appRouter = router({
  repository: repositoryRouter,
  list: listRouter,
  system: fileSystemRouter,
  tagging: {
    systems: taggingSystemRouter,
    tags: taggingTagRouter,
    categories: taggingCategoryRouter,
    groups: taggingGroupRouter,
    importExport: taggingImportExportRouter,
  },
  content: {
    items: contentItemRouter,
    collections: contentCollectionRouter,
    importExport: contentImportExportRouter,
  },
  location: locationRouter,
  taxonomy: taxonomyRouter,
});
