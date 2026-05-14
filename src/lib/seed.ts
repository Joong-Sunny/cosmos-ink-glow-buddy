import type { Book, Constellation, StarPosition, WorldviewCard } from "./types";
import { CATEGORIES, type Category, coverColorFor } from "./categories";
import { findBookByTitle } from "./book-database";

// Deterministic PRNG (mulberry32) for stable star coordinates
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type SeedSpec = {
  id: string;
  /** CSV title; if undefined the entry below provides explicit fields. */
  title: string;
  /** Used only when the title isn't in books.csv (e.g. 동물농장). */
  fallbackAuthor?: string;
  fallbackCategories?: Category[];
  /** Optional override for cover color. */
  coverColor?: string;
};

/**
 * 데모용 이미-읽은 책 목록.
 * 11개 카테고리가 각각 3~5권씩 커버되도록 고른다.
 * (한 권이 여러 카테고리에 속하므로 총 권수는 약 37권)
 *
 * b01(동물농장)은 사용자가 "방금 등록한 책"으로 시연에 쓰는 책이라
 * books.csv에는 없지만 시드에는 포함시켜 별자리 효과를 만든다.
 */
const SEED_SPECS: SeedSpec[] = [
  // b01 — 데모 진입 책 (방금 등록된 별)
  {
    id: "b01",
    title: "동물농장",
    fallbackAuthor: "George Orwell",
    fallbackCategories: ["사회·정의", "용기·리더십", "철학"],
    coverColor: "#C9543B",
  },
  // 이하 books.csv에서 가져온 이미-읽은 책들
  { id: "b02", title: "긴긴밤" },
  { id: "b03", title: "자전거 도둑" },
  { id: "b04", title: "마당을 나온 암탉" },
  { id: "b05", title: "열두 살에 부자가 된 키라" },
  { id: "b06", title: "어린 왕자" },
  { id: "b07", title: "초정리 편지" },
  { id: "b08", title: "괭이부리말 아이들" },
  { id: "b09", title: "샬롯의 거미줄" },
  { id: "b10", title: "5번 레인" },
  { id: "b11", title: "우리들의 일그러진 영웅" },
  { id: "b12", title: "소나기" },
  { id: "b13", title: "비밀의 화원" },
  { id: "b14", title: "아몬드" },
  { id: "b15", title: "창가의 토토" },
  { id: "b16", title: "삼국유사" },
  { id: "b17", title: "종의 기원 (어린이용)" },
  { id: "b18", title: "목민심서 (어린이용)" },
  { id: "b19", title: "열하일기 (어린이용)" },
  { id: "b20", title: "톨스토이 단편선" },
  { id: "b21", title: "이상한 나라의 앨리스" },
  { id: "b22", title: "처음 읽는 삼국지" },
  { id: "b23", title: "정의란 무엇인가 (어린이)" },
  { id: "b24", title: "연금술사" },
  { id: "b25", title: "침묵의 봄 (어린이용)" },
  { id: "b26", title: "사자와 마녀와 옷장" },
  { id: "b27", title: "난중일기 (어린이용)" },
  { id: "b28", title: "행복한 청소부" },
  { id: "b29", title: "강아지똥" },
  { id: "b30", title: "몽실 언니" },
  { id: "b31", title: "너도 하늘말나리야" },
  { id: "b32", title: "책과 노니는 집" },
  { id: "b33", title: "양반전" },
  { id: "b34", title: "허생전" },
  { id: "b35", title: "독 짓는 늙은이" },
  { id: "b36", title: "수난이대" },
  { id: "b37", title: "후추의 안개 공장" },
  { id: "b38", title: "알로하 나의 엄마들" },
];

function resolveSeed(spec: SeedSpec): {
  id: string;
  title: string;
  author: string;
  keywords: Category[];
  coverColor: string;
} {
  const csv = findBookByTitle(spec.title);
  const author = csv?.author ?? spec.fallbackAuthor ?? "작자 미상";
  const keywords = csv?.categories?.length
    ? csv.categories
    : spec.fallbackCategories ?? [];
  const coverColor = spec.coverColor ?? coverColorFor(keywords);
  return {
    id: spec.id,
    title: spec.title,
    author,
    keywords,
    coverColor,
  };
}

