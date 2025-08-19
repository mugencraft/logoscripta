import { useCallback, useEffect, useState } from "react";

import type { ImageMappingType } from "@/domain/models/tagging/types";
import type {
  TagConfiguration,
  TagMapping,
  TagsVisualizerConfig,
} from "@/domain/validation/tagging/group";

import { getAreaColor } from "@/ui/components/tagging/groups/visualizer-config/editor/MappingConfig";

export interface UseVisualizerConfigOptions {
  onSave?: (config: TagsVisualizerConfig) => Promise<void>;
  autoSave?: boolean;
}

export interface UseVisualizerConfigReturn {
  // State
  config: TagsVisualizerConfig;
  selectedTag: string | undefined;
  isDirty: boolean;
  isSaving: boolean;

  // Core config actions
  updateConfig: (updates: Partial<TagsVisualizerConfig>) => void;
  setSelectedTag: (tagName: string | undefined) => void;

  // Image configuration actions
  addImageConfiguration: () => void;
  removeImageConfiguration: (index: number) => void;
  updateImageConfiguration: (
    index: number,
    updates: Partial<TagConfiguration>,
  ) => void;

  // Mapping actions
  addMapping: (configIndex: number, tagName: string) => void;
  updateMapping: (
    configIndex: number,
    tagName: string,
    updates: Partial<TagMapping>,
  ) => void;
  removeMapping: (configIndex: number, tagName: string) => void;
  // new
  createMappingHandlers: (configIndex: number) => {
    handleTagSelection: (tagName: string) => void;
    handleMappingUpdate: (
      tagName: string,
      updates: Partial<TagMapping>,
    ) => void;
    handleMappingRemoval: (tagName: string) => void;
    handleTypeChange: (tagName: string, type: ImageMappingType) => void;
    handleLabelChange: (tagName: string, label: string) => void;
  };

  // Persistence actions
  save: () => Promise<void>;
  reset: () => void;
}

const createDefaultConfig = (): TagsVisualizerConfig => ({
  activationCategoryIds: [],
  tagConfigurations: [],
  aspectRatio: "aspect-[1/2]",
  position: "left",
  width: "w-48",
});

