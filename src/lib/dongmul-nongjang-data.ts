import type {
  Book,
  QuestionLevel,
  QuestionCategory,
} from "./types";

export type CardQuestion = {
  /** Stable id like "b01:k0" — also serves as URL param */
  id: string;
  bookId: string;
  keyword: string;
  /** index of the keyword inside book.keywords */
  keywordIndex: number;
  level: QuestionLevel;
  text: string;
  category?: QuestionCategory;
};

export const DONGMUL_BOOK_ID = "b01";

type Override = Omit<CardQuestion, "id" | "bookId" | "keyword" | "keywordIndex">;

// Curated question per (bookId, keyword). Falls back to a generic prompt
// for any (book, keyword) not listed here.
const BOOK_OVERRIDES: Record<string, Record<string, Override>> = {
  b01: {
    "사회·정의": {
      level: "L3",
      text: "나폴레옹은 왜 다른 돼지들과 다르게 행동했을까?",
      category: "inference",
    },
    "용기·리더십": {
      level: "L2",
      text: "동물들은 왜 처음에 반란에 찬성했어?",
      category: "plot",
    },
    "철학": {
      level: "L4",
      text: "작가는 정말 혁명에 반대했을까?",
      category: "critical",
    },
  },
  b1984: {
    "사회·정의": {
      level: "L3",
      text: "'전쟁은 평화다'라는 구호는 어떤 의미일까?",
      category: "inference",
    },
    "철학": {
      level: "L4",
      text: "작가는 이 소설로 어떤 경고를 하고 싶었을까?",
      category: "critical",
    },
  },
  bgiver: {
    "사회·정의": {
      level: "L3",
      text: "마을 사람들은 왜 고통과 기쁨을 모두 잃은 것에 만족했을까?",
      category: "inference",
    },
    "철학": {
      level: "L4",
      text: "고통이 없는 세상은 정말 행복한 세상일까?",
      category: "critical",
    },
    "성장": {
      level: "L5",
      text: "우리 사회가 '편안함'을 위해 포기한 것이 있다면?",
      category: "meta",
    },
  },
  b11: {
    "사회·정의": {
      level: "L3",
      text: "한병태는 왜 결국 엄석대에게 굴복했을까?",
      category: "inference",
    },
    "철학": {
      level: "L4",
      text: "반 아이들은 알면서도 침묵했을까, 정말 몰랐을까?",
      category: "critical",
    },
  },
};

function fallbackFor(keyword: string): Override {
  return {
    level: "L3",
    text: `이 책에서 '${keyword}'은(는) 어떻게 드러나니?`,
    category: "inference",
  };
}

/** Build the 2~3 cards for a book based on its keywords. */
export function getCardsForBook(book: Book | undefined): CardQuestion[] {
  if (!book) return [];
  const ov = BOOK_OVERRIDES[book.id];
  return book.keywords.map((keyword, keywordIndex) => {
    const data = ov?.[keyword] ?? fallbackFor(keyword);
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
 * Follow-up chain keyed by initial card id.
 * Q1(picked) → Q2(L4 심화) → Q3(L5 메타) → star-born.
 */
export const followUpQuestions: Record<
  string,
  Array<Omit<CardQuestion, "bookId" | "keyword" | "keywordIndex">>
> = {
  "b01:k0": [
    {
      id: "b01:k0:f1",
      level: "L4",
      text: '"권력이 사람을 바꾼다"고 했는데, 권력이 없었다면 나폴레옹은 다르게 살았을까?',
    },
    {
      id: "b01:k0:f2",
      level: "L5",
      text: '이 이야기를 우리 학교나 친구 관계에 적용한다면, 비슷한 "나폴레옹"이 있을까?',
    },
  ],
  "b01:k1": [
    {
      id: "b01:k1:f1",
      level: "L4",
      text: "처음의 약속이 깨질 때, 동물들은 왜 침묵했을까?",
    },
    {
      id: "b01:k1:f2",
      level: "L5",
      text: "네가 본 '말이 바뀌는 순간'은 언제였어?",
    },
  ],
  "b01:k2": [
    {
      id: "b01:k2:f1",
      level: "L4",
      text: "선과 악이 처음부터 정해져 있는 게 아니라면, 무엇이 그것을 만들까?",
    },
    {
      id: "b01:k2:f2",
      level: "L5",
      text: "오늘 너의 하루 중 '회색지대'는 어디에 있었어?",
    },
  ],
};

/**
 * Demo simulated answers, keyed by question id (initial or follow-up).
 * The answer page auto-types these into the compose box for the demo
 * (see /answer/$bookId/$questionId).
 */
export const SIMULATED_ANSWERS: Record<string, string> = {
  "b01:k0":
    "나폴레옹은 처음엔 다른 돼지들과 똑같았는데, 점점 자기만 우유랑 사과를 더 먹기 시작했다. 권력을 가지면 사람이 변하는 것 같다. 처음의 마음을 잊는 게 아니라, 잊고 싶어하는 거 같기도.",
  "b01:k0:f1":
    "권력 자체가 사람을 만드는 거 같다. 누가 그 자리에 있어도 비슷했을 듯. 나폴레옹이 특별히 나쁜 게 아니라, 그 자리가 특별히 무서운 거.",
  "b01:k0:f2":
    "우리 반에도 비슷한 일이 있다. 처음엔 다 같이 정한 규칙이었는데, 누가 반장이 되고 나면 규칙이 슬쩍슬쩍 바뀐다. 그리고 아무도 그게 바뀌었다고 말 안 한다. 평등은 한 번 만든다고 끝이 아니라, 매일 지켜내야 하는 약속이다.",
};

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
