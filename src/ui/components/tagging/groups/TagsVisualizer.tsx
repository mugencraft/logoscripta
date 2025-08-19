import { useMemo } from "react";

import type { Tag } from "@/domain/models/tagging/tag";
import type { TagsVisualizerConfig } from "@/domain/validation/tagging/group";

import { cn } from "@/ui/utils";

interface TagsVisualizerProps {
  selectedSystemTags: Tag[];
  config: TagsVisualizerConfig;
}

export function TagsVisualizer({
  selectedSystemTags,
  config,
}: TagsVisualizerProps) {
  const selectedTagNames = useMemo(
    () => selectedSystemTags.map((tag) => tag.name),
    [selectedSystemTags],
  );

  // Find the best matching image based on activation tags
  const currentImage = useMemo(() => {
    if (!config.tagConfigurations || config.tagConfigurations.length === 0) {
      return null;
    }

    let bestMatch = config.tagConfigurations[0];
    let maxMatches = 0;

    for (const imageConfig of config.tagConfigurations) {
      // Check how many of the required tags are selected
      const requiredTags = imageConfig.tagNames || [];
      const matchedTags = requiredTags.filter((tagName) =>
        selectedTagNames.includes(tagName),
      );

      // Perfect match: all required tags are selected
      if (
        matchedTags.length === requiredTags.length &&
        requiredTags.length > 0
      ) {
        // Prefer configurations with more specific requirements
        if (requiredTags.length > maxMatches) {
          bestMatch = imageConfig;
          maxMatches = requiredTags.length;
        }
      }
    }

    // If no perfect match, return the first configuration as fallback
    return maxMatches > 0 ? bestMatch : config.tagConfigurations[0];
  }, [config.tagConfigurations, selectedTagNames]);

  // Get active mappings based on selected tags
  const activeMappings = useMemo(() => {
    if (!currentImage) return [];
    return currentImage.mappings.filter((mapping) =>
      selectedTagNames.includes(mapping.tagName),
    );
  }, [currentImage, selectedTagNames]);

  // Separate crop and overlay mappings
  const cropMappings = activeMappings.filter((m) => m.type === "crop");
  const overlayMappings = activeMappings.filter((m) => m.type === "overlay");

  return (
    <div
      className={cn(
        "relative w-full border rounded-lg overflow-hidden bg-gray-50",
        config.aspectRatio,
      )}
    >
      {/* Base image */}
      {currentImage?.imagePath && (
        <img
          src={currentImage.imagePath}
          alt="Visual reference"
          className="w-full h-full object-cover"
        />
      )}

      {/* Crop areas (typically shot type indicators) */}
      {cropMappings.map((mapping) => (
        <div
          key={`crop-{mapping.tagName}`}
          className="absolute border-2 bg-opacity-20"
          style={{
            left: `${mapping.area.x}%`,
            top: `${mapping.area.y}%`,
            width: `${mapping.area.width}%`,
            height: `${mapping.area.height}%`,
            borderColor: mapping.style.color,
            backgroundColor: `${mapping.style.color}20`,
          }}
        >
          <div
            className="absolute -top-6 left-0 text-xs font-medium px-1 rounded bg-white"
            style={{ color: mapping.style.color }}
          >
            {mapping.style.label}
          </div>
        </div>
      ))}

      {/* Overlay areas (focus, crop, etc.) */}
      {overlayMappings.map((mapping) => (
        <div
          key={`overlay-${mapping.tagName}`}
          className="absolute border-2 pointer-events-none"
          style={{
            left: `${mapping.area.x}%`,
            top: `${mapping.area.y}%`,
            width: `${mapping.area.width}%`,
            height: `${mapping.area.height}%`,
            borderColor: mapping.style.color,
            backgroundColor: `${mapping.style.color}20`,
          }}
        >
          {mapping.style.label && (
            <div
              className="absolute -top-6 left-0 text-xs font-medium px-1 rounded bg-white"
              style={{ color: mapping.style.color }}
            >
              {mapping.style.label}
            </div>
          )}
        </div>
      ))}

      {/* Fallback when no image is configured */}
      {!currentImage?.imagePath && (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <span className="text-sm">No image configured</span>
        </div>
      )}
    </div>
  );
}
