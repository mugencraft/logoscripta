import { useEffect, useId, useMemo, useState } from "react";

import { getFilenameWithoutExt } from "@/core/utils/format";
import type { ContentCollection } from "@/domain/models/content/collection";
import type { ContentType } from "@/domain/models/content/types";

import { Button } from "@/ui/components/core/button";
import { Input } from "@/ui/components/core/input";
import { Label } from "@/ui/components/core/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/components/core/select";
import { Switch } from "@/ui/components/core/switch";
import { ImportOptionsForm } from "@/ui/components/import-export/ImportOptionsForm";

interface StepOptionsProps {
  contentType: ContentType;
  data: { path?: string } | null;
  collections?: ContentCollection[];
  onNext: (options: ImportOptionsData) => void;
  onBack: () => void;
}

export interface ImportOptionsData {
  collectionId?: number;
  createNewCollection: boolean;
  newCollectionName?: string;
  skipExisting: boolean;
  matchByFilename: boolean;
  preserveStructure: boolean;
  additionalOptions: Record<string, unknown>;
}

const importOptionsConfig = [
  {
    id: "skipExisting",
    label: "Skip existing items",
    defaultValue: true,
  },
  {
    id: "matchByFilename",
    label: "Match by filename",
    defaultValue: true,
  },
  {
    id: "preserveStructure",
    label: "Preserve folder structure (coming soon)",
    disabled: true,
  },
];

export function StepOptions({
  contentType,
  data,
  collections,
  onNext,
  onBack,
}: StepOptionsProps) {
  const defaultName = useMemo(() => {
    if (!data?.path) return "";
    return getFilenameWithoutExt(data.path);
  }, [data?.path]);

  const [options, setOptions] = useState<ImportOptionsData>({
    createNewCollection: true,
    newCollectionName: defaultName,
    skipExisting: true,
    matchByFilename: true,
    preserveStructure: false,
    additionalOptions: {},
  });

  const preserveId = useId();
  const createId = useId();
  const collectionId = useId();

  useEffect(() => {
    if (options.createNewCollection && !options.newCollectionName) {
      setOptions((prev) => ({ ...prev, newCollectionName: defaultName }));
    }
  }, [defaultName, options.createNewCollection, options.newCollectionName]);

  const getTypeSpecificOptions = () => {
    switch (contentType) {
      case "image":
        return (
          <>
            <div className="flex items-center space-x-2">
              <Switch
                id={preserveId}
                checked={options.preserveStructure}
                onCheckedChange={(checked) =>
                  setOptions((prev) => ({
                    ...prev,
                    preserveStructure: checked,
                  }))
                }
                disabled={true} // Disabled until we implement recursion
              />
              <Label htmlFor={preserveId} className="text-muted-foreground">
                Preserve folder structure (coming soon)
              </Label>
            </div>
            <div className="text-sm text-muted-foreground">
              Caption files (.txt) will be automatically matched with image
              files by filename
            </div>
          </>
        );
      // case "captions":
      //   return (
      //     <div className="space-y-4">
      //       <div>
      //         <Label>Caption Format</Label>
      //         <Select
      //           onValueChange={(value) =>
      //             setOptions((prev) => ({
      //               ...prev,
      //               additionalOptions: {
      //                 ...prev.additionalOptions,
      //                 format: value,
      //               },
      //             }))
      //           }
      //         >
      //           <SelectTrigger>
      //             <SelectValue placeholder="Select format" />
      //           </SelectTrigger>
      //           <SelectContent>
      //             <SelectItem value="json">JSON</SelectItem>
      //             <SelectItem value="csv">CSV</SelectItem>
      //             <SelectItem value="txt">Text Files</SelectItem>
      //           </SelectContent>
      //         </Select>
      //       </div>
      //     </div>
      //   );
      default:
        return null;
    }
  };

  const handleOptionChange = (optionId: string, checked: boolean) => {
    setOptions((prev) => ({ ...prev, [optionId]: checked }));
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium">Import Options</Label>
        <p className="text-sm text-muted-foreground">
          Configure how to import your {contentType}
        </p>
      </div>

      {/* Collection Selection */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id={createId}
            checked={options.createNewCollection}
            onCheckedChange={(checked) =>
              setOptions((prev) => ({ ...prev, createNewCollection: checked }))
            }
          />
          <Label htmlFor={createId}>Create new collection</Label>
        </div>

        {options.createNewCollection ? (
          <div>
            <Label htmlFor={collectionId}>Collection Name</Label>
            <Input
              id={collectionId}
              value={options.newCollectionName || ""}
              onChange={(e) =>
                setOptions((prev) => ({
                  ...prev,
                  newCollectionName: e.target.value,
                }))
              }
              placeholder={`Enter collection name (default: ${defaultName})`}
            />
          </div>
        ) : (
          <div>
            <Label>Select Collection</Label>
            <Select
              onValueChange={(value) =>
                setOptions((prev) => ({
                  ...prev,
                  collectionId: Number.parseInt(value, 10),
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select existing collection" />
              </SelectTrigger>
              <SelectContent>
                {collections?.map((collection) => (
                  <SelectItem
                    key={collection.id}
                    value={collection.id.toString()}
                  >
                    {collection.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Common Options */}
      <ImportOptionsForm
        domain="items"
        options={importOptionsConfig}
        values={{
          skipExisting: options.skipExisting,
          matchByFilename: options.matchByFilename,
          preserveStructure: options.preserveStructure,
        }}
        onChange={handleOptionChange}
      />

      {/* Type-specific Options */}
      {getTypeSpecificOptions()}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          onClick={() => onNext(options)}
          disabled={options.createNewCollection && !options.newCollectionName}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
