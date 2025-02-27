import type { List } from "@/interfaces/server-client";
import {
	type RowData,
	type Table,
	getFacetedUniqueValues,
	getMemoOptions,
	memo,
} from "@tanstack/react-table";

export function getFacetedUniqueValuesCustom<TData extends RowData>(): (
	table: Table<TData>,
	columnId: string,
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
) => () => Map<any, number> {
	return (table, columnId) => {
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

					const facetedUniqueValues = new Map<List, number>();

					for (const row of facetedRowModel.flatRows) {
						const lists = row.getValue(columnId) as List[];
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
