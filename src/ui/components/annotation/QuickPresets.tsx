import { Button } from "@/ui/components/core/button";
import { Label } from "@/ui/components/core/label";

interface RectangleArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface QuickPresetsProps {
  onChange: (area: RectangleArea) => void;
}

export function QuickPresets({ onChange }: QuickPresetsProps) {
  const presets = [
    { name: "Full", area: { x: 0, y: 0, width: 100, height: 100 } },
    { name: "Center", area: { x: 25, y: 25, width: 50, height: 50 } },
    { name: "Top Half", area: { x: 0, y: 0, width: 100, height: 50 } },
    { name: "Bottom Half", area: { x: 0, y: 50, width: 100, height: 50 } },
    { name: "Portrait", area: { x: 15, y: 5, width: 70, height: 35 } },
    { name: "Face Focus", area: { x: 35, y: 8, width: 30, height: 15 } },
  ];

  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium">Quick Presets</Label>
      <div className="grid grid-cols-2 gap-1">
        {presets.map((preset) => (
          <Button
            key={preset.name}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onChange(preset.area)}
            className="h-7 text-xs"
          >
            {preset.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
