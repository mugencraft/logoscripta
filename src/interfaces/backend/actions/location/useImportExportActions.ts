import { toast } from "sonner";

import type { LocationImportResult } from "@/domain/models/location/types";
import type { POIMetadata } from "@/domain/validation/location/poi";
import { trpc } from "@/interfaces/server-client";

interface ImportExportCallbacks {
  onImportSuccess?: (result: LocationImportResult) => void;
  onImportError?: (error: string) => void;
  onExportSuccess?: (data: unknown[]) => void;
  onExportError?: (error: string) => void;
}

export function useImportExportActions(callbacks: ImportExportCallbacks = {}) {
  const { onImportSuccess, onImportError, onExportSuccess, onExportError } =
    callbacks;

  const importMutation = trpc.location.importExport.importPOIs.useMutation({
    onSuccess: (result) => {
      const { poisCreated, errors } = result;

      if (errors.length > 0) {
        toast.warning(
          `Import completed: ${poisCreated} POIs created with ${errors.length} errors`,
        );
      } else {
        toast.success(`Successfully imported ${poisCreated} POIs`);
      }

      onImportSuccess?.(result);
    },
    onError: (error) => {
      toast.error(`Import failed: ${error.message}`);
      onImportError?.(error.message);
    },
  });

  const exportQuery = trpc.location.importExport.exportPOIs.useQuery;

  const actions = {
    // Import POIs from structured data
    importPOIs: async (
      poisData: Array<{
        name: string;
        type: string;
        communeCode: string;
        latitude?: number;
        longitude?: number;
        address?: string;
        metadata?: POIMetadata;
      }>,
      options?: { skipInvalid?: boolean },
    ) => {
      return importMutation.mutateAsync({ poisData, options });
    },

    // Export POIs with optional filtering by communes
    exportPOIs: async (communeCodes?: string[]) => {
      try {
        const data = await exportQuery({ communeCodes }).refetch();

        if (data.data) {
          // Create downloadable blob
          const blob = new Blob([JSON.stringify(data.data, null, 2)], {
            type: "application/json",
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `pois-export-${new Date().toISOString().split("T")[0]}.json`;
          a.click();
          URL.revokeObjectURL(url);

          toast.success(`Exported ${data.data.length} POIs`);
          onExportSuccess?.(data.data);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Export failed";
        toast.error(errorMessage);
        onExportError?.(errorMessage);
      }
    },
  };

  return {
    ...actions,
    isImporting: importMutation.isPending,
    importError: importMutation.error,
  };
}
