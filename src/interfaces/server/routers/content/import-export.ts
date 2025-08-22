import type { ImportProgressUpdate } from "@/domain/models/content/types";
import { contentImportExportRoutesSchema } from "@/domain/validation/content/import-export";

import { publicProcedure, router } from "../../trpc";

export const contentImportExportRouter = router({
  // Server-side: streaming for filesystem operations
  importFromServer: publicProcedure
    .input(contentImportExportRoutesSchema.importFromServer)
    .subscription(async function* ({ ctx, input }) {
      yield* ctx.contentImportExport.importFromServer(
        input.input,
        input.options,
      );
    }),

  // Client-side: direct mutation for in-memory operations
  importFromClient: publicProcedure
    .input(contentImportExportRoutesSchema.importFromClient)
    .mutation(async ({ ctx, input }) => {
      const updates: ImportProgressUpdate[] = [];

      const data = await ctx.contentImportExport.importFromClient(
        input.input,
        input.options,
      );

      for (const update of data) {
        updates.push(update);
      }

      return updates;
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
