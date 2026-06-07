"use client";

import { create } from "zustand";

interface FilterState {
  tier: string[];
  tags: string[];
  minTrust: number;
  maxTrust: number;
  searchQuery: string;
  sortBy: "trust_desc" | "trust_asc" | "newest" | "popular";
}

interface UIState {
  // Marketplace filters
  filters: FilterState;
  // Sidebar collapsed state
  sidebarCollapsed: boolean;
  // Mobile sidebar open
  mobileSidebarOpen: boolean;
  // Active connect panel tab
  connectPanelTab: "open" | "api" | "mcp" | "cli" | "a2a";
}

interface UIActions {
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setMobileSidebarOpen: (open: boolean) => void;
  setConnectPanelTab: (tab: UIState["connectPanelTab"]) => void;
}

const DEFAULT_FILTERS: FilterState = {
  tier: [],
  tags: [],
  minTrust: 0,
  maxTrust: 100,
  searchQuery: "",
  sortBy: "trust_desc",
};

/**
 * Zustand store for ephemeral UI state. Contains marketplace filters,
 * sidebar collapse state, and connect panel tab selection.
 *
 * Server data (agent listings, usage, billing) lives in TanStack Query.
 */
export const useUIStore = create<UIState & UIActions>((set) => ({
  filters: DEFAULT_FILTERS,
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  connectPanelTab: "open",

  setFilters(filters) {
    set((state) => ({ filters: { ...state.filters, ...filters } }));
  },

  resetFilters() {
    set({ filters: DEFAULT_FILTERS });
  },

  setSidebarCollapsed(collapsed) {
    set({ sidebarCollapsed: collapsed });
  },

  setMobileSidebarOpen(open) {
    set({ mobileSidebarOpen: open });
  },

  setConnectPanelTab(tab) {
    set({ connectPanelTab: tab });
  },
}));
