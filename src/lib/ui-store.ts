import { create } from "zustand";

/**
 * In-memory UI state — survives in-app navigation (zustand singleton)
 * but resets on page refresh, which is fine for a demo:
 * - intro copy plays once per browser session
 * - filter selection persists if you bounce to /worldview and back
 * - modal state for + register popup is here too so any component can open it
 */
type UiState = {
  homeMode: "intro" | "explore";
  homeActiveKeyword: string | null;
  registerOpen: boolean;
};

type UiActions = {
  setHomeMode: (m: "intro" | "explore") => void;
  setHomeActiveKeyword: (k: string | null) => void;
  openRegister: () => void;
  closeRegister: () => void;
};

export const useUiStore = create<UiState & UiActions>((set) => ({
  homeMode: "intro",
  homeActiveKeyword: null,
  registerOpen: false,
  setHomeMode: (m) => set({ homeMode: m }),
  setHomeActiveKeyword: (k) => set({ homeActiveKeyword: k }),
  openRegister: () => set({ registerOpen: true }),
  closeRegister: () => set({ registerOpen: false }),
}));
