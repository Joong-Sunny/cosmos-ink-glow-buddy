import type {
  Book,
  QuestionLevel,
  QuestionCategory,
} from "./types";

/**
 * Question bank
 * =============
 * Keyed by **book title** (not book id) so the same questions apply
 * whether the book came in as a hand-crafted seed entry or as a CSV
 * import via the register modal (different ids, same title).
 *
 * Demo USP: when the user answers an initial question, the follow-up
 * questions *name specific seed books they've already answered* — that's
 * what makes the new star feel like it's connecting to existing stars
 * in their universe.
 *
 * Layout:
 *   QUESTION_BANK[title][keyword] = {
 *     initial:    one initial question
 *     followUps:  ordered list of follow-up questions
 *     simulated:  auto-typed answers (index 0 = initial, 1 = f1, 2 = f2)
 *   }
 */

export type CardQuestion = {
  id: string;
  bookId: string;
  keyword: string;
  keywordIndex: number;
  level: QuestionLevel;
  text: string;
  category?: QuestionCategory;
};

export type FollowUp = {
  id: string;
  level: QuestionLevel;
  text: string;
  category?: QuestionCategory;
};

type QuestionData = {
  level: QuestionLevel;
  text: string;
  category?: QuestionCategory;
};

type KeywordBundle = {
  initial: QuestionData;
  followUps: QuestionData[];
  /** index 0 = initial, 1 = f1, 2 = f2, ... — used by the answer page's
   *  auto-typing demo. Indices beyond the array length = no auto-typing. */
  simulated: string[];
};

/** The demo book. Hand-crafted to thread back into the seed universe. */
const DONGMUL_NONGJANG: Record<string, KeywordBundle> = {
  "권력": {
    initial: {
      level: "L3",
      text: "권력은 어느 장면에서 처음 변하기 시작했어?",
      category: "inference",
    },
    followUps: [
      {
        level: "L4",
        text: "예전에 답한 「우리들의 일그러진 영웅」의 엄석대를 떠올려봐. 나폴레옹과 엄석대는 권력을 잡은 방식이 닮았을까, 달랐을까?",
        category: "critical",
      },
      {
        level: "L5",
        text: "「1984」의 빅 브라더까지 떠올려보면, 세 권력자가 공통으로 '먼저 한 일'이 있어. 우리 일상의 작은 권력도 같은 방식으로 시작될까?",
        category: "meta",
      },
    ],
    simulated: [
      "처음엔 같이 정한 규칙이었는데, 나폴레옹이 우유랑 사과를 따로 챙기는 장면이 결정적이었던 것 같다. 모두가 '리더는 더 가져도 돼'라고 침묵하는 순간.",
      "엄석대는 처음부터 강압이었고, 나폴레옹은 처음엔 동등했다가 점점 위로 갔다. 시작은 다른데 끝은 비슷하다. 둘 다 주변이 침묵하면서 굳어졌으니까.",
      "빅 브라더는 보이지 않고, 엄석대는 너무 잘 보였고, 나폴레옹은 처음엔 친구였어. 공통으로 한 일은 '규칙을 자기 편한 대로 다시 쓴 것'. 우리 반에서도 반장이 그러면 다들 그냥 받아들인다. 평등은 한 번 만든다고 끝이 아니라, 매일 지켜내야 하는 약속이다.",
    ],
  },
  "철학": {
    initial: {
      level: "L4",
      text: "이 동물 우화가 진짜로 의심하라고 가리키는 '당연한 것'은 뭘까?",
      category: "critical",
    },
    followUps: [
      {
        level: "L4",
        text: "예전에 답한 「어린 왕자」에서 '어른들은 숫자만 좋아한다'고 했지. 동물농장의 돼지들도 결국 비슷한 어른이 돼. 두 책이 말하는 '잃어버린 것'은 같은 것일까?",
        category: "critical",
      },
      {
        level: "L5",
        text: "「정의란 무엇인가」까지 셋을 함께 놓고 보면, 세 책이 공통으로 '의심해야 한다'고 말하는 건 뭐야? 너는 그것을 일상에서 의심해본 적 있어?",
        category: "meta",
      },
    ],
    simulated: [
      "처음에 다 같이 정한 약속이 점점 '원래 그랬던 것'처럼 바뀌어 가는 게 무서웠다. 당연하다고 받아들이는 순간 이미 바뀌어 있다.",
      "어린 왕자는 숫자에 빠진 어른들이 슬펐고, 동물농장은 계산하는 동물들이 무서웠다. 둘 다 '천천히 보고, 묻는 마음'을 잃은 거 같다.",
      "세 책 다 '자기가 맞다고 너무 확신하는 것'을 의심하라고 한다. 나도 친구랑 다툴 때 내가 맞다고만 우긴 적이 많은데, 한 번 더 묻는 연습을 해야겠다.",
    ],
  },
};

