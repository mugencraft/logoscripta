import { sharedSchema } from "@/domain/validation/shared";

import { publicProcedure, router } from "../../trpc";

export const fileSystemRouter = router({
  getAssetImages: publicProcedure.query(
    async ({ ctx }) => await ctx.fileSystemService.getAssetImages(),
  ),

  getImportFolders: publicProcedure.query(
    async ({ ctx }) => await ctx.fileSystemService.getImportFolders(),
  ),

  getImportPreview: publicProcedure
    .input(sharedSchema.getImportPreview)
    .query(
      async ({ ctx, input }) =>
        await ctx.fileSystemService.getImportPreview(
          input.folderName,
          input.contentType,
        ),
    ),
});
