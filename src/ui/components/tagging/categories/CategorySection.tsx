import { DynamicIcon } from "lucide-react/dynamic";

import { getLayoutClasses } from "@/ui/components/tagging/utils";

import type { CategorySectionProps } from "../types";
import { CategoryValidationBanner } from "./CategoryValidationBanner";
import { TagCategoryGrid } from "./TagCategoryGrid";

export function CategorySection({
  title,
  categories,
  layout = "one-column",
  item,
  systemId,
  selectedSystemTags,
  toggleSystemTag,
}: CategorySectionProps) {
  if (!categories.length) return null;

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 border-b pb-1">
        {title}
      </h4>
      <div className={getLayoutClasses(layout)}>
        {categories.map((category) => {
          const categoryLayout =
            category.metadata?.display?.layoutType || layout;

          return (
            <div key={category.id} className="space-y-2">
              <CategoryValidationBanner
                category={category}
                selectedTags={selectedSystemTags}
              />

              {categories.length > 1 && (
                <h5 className="text-xs font-medium text-gray-500 dark:text-gray-200 flex flex-row gap-2">
                  {category.metadata.display?.icon && (
                    <DynamicIcon name={category.metadata.display.icon} />
                  )}
                  {category.name}
                </h5>
              )}
              <TagCategoryGrid
                item={item}
                category={category}
                selectedSystemTags={selectedSystemTags}
                systemId={systemId}
                toggleSystemTag={toggleSystemTag}
                layout={categoryLayout}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
