import { Trash2 } from "lucide-react";
import { useMemo } from "react";
import { Rnd } from "react-rnd";

import type { TagMapping } from "@/domain/validation/tagging/group";

import { Button } from "@/ui/components/core/button";

import { coordinateTransforms } from "./coordinateTransforms";
import { getAreaColor } from "./MappingConfig";
import { useContainerDimensions } from "./useContainerDimensions";

interface ImagePreviewProps {
  imagePath: string;
  mappings: TagMapping[];
  selectedTag?: string;
  updateMapping: (tagName: string, updates: Partial<TagMapping>) => void;
  removeMappingForTag: (tagName: string) => void;
}

export function ImagePreview({
  imagePath,
  mappings,
  selectedTag,
  updateMapping,
  removeMappingForTag,
}: ImagePreviewProps) {
  const { containerRef, dimensions } = useContainerDimensions();

  // Precompute pixel positions for all mappings
  const mappingsWithPixelData = useMemo(
    () =>
      mappings.map((mapping) => ({
        ...mapping,
        pixelArea: coordinateTransforms.toPixels(mapping.area, dimensions),
      })),
    [mappings, dimensions],
  );

  const handleDragStop =
    (mapping: TagMapping) => (_e: unknown, data: { x: number; y: number }) => {
      const percentageArea = coordinateTransforms.toPercentage(
        { ...coordinateTransforms.toPixels(mapping.area, dimensions), ...data },
        dimensions,
      );

      updateMapping(mapping.tagName, {
        area: coordinateTransforms.constrainToContainer(percentageArea),
      });
    };

  const handleResizeStop =
    (mapping: TagMapping) =>
    (
      _e: unknown,
      _direction: unknown,
      ref: HTMLElement,
      _delta: unknown,
      position: { x: number; y: number },
    ) => {
      const pixelArea = {
        x: position.x,
        y: position.y,
        width: ref.offsetWidth,
        height: ref.offsetHeight,
      };

      const percentageArea = coordinateTransforms.toPercentage(
        pixelArea,
        dimensions,
      );

      updateMapping(mapping.tagName, {
        area: coordinateTransforms.constrainToContainer(percentageArea),
      });
    };

  if (!imagePath) {
    return (
      <div className="flex items-center justify-center aspect-[1/2] border rounded text-destructive">
        <span className="text-sm">No image selected</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        ref={containerRef}
        className="relative aspect-[1/2] border rounded overflow-hidden bg-gray-50"
      >
        <img
          src={`/cdn/assets/${imagePath}`}
          alt={`Preview ${imagePath}`}
          className="w-full h-full object-cover"
        />

        {mappingsWithPixelData.map(({ pixelArea, ...mapping }) => (
          <Rnd
            key={mapping.tagName}
            size={{ width: pixelArea.width, height: pixelArea.height }}
            position={{ x: pixelArea.x, y: pixelArea.y }}
            onDragStop={handleDragStop(mapping)}
            onResizeStop={handleResizeStop(mapping)}
            bounds="parent"
            minWidth={20}
            minHeight={20}
            className={`
              border-2 bg-opacity-20 cursor-move
              ${mapping.tagName === selectedTag ? "ring-2 ring-blue-400" : ""}
            `}
            style={{
              borderColor: getAreaColor(mapping.type),
              backgroundColor: `${getAreaColor(mapping.type)}20`,
            }}
          >
            <div
              className="absolute -top-6 left-0 text-xs font-medium px-1 rounded bg-white flex items-center gap-1"
              style={{ color: getAreaColor(mapping.type) }}
            >
              {mapping.style.label}
              <Button
                size="sm"
                variant="ghost"
                className="h-4 w-4 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  removeMappingForTag(mapping.tagName);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </Rnd>
        ))}
      </div>
    </div>
  );
}
