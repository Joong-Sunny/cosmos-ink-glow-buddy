import type { Book, Constellation, StarPosition, WorldviewCard } from "./types";

// Deterministic PRNG (mulberry32) for stable star coordinates
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type SeedBook = Omit<Book, "id" | "registeredAt" | "starState"> & {
  id: string;
  starState?: Book["starState"];
};

const RAW_BOOKS: SeedBook[] = [
  { id: "b01", title: "동물농장", author: "George Orwell", coverColor: "#C9543B", keywords: ["권력", "배신", "선과 악"] },
  { id: "b02", title: "아몬드", author: "손원평", coverColor: "#6FA686", keywords: ["공감", "정체성"] },
  { id: "b03", title: "가시고기", author: "조창인", coverColor: "#5A7AAB", keywords: ["사랑", "희생"] },
  { id: "b04", title: "우리들의 일그러진 영웅", author: "이문열", coverColor: "#8A4D3B", keywords: ["권력", "비겁"] },
  { id: "b05", title: "기억 전달자", author: "로이스 라우리", coverColor: "#3D5C7A", keywords: ["자유", "통제"] },
  { id: "b06", title: "죽이고 싶은 아이", author: "이꽃님", coverColor: "#7A3D5C", keywords: ["진실", "우정"] },
  { id: "b07", title: "데미안", author: "헤르만 헤세", coverColor: "#4A4A6E", keywords: ["정체성", "이중성"] },
  { id: "b08", title: "앵무새 죽이기", author: "하퍼 리", coverColor: "#8A6C3B", keywords: ["정의", "편견"] },
  { id: "b09", title: "위저드 베이커리", author: "구병모", coverColor: "#6E4A5C", keywords: ["선택", "책임"] },
  { id: "b10", title: "스노볼", author: "박소영", coverColor: "#3B6E7A", keywords: ["권력", "미디어"] },
  { id: "b11", title: "완득이", author: "김려령", coverColor: "#6B8E4E", keywords: ["정체성", "공감"] },
  { id: "b12", title: "두근두근 내 인생", author: "김애란", coverColor: "#A36B4A", keywords: ["사랑", "정체성"] },
  { id: "b13", title: "체리새우: 비밀글입니다", author: "황영미", coverColor: "#9A4763", keywords: ["우정", "정체성"] },
  { id: "b14", title: "유진과 유진", author: "이금이", coverColor: "#4E6E8A", keywords: ["기억", "공감"] },
  { id: "b15", title: "1984", author: "George Orwell", coverColor: "#2E2E4A", keywords: ["권력", "자유"] },
  { id: "b16", title: "파리대왕", author: "William Golding", coverColor: "#8A5A2E", keywords: ["선과 악", "권력"] },
  { id: "b17", title: "호밀밭의 파수꾼", author: "J.D. Salinger", coverColor: "#A33B3B", keywords: ["정체성", "고독"] },
  { id: "b18", title: "어린 왕자", author: "Saint-Exupéry", coverColor: "#D4A14A", keywords: ["사랑", "공감"] },
  { id: "b19", title: "수레바퀴 아래서", author: "헤르만 헤세", coverColor: "#5C4A3B", keywords: ["자유", "통제"] },
  { id: "b20", title: "젊은 베르테르의 슬픔", author: "Goethe", coverColor: "#7A3B4A", keywords: ["사랑", "정체성"] },
  { id: "b21", title: "변신", author: "Franz Kafka", coverColor: "#3B3B3B", keywords: ["정체성", "고독"] },
  { id: "b22", title: "이방인", author: "Albert Camus", coverColor: "#6B6B6B", keywords: ["정의", "정체성"] },
  { id: "b23", title: "노인과 바다", author: "Hemingway", coverColor: "#4A6B7A", keywords: ["희생", "자유"] },
  { id: "b24", title: "모모", author: "Michael Ende", coverColor: "#8A6E3B", keywords: ["공감", "자유"] },
  { id: "b25", title: "사피엔스", author: "유발 하라리", coverColor: "#A38A3B", keywords: ["정체성", "권력"] },
  { id: "b26", title: "총, 균, 쇠", author: "Jared Diamond", coverColor: "#5C7A4A", keywords: ["권력", "정의"] },
  { id: "b27", title: "정의란 무엇인가", author: "마이클 샌델", coverColor: "#3B5C8A", keywords: ["정의", "선과 악"] },
  { id: "b28", title: "코스모스", author: "Carl Sagan", coverColor: "#1F2E5A", keywords: ["자유", "정체성"] },
  { id: "b29", title: "이기적 유전자", author: "Richard Dawkins", coverColor: "#6E3B5C", keywords: ["선과 악", "정체성"] },
  { id: "b30", title: "총균쇠 이후의 세계", author: "???", coverColor: "#4A5C6E", keywords: ["정의", "권력"] },
];

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

export const SEED_BOOKS: Book[] = RAW_BOOKS.map((b, i) => {
  const answered = seedCompletion(i, b.keywords.length);
  return {
    ...b,
    starState: "lit",
    answeredKeywordIndices: answered,
    questionsAnswered: answered.length,
    registeredAt: new Date(NOW - (RAW_BOOKS.length - i) * 86400000).toISOString(),
  };
});

export const SEED_STAR_POSITIONS = generateStarPositions(SEED_BOOKS);

export const SEED_KEYWORDS = ["권력", "선과 악", "공감", "자유", "정체성", "정의"] as const;

export const SEED_CONSTELLATIONS: Constellation[] = SEED_KEYWORDS.map((keyword) => {
  const matches = SEED_BOOKS.filter((b) => b.keywords.includes(keyword));
  return {
    keyword,
    bookIds: matches.map((b) => b.id),
    centerBookId: matches[matches.length - 1]?.id ?? matches[0]?.id ?? "",
  };
});

export const SEED_WORLDVIEW_CARDS: WorldviewCard[] = [
  {
    id: "wc-i",
    romanNumeral: "I",
    nameKr: "정의를 묻는 자",
    nameEn: "THE SEEKER",
    arcanumType: "seeker",
    quote: "정의는 다수의 편이 아니라 진실의 편이다.",
    booksCount: 4,
    starsCount: 8,
    issuedAt: new Date(NOW - 7 * 86400000).toISOString(),
    relatedKeyword: "정의",
    relatedBookIds: ["b08", "b22", "b26", "b27"],
  },
  {
    id: "wc-ii",
    romanNumeral: "II",
    nameKr: "자라난 의심",
    nameEn: "THE DOUBT",
    arcanumType: "doubt",
    quote: "당연하다고 믿었던 것 뒤에는 늘 묻지 않은 질문이 있다.",
    booksCount: 4,
    starsCount: 10,
    issuedAt: new Date(NOW - 2 * 86400000).toISOString(),
    relatedKeyword: "권력",
    relatedBookIds: ["b01", "b04", "b10", "b15"],
  },
];