const QUESTION_BANK: Record<string, Record<string, KeywordBundle>> = {
  "동물농장": DONGMUL_NONGJANG,
};

// ─── Public helpers ──────────────────────────────────────────────────

function fallbackFor(keyword: string): QuestionData {
  return {
    level: "L3",
    text: `이 책에서 '${keyword}'은(는) 어떻게 드러나니?`,
    category: "inference",
  };
}

/** Build the initial question cards for a book based on its keywords. */
export function getCardsForBook(book: Book | undefined): CardQuestion[] {
  if (!book) return [];
  const byKeyword = QUESTION_BANK[book.title];
  return book.keywords.map((keyword, keywordIndex) => {
    const data = byKeyword?.[keyword]?.initial ?? fallbackFor(keyword);
    return {
      id: `${book.id}:k${keywordIndex}`,
      bookId: book.id,
      keyword,
      keywordIndex,
      ...data,
    };
  });
}

export function findCard(
  book: Book | undefined,
  cardId: string,
): CardQuestion | undefined {
  return getCardsForBook(book).find((c) => c.id === cardId);
}

/**
 * Get follow-up questions for a (book, keywordIndex). Returned ids match
 * the convention `${bookId}:k${idx}:f${n}` so they're stable across the
 * answer page's transcript chain.
 */
export function getFollowUpsForCard(
  book: Book | undefined,
  keywordIndex: number,
): FollowUp[] {
  if (!book) return [];
  const keyword = book.keywords[keywordIndex];
  if (!keyword) return [];
  const bundle = QUESTION_BANK[book.title]?.[keyword];
  if (!bundle) return [];
  return bundle.followUps.map((q, i) => ({
    id: `${book.id}:k${keywordIndex}:f${i + 1}`,
    level: q.level,
    text: q.text,
    category: q.category,
  }));
}

/**
 * Look up the auto-typed simulated answer for the current active question.
 * Returns undefined when the book has no demo content (=> no auto-typing).
 *
 * Resolution:
 *   - turnIndex 0 = initial card → simulated[0]
 *   - turnIndex N (f1, f2, ...) parsed from `:fN` suffix on the id
 */
export function getSimulatedAnswer(
  book: Book | undefined,
  q: Pick<CardQuestion, "id" | "keywordIndex"> | undefined,
): string | undefined {
  if (!book || !q) return undefined;
  const keyword = book.keywords[q.keywordIndex];
  if (!keyword) return undefined;
  const bundle = QUESTION_BANK[book.title]?.[keyword];
  if (!bundle) return undefined;
  const m = /:f(\d+)$/.exec(q.id);
  const turnIdx = m ? Number(m[1]) : 0;
  return bundle.simulated[turnIdx];
}

export const LEVEL_META: Record<
  QuestionLevel,
  { color: string; bg: string; label: string }
> = {
  L1: { color: "var(--level-l1)", bg: "rgba(118,195,155,0.15)", label: "L1" },
  L2: { color: "var(--level-l2)", bg: "rgba(143,184,255,0.15)", label: "L2" },
  L3: { color: "var(--level-l3)", bg: "rgba(197,163,255,0.15)", label: "L3" },
  L4: { color: "var(--level-l4)", bg: "rgba(255,163,122,0.15)", label: "L4" },
  L5: { color: "var(--level-l5)", bg: "rgba(232,181,71,0.15)", label: "L5" },
};
