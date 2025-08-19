import { Trash2 } from "lucide-react";

import type { TagConfiguration } from "@/domain/validation/tagging/group";

import { Button } from "@/ui/components/core/button";
import { Separator } from "@/ui/components/core/separator";

import type { UseVisualizerConfigReturn } from "../useVisualizerConfig";
import { ImagePreview } from "./ImagePreview";
import { ImageSelector } from "./ImageSelector";
import { MappingConfig } from "./MappingConfig";
import { TagCombinationSelector } from "./TagCombinationSelector";
import { TagImageMapping } from "./TagImageMapping";
import type { AvailableTag } from "./types";
import { ValidationErrors } from "./ValidationErrors";

interface TagConfigEditorProps {
  configIndex: number;
  tagConfig: TagConfiguration;
  activationTags: AvailableTag[];
  mappingTags: AvailableTag[];
  availableImages: string[];
  visualizerState: UseVisualizerConfigReturn;
}

export function TagConfigEditor({
  configIndex,
  tagConfig,
  activationTags,
  mappingTags,
  availableImages,
  visualizerState,
}: TagConfigEditorProps) {
  const selectedTags = tagConfig.tagNames || [];
  const isImageValid = availableImages.includes(tagConfig.imagePath);
  const selectedMapping = tagConfig.mappings.find(
    (m) => m.tagName === visualizerState.selectedTag,
  );

  const { handleTagSelection, handleMappingUpdate, handleMappingRemoval } =
    visualizerState.createMappingHandlers(configIndex);

  return (
    <div className="space-y-4 border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <h5 className="font-medium">Image Configuration</h5>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => visualizerState.removeImageConfiguration(configIndex)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <ValidationErrors
        selectedTags={selectedTags}
        activationTags={activationTags}
      />

      <div className="flex flex-row gap-6">
        <div className="w-full space-y-4">
          <TagCombinationSelector
            selectedTags={selectedTags}
            activationTags={activationTags}
            onUpdate={(updates) =>
              visualizerState.updateImageConfiguration(configIndex, updates)
            }
          />
          <Separator />
          <div className="flex flex-row gap-6">
            <TagImageMapping
              mappingTags={mappingTags}
              activeMappings={tagConfig.mappings}
              selectedTag={visualizerState.selectedTag}
              onTagClick={handleTagSelection}
            />
            <MappingConfig
              selectedMapping={selectedMapping}
              visualizerState={visualizerState}
              configIndex={configIndex}
            />
          </div>
        </div>

        <div className="space-y-4 max-w-[300px]">
          <ImageSelector
            availableImages={availableImages}
            selectedPath={tagConfig.imagePath}
            onSelect={(imagePath) =>
              visualizerState.updateImageConfiguration(configIndex, {
                imagePath,
              })
            }
          />
          {!isImageValid ? (
            <p>{`Image is not available: ${tagConfig.imagePath}`}</p>
          ) : (
            <ImagePreview
              imagePath={tagConfig.imagePath}
              mappings={tagConfig.mappings}
              selectedTag={visualizerState.selectedTag}
              updateMapping={handleMappingUpdate}
              removeMappingForTag={handleMappingRemoval}
            />
          )}
        </div>
      </div>
    </div>
  );
}
