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
 * 키워드(별자리)와 책 시트는 독립적이다 — 키워드 선택 중에 별을 클릭해도
 * 별자리 라인은 그대로 두고 BookSheet만 열린다. 별 시트를 닫아도 키워드
 * 활성 상태는 유지된다. 빈 공간 클릭 / ESC만 모든 선택을 한 번에 해제한다.
 */
export type HomeSelection = {
  activeKeyword: string | null;
  focusedBookId: string | null;
};

type UiState = {
  /** "intro" copy stage vs "explore" universe stage on the home page */
  homeMode: "intro" | "explore";
  /** Universe selection — keyword + book are independent */
  selection: HomeSelection;
  /** Is the "add a new star" popup open? */
  registerOpen: boolean;
};

type UiActions = {
  setHomeMode: (m: "intro" | "explore") => void;
  selectKeyword: (keyword: string) => void;
  selectStar: (bookId: string) => void;
  /** Close just the BookSheet — keeps keyword constellation visible */
  closeBookSheet: () => void;
  /** Clear ALL selection (keyword + book) — bg click / ESC */
  clearSelection: () => void;
  openRegister: () => void;
  closeRegister: () => void;
};

export const useUiStore = create<UiState & UiActions>((set) => ({
  homeMode: "intro",
  selection: { activeKeyword: null, focusedBookId: null },
  registerOpen: false,

  setHomeMode: (m) => set({ homeMode: m }),

  // Toggle the keyword (off if same, on otherwise). 책 시트는 건드리지 않는다.
  selectKeyword: (keyword) =>
    set((s) => ({
      selection: {
        ...s.selection,
        activeKeyword:
          s.selection.activeKeyword === keyword ? null : keyword,
      },
    })),

  // 책 시트 열기. 키워드 활성 상태는 그대로 둔다.
  selectStar: (bookId) =>
    set((s) => ({
      selection: { ...s.selection, focusedBookId: bookId },
    })),

  closeBookSheet: () =>
    set((s) => ({
      selection: { ...s.selection, focusedBookId: null },
    })),

  // 전부 해제 — bg 클릭, ESC가 호출
  clearSelection: () =>
    set({ selection: { activeKeyword: null, focusedBookId: null } }),

  openRegister: () => set({ registerOpen: true }),
  closeRegister: () => set({ registerOpen: false }),
}));

/** Convenience selectors so consumers don't need to peek at the union shape. */
export const homeActiveKeyword = (s: { selection: HomeSelection }): string | null =>
  s.selection.activeKeyword;

export const homeFocusedBookId = (s: { selection: HomeSelection }): string | null =>
  s.selection.focusedBookId;
