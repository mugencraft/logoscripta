import { FileText, FolderOpen, Globe, Upload } from "lucide-react";
import { useId, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/ui/components/core/button";
import { Card, CardContent } from "@/ui/components/core/card";
import { Input } from "@/ui/components/core/input";
import { Label } from "@/ui/components/core/label";
import { RadioGroup, RadioGroupItem } from "@/ui/components/core/radio-group";

type ImportSourceType = "folder" | "zip" | "url" | "file";

export interface ImportSourceData {
  sourceType: ImportSourceType;
  path: string;
  options: Record<string, unknown>;
}

const sourceOptions = {
  images: [
    {
      value: "folder",
      label: "Local Folder",
      icon: FolderOpen,
      desc: "Import from /import folder",
    },
    {
      value: "zip",
      label: "ZIP Archive",
      icon: Upload,
      desc: "Upload and extract ZIP file",
    },
  ],
  captions: [
    {
      value: "file",
      label: "File Import",
      icon: FileText,
      desc: "JSON, CSV, or TXT files",
    },
    {
      value: "folder",
      label: "Text Files",
      icon: FolderOpen,
      desc: "Individual caption files",
    },
  ],
  bookmarks: [
    {
      value: "file",
      label: "Bookmark File",
      icon: FileText,
      desc: "Browser export or JSON",
    },
    {
      value: "url",
      label: "URL List",
      icon: Globe,
      desc: "Plain text URL list",
    },
  ],
  markdown: [
    {
      value: "folder",
      label: "Markdown Folder",
      icon: FolderOpen,
      desc: "Folder with .md files",
    },
    {
      value: "zip",
      label: "Archive",
      icon: Upload,
      desc: "ZIP with markdown files",
    },
  ],
};

interface ImportSourceSelectorProps {
  type: "images" | "captions" | "bookmarks" | "markdown";
  importFolders?: string[];
  onNext: (data: ImportSourceData) => void;
}

export function ImportSourceSelector({
  type,
  importFolders,
  onNext,
}: ImportSourceSelectorProps) {
  const [sourceType, setSourceType] =
    useState<ImportSourceData["sourceType"]>("folder");
  const [path, setPath] = useState("");

  const handleNext = async () => {
    if (!path.trim()) return;

    if (sourceType === "folder" && type === "images" && importFolders) {
      const folderExists = importFolders.includes(path.trim());
      if (!folderExists) {
        toast.error(`Folder "${path.trim()}" not found in import directory`);
        return;
      }
    }

    onNext({
      sourceType,
      path: path.trim(),
      options: {},
    });
  };

  const pathId = useId();

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium">Select Import Source</Label>
        <p className="text-sm text-muted-foreground">
          Choose how to import your {type}
        </p>
      </div>

      <RadioGroup
        value={sourceType}
        onValueChange={(value) => setSourceType(value as ImportSourceType)}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sourceOptions[type].map((option) => (
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
      {sourceType === "folder" && type === "images" && importFolders && (
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

      <div className="space-y-2">
        <Label htmlFor={pathId}>
          {sourceType === "folder"
            ? "Folder Name"
            : sourceType === "zip"
              ? "ZIP File Path"
              : sourceType === "url"
                ? "URL or File Path"
                : "File Path"}
        </Label>
        <Input
          id={pathId}
          value={path}
          onChange={(e) => setPath(e.target.value)}
          placeholder={
            sourceType === "folder"
              ? "Select folder or type folder name"
              : sourceType === "zip"
                ? "/import/archive.zip"
                : sourceType === "url"
                  ? "https://example.com/urls.txt"
                  : "/import/captions.json"
          }
        />
      </div>

      <div className="flex justify-end">
        <Button onClick={handleNext} disabled={!path.trim()}>
          Next
        </Button>
      </div>
    </div>
  );
}
