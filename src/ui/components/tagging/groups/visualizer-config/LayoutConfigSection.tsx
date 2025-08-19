import type {
  AspectRatio,
  TagVisualizerPosition,
  TagVisualizerSize,
} from "@/domain/models/tagging/types";
import type { TagsVisualizerConfig } from "@/domain/validation/tagging/group";

import { Label } from "@/ui/components/core/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/components/core/select";

interface LayoutConfigSectionProps {
  config: TagsVisualizerConfig;
  onChange: (config: TagsVisualizerConfig) => void;
}

export function LayoutConfigSection({
  config,
  onChange,
}: LayoutConfigSectionProps) {
  const updateLayout = (
    field: keyof TagsVisualizerConfig,
    value: AspectRatio | TagVisualizerPosition | TagVisualizerSize,
  ) => {
    onChange({ ...config, [field]: value });
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      <div>
        <Label>Aspect Ratio</Label>
        <Select
          value={config.aspectRatio}
          onValueChange={(value: AspectRatio) =>
            updateLayout("aspectRatio", value)
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="aspect-[1/2]">Portrait (1:2)</SelectItem>
            <SelectItem value="aspect-[2/3]">Standard (2:3)</SelectItem>
            <SelectItem value="aspect-[3/4]">Photo (3:4)</SelectItem>
            <SelectItem value="aspect-square">Square (1:1)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Position</Label>
        <Select
          value={config.position}
          onValueChange={(value: TagVisualizerPosition) =>
            updateLayout("position", value)
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Left</SelectItem>
            <SelectItem value="right">Right</SelectItem>
            <SelectItem value="top">Top</SelectItem>
            <SelectItem value="bottom">Bottom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Width</Label>
        <Select
          value={config.width}
          onValueChange={(value: TagVisualizerSize) =>
            updateLayout("width", value)
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="w-32">Small (128px)</SelectItem>
            <SelectItem value="w-48">Medium (192px)</SelectItem>
            <SelectItem value="w-64">Large (256px)</SelectItem>
            <SelectItem value="w-80">Extra Large (320px)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
