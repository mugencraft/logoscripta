import { Link, Unlink } from "lucide-react";
import { useState } from "react";

import { Button } from "@/ui/components/core/button";
import { Input } from "@/ui/components/core/input";
import { Label } from "@/ui/components/core/label";

interface RectangleArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface RectangleControlsProps {
  area: RectangleArea;
  onChange: (area: RectangleArea) => void;
  min?: number;
  max?: number;
  step?: number;
  showLinkControls?: boolean;
}

export function RectangleControls({
  area,
  onChange,
  min = 0,
  max = 100,
  step = 0.1,
  showLinkControls = true,
}: RectangleControlsProps) {
  const [isLinked, setIsLinked] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(area.width / area.height);

  const handlePositionChange = (field: "x" | "y", value: number) => {
    onChange({ ...area, [field]: Math.max(min, Math.min(max, value)) });
  };

  const handleSizeChange = (field: "width" | "height", value: number) => {
    const newValue = Math.max(0.1, Math.min(max, value));

    if (isLinked && showLinkControls) {
      if (field === "width") {
        const newHeight = newValue / aspectRatio;
        onChange({
          ...area,
          width: newValue,
          height: Math.max(0.1, Math.min(max, newHeight)),
        });
      } else {
        const newWidth = newValue * aspectRatio;
        onChange({
          ...area,
          height: newValue,
          width: Math.max(0.1, Math.min(max, newWidth)),
        });
      }
    } else {
      onChange({ ...area, [field]: newValue });
    }
  };

  const toggleLink = () => {
    if (!isLinked) {
      setAspectRatio(area.width / area.height);
    }
    setIsLinked(!isLinked);
  };

  return (
    <div className="space-y-3">
      {/* Position Controls */}
      <div>
        <Label className="text-xs font-medium">Position (%)</Label>
        <div className="grid grid-cols-2 gap-2 mt-1">
          <div>
            <Label className="text-xs text-muted-foreground">X</Label>
            <Input
              type="number"
              value={area.x.toFixed(1)}
              onChange={(e) =>
                handlePositionChange("x", parseFloat(e.target.value) || 0)
              }
              min={min}
              max={max}
              step={step}
              className="h-7"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Y</Label>
            <Input
              type="number"
              value={area.y.toFixed(1)}
              onChange={(e) =>
                handlePositionChange("y", parseFloat(e.target.value) || 0)
              }
              min={min}
              max={max}
              step={step}
              className="h-7"
            />
          </div>
        </div>
      </div>

      {/* Size Controls */}
      <div>
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium">Size (%)</Label>
          {showLinkControls && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={toggleLink}
              className="h-6 w-6 p-0"
            >
              {isLinked ? (
                <Link className="h-3 w-3" />
              ) : (
                <Unlink className="h-3 w-3" />
              )}
            </Button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 mt-1">
          <div>
            <Label className="text-xs text-muted-foreground">W</Label>
            <Input
              type="number"
              value={area.width.toFixed(1)}
              onChange={(e) =>
                handleSizeChange("width", parseFloat(e.target.value) || 0)
              }
              min={0.1}
              max={max}
              step={step}
              className="h-7"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">H</Label>
            <Input
              type="number"
              value={area.height.toFixed(1)}
              onChange={(e) =>
                handleSizeChange("height", parseFloat(e.target.value) || 0)
              }
              min={0.1}
              max={max}
              step={step}
              className="h-7"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
