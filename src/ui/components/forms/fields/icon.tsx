// https://github.com/lucide-icons/lucide/discussions/1164
import { Search, X } from "lucide-react";
import { DynamicIcon, iconNames } from "lucide-react/dynamic";
import { useCallback, useMemo, useState } from "react";

import { Button } from "@/ui/components/core/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/ui/components/core/dropdown-menu";
import { Input } from "@/ui/components/core/input";
import { cn } from "@/ui/utils";

import { useFieldContext } from "../context";
import type { FormFieldProps } from "../types";
import { FieldWrapper } from "./base";

type IconName = (typeof iconNames)[number];

export default function IconField({
  label,
  placeholder = "Search icons...",
  required,
}: FormFieldProps) {
  const field = useFieldContext<IconName | string>();
  const maxIcons = 50;
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Filter and prepare icons
  const filteredIcons = useMemo(() => {
    const searchLower = searchTerm.toLowerCase().trim();
    const icons = searchLower
      ? iconNames.filter(
          (name) =>
            name.toLowerCase().includes(searchLower) ||
            name.replace(/-/g, " ").includes(searchLower) ||
            name.replace(/-/g, "").includes(searchLower),
        )
      : iconNames;
    return icons.slice(0, maxIcons);
  }, [searchTerm]);

  // Get selected icon display name
  const selectedIconDisplay = useMemo(() => {
    if (
      !field.state.value ||
      !iconNames.includes(field.state.value as IconName)
    )
      return null;
    return (field.state.value as string)
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  }, [field.state.value]);

  const handleSelect = useCallback(
    (iconName: IconName) => {
      field.handleChange(iconName);
      setSearchTerm("");
      setIsOpen(false);
    },
    [field],
  );

  const handleClear = useCallback(() => {
    field.handleChange("");
    setIsOpen(false);
  }, [field]);

  const columns = window.innerWidth < 768 ? 6 : 8;

  return (
    <FieldWrapper
      label={label}
      required={required}
      fieldName={field.name}
      errors={field.state.meta.errors}
    >
      <div className="flex gap-2">
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "flex-1 justify-start text-left font-normal h-10 px-3",
                !field.state.value && "text-muted-foreground",
                "hover:bg-accent hover:text-accent-foreground",
                "focus:ring-2 focus:ring-ring focus:ring-offset-2",
              )}
            >
              <div className="flex items-center gap-3 w-full">
                {field.state.value ? (
                  <>
                    <div className="flex items-center justify-center w-5 h-5 rounded border bg-muted/50">
                      <DynamicIcon
                        name={field.state.value as IconName}
                        size={16}
                        className="text-foreground"
                      />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-medium text-foreground truncate">
                        {selectedIconDisplay}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {field.state.value}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-center w-5 h-5 rounded border bg-muted/30">
                      <Search size={14} className="text-muted-foreground" />
                    </div>
                    <span className="text-muted-foreground">
                      Select an icon
                    </span>
                  </>
                )}
              </div>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-80 p-0"
            align="start"
            sideOffset={4}
          >
            {/* Search Header */}
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={placeholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-9"
                  autoFocus
                />
              </div>
            </div>

            {/* Results Header */}
            <div className="px-3 py-2 text-xs text-muted-foreground border-b bg-muted/30">
              {filteredIcons.length > 0
                ? `Showing ${filteredIcons.length} of ${iconNames.length} icons`
                : "No icons found"}
            </div>

            {/* Icons Grid */}
            <div className="p-3">
              {filteredIcons.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  <Search className="mx-auto h-8 w-8 mb-2 opacity-50" />
                  No icons match your search
                </div>
              ) : (
                <div
                  className="grid gap-1"
                  style={{
                    gridTemplateColumns: `repeat(${columns}, 1fr)`,
                  }}
                >
                  {filteredIcons.map((iconName) => {
                    const isSelected = field.state.value === iconName;
                    return (
                      <Button
                        key={iconName}
                        variant={isSelected ? "default" : "ghost"}
                        size="sm"
                        className={cn(
                          "p-2 h-10 flex items-center justify-center relative group",
                          isSelected && "ring-2 ring-ring ring-offset-1",
                        )}
                        onClick={() => handleSelect(iconName)}
                        title={iconName.replace(/-/g, " ")}
                      >
                        <DynamicIcon
                          name={iconName}
                          size={18}
                          className={cn(
                            isSelected
                              ? "text-primary-foreground"
                              : "text-foreground",
                          )}
                        />
                        {/* Tooltip on hover */}
                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded border shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
                          {iconName.replace(/-/g, " ")}
                        </div>
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Max results warning */}
            {searchTerm && filteredIcons.length === maxIcons && (
              <div className="px-3 py-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/20 border-t">
                Showing first {maxIcons} results. Refine your search for more
                specific results.
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Clear Button */}
        {field.state.value && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleClear}
            title="Clear selection"
            className="shrink-0 h-10 w-10"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </FieldWrapper>
  );
}
