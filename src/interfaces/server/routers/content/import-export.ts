import { contentImportExportRoutesSchema } from "@/domain/validation/content/import-export";

import { publicProcedure, router } from "../../trpc";

export const contentImportExportRouter = router({
  importFromFileSystem: publicProcedure
    .input(contentImportExportRoutesSchema.importFromFileSystem)
    .subscription(async function* ({ ctx, input }) {
      const { folderName, name } = input;
      yield* ctx.contentImportExport.importFromFileSystem(folderName, name);
    }),

  exportForTraining: publicProcedure
    .input(contentImportExportRoutesSchema.exportForTraining)
    .mutation(
      async ({ ctx, input }) =>
        await ctx.contentImportExport.exportForTraining(
          input.collectionId,
          input.outputPath,
        ),
    ),
});
