import { sharedSchema } from "@/domain/validation/shared";
import { tagSystemRoutesSchema } from "@/domain/validation/tagging/system";

import { publicProcedure, router } from "../../trpc";

export const taggingImportExportRouter = router({
  importSystem: publicProcedure
    .input(tagSystemRoutesSchema.importSystem)
    .mutation(
      async ({ ctx, input }) =>
        await ctx.taggingImportExport.importSystem(
          input.systemData,
          input.options,
        ),
    ),

  exportSystem: publicProcedure
    .input(sharedSchema.entityId)
    .mutation(
      async ({ ctx, input }) =>
        await ctx.taggingImportExport.exportSystem(input),
    ),
});
