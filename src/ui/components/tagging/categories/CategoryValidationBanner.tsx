import { AlertTriangle, Info } from "lucide-react";

import type { Tag } from "@/domain/models/tagging/tag";
import type { TagCategoryWithTags } from "@/domain/models/tagging/types";

import { Alert, AlertDescription } from "@/ui/components/core/alert";

interface CategoryValidationBannerProps {
  category: TagCategoryWithTags;
  selectedTags: Tag[];
}

export function CategoryValidationBanner({
  category,
  selectedTags,
}: CategoryValidationBannerProps) {
  const categorySelectedTags = selectedTags.filter((tag) =>
    category.tagAssociation?.some((assoc) => assoc.tag.id === tag.id),
  );

  // OneOfKind validation
  if (category.metadata?.rules?.oneOfKind && categorySelectedTags.length > 1) {
    return (
      <Alert variant="destructive" className="mb-3">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Only one {category.name.toLowerCase()} can be selected at a time.
          Currently selected:{" "}
          {categorySelectedTags.map((t) => t.name).join(", ")}
        </AlertDescription>
      </Alert>
    );
  }

  // Required validation
  if (category.metadata?.rules?.required && categorySelectedTags.length === 0) {
    return (
      <Alert variant="default" className="mb-3">
        <Info className="h-4 w-4" />
        <AlertDescription>
          This category requires at least one selection.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
