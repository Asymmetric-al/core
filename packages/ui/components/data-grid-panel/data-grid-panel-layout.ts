"use client";

import { createContext, useContext } from "react";

/**
 * How a `DataGridPanel` is drawing its rows right now. The panel can show
 * cards above md too (a chosen card view, or columns that would not fit),
 * so toolbar controls that only act on columns read this rather than the
 * viewport width.
 */
export const DataGridPanelLayoutContext = createContext<{ cards: boolean }>({
  cards: false,
});

/** True while the enclosing panel shows cards instead of the table. */
export function useDataGridPanelShowsCards(): boolean {
  return useContext(DataGridPanelLayoutContext).cards;
}
