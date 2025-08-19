import { type ColorResult, Sketch } from "@uiw/react-color";
import { Palette, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/ui/components/core/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/ui/components/core/popover";

import { useFieldContext } from "../context";
import type { FormFieldProps } from "../types";
import { FieldWrapper } from "./base";

export const ColorField = ({
  label,
  placeholder,
  required,
}: FormFieldProps) => {
  const field = useFieldContext<string | undefined>();
  const [isOpen, setIsOpen] = useState(false);

  const handleColorChange = (color: ColorResult) => {
    field.handleChange(color.hex);
  };

  const handleClear = () => {
    field.handleChange("");
    console.log(field.state.value);
  };

  return (
    <FieldWrapper
      label={label}
      required={required}
      fieldName={field.name}
      errors={field.state.meta.errors}
    >
      <div className="flex gap-2">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="flex-1 justify-start text-left font-normal h-10"
            >
              <div className="flex items-center gap-2 w-full">
                {field.state.value ? (
                  <>
                    <div
                      className="w-4 h-4 rounded border border-border"
                      style={{ backgroundColor: field.state.value }}
                    />
                    <span className="flex-1 truncate">{field.state.value}</span>
                  </>
                ) : (
                  <>
                    <Palette className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {placeholder || "Select color"}
                    </span>
                  </>
                )}
              </div>
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-3">
              <Sketch
                color={field.state.value || "#ffeb3b"}
                onChange={handleColorChange}
                disableAlpha={false}
                style={{
                  backgroundColor: "hsl(var(--background))",
                  border: "none",
                  borderRadius: "calc(var(--radius) - 2px)",
                  boxShadow: "none",
                }}
                presetColors={[
                  "#f44336",
                  "#e91e63",
                  "#9c27b0",
                  "#673ab7",
                  "#3f51b5",
                  "#2196f3",
                  "#03a9f4",
                  "#00bcd4",
                  "#009688",
                  "#4caf50",
                  "#8bc34a",
                  "#cddc39",
                  "#ffeb3b",
                  "#ffc107",
                  "#ff9800",
                  "#ff5722",
                  "#795548",
                  "#607d8b",
                  "#000000",
                  "#ffffff",
                ]}
              />
            </div>
          </PopoverContent>
        </Popover>

        {field.state.value && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleClear}
            title="Clear color"
            className="shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </FieldWrapper>
  );
};