export function generateStarPositions(books: { id: string }[]): Record<string, StarPosition> {
  const rng = mulberry32(20260514);
  const out: Record<string, StarPosition> = {};
  for (const b of books) {
    out[b.id] = {
      // padded to keep stars away from screen edges
      x: 0.08 + rng() * 0.84,
      y: 0.12 + rng() * 0.76,
    };
  }
  return out;
}

const NOW = new Date("2026-05-14T10:00:00.000Z").getTime();

/**
 * Distribution per spec:
 * - ~1/2 of books fully complete (all keywords answered)
 * - ~1/3 partial (1 of N answered)
 * - ~1/6 just-registered (0 answered)
 */
function seedCompletion(idx: number, total: number): number[] {
  const m = idx % 6;
  if (m < 3) return Array.from({ length: total }, (_, i) => i); // full
  if (m < 5) return [0]; // partial
  return []; // dim
}

const RESOLVED = SEED_SPECS.map(resolveSeed);

export const SEED_BOOKS: Book[] = RESOLVED.map((b, i) => {
  const answered = seedCompletion(i, b.keywords.length);
  return {
    id: b.id,
    title: b.title,
    author: b.author,
    coverColor: b.coverColor,
    keywords: b.keywords,
    starState: "lit" as const,
    answeredKeywordIndices: answered,
    questionsAnswered: answered.length,
    registeredAt: new Date(NOW - (RESOLVED.length - i) * 86400000).toISOString(),
  };
});

export const SEED_STAR_POSITIONS = generateStarPositions(SEED_BOOKS);

export const SEED_KEYWORDS = CATEGORIES;

export const SEED_CONSTELLATIONS: Constellation[] = CATEGORIES.map((keyword) => {
  const matches = SEED_BOOKS.filter((b) => b.keywords.includes(keyword));
  return {
    keyword,
    bookIds: matches.map((b) => b.id),
    centerBookId: matches[matches.length - 1]?.id ?? matches[0]?.id ?? "",
  };
});

/** "사회·정의" 카테고리의 대표 4권. */
const JUSTICE_BOOK_IDS = SEED_BOOKS.filter((b) =>
  b.keywords.includes("사회·정의"),
)
  .slice(0, 4)
  .map((b) => b.id);

/** "철학" 카테고리의 대표 4권. */
const PHILOSOPHY_BOOK_IDS = SEED_BOOKS.filter((b) => b.keywords.includes("철학"))
  .slice(0, 4)
  .map((b) => b.id);

export const SEED_WORLDVIEW_CARDS: WorldviewCard[] = [
  {
    id: "wc-i",
    romanNumeral: "I",
    nameKr: "정의를 묻는 자",
    nameEn: "THE SEEKER",
    arcanumType: "seeker",
    quote: "정의는 다수의 편이 아니라 진실의 편이다.",
    booksCount: JUSTICE_BOOK_IDS.length,
    starsCount: JUSTICE_BOOK_IDS.length * 2,
    issuedAt: new Date(NOW - 7 * 86400000).toISOString(),
    relatedKeyword: "사회·정의",
    relatedBookIds: JUSTICE_BOOK_IDS,
  },
  {
    id: "wc-ii",
    romanNumeral: "II",
    nameKr: "자라난 의심",
    nameEn: "THE DOUBT",
    arcanumType: "doubt",
    quote: "당연하다고 믿었던 것 뒤에는 늘 묻지 않은 질문이 있다.",
    booksCount: PHILOSOPHY_BOOK_IDS.length,
    starsCount: PHILOSOPHY_BOOK_IDS.length * 2 + 2,
    issuedAt: new Date(NOW - 2 * 86400000).toISOString(),
    relatedKeyword: "철학",
    relatedBookIds: PHILOSOPHY_BOOK_IDS,
  },
];
