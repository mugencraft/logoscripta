import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  AlignVerticalDistributeEnd,
  AlignVerticalDistributeStart,
  AlignVerticalSpaceAroundIcon,
} from "lucide-react";

import { Button } from "@/ui/components/core/button";
import { Label } from "@/ui/components/core/label";

interface RectangleArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface AlignmentControlsProps {
  area: RectangleArea;
  onChange: (area: RectangleArea) => void;
  containerBounds?: { width: number; height: number };
}

export function AlignmentControls({
  area,
  onChange,
  containerBounds = { width: 100, height: 100 },
}: AlignmentControlsProps) {
  const alignHorizontal = (alignment: "left" | "center" | "right") => {
    let newX = area.x;

    switch (alignment) {
      case "left":
        newX = 0;
        break;
      case "center":
        newX = (containerBounds.width - area.width) / 2;
        break;
      case "right":
        newX = containerBounds.width - area.width;
        break;
    }

    onChange({
      ...area,
      x: Math.max(0, Math.min(containerBounds.width - area.width, newX)),
    });
  };

  const alignVertical = (alignment: "top" | "center" | "bottom") => {
    let newY = area.y;

    switch (alignment) {
      case "top":
        newY = 0;
        break;
      case "center":
        newY = (containerBounds.height - area.height) / 2;
        break;
      case "bottom":
        newY = containerBounds.height - area.height;
        break;
    }

    onChange({
      ...area,
      y: Math.max(0, Math.min(containerBounds.height - area.height, newY)),
    });
  };

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs font-medium mb-2 block">
          Horizontal Alignment
        </Label>
        <div className="flex gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => alignHorizontal("left")}
            className="h-7 w-7 p-0"
          >
            <AlignLeft className="h-3 w-3" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => alignHorizontal("center")}
            className="h-7 w-7 p-0"
          >
            <AlignCenter className="h-3 w-3" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => alignHorizontal("right")}
            className="h-7 w-7 p-0"
          >
            <AlignRight className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div>
        <Label className="text-xs font-medium mb-2 block">
          Vertical Alignment
        </Label>
        <div className="flex gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => alignVertical("top")}
            className="h-7 w-7 p-0"
          >
            <AlignVerticalDistributeStart className="h-3 w-3" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => alignVertical("center")}
            className="h-7 w-7 p-0"
          >
            <AlignVerticalSpaceAroundIcon className="h-3 w-3" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => alignVertical("bottom")}
            className="h-7 w-7 p-0"
          >
            <AlignVerticalDistributeEnd className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
