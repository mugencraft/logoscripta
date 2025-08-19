import { Label } from "@/ui/components/core/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/components/core/select";

interface ImageSelectorProps {
  availableImages: string[];
  selectedPath: string;
  onSelect: (path: string) => void;
  disabled?: boolean;
}

export function ImageSelector({
  availableImages,
  selectedPath,
  onSelect,
  disabled = false,
}: ImageSelectorProps) {
  return (
    <div className="flex flex-row items-center space-y-2 gap-4">
      <Label htmlFor="image">Image</Label>
      <Select
        name="image"
        value={selectedPath}
        onValueChange={onSelect}
        disabled={disabled}
      >
        <SelectTrigger className="cursor-pointer">
          <SelectValue placeholder="Select image..." />
        </SelectTrigger>
        <SelectContent>
          {availableImages.map((imagePath) => (
            <SelectItem key={imagePath} value={imagePath}>
              {imagePath.split("/").pop()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
