import { ChevronDown, ChevronRight } from "lucide-react";
import { useCallback, useState } from "react";

import type { TagSystemData } from "@/domain/validation/tagging/system";

import { Button } from "@/ui/components/core/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/ui/components/core/collapsible";
import { FileUploadDropzone } from "@/ui/components/import-export/FileUploadDropzone";
import { ImportOptionsForm } from "@/ui/components/import-export/ImportOptionsForm";
import { StatsPreview } from "@/ui/components/import-export/StatsPreview";
import {
  ValidationFeedback,
  type ValidationMessage,
} from "@/ui/components/import-export/ValidationFeedback";

import { TagSystemStructurePreview } from "./TagSystemStructurePreview";

interface TagSystemUploaderProps {
  onImport: (data: TagSystemData, options: Record<string, boolean>) => void;
  isImporting: boolean;
}

export function TagSystemUploader({
  onImport,
  isImporting,
}: TagSystemUploaderProps) {
  const [systemData, setSystemData] = useState<TagSystemData | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [options, setOptions] = useState({
    overwrite: false,
    renameIfExists: true,
  });
  const [validationMessages, setValidationMessages] = useState<
    ValidationMessage[]
  >([]);
  const [previewExpanded, setPreviewExpanded] = useState(false);

  const importOptions = [
    {
      id: "overwrite",
      label: "Overwrite existing system",
      conflictsWith: ["renameIfExists"],
    },
    {
      id: "renameIfExists",
      label: "Rename if system exists",
      disabled: options.overwrite,
    },
  ];

  const handleFileUpload = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text) as TagSystemData;

      // Basic validation
      if (!data.system?.name || !Array.isArray(data.groups)) {
        throw new Error("Invalid tag system format");
      }

      setSystemData(data);
      setFileName(file.name);
      setValidationMessages([
        {
          status: "success",
          message: `Tag system "${data.system.name}" loaded successfully`,
        },
      ]);
    } catch (error) {
      setValidationMessages([
        {
          status: "error",
          message:
            error instanceof Error ? error.message : "Invalid JSON format",
        },
      ]);
    }
  }, []);

  const handleOptionChange = (optionId: string, checked: boolean) => {
    setOptions((prev) => ({ ...prev, [optionId]: checked }));
  };

  const handleImport = () => {
    if (systemData) {
      onImport(systemData, options);
    }
  };

  const getStats = (): Record<string, number> => {
    if (!systemData) return {};
    return {
      groups: systemData.groups.length,
      categories: systemData.categories.length,
      tags: systemData.tags.length,
      relations: systemData.relationships.length,
    };
  };

  return (
    <div className="space-y-4">
      {!systemData ? (
        <FileUploadDropzone
          onFileSelect={handleFileUpload}
          disabled={isImporting}
        />
      ) : (
        <>
          {/* File Info Header */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <span className="font-medium">{systemData.system.name}</span>
              <span className="text-xs text-muted-foreground">
                ({fileName})
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSystemData(null);
                setFileName("");
                setValidationMessages([]);
              }}
            >
              Clear
            </Button>
          </div>

          <ImportOptionsForm
            domain="system"
            options={importOptions}
            values={options}
            onChange={handleOptionChange}
          />

          <StatsPreview stats={getStats()} />

          <Collapsible open={previewExpanded} onOpenChange={setPreviewExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full">
                {previewExpanded ? (
                  <>
                    <ChevronDown className="h-4 w-4 mr-2" />
                    Hide Structure Preview
                  </>
                ) : (
                  <>
                    <ChevronRight className="h-4 w-4 mr-2" />
                    Show Structure Preview
                  </>
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4">
              <TagSystemStructurePreview systemData={systemData} />
            </CollapsibleContent>
          </Collapsible>

          <Button
            onClick={handleImport}
            disabled={isImporting}
            className="w-full"
          >
            {isImporting ? "Importing..." : `Import ${systemData.system.name}`}
          </Button>
        </>
      )}

      <ValidationFeedback messages={validationMessages} domain="Tag system" />
    </div>
  );
}
