import { skipToken } from "@tanstack/react-query";
import { FileUp, FolderOpen } from "lucide-react";
import { useCallback, useState } from "react";

import type {
  ClientImportConfig,
  ContentType,
  ImportConfig,
  ImportProgressUpdate,
  ServerImportConfig,
} from "@/domain/models/content/types";
import { trpc } from "@/interfaces/server-client";

import { RecentCollections } from "@/ui/components/content/collection/RecentCollections";
import { ContentStatisticsBanner } from "@/ui/components/content/dashboard/ContentStatisticsBanner";
import {
  ContentImport,
  type ImportAction,
} from "@/ui/components/content/import/ContentImport";
import { ImportWizard } from "@/ui/components/content/import/wizard/ImportWizard";
import { ViewContainer } from "@/ui/components/layout/ViewContainer";

export function ContentView() {
  const [showImportWizard, setShowImportWizard] = useState(false);
  const [importType, setImportType] = useState<ContentType>("image");
  const [serverImportConfig, setServerImportConfig] =
    useState<ServerImportConfig | null>(null);
  const [progressData, setProgressData] = useState<ImportProgressUpdate | null>(
    null,
  );

  const queryClient = trpc.useUtils();

  trpc.content.importExport.importFromServer.useSubscription(
    serverImportConfig ?? skipToken,
    {
      onData: setProgressData,
      onError: (error) => {
        setProgressData({ type: "error", error: error.message });
        setServerImportConfig(null);
      },
    },
  );

  const clientImportMutation =
    trpc.content.importExport.importFromClient.useMutation({
      onSuccess: (updates) => {
        const finalResult = updates.find(
          (update) => update.type === "completed" || update.type === "error",
        );

        if (finalResult) {
          setProgressData(finalResult);
        }
      },
      onError: (error) => {
        setProgressData({ type: "error", error: error.message });
      },
    });

  const handleStartImport = useCallback(
    (config: ImportConfig) => {
      setProgressData(null);

      if (config.input.source === "text-content") {
        clientImportMutation.mutate(config as ClientImportConfig);
      } else {
        setServerImportConfig(config as ServerImportConfig);
      }
    },
    [clientImportMutation],
  );

  const { data: collections } = trpc.content.collections.getAll.useQuery();
  const { data: stats } = trpc.content.collections.getOverallStats.useQuery();
  const { data: importFolders } = trpc.system.getImportFolders.useQuery();
  const { data: existingItems = [] } = trpc.content.items.getAll.useQuery();

  const handleGetImportPreview = async (
    folderName: string,
    contentType: "image" | "document",
  ) => {
    return await queryClient.system.getImportPreview.fetch({
      folderName,
      contentType,
    });
  };

  const importActions: ImportAction[] = [
    {
      id: "import-images",
      label: "Import Images",
      icon: FileUp,
      description: "Import images from folders or archives",
      handler: () => {
        setImportType("image");
        setShowImportWizard(true);
      },
    },
    {
      id: "import-bookmarks",
      label: "Import Bookmarks",
      icon: FolderOpen,
      description: "Import URL collections and bookmarks",
      handler: () => {
        setImportType("url");
        setShowImportWizard(true);
      },
    },
  ];

  return (
    <ViewContainer
      title="Content Management"
      description="Manage collections, import content, and view statistics"
    >
      <div className="space-y-6">
        <ContentStatisticsBanner collections={collections} stats={stats} />

        <ContentImport importActions={importActions} />

        <RecentCollections collections={collections} />
      </div>

      {showImportWizard && (
        <ImportWizard
          contentType={importType}
          importFolders={importFolders}
          existingItems={existingItems}
          collections={collections || []}
          onGetImportPreview={handleGetImportPreview}
          onStartImport={handleStartImport}
          progressData={progressData}
          onClose={() => setShowImportWizard(false)}
          onSuccess={() => setShowImportWizard(false)}
        />
      )}
    </ViewContainer>
  );
}
