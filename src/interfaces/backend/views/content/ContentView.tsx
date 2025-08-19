import { skipToken } from "@tanstack/react-query";
import { Database, FileUp, FolderOpen } from "lucide-react";
import { useCallback, useState } from "react";

import type { ImportProgressUpdate } from "@/domain/services/content/import-export";
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
  const [importType, setImportType] = useState<
    "images" | "captions" | "bookmarks" | "markdown"
  >("images");

  const queryClient = trpc.useUtils();

  const [importConfig, setImportConfig] = useState<{
    folderName: string;
    name: string;
  } | null>(null);
  const [progressData, setProgressData] = useState<ImportProgressUpdate | null>(
    null,
  );

  trpc.content.importExport.importFromFileSystem.useSubscription(
    importConfig ?? skipToken, // Use skipToken when null
    {
      onData: setProgressData,
      onError: (error) => {
        setProgressData({ type: "error", error: error.message });
        setImportConfig(null);
      },
    },
  );

  const handleStartImport = useCallback((folderName: string, name: string) => {
    setProgressData(null); // Reset previous data
    setImportConfig({ folderName, name });
  }, []);

  const { data: collections } = trpc.content.collections.getAll.useQuery();
  const { data: stats } = trpc.content.collections.getOverallStats.useQuery();
  const { data: importFolders } = trpc.system.getImportFolders.useQuery();
  const { data: existingItems = [] } = trpc.content.items.getAll.useQuery();

  const handleGetImagesWithCaptions = async (folderName: string) => {
    return await queryClient.system.getImportImagesWithCaptions.fetch(
      folderName,
    );
  };

  const importActions: ImportAction[] = [
    {
      id: "import-images",
      label: "Import Images",
      icon: FileUp,
      description: "Import images from folders or archives",
      handler: () => {
        setImportType("images");
        setShowImportWizard(true);
      },
    },
    {
      id: "import-captions",
      label: "Import Captions",
      icon: Database,
      description: "Import captions from JSON, CSV, or text files",
      handler: () => {
        setImportType("captions");
        setShowImportWizard(true);
      },
    },
    // Future import types
    {
      id: "import-bookmarks",
      label: "Import Bookmarks",
      icon: FolderOpen,
      description: "Import URL collections and bookmarks",
      handler: () => {
        setImportType("bookmarks");
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

      {/* Import Wizard Modal */}
      {showImportWizard && (
        <ImportWizard
          type={importType}
          importFolders={importFolders}
          existingItems={existingItems}
          collections={collections || []}
          onGetImagesWithCaptions={handleGetImagesWithCaptions}
          onStartImport={handleStartImport}
          // onStopImport={handleStopImport}
          progressData={progressData}
          onClose={() => setShowImportWizard(false)}
          onSuccess={() => setShowImportWizard(false)}
        />
      )}
    </ViewContainer>
  );
}
