import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Book, ThreadTurn, WorldviewCard, StarPosition } from "./types";
import {
  SEED_BOOKS,
  SEED_CONSTELLATIONS,
  SEED_STAR_POSITIONS,
  SEED_WORLDVIEW_CARDS,
  generateStarPositions,
} from "./seed";

/**
 * Universe data store
 * ===================
 * The persisted "what's in my universe" model — books, threads, world-view
 * cards, star positions. Demo-time UI knobs (auto-typing speed, dev nav,
 * etc.) used to live here too; they were removed once the flow was stable
 * because every extra toggle was a source of "why doesn't X work?" bugs.
 * Everything that used to be configurable now runs at the default.
 */

type State = {
  books: Book[];
  threads: ThreadTurn[];
  worldviewCards: WorldviewCard[];
  starPositions: Record<string, StarPosition>;
  currentBookId: string | null;
};

type Actions = {
  addBook: (book: Book) => void;
  setCurrentBook: (id: string | null) => void;
  addThreadTurn: (turn: ThreadTurn) => void;
  addWorldviewCard: (card: WorldviewCard) => void;
  markCardAnswered: (bookId: string, keywordIndex: number) => void;
  addKeywordToBook: (bookId: string, keyword: string) => void;
  resetUniverse: () => void;
  reset: () => void;
};

const initial: State = {
  books: SEED_BOOKS,
  threads: [],
  worldviewCards: SEED_WORLDVIEW_CARDS,
  starPositions: SEED_STAR_POSITIONS,
  currentBookId: null,
};

export const useUniverseStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      ...initial,
      addBook: (book) => {
        if (get().books.some((b) => b.id === book.id)) return;
        const books = [...get().books, book];
        const starPositions = { ...get().starPositions, ...generateStarPositions([book]) };
        set({ books, starPositions });
      },
      setCurrentBook: (id) => set({ currentBookId: id }),
      addThreadTurn: (turn) => set({ threads: [...get().threads, turn] }),
      addWorldviewCard: (card) => {
        if (get().worldviewCards.some((c) => c.id === card.id)) return;
        set({ worldviewCards: [...get().worldviewCards, card] });
      },
      markCardAnswered: (bookId, keywordIndex) => {
        const books = get().books.map((b) => {
          if (b.id !== bookId) return b;
          const idxs = new Set(b.answeredKeywordIndices ?? []);
          idxs.add(keywordIndex);
          const arr = [...idxs].sort((a, c) => a - c);
          return { ...b, answeredKeywordIndices: arr, questionsAnswered: arr.length };
        });
        set({ books });
      },
      addKeywordToBook: (bookId, keyword) => {
        const k = keyword.trim();
        if (!k) return;
        const books = get().books.map((b) => {
          if (b.id !== bookId) return b;
          if (b.keywords.includes(k)) return b;
          return { ...b, keywords: [...b.keywords, k] };
        });
        set({ books });
      },
      resetUniverse: () =>
        set({
          books: SEED_BOOKS,
          threads: [],
          worldviewCards: SEED_WORLDVIEW_CARDS,
          starPositions: SEED_STAR_POSITIONS,
          currentBookId: null,
        }),
      reset: () => set(initial),
    }),
    {
      // Bumped to v5 so old localStorage with demoMode/simSpeed/etc. shape
      // is invalidated and re-seeded on next load.
      name: "book-universe-v5",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.localStorage : (undefined as never),
      ),
      skipHydration: typeof window === "undefined",
    },
  ),
);

export function getConstellations() {
  return SEED_CONSTELLATIONS;
}
