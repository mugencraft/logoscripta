import { locationImportExportRoutesSchema } from "@/domain/validation/location/import-export";

import { publicProcedure, router } from "../../trpc";

export const locationImportExportRouter = router({
  // Sync administrative data
  syncCountries: publicProcedure
    .input(locationImportExportRoutesSchema.syncOptions)
    .mutation(async ({ ctx, input }) => {
      return await ctx.geoSyncService.syncCountries(input);
    }),
  syncItalyAdministrative: publicProcedure
    .input(locationImportExportRoutesSchema.syncOptions)
    .mutation(async ({ ctx, input }) => {
      return await ctx.geoSyncService.syncItalyAdministrative(input);
    }),

  // Import POIs from various sources
  importPOIs: publicProcedure
    .input(locationImportExportRoutesSchema.importPOIs)
    .mutation(async ({ ctx, input }) => {
      return await ctx.locationImportExport.importPOIs(
        input.poisData,
        input.options,
      );
    }),

  // Export POIs for backup or migration
  exportPOIs: publicProcedure
    .input(locationImportExportRoutesSchema.exportPOIs)
    .query(async ({ ctx, input }) => {
      return await ctx.locationImportExport.exportPOIs(input.communeCodes);
    }),
});
