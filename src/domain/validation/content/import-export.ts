import * as z from "zod";

// ROUTES

export const contentImportExportRoutesSchema = {
  importFromFileSystem: z.object({
    folderName: z.string(),
    name: z.string(),
    lastEventId: z.string().nullish(),
  }),
  exportForTraining: z.object({
    collectionId: z.number(),
    outputPath: z.string(),
  }),
};
