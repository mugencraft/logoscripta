import { Image, Target } from "lucide-react";

import type { TagGroupWithCategories } from "@/domain/models/tagging/types";

import { Badge } from "@/ui/components/core/badge";
import { Label } from "@/ui/components/core/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/ui/components/core/tabs";

import { CategorySelector } from "./CategorySelector";
import { TagConfigEditor } from "./editor/TagConfigEditor";
import { useTagManagement } from "./useTagManagement";
import type { UseVisualizerConfigReturn } from "./useVisualizerConfig";

interface TagsConfigSectionProps {
  group: TagGroupWithCategories;
  assetImages: string[];
  visualizerState: UseVisualizerConfigReturn;
}

export function TagsConfigSection({
  group,
  assetImages,
  visualizerState,
}: TagsConfigSectionProps) {
  const { config, updateConfig, addImageConfiguration } = visualizerState;

  const { activationTags, mappingTags, createCategorySelectionHandler } =
    useTagManagement(group, config.activationCategoryIds);

  const handleCategorySelection = createCategorySelectionHandler(updateConfig);

  const imageConfigurations = config.tagConfigurations || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">Image Configuration</Label>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {activationTags.length} activation tags
          </Badge>
          <Badge variant="outline">
            {imageConfigurations.length} images configured
          </Badge>
        </div>
      </div>

      <CategorySelector
        categories={group.categories}
        selectedCategoryIds={config.activationCategoryIds}
        onSelectionChange={handleCategorySelection}
      />

      {!config.activationCategoryIds?.length || activationTags.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>
            {activationTags.length === 0
              ? "Selected categories have no tags available"
              : "Select categories to configure image switching"}
          </p>
          <p className="text-xs mt-1">
            {activationTags.length === 0
              ? "Configure tags in the selected categories first"
              : "Tags from selected categories will determine which image to display"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Image Configurations</h4>
            <button
              type="button"
              onClick={addImageConfiguration}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              + Add Image
            </button>
          </div>

          {imageConfigurations.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg">
              <Image className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No image configurations yet</p>
              <p className="text-xs">
                Add an image to start configuring tag combinations
              </p>
            </div>
          ) : (
            <Tabs value="0" className="w-full">
              <TabsList
                className="grid w-full"
                style={{
                  gridTemplateColumns: `repeat(${imageConfigurations.length}, minmax(0, 1fr))`,
                }}
              >
                {imageConfigurations.map((config, index) => (
                  <TabsTrigger
                    key={config.tagNames.join("-")}
                    value={String(index)}
                  >
                    {config.imagePath.split("/").pop()}
                  </TabsTrigger>
                ))}
              </TabsList>

              {imageConfigurations.map((imageConfig, index) => (
                <TabsContent
                  key={config.activationCategoryIds.join("-")}
                  value={String(index)}
                  className="mt-4"
                >
                  <TagConfigEditor
                    configIndex={index}
                    tagConfig={imageConfig}
                    availableImages={assetImages}
                    activationTags={activationTags}
                    mappingTags={mappingTags}
                    visualizerState={visualizerState}
                  />
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>
      )}
    </div>
  );
}
