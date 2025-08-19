import { Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import type { TagSystemData } from "@/domain/validation/tagging/system";
import { trpc } from "@/interfaces/server-client";

import { Button } from "@/ui/components/core/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/components/core/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/components/core/select";
import { ViewContainer } from "@/ui/components/layout/ViewContainer";
import { TagSystemUploader } from "@/ui/components/tagging/import/TagSystemUploader";

export function TaggingView() {
  const [selectedSystemForExport, setSelectedSystemForExport] = useState<
    number | null
  >(null);
  const [isExporting, setIsExporting] = useState(false);
  const [_exportData, setExportData] = useState<string | null>(null);

  const { data: availableSystems } = trpc.tagging.systems.getAll.useQuery();

  const importMutation = trpc.tagging.importExport.importSystem.useMutation();
  const exportMutation = trpc.tagging.importExport.exportSystem.useMutation();

  const handleExport = async () => {
    if (!selectedSystemForExport) return;

    setIsExporting(true);
    try {
      const result = await exportMutation.mutateAsync(selectedSystemForExport); // Ora passa l'ID
      const systemName =
        availableSystems?.find((s) => s.id === selectedSystemForExport)?.name ||
        "system";

      const exportJson = JSON.stringify(result.data, null, 2);
      setExportData(exportJson);

      // Auto-download con nome corretto
      const blob = new Blob([exportJson], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${systemName}-export.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`System "${systemName}" exported successfully`);
    } catch (error) {
      toast.error(
        `Export failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (
    systemData: TagSystemData,
    options: Record<string, boolean>,
  ) => {
    try {
      const result = await importMutation.mutateAsync({ systemData, options });
      toast.success(
        `System "${result.resolvedSystemName}" imported with ${result.stats.tags} tags`,
      );
    } catch (error: unknown) {
      toast.error(
        `Import failed: ${error instanceof Error ? error.message : error}`,
      );
    }
  };

  return (
    <ViewContainer
      title="Tagging System"
      description="Manage tag systems import and export"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Import Section */}
        <Card>
          <CardHeader>
            <CardTitle>Import Tag System</CardTitle>
            <CardDescription>
              Upload a JSON system export to import a complete tag system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TagSystemUploader
              onImport={handleImport}
              isImporting={importMutation.isPending}
            />
          </CardContent>
        </Card>

        {/* Export Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Tag System
            </CardTitle>
            <CardDescription>
              Export an existing tag system to a portable JSON file
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              value={selectedSystemForExport?.toString() || ""}
              onValueChange={(value) =>
                setSelectedSystemForExport(value ? Number(value) : null)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select system to export" />
              </SelectTrigger>
              <SelectContent>
                {availableSystems?.map((system) => (
                  <SelectItem key={system.id} value={system.id.toString()}>
                    <div className="flex flex-col">
                      <span>{system.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {system.totalTags} tags, {system.totalGroups} groups
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={handleExport}
              disabled={!selectedSystemForExport || isExporting}
              className="w-full"
              variant="outline"
            >
              {isExporting ? "Exporting..." : "Export System"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </ViewContainer>
  );
}
