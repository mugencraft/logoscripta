import { useState } from "react";

import type { ContentCollection } from "@/domain/models/content/collection";
import type {
  ContentItemWithStats,
  ContentType,
  ImportConfig,
  ImportPreviewHandler,
  ImportProgressUpdate,
} from "@/domain/models/content/types";

import { DialogStyled } from "@/ui/components/extra/dialog-styled";
import { ImportProgress } from "@/ui/components/import-export/ImportProgress";
import { ImportResult } from "@/ui/components/import-export/ImportResult";

import { type ImportOptionsData, StepOptions } from "./StepOptions";
import { StepPreview } from "./StepPreview";
import {
  type ImportSourceData,
  StepSourceSelector,
} from "./StepSourceSelector";

type ImportStep = "source" | "options" | "preview" | "progress" | "complete";

interface ImportWizardProps {
  contentType: ContentType;
  importFolders?: string[];
  existingItems?: ContentItemWithStats[];
  collections?: ContentCollection[];
  onGetImportPreview?: ImportPreviewHandler;
  onStartImport: (config: ImportConfig) => void;
  progressData: ImportProgressUpdate | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function ImportWizard({
  contentType,
  importFolders,
  existingItems,
  collections,
  onGetImportPreview,
  onStartImport,
  progressData,
  onClose,
  onSuccess,
}: ImportWizardProps) {
  const [currentStep, setCurrentStep] = useState<ImportStep>("source");
  const [importData, setImportData] = useState<ImportSourceData | null>(null);
  const [options, setOptions] = useState<ImportOptionsData | null>(null);
  const [hasTriggeredImport, setHasTriggeredImport] = useState(false);

  const handleBack = () => {
    switch (currentStep) {
      case "options":
        setCurrentStep("source");
        break;
      case "preview":
        setCurrentStep("options");
        break;
      case "progress":
        // Can't go back from progress
        break;
      default:
        onClose();
    }
  };

  const handleStartImport = () => {
    if (!importData || !options || hasTriggeredImport) return;

    setHasTriggeredImport(true);

    let config: ImportConfig;

    if (importData.sourceType === "filesystem") {
      config = {
        input: {
          source: "filesystem",
          contentType: contentType as "image" | "document",
          data: { folderName: importData.path },
        },
        options: {
          collectionName: options.newCollectionName || importData.path,
          description: `Imported ${contentType} content`,
          skipExisting: options.skipExisting,
          batchSize: 50,
        },
      };
    } else if (
      importData.sourceType === "text-content" &&
      importData.parsedData
    ) {
      config = {
        input: {
          source: "text-content",
          contentType: contentType as "url" | "document",
          format: "json",
          data: importData.parsedData,
        },
        options: {
          collectionName: options.newCollectionName || importData.path,
          description: `Imported ${contentType} content`,
          skipExisting: options.skipExisting,
          batchSize: 50,
        },
      };
    } else {
      console.error("Invalid import configuration");
      return;
    }

    onStartImport(config);
  };

  const steps = {
    source: (
      <StepSourceSelector
        contentType={contentType}
        importFolders={importFolders}
        onNext={(data) => {
          setImportData(data);
          setCurrentStep("options");
        }}
        onBack={onClose}
      />
    ),
    options: (
      <StepOptions
        contentType={contentType}
        data={importData}
        collections={collections}
        onNext={(opts) => {
          setOptions(opts);
          setCurrentStep("preview");
        }}
        onBack={handleBack}
      />
    ),
    preview: importData ? (
      <StepPreview
        contentType={contentType}
        data={importData}
        existingItems={existingItems}
        onGetImportPreview={onGetImportPreview}
        onConfirm={() => {
          setCurrentStep("progress");
          handleStartImport();
        }}
        onBack={handleBack}
      />
    ) : null,
    progress:
      importData?.sourceType === "text-content" ? (
        progressData ? (
          <ImportResult
            domain={contentType === "image" ? "images" : "items"}
            result={progressData}
            onComplete={onSuccess}
          />
        ) : (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            <span className="ml-2">Processing...</span>
          </div>
        )
      ) : (
        <ImportProgress
          domain={contentType === "image" ? "images" : "items"}
          progressData={progressData}
          onComplete={onSuccess}
        />
      ),
  };

  return (
    <DialogStyled
      open={true}
      onOpenChange={onClose}
      title={`Import ${contentType.charAt(0).toUpperCase() + contentType.slice(1)}`}
      description={`Import various types of ${contentType} into a collection`}
    >
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
    </DialogStyled>
  );
}
