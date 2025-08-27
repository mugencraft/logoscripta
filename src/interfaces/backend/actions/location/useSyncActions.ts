import { toast } from "sonner";

import type {
  CountriesSyncResult,
  ItalySyncResult,
} from "@/domain/models/location/types";
import { trpc } from "@/interfaces/server-client";

export interface SyncActionCallbacks {
  onSyncStart?: () => void;
  onSyncComplete?: (result: CountriesSyncResult | ItalySyncResult) => void;
  onSyncError?: (error: string) => void;
}

export function useSyncActions(callbacks: SyncActionCallbacks = {}) {
  const { onSyncStart, onSyncComplete, onSyncError } = callbacks;

  const syncCountriesMutation =
    trpc.location.importExport.syncCountries.useMutation({
      onMutate: () => {
        onSyncStart?.();
        toast.info("Starting countries synchronization...");
      },
      onSuccess: (result) => {
        if (result.preview) {
          toast.info(
            `Countries preview: ${result.preview.toAdd} to add, ${result.preview.toUpdate} to update, ${result.preview.toDeprecate} to deprecate`,
          );
        } else {
          toast.success(`Successfully synced ${result.countries} countries`);
        }
        onSyncComplete?.(result);
      },
      onError: (error) => {
        toast.error(`Countries sync failed: ${error.message}`);
        onSyncError?.(error.message);
      },
    });

  const syncItalyMutation =
    trpc.location.importExport.syncItalyAdministrative.useMutation({
      onMutate: () => {
        onSyncStart?.();
        toast.info("Starting Italy administrative data synchronization...");
      },
      onSuccess: (result) => {
        if (result.preview) {
          const { regions, provinces, communes } = result.preview;
          toast.info(
            `Italy preview: ${regions.toAdd + provinces.toAdd + communes.toAdd} to add, ` +
              `${regions.toUpdate + provinces.toUpdate + communes.toUpdate} to update, ` +
              `${regions.toDeprecate + provinces.toDeprecate + communes.toDeprecate} to deprecate`,
          );
        } else {
          if (result.errors.length > 0) {
            toast.warning(
              `Italy sync completed with ${result.errors.length} errors: ${result.regions} regions, ${result.provinces} provinces, ${result.communes} communes`,
            );
          } else {
            toast.success(
              `Italy sync completed: ${result.regions} regions, ${result.provinces} provinces, ${result.communes} communes`,
            );
          }
        }
        onSyncComplete?.(result);
      },
      onError: (error) => {
        toast.error(`Italy sync failed: ${error.message}`);
        onSyncError?.(error.message);
      },
    });

  const actions = {
    // Countries sync
    previewCountriesSync: async () => {
      return syncCountriesMutation.mutateAsync({ dryRun: true });
    },

    syncCountries: async (force = false) => {
      return syncCountriesMutation.mutateAsync({ force });
    },

    // Italy administrative sync
    previewItalySync: async () => {
      return syncItalyMutation.mutateAsync({ dryRun: true });
    },

    syncItaly: async (force = false) => {
      return syncItalyMutation.mutateAsync({ force });
    },

    // Combined operations
    previewAllSync: async () => {
      const [countriesResult, italyResult] = await Promise.all([
        syncCountriesMutation.mutateAsync({ dryRun: true }),
        syncItalyMutation.mutateAsync({ dryRun: true }),
      ]);
      return { countries: countriesResult, italy: italyResult };
    },
  };

  return {
    ...actions,
    isCountriesLoading: syncCountriesMutation.isPending,
    isItalyLoading: syncItalyMutation.isPending,
    isLoading: syncCountriesMutation.isPending || syncItalyMutation.isPending,
    countriesError: syncCountriesMutation.error,
    italyError: syncItalyMutation.error,
  };
}