export function useVisualizerConfig(
  options: UseVisualizerConfigOptions = {},
  initialConfig: TagsVisualizerConfig = createDefaultConfig(),
): UseVisualizerConfigReturn {
  const { onSave, autoSave = false } = options;

  const [config, setConfig] = useState<TagsVisualizerConfig>(initialConfig);
  const [originalConfig] = useState<TagsVisualizerConfig>(initialConfig);
  const [selectedTag, setSelectedTag] = useState<string | undefined>();
  const [isSaving, setIsSaving] = useState(false);

  const isDirty = JSON.stringify(config) !== JSON.stringify(originalConfig);

  const updateConfig = useCallback((updates: Partial<TagsVisualizerConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  const addImageConfiguration = useCallback(() => {
    const newConfig: TagConfiguration = {
      tagNames: [],
      imagePath: "",
      mappings: [],
    };

    setConfig((prev) => ({
      ...prev,
      tagConfigurations: [...prev.tagConfigurations, newConfig],
    }));
  }, []);

  const removeImageConfiguration = useCallback((index: number) => {
    setConfig((prev) => ({
      ...prev,
      tagConfigurations: prev.tagConfigurations.filter((_, i) => i !== index),
    }));
  }, []);

  const updateImageConfiguration = useCallback(
    (index: number, updates: Partial<TagConfiguration>) => {
      setConfig((prev) => {
        const updatedConfigurations = [...prev.tagConfigurations];
        const existing = updatedConfigurations[index];

        if (!existing) return prev; // Defensive programming

        updatedConfigurations[index] = { ...existing, ...updates };

        return {
          ...prev,
          tagConfigurations: updatedConfigurations,
        };
      });
    },
    [],
  );

  const addMapping = useCallback((configIndex: number, tagName: string) => {
    const newMapping: TagMapping = {
      tagName,
      type: "overlay",
      area: { x: 25, y: 25, width: 30, height: 30 },
      style: { color: "#3b82f6", label: tagName },
    };

    setConfig((prev) => {
      const updatedConfigurations = [...prev.tagConfigurations];
      const targetConfig = updatedConfigurations[configIndex];

      if (!targetConfig) return prev;

      // Prevent duplicate mappings
      if (targetConfig.mappings.some((m) => m.tagName === tagName)) {
        return prev;
      }

      updatedConfigurations[configIndex] = {
        ...targetConfig,
        mappings: [...targetConfig.mappings, newMapping],
      };

      return {
        ...prev,
        tagConfigurations: updatedConfigurations,
      };
    });

    setSelectedTag(tagName); // Auto-select newly created mapping
  }, []);

  const updateMapping = useCallback(
    (configIndex: number, tagName: string, updates: Partial<TagMapping>) => {
      setConfig((prev) => {
        const updatedConfigurations = [...prev.tagConfigurations];
        const targetConfig = updatedConfigurations[configIndex];

        if (!targetConfig) return prev;

        const updatedMappings = targetConfig.mappings.map((mapping) =>
          mapping.tagName === tagName ? { ...mapping, ...updates } : mapping,
        );

        updatedConfigurations[configIndex] = {
          ...targetConfig,
          mappings: updatedMappings,
        };

        return {
          ...prev,
          tagConfigurations: updatedConfigurations,
        };
      });
    },
    [],
  );

  const removeMapping = useCallback(
    (configIndex: number, tagName: string) => {
      setConfig((prev) => {
        const updatedConfigurations = [...prev.tagConfigurations];
        const targetConfig = updatedConfigurations[configIndex];

        if (!targetConfig) return prev;

        updatedConfigurations[configIndex] = {
          ...targetConfig,
          mappings: targetConfig.mappings.filter((m) => m.tagName !== tagName),
        };

        return {
          ...prev,
          tagConfigurations: updatedConfigurations,
        };
      });

      // Clear selection if the removed mapping was selected
      if (selectedTag === tagName) {
        setSelectedTag(undefined);
      }
    },
    [selectedTag],
  );

  const createMappingHandlers = useCallback(
    (configIndex: number) => {
      return {
        handleTagSelection: (tagName: string) => {
          setSelectedTag(tagName);
          if (
            !config.tagConfigurations[configIndex]?.mappings.some(
              (m) => m.tagName === tagName,
            )
          ) {
            addMapping(configIndex, tagName);
          }
        },

        handleMappingUpdate: (
          tagName: string,
          updates: Partial<TagMapping>,
        ) => {
          updateMapping(configIndex, tagName, updates);
        },

        handleMappingRemoval: (tagName: string) => {
          removeMapping(configIndex, tagName);
          if (selectedTag === tagName) {
            setSelectedTag(undefined);
          }
        },

        handleTypeChange: (tagName: string, type: "overlay" | "crop") => {
          const currentMapping = config.tagConfigurations[
            configIndex
          ]?.mappings.find((m) => m.tagName === tagName);
          if (!currentMapping) return;

          updateMapping(configIndex, tagName, {
            type,
            style: { ...currentMapping.style, color: getAreaColor(type) },
          });
        },

        handleLabelChange: (tagName: string, label: string) => {
          const currentMapping = config.tagConfigurations[
            configIndex
          ]?.mappings.find((m) => m.tagName === tagName);
          if (!currentMapping) return;

          updateMapping(configIndex, tagName, {
            style: { ...currentMapping.style, label },
          });
        },
      };
    },
    [
      config.tagConfigurations,
      selectedTag,
      addMapping,
      updateMapping,
      removeMapping,
    ],
  );

  const save = useCallback(async () => {
    if (!onSave || !isDirty) return;

    setIsSaving(true);
    try {
      await onSave(config);
    } finally {
      setIsSaving(false);
    }
  }, [config, isDirty, onSave]);

  const reset = useCallback(() => {
    setConfig(originalConfig);
    setSelectedTag(undefined);
  }, [originalConfig]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && isDirty && onSave) {
      const timeoutId = setTimeout(() => save(), 1000);
      return () => clearTimeout(timeoutId);
    }
    return () => {};
  }, [autoSave, isDirty, onSave, save]);

  return {
    // State
    config,
    selectedTag,
    isDirty,
    isSaving,

    // Core config actions
    updateConfig,
    setSelectedTag,

    // Image configuration actions
    addImageConfiguration,
    removeImageConfiguration,
    updateImageConfiguration,

    // Mapping actions
    addMapping,
    updateMapping,
    removeMapping,
    createMappingHandlers,

    // Persistence actions
    save,
    reset,
  };
}
