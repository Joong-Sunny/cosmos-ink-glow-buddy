import { create } from "zustand";
import type { Book, ThreadTurn, WorldviewCard, StarPosition } from "./types";
import {
  SEED_BOOKS,
  SEED_CONSTELLATIONS,
  SEED_STAR_POSITIONS,
  SEED_THREADS,
  SEED_WORLDVIEW_CARDS,
  generateStarPositions,
} from "./seed";

/**
 * Universe data store
 * ===================
 * In-memory only — no persist wrapper. Every page load reboots from
 * `SEED_BOOKS / SEED_THREADS / SEED_WORLDVIEW_CARDS`, so anyone visiting
 * the demo URL gets the same starting universe regardless of prior visits.
 *
 * If you ever need to keep state across reloads, wrap `create` in
 * `persist(...)` again — but the demo's deliberate decision is to NOT.
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
  threads: SEED_THREADS,
  worldviewCards: SEED_WORLDVIEW_CARDS,
  starPositions: SEED_STAR_POSITIONS,
  currentBookId: null,
};

export const useUniverseStore = create<State & Actions>()((set, get) => ({
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
  resetUniverse: () => set(initial),
  reset: () => set(initial),
}));

export function getConstellations() {
  return SEED_CONSTELLATIONS;
}
