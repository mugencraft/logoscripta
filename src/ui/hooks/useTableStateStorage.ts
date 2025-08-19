import type { TableState } from "@tanstack/react-table";
import { useCallback } from "react";

export interface PersistedTableState {
  columnFilters: TableState["columnFilters"];
  columnSizing: TableState["columnSizing"];
  columnVisibility: TableState["columnVisibility"];
  globalFilter: TableState["globalFilter"];
  pagination: TableState["pagination"];
  rowSelection: TableState["rowSelection"];
  sorting: TableState["sorting"];
}

export function useTableStateStorage(
  tableId: string,
  initialState?: Partial<PersistedTableState>,
) {
  // Get state from localStorage on mount
  const loadTableState = useCallback(() => {
    try {
      const savedState = localStorage.getItem(`table-state-${tableId}`);
      if (savedState) {
        return JSON.parse(savedState) as PersistedTableState;
      }
    } catch (error) {
      console.warn(`Error loading table state for ${tableId}:`, error);
    }
    return initialState;
  }, [tableId, initialState]);

  // Save state to localStorage
  const saveTableState = useCallback(
    (state: Partial<PersistedTableState>) => {
      try {
        localStorage.setItem(`table-state-${tableId}`, JSON.stringify(state));
      } catch (error) {
        console.warn(`Error saving table state for ${tableId}:`, error);
      }
    },
    [tableId],
  );

  return {
    loadTableState,
    saveTableState,
  };
}
