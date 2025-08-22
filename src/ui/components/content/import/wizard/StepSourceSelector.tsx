import { FileText, FolderOpen, type LucideIcon } from "lucide-react";
import { useId, useState } from "react";
import { toast } from "sonner";

import type {
  ContentType,
  ImportSourceType,
} from "@/domain/models/content/types";

import { Button } from "@/ui/components/core/button";
import { Card, CardContent } from "@/ui/components/core/card";
import { Input } from "@/ui/components/core/input";
import { Label } from "@/ui/components/core/label";
import { RadioGroup, RadioGroupItem } from "@/ui/components/core/radio-group";
import { FileContentParser } from "@/ui/components/import-export/FileContentParser";

export interface ImportSourceData {
  sourceType: ImportSourceType;
  path: string;
  options: Record<string, unknown>;
  parsedData?: Record<string, unknown>[];
}

interface ImportSourceOption {
  value: ImportSourceType;
  label: string;
  icon: LucideIcon;
  desc: string;
}

// TODO: be DRY here
const sourceOptions: Record<ContentType, ImportSourceOption[]> = {
  image: [
    {
      value: "text-content",
      label: "File Import",
      icon: FileText,
      desc: "JSON, CSV, or TXT files",
    },
    {
      value: "filesystem",
      label: "Local Folder",
      icon: FolderOpen,
      desc: "Import from /import folder",
    },
    // {
    //   value: "file-upload",
    //   label: "ZIP Archive",
    //   icon: Upload,
    //   desc: "Upload and extract ZIP file",
    // },
  ],
  url: [
    {
      value: "text-content",
      label: "Bookmark File",
      icon: FileText,
      desc: "Browser export or JSON",
    },
  ],
  document: [
    {
      value: "text-content",
      label: "File Import",
      icon: FileText,
      desc: "JSON, CSV, or TXT files",
    },
    {
      value: "filesystem",
      label: "Markdown Folder",
      icon: FolderOpen,
      desc: "Folder with .md files",
    },
    // {
    //   value: "file-upload",
    //   label: "Archive",
    //   icon: Upload,
    //   desc: "ZIP with markdown files",
    // },
  ],
  video: [
    {
      value: "text-content",
      label: "File Import",
      icon: FileText,
      desc: "JSON, CSV, or TXT files",
    },
    {
      value: "filesystem",
      label: "Local Folder",
      icon: FolderOpen,
      desc: "Import from /import folder",
    },
  ],
};

interface StepSourceSelectorProps {
  contentType: ContentType;
  importFolders?: string[];
  onNext: (data: ImportSourceData) => void;
  onBack: () => void;
}

export function StepSourceSelector({
  contentType,
  importFolders,
  onNext,
}: StepSourceSelectorProps) {
  const [sourceType, setSourceType] =
    useState<ImportSourceData["sourceType"]>("text-content");
  const [path, setPath] = useState("");
  const [parsedData, setParsedData] = useState<
    Record<string, unknown>[] | null
  >(null);

  const handleNext = async () => {
    if (!path.trim()) return;

    // Validation strategy pattern
    const validators: Record<ImportSourceType, () => void> = {
      filesystem: () => {
        if (contentType === "image" && importFolders) {
          const folderExists = importFolders.includes(path.trim());
          if (!folderExists) {
            throw new Error(
              `Folder "${path.trim()}" not found in import directory`,
            );
          }
        }
      },
      "file-upload": () => {
        if (!parsedData) {
          throw new Error("Please upload and parse a file first");
        }
      },
      "text-content": () => {
        if (!parsedData) {
          throw new Error("Please enter content first");
        }
      },
    };

    try {
      validators[sourceType]?.();
      onNext({
        sourceType,
        path: path.trim(),
        options: {},
        parsedData: parsedData || undefined,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Validation failed");
    }
  };

  const pathId = useId();

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium">Select Import Source</Label>
        <p className="text-sm text-muted-foreground">
          Choose how to import your {contentType}
        </p>
      </div>

      <RadioGroup
        value={sourceType}
        onValueChange={(value) => setSourceType(value as ImportSourceType)}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sourceOptions[contentType].map((option) => (
            <Card
              key={option.value}
              className="cursor-pointer hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label
                    htmlFor={option.value}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <option.icon className="h-4 w-4" />
                    {option.label}
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground mt-2 ml-6">
                  {option.desc}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </RadioGroup>

      {/* Show available folders for image imports */}
      {sourceType === "filesystem" &&
        contentType === "image" &&
        importFolders && (
          <div className="space-y-2">
            <Label>Available Folders</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
              {importFolders.map((folder) => (
                <Button
                  key={folder}
                  variant={path === folder ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPath(folder)}
                  className="justify-start"
                >
                  <FolderOpen className="h-3 w-3 mr-2" />
                  {folder}
                </Button>
              ))}
            </div>
          </div>
        )}

      {sourceType === "text-content" && (
        <FileContentParser
          onDataParsed={setParsedData}
          onFileNameChange={setPath}
        />
      )}

      {sourceType === "filesystem" && (
        <div className="space-y-2">
          <Label htmlFor={pathId}>Folder Name</Label>
          <Input
            id={pathId}
            value={path}
            onChange={(e) => setPath(e.target.value)}
            placeholder="Select folder or type folder name"
          />
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={handleNext} disabled={!path.trim()}>
          Next
        </Button>
      </div>
    </div>
  );
}
