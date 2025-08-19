import type { TagGroupWithCategories } from "@/domain/models/tagging/types";

import { Label } from "@/ui/components/core/label";
import { MultiSelect } from "@/ui/components/extra/multi-select";

interface CategorySelectorProps {
  categories: TagGroupWithCategories["categories"];
  selectedCategoryIds: number[];
  onSelectionChange: (categoryIds: number[]) => void;
}

export function CategorySelector({
  categories,
  selectedCategoryIds,
  onSelectionChange,
}: CategorySelectorProps) {
  const options = categories.map((cat) => ({
    label: `${cat.label || cat.name} (${
      cat.tagAssociation
        ?.map((assoc) => assoc.tag.name)
        // .slice(0, 3) // to limit the number of tags displayed
        .join(", ") || "-"
    })`,
    value: String(cat.id),
  }));

  return (
    <div className="space-y-2">
      <Label>Activation Categories</Label>
      <MultiSelect
        options={options}
        onValueChange={(categoryIds) =>
          onSelectionChange(categoryIds.map(Number))
        }
        defaultValue={selectedCategoryIds.map((id) => String(id))}
      />
    </div>
  );
}
