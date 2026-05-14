import { create } from "zustand";

/**
 * UI / interaction store
 * ======================
 * In-memory state that survives in-app navigation but resets on page
 * refresh. Lives separately from the persisted data store so demo-flow
 * UI choices don't leak into localStorage.
 *
 * Selection model
 * ---------------
 * The home universe view has exactly one selection at a time:
 *
 *   { kind: "none" }                  // overview — nothing highlighted
 *   { kind: "keyword"; keyword }      // a keyword hub is focused
 *   { kind: "book"; bookId }          // a star is focused (sheet open)
 *
 * Using a discriminated union (rather than three independent booleans)
 * means transitions cannot desync. Every action that should "deselect"
 * — closing the sheet, clicking empty space, pressing Escape, opening a
 * different hub — funnels through one of three actions below, and the
 * derived visual state (dim other stars, BookSheet open, zoomed viewbox)
 * always agrees.
 */
export type HomeSelection =
  | { kind: "none" }
  | { kind: "keyword"; keyword: string }
  | { kind: "book"; bookId: string };

type UiState = {
  /** "intro" copy stage vs "explore" universe stage on the home page */
  homeMode: "intro" | "explore";
  /** Universe selection — see HomeSelection above */
  selection: HomeSelection;
  /** Is the "add a new star" popup open? */
  registerOpen: boolean;
};

type UiActions = {
  setHomeMode: (m: "intro" | "explore") => void;
  selectKeyword: (keyword: string) => void;
  selectStar: (bookId: string) => void;
  clearSelection: () => void;
  openRegister: () => void;
  closeRegister: () => void;
};

export const useUiStore = create<UiState & UiActions>((set) => ({
  homeMode: "intro",
  selection: { kind: "none" },
  registerOpen: false,

  setHomeMode: (m) => set({ homeMode: m }),

  // Selecting a keyword replaces any prior selection (mutual exclusion)
  selectKeyword: (keyword) =>
    set((s) => {
      // Toggle off if clicking the already-active keyword
      if (s.selection.kind === "keyword" && s.selection.keyword === keyword) {
        return { selection: { kind: "none" } };
      }
      return { selection: { kind: "keyword", keyword } };
    }),

  // Selecting a star replaces any prior selection
  selectStar: (bookId) => set({ selection: { kind: "book", bookId } }),

  // Single "return to overview" action — used by sheet-close, bg-click, ESC
  clearSelection: () => set({ selection: { kind: "none" } }),

  openRegister: () => set({ registerOpen: true }),
  closeRegister: () => set({ registerOpen: false }),
}));

/** Convenience selectors so consumers don't need to switch on kind. */
export const homeActiveKeyword = (s: { selection: HomeSelection }): string | null =>
  s.selection.kind === "keyword" ? s.selection.keyword : null;

export const homeFocusedBookId = (s: { selection: HomeSelection }): string | null =>
  s.selection.kind === "book" ? s.selection.bookId : null;
