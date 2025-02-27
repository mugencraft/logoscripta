import { getFacetedUniqueValuesCustom } from "@/interfaces/backend/config/faceting/getFacetedUniqueValuesCustom";
import { dateRangeFilter } from "@/interfaces/backend/config/filters/date-range";
import { listIdsFilter } from "@/interfaces/backend/config/filters/list-ids";
import {
	type PersistedTableState,
	useTableStateStorage,
} from "@/interfaces/backend/hooks/useTableStateStorage";
import type { TableConfiguration } from "@/ui/components/table/types";
import {
	type OnChangeFn,
	type Table,
	getCoreRowModel,
	getFacetedMinMaxValues,
	getFacetedRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import _ from "lodash";
import { useEffect, useMemo, useRef, useState } from "react";

interface UseDataTableResult<TData, T = string | number> {
	table: Table<TData>;
	config: TableConfiguration<TData, T>;
}

interface UseDataTableOptions<TData, T = string | number> {
	data: TData[];
	tableId: string;
	config: Partial<TableConfiguration<TData, T>>;
	baseConfig?: TableConfiguration<TData>;
}

export function useDataTable<TData, T = string | number>({
	data,
	tableId,
	config: partialConfig,
	baseConfig,
}: UseDataTableOptions<TData, T>): UseDataTableResult<TData, T> {
	// Merge configurations using useMemo to prevent unnecessary recalculations
	const config = useMemo(
		() =>
			baseConfig
				? _.merge({}, baseConfig, partialConfig)
				: (partialConfig as TableConfiguration<TData, T>),
		[baseConfig, partialConfig],
	);

	const { loadTableState, saveTableState } = useTableStateStorage(tableId);

	// Create state with default values
	const [tableState, setTableState] = useState<PersistedTableState>(() => {
		const savedState = loadTableState();
		return {
			columnFilters: [],
			columnSizing: {},
			columnVisibility: {},
			globalFilter: "",
			pagination: { pageIndex: 0, pageSize: 20 },
			rowSelection: {},
			sorting: [],
			...savedState, // Overwrite defaults with any saved state
		};
	});

	// Track previous tableId to detect changes
	const prevTableIdRef = useRef(tableId);

	// Load state when tableId changes
	useEffect(() => {
		if (prevTableIdRef.current !== tableId) {
			const newSavedState = loadTableState();
			if (newSavedState) {
				setTableState((currentState) => ({
					...currentState,
					...newSavedState,
				}));
			}
			prevTableIdRef.current = tableId;
		}
	}, [tableId, loadTableState]);

	// Save state when it changes
	useEffect(() => {
		saveTableState(tableState);
	}, [tableState, saveTableState]);

	// Generic state updater factory that handles both value and function updaters
	const createStateUpdater = <K extends keyof PersistedTableState>(
		key: K,
	): OnChangeFn<PersistedTableState[K]> => {
		return (updaterOrValue) => {
			setTableState((prev) => ({
				...prev,
				[key]:
					typeof updaterOrValue === "function"
						? (
								updaterOrValue as (
									prev: PersistedTableState[K],
								) => PersistedTableState[K]
							)(prev[key])
						: updaterOrValue,
			}));
		};
	};

	const features = config.features || {};

	const shouldDebug = false;

	// Initialize table with proper filtering configuration
	const table = useReactTable({
		data,
		columns: config.columns,
		filterFns: {
			dateRangeFilter,
			listIdsFilter,
		},
		getCoreRowModel: getCoreRowModel(),

		// Faceting
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValuesCustom(),
		getFacetedMinMaxValues: getFacetedMinMaxValues(),

		// Filtering
		enableColumnFilters: features.enableColumnFilters,
		getFilteredRowModel: getFilteredRowModel(),

		// Resizing
		columnResizeMode: "onChange",
		enableColumnResizing: features.enableColumnResizing,

		// Filtering
		enableGlobalFilter: features.enableGlobalFilter,

		// Pagination
		getPaginationRowModel: getPaginationRowModel(),

		// Selection
		enableRowSelection: features.enableRowSelection,

		// Sorting
		enableSorting: features.enableSorting,
		enableMultiSort: features.enableMultiSort,
		getSortedRowModel: getSortedRowModel(),

		// State management
		state: tableState,
		onColumnFiltersChange: createStateUpdater("columnFilters"),
		onColumnSizingChange: createStateUpdater("columnSizing"),
		onColumnVisibilityChange: createStateUpdater("columnVisibility"),
		onGlobalFilterChange: createStateUpdater("globalFilter"),
		onPaginationChange: createStateUpdater("pagination"),
		onRowSelectionChange: createStateUpdater("rowSelection"),
		onSortingChange: createStateUpdater("sorting"),

		debugTable: shouldDebug,
		debugHeaders: shouldDebug,
		debugColumns: shouldDebug,
	});

	return {
		table,
		config,
	};
}
