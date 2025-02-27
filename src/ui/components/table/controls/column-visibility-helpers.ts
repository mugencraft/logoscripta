import type { Column, Table } from "@tanstack/react-table";

interface ColumnGroup<TData> {
	name: string;
	id: string;
	columns: Column<TData, unknown>[];
}

export function getTableColumnGroups<TData>(
	table: Table<TData>,
): ColumnGroup<TData>[] {
	// Get all columns directly from the table
	const allColumns = table.getAllColumns();

	// Find the top-level parent columns (group headers)
	const parentColumns = allColumns.filter((column) => {
		const def = column.columnDef;
		return "columns" in def && Array.isArray(def.columns);
	});

	// Map each parent column to a group with its child columns
	return parentColumns.map((parentColumn) => {
		const childColumns = getChildColumns(table, parentColumn.id);

		return {
			name: getColumnName(parentColumn),
			id: parentColumn.id,
			columns: childColumns,
		};
	});
}

function getChildColumns<TData>(
	table: Table<TData>,
	parentId: string,
): Column<TData, unknown>[] {
	// Get all leaf columns
	const leafColumns = table.getAllLeafColumns();

	// Filter leaves that belong to this parent
	return leafColumns.filter((column) => {
		let current = column;
		while (current.parent) {
			// biome-ignore lint/style/noNonNullAssertion: <explanation>
			current = current.parent!;
			if (current.id === parentId) {
				return true;
			}
		}
		return false;
	});
}

function getColumnName<TData>(column: Column<TData, unknown>): string {
	const header = column.columnDef.header;

	if (typeof header === "string") {
		return header;
	}

	return column.id;
}
