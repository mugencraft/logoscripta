import { Check, ChevronDown, X } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/ui/components/core/badge";
import { Button } from "@/ui/components/core/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/ui/components/core/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/ui/components/core/popover";
import { cn } from "@/ui/utils";

import { useFieldContext } from "../context";
import type { FormFieldProps } from "../types";
import { FieldWrapper } from "./base";

interface SelectOption {
  value: string;
  label: string;
}

export interface RelationSelectProps extends FormFieldProps {
  options: SelectOption[];
  multiple?: boolean;
}

export const RelationSelectField = ({
  label,
  placeholder,
  required,
  options = [],
  multiple = false,
}: RelationSelectProps) => {
  const field = useFieldContext<string | number | number[]>();
  const [open, setOpen] = useState(false);

  const selectedOptions = useMemo(() => {
    if (multiple) {
      const values = (field.state.value as number[]) || [];
      return options.filter((option) => values.includes(Number(option.value)));
    }
    return options.filter(
      (option) => option.value === field.state.value?.toString(),
    );
  }, [options, field.state.value, multiple]);

  const handleSelect = (value: string) => {
    if (multiple) {
      const current = (field.state.value as number[]) || [];
      const numValue = Number(value);
      const newValue = current.includes(numValue)
        ? current.filter((v) => v !== numValue)
        : [...current, numValue];
      field.handleChange(newValue);
    } else {
      field.handleChange(Number(value));
      setOpen(false);
    }
  };

  const handleRemove = (value: number) => {
    if (multiple) {
      const current = (field.state.value as number[]) || [];
      field.handleChange(current.filter((v) => v !== value));
    }
  };

  const isSelected = (optionValue: string) => {
    if (multiple) {
      return ((field.state.value as number[]) || []).includes(
        Number(optionValue),
      );
    }
    return field.state.value?.toString() === optionValue;
  };

  const getDisplayText = () => {
    if (multiple) {
      return selectedOptions.length > 0
        ? `${selectedOptions.length} selected`
        : placeholder;
    }
    return selectedOptions[0]?.label || placeholder;
  };

  return (
    <div className="space-y-2">
      <FieldWrapper
        label={label}
        required={required}
        fieldName={field.name}
        errors={field.state.meta.errors}
      >
        {/* Selected items for multiple */}
        {multiple && selectedOptions.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {selectedOptions.map((option) => (
              <Badge key={option.value} variant="secondary" className="text-xs">
                {option.label}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-3 w-3 p-0 ml-1"
                  onClick={() => handleRemove(Number(option.value))}
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            ))}
          </div>
        )}

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              aria-expanded={open}
              aria-haspopup="listbox"
              className="w-full justify-between"
            >
              {getDisplayText()}
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder={`Search ${label.toLowerCase()}...`} />
              <CommandList>
                <CommandEmpty>No options found.</CommandEmpty>
                <CommandGroup>
                  {options.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => handleSelect(option.value)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          isSelected(option.value)
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </FieldWrapper>
    </div>
  );
};
