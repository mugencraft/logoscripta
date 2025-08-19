import { AlertTriangle } from "lucide-react";
import { useMemo } from "react";

import { Alert, AlertDescription } from "@/ui/components/core/alert";

import type { AvailableTag } from "./types";

interface ValidationErrorsProps {
  selectedTags: string[];
  activationTags: AvailableTag[];
}

export function ValidationErrors({
  selectedTags,
  activationTags,
}: ValidationErrorsProps) {
  const errors = useMemo(() => {
    const errors: string[] = [];

    // Check oneOfKind violations
    for (const tag of activationTags) {
      if (selectedTags.includes(tag.name)) {
        const selectedInCategory = activationTags.filter(
          (t) =>
            tag.categoryId === t.categoryId && selectedTags.includes(t.name),
        );

        if (selectedInCategory.length > 1) {
          errors.push(
            `Category "${tag.categoryName}" allows only one selection, but ${selectedInCategory.length} are selected: ${selectedInCategory.join(", ")}`,
          );
        }
      }
    }

    return errors;
  }, [selectedTags, activationTags]);

  const errorMessages = useMemo(() => {
    return errors.map((error) => {
      return (
        <span key={error} className="text-destructive text-sm">
          {error}
        </span>
      );
    });
  }, [errors]);

  if (!errors?.length) return null;

  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <div className="space-y-1">{errorMessages}</div>
      </AlertDescription>
    </Alert>
  );
}
