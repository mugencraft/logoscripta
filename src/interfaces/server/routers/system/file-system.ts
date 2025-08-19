import { sharedSchema } from "@/domain/validation/shared";

import { publicProcedure, router } from "../../trpc";

export const fileSystemRouter = router({
  getAssetImages: publicProcedure.query(
    async ({ ctx }) => await ctx.fileSystemService.getAssetImages(),
  ),

  getImportFolders: publicProcedure.query(
    async ({ ctx }) => await ctx.fileSystemService.getImportFolders(),
  ),

  getImportImagesWithCaptions: publicProcedure
    .input(sharedSchema.folderName)
    .query(
      async ({ ctx, input }) =>
        await ctx.fileSystemService.getImportImagesWithCaptions(input),
    ),
});
