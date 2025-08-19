import { cn } from "@/ui/utils";

import { CategorySection } from "../categories/CategorySection";
import type { TagGroupManagerProps } from "../types";
import { GroupHeader } from "./GroupHeader";
import { TagsVisualizer } from "./TagsVisualizer";
import { useCategoryGrouping } from "./useCategoryGrouping";

export const TagGroupManager = (props: TagGroupManagerProps) => {
  const { group } = props;
  const categoryGroups = useCategoryGrouping(props.categories);
  const visualizerConfig = group.metadata?.display?.visualizer;
  const sectionsPerRow = group.metadata?.display?.sectionsPerRow || 1;
  const showSectionTitles = group.metadata?.display?.showSectionTitles ?? true;

  const gridClass =
    sectionsPerRow > 1 ? `grid grid-cols-${sectionsPerRow} gap-4` : "space-y-4";

  return (
    <div className="space-y-4">
      <GroupHeader {...props} />

      <div className={getLayoutClass(visualizerConfig?.position)}>
        {visualizerConfig && (
          <div
            className={cn("flex-shrink-0", visualizerConfig.width || "w-48")}
          >
            <TagsVisualizer
              selectedSystemTags={props.selectedSystemTags}
              config={visualizerConfig}
            />
          </div>
        )}

        <div className="flex-1">
          <div className={gridClass}>
            {categoryGroups.map((group) => (
              <div key={group.name} className="space-y-3">
                {showSectionTitles && categoryGroups.length > 1 && (
                  <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 border-b pb-1">
                    {formatSectionTitle(group.name)}
                  </h4>
                )}

                <CategorySection
                  title="" // empty as it is already in the section title
                  categories={group.categories}
                  layout="horizontal-pills"
                  item={props.item}
                  systemId={props.systemId}
                  selectedSystemTags={props.selectedSystemTags}
                  toggleSystemTag={props.toggleSystemTag}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

function getLayoutClass(
  position?: "left" | "right" | "top" | "bottom",
): string {
  const layouts = {
    left: "flex gap-4",
    right: "flex flex-row-reverse gap-4",
    top: "flex flex-col gap-4",
    bottom: "flex flex-col-reverse gap-4",
  };
  return layouts[position || "left"];
}

function formatSectionTitle(sectionName: string): string {
  return sectionName === "default"
    ? "Other"
    : sectionName
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
}
