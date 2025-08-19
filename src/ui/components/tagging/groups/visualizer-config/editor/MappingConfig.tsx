import { Trash2 } from "lucide-react";

import type { TagMapping } from "@/domain/validation/tagging/group";

import { AlignmentControls } from "@/ui/components/annotation/AlignmentControls";
import { QuickPresets } from "@/ui/components/annotation/QuickPresets";
import { RectangleControls } from "@/ui/components/annotation/RectangleControls";
import { Button } from "@/ui/components/core/button";
import { Label } from "@/ui/components/core/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/components/core/select";
import { Separator } from "@/ui/components/core/separator";

import type { UseVisualizerConfigReturn } from "../useVisualizerConfig";

interface MappingConfigProps {
  selectedMapping?: TagMapping;
  selectedTag?: string;
  configIndex: number;
  visualizerState: UseVisualizerConfigReturn;
}
export const MappingConfig = ({
  selectedMapping,
  configIndex,
  visualizerState,
}: MappingConfigProps) => {
  const { createMappingHandlers, selectedTag } = visualizerState;
  const {
    handleTypeChange,
    handleLabelChange,
    handleMappingRemoval,
    handleMappingUpdate,
  } = createMappingHandlers(configIndex);
  const isValid = Boolean(selectedTag && selectedMapping);

  const handleAreaChange = (area: TagMapping["area"]) => {
    if (selectedTag) {
      handleMappingUpdate(selectedTag, { area });
    }
  };

  return (
    <div className="space-y-3 p-3 border rounded">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">
          {selectedTag ? `Mapping for: ${selectedTag}` : "Select Tag"}
        </Label>
        <Button
          size="sm"
          type="button"
          variant="destructive"
          disabled={!isValid}
          onClick={() => selectedTag && handleMappingRemoval(selectedTag)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {selectedMapping && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Type</Label>
              <Select
                value={selectedMapping.type ?? ""}
                disabled={!isValid}
                onValueChange={(value: "overlay" | "crop") =>
                  selectedTag && handleTypeChange(selectedTag, value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overlay">Overlay Area</SelectItem>
                  <SelectItem value="crop">Crop Area</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Label</Label>
              <input
                className="w-full text-xs p-2 border rounded"
                type="text"
                value={selectedMapping.style.label ?? ""}
                disabled={!isValid}
                onChange={(e) =>
                  selectedTag && handleLabelChange(selectedTag, e.target.value)
                }
              />
            </div>
          </div>

          <Separator />

          <QuickPresets onChange={handleAreaChange} />

          <Separator />

          <RectangleControls
            area={selectedMapping.area}
            onChange={handleAreaChange}
            showLinkControls={true}
          />

          <Separator />

          <AlignmentControls
            area={selectedMapping.area}
            onChange={handleAreaChange}
          />
        </>
      )}
    </div>
  );
};

export const getAreaColor = (type: string) => {
  switch (type) {
    case "crop":
      return "#ef4444";
    case "overlay":
      return "#10b981";
    default:
      return "#6b7280";
  }
};
