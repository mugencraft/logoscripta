import { useEffect, useState } from "react";

import type { ContentCollection } from "@/domain/models/content/collection";
import type {
  ContentItemWithStats,
  ImageCaptioned,
} from "@/domain/models/content/types";
import type { ImportProgressUpdate } from "@/domain/services/content/import-export";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/ui/components/core/dialog";
import { ImportProgress } from "@/ui/components/import-export/ImportProgress";

import { ImportOptions, type ImportOptionsData } from "./ImportOptions";
import { ImportPreview } from "./ImportPreview";
import {
  type ImportSourceData,
  ImportSourceSelector,
} from "./ImportSourceSelector";

type ImportStep = "source" | "options" | "preview" | "progress" | "complete";

interface ImportWizardProps {
  type: "images" | "captions" | "bookmarks" | "markdown";
  importFolders?: string[];
  existingItems?: ContentItemWithStats[];
  collections?: ContentCollection[];
  onGetImagesWithCaptions?: (folderName: string) => Promise<ImageCaptioned[]>;
  onStartImport: (basePath: string, name: string) => void;
  progressData: ImportProgressUpdate | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function ImportWizard({
  type,
  importFolders,
  existingItems,
  collections,
  onGetImagesWithCaptions,
  onStartImport,
  progressData,
  onClose,
  onSuccess,
}: ImportWizardProps) {
  const [currentStep, setCurrentStep] = useState<ImportStep>("source");
  const [importData, setImportData] = useState<ImportSourceData | null>(null);
  const [options, setOptions] = useState<ImportOptionsData | null>(null);

  const steps = {
    source: (
      <ImportSourceSelector
        type={type}
        importFolders={importFolders}
        onNext={(data) => {
          setImportData(data);
          setCurrentStep("options");
        }}
      />
    ),
    options: (
      <ImportOptions
        type={type}
        data={importData}
        collections={collections}
        onNext={(opts) => {
          setOptions(opts);
          setCurrentStep("preview");
        }}
      />
    ),
    preview: importData ? (
      <ImportPreview
        type={type}
        data={importData}
        existingItems={existingItems}
        onGetImagesWithCaptions={onGetImagesWithCaptions}
        onConfirm={() => setCurrentStep("progress")}
      />
    ) : null,
    progress: (
      <ImportProgress
        domain={type === "images" ? "images" : "items"}
        progressData={progressData}
        onComplete={onSuccess}
      />
    ),
  };

  // Trigger import on step transition
  useEffect(() => {
    if (currentStep === "progress" && importData && options) {
      onStartImport(
        importData.path,
        options.newCollectionName || importData.path,
      );
    }
  }, [currentStep, importData, options, onStartImport]);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Import {type.charAt(0).toUpperCase() + type.slice(1)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Step indicator */}
          <div className="flex items-center space-x-2">
            {["source", "options", "preview", "progress"].map((step, index) => (
              <div
                key={step}
                className={`flex items-center ${index > 0 ? "ml-2" : ""}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep === step
                      ? "bg-primary text-primary-foreground"
                      : ["source", "options", "preview", "progress"].indexOf(
                            currentStep,
                          ) > index
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {index + 1}
                </div>
                {index < 3 && <div className="w-4 h-0.5 bg-gray-200 mx-2" />}
              </div>
            ))}
          </div>

          {/* Current step content */}
          {steps[currentStep as keyof typeof steps]}
        </div>
      </DialogContent>
    </Dialog>
  );
}
