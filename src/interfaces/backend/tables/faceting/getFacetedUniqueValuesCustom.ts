import {
  getFacetedUniqueValues,
  getMemoOptions,
  memo,
  type RowData,
  type Table,
} from "@tanstack/react-table";

import type { ImportPreviewItem } from "@/domain/models/content/types";
import type { RepositoryList } from "@/domain/models/github/repository-list";

const STORAGE_KEY = "tag-analysis-selected-tags";

// Helper to get selected analysis tags from localStorage
function getAnalysisSelectedTags(): Set<string> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const selectedTags = Object.entries(parsed)
        .filter(([_, isSelected]) => isSelected)
        .map(([tag]) => tag);
      return new Set(selectedTags);
    }
  } catch (error) {
    console.warn("Failed to load selected tags:", error);
  }
  return new Set();
}

export function getFacetedUniqueValuesCustom<TData extends RowData>(): (
  table: Table<TData>,
  columnId: string,
) => () => Map<unknown, number> {
  return (table, columnId) => {
    if (columnId === "tags") {
      return memo(
        () => [table.getColumn(columnId)?.getFacetedRowModel()],
        (facetedRowModel) => {
          if (!facetedRowModel) return new Map();

          const facetedUniqueValues = new Map<string, number>();
          const analysisSelectedTags = getAnalysisSelectedTags();
          const useAnalysisFilter = analysisSelectedTags.size > 0;

          for (const row of facetedRowModel.flatRows) {
            const rowData = row.original as ImportPreviewItem;
            const tags = rowData.tags;
            if (!tags) continue;

            for (const tag of tags) {
              // If we have analysis selection, only include those tags
              if (useAnalysisFilter && !analysisSelectedTags.has(tag)) {
                continue;
              }

              facetedUniqueValues.set(
                tag,
                (facetedUniqueValues.get(tag) ?? 0) + 1,
              );
            }
          }

          return facetedUniqueValues;
        },
        getMemoOptions(
          table.options,
          "debugTable",
          `getFacetedUniqueValues_${columnId}`,
        ),
      );
    }

    if (columnId === "topics") {
      return memo(
        () => [table.getColumn(columnId)?.getFacetedRowModel()],
        (facetedRowModel) => {
          if (!facetedRowModel) return new Map();

          const facetedUniqueValues = new Map<string, number>();

          for (const row of facetedRowModel.flatRows) {
            const topics = row.getValue(columnId) as string[];
            if (!topics) continue;

            for (const topic of topics) {
              facetedUniqueValues.set(
                topic,
                (facetedUniqueValues.get(topic) ?? 0) + 1,
              );
            }
          }

          return facetedUniqueValues;
        },
        getMemoOptions(
          table.options,
          "debugTable",
          `getFacetedUniqueValues_${columnId}`,
        ),
      );
    }
    if (columnId === "listIds") {
      return memo(
        () => [table.getColumn(columnId)?.getFacetedRowModel()],
        (facetedRowModel) => {
          if (!facetedRowModel) return new Map();

          const facetedUniqueValues = new Map<RepositoryList, number>();

          for (const row of facetedRowModel.flatRows) {
            const lists = row.getValue(columnId) as RepositoryList[];
            if (!lists) continue;

            for (const list of lists) {
              // Find existing entry by ID
              const existingEntry = Array.from(
                facetedUniqueValues.entries(),
              ).find(([key]) => key.id === list.id);

              if (existingEntry) {
                // Update count for existing list
                facetedUniqueValues.set(existingEntry[0], existingEntry[1] + 1);
              } else {
                // Add new list entry
                facetedUniqueValues.set(list, 1);
              }
            }
          }

          return facetedUniqueValues;
        },
        getMemoOptions(
          table.options,
          "debugTable",
          `getFacetedUniqueValues_${columnId}`,
        ),
      );
    }
    if (columnId === "modes") {
      return memo(
        () => [table.getColumn(columnId)?.getFacetedRowModel()],
        (facetedRowModel) => {
          if (!facetedRowModel) return new Map();

          const facetedUniqueValues = new Map<string, number>();

          for (const row of facetedRowModel.flatRows) {
            const modes = row.getValue(columnId) as string[];
            if (!modes) continue;

            for (const mode of modes) {
              facetedUniqueValues.set(
                mode,
                (facetedUniqueValues.get(mode) ?? 0) + 1,
              );
            }
          }

          return facetedUniqueValues;
        },
        getMemoOptions(
          table.options,
          "debugTable",
          `getFacetedUniqueValues_${columnId}`,
        ),
      );
    }

    // Use original implementation for all other columns
    return getFacetedUniqueValues<TData>()(table, columnId);
  };
}
