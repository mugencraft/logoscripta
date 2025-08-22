import * as z from "zod";

// ROUTES

const serverImportInputSchema = z.discriminatedUnion("source", [
  z.object({
    source: z.literal("filesystem"),
    contentType: z.enum(["image", "document"]),
    data: z.object({ folderName: z.string() }),
  }),
  // Future: file-upload
]);

const clientImportInputSchema = z.object({
  source: z.literal("text-content"),
  contentType: z.enum(["url", "document"]),
  format: z.literal("json"),
  data: z.array(z.record(z.string(), z.unknown())),
});

export type ServerImportInput = z.infer<typeof serverImportInputSchema>;
export type ClientImportInput = z.infer<typeof clientImportInputSchema>;

const importOptionsSchema = z.object({
  collectionName: z.string(),
  description: z.string().optional(),
  skipExisting: z.boolean().optional(),
  batchSize: z.number().optional(),
});

export type ContentImportOptions = z.infer<typeof importOptionsSchema>;

export const contentImportExportRoutesSchema = {
  // Server-side: subscription for long-running operations
  importFromServer: z.object({
    input: serverImportInputSchema,
    options: importOptionsSchema,
    lastEventId: z.string().nullish(),
  }),

  // Client-side: mutation for immediate processing
  importFromClient: z.object({
    input: clientImportInputSchema,
    options: importOptionsSchema,
  }),
  exportForTraining: z.object({
    collectionId: z.number(),
    outputPath: z.string(),
  }),
};
