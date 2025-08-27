import { useCallback } from "react";

import type { TagGroup } from "@/domain/models/tagging/group";
import type { TagsVisualizerConfig } from "@/domain/validation/tagging/group";
import { trpc } from "@/interfaces/server-client";

import { Button } from "@/ui/components/core/button";
import { Card, CardContent, CardHeader } from "@/ui/components/core/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/ui/components/core/tabs";
import { LayoutConfigSection } from "@/ui/components/tagging/groups/visualizer-config/LayoutConfigSection";
import { TagsConfigSection } from "@/ui/components/tagging/groups/visualizer-config/TagsConfigSection";
import { useVisualizerConfig } from "@/ui/components/tagging/groups/visualizer-config/useVisualizerConfig";

import { useTagGroupActions } from "../../useTagGroupActions";

interface TagGroupVisualizerManagerProps {
  group: TagGroup;
  onSuccess?: () => void;
}

export function TagGroupVisualizerManager({
  group,
  onSuccess,
}: TagGroupVisualizerManagerProps) {
  const { data: groupWithCategories, isLoading } =
    trpc.tagging.groups.getWithCategories.useQuery(group.id);

  const { data: assetImages = [] } = trpc.system.getAssetImages.useQuery();

  const { handleUpdate } = useTagGroupActions({
    callbacks: {
      onSuccess,
    },
  });

  const saveVisualizerConfig = useCallback(
    async (config: TagsVisualizerConfig) => {
      await handleUpdate({
        data: {
          ...group,
          metadata: {
            ...group.metadata,
            display: {
              color: group.metadata?.display?.color || "",
              order: group.metadata?.display?.order || 999,
              sectionsPerRow: group.metadata?.display?.sectionsPerRow || 1,
              showSectionTitles:
                group.metadata?.display?.showSectionTitles || true,
              ...group.metadata?.display,
              visualizer: config,
            },
          },
        },
      });
    },
    [group, handleUpdate],
  );

  const visualizerState = useVisualizerConfig(
    { onSave: saveVisualizerConfig },
    group.metadata?.display?.visualizer,
  );

  if (isLoading || !groupWithCategories?.categories.length) {
    return (
      <Card>
        <CardHeader></CardHeader>
        <CardContent className="p-6 text-center">
          {isLoading
            ? "Loading categories..."
            : groupWithCategories
              ? "Error loading group categories"
              : "Configure categories and tags first to enable the visual mapper"}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader></CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Tabs defaultValue="images">
            <TabsList>
              <TabsTrigger value="images">Images & Mappings</TabsTrigger>
              <TabsTrigger value="layout">Layout</TabsTrigger>
            </TabsList>

            <TabsContent value="images">
              {groupWithCategories && (
                <TagsConfigSection
                  group={groupWithCategories}
                  assetImages={assetImages}
                  visualizerState={visualizerState}
                />
              )}
            </TabsContent>
            <TabsContent value="layout">
              <LayoutConfigSection
                config={visualizerState.config}
                onChange={visualizerState.updateConfig}
              />
            </TabsContent>
          </Tabs>

          <div className="flex justify-end">
            {visualizerState.isDirty && (
              <Button
                variant="outline"
                onClick={visualizerState.reset}
                disabled={visualizerState.isSaving}
              >
                Reset
              </Button>
            )}
            <Button
              onClick={visualizerState.save}
              disabled={visualizerState.isSaving || !visualizerState.isDirty}
            >
              {visualizerState.isSaving
                ? "Saving..."
                : "Save Visualizer Config"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
