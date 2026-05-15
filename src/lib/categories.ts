/**
 * 11 카테고리 (= 키워드).
 * books.csv의 카테고리 필드와 정확히 동일한 문자열을 사용한다.
 */
export const CATEGORIES = [
  "성장",
  "희생",
  "권력",
  "역사",
  "과학·자연",
  "철학",
  "자유",
  "용기",
  "경제",
  "예술",
  "사랑",
] as const;

export type Category = (typeof CATEGORIES)[number];

export function isCategory(s: string): s is Category {
  return (CATEGORIES as readonly string[]).includes(s);
}

/**
 * 캔버스(1440×900) 위 각 카테고리 허브 좌표.
 * 세 개의 행성("나와 성장" / "세상과 마주" / "상상과 발견")에 맞춰
 * 카테고리를 모아 둔다.
 */
export const CATEGORY_ANCHORS: Record<Category, { x: number; y: number }> = {
  // 보이는 7개 — 중심(720, 450) 기준 15% 더 가까이
  "자유":  { x: 754, y: 221 },
  "성장":  { x: 380, y: 289 },
  "권력":  { x: 1077, y: 306 },
  "희생":  { x: 618, y: 459 },
  "용기":  { x: 1094, y: 527 },
  "사랑":  { x: 312, y: 578 },
  "철학":  { x: 805, y: 680 },
  // 숨김 4개 — 라벨은 안 보이지만 별을 모으는 중심 역할
  "역사":       { x: 1196, y: 459 },
  "경제":       { x: 1162, y: 714 },
  "예술":       { x: 873, y: 272 },
  "과학·자연":  { x: 771, y: 663 },
};

/** 책 표지에 쓰일 카테고리 대표색 (deterministic). */
export const CATEGORY_COLORS: Record<Category, string> = {
  "성장":       "#6FA686",
  "희생":  "#D4A14A",
  "권력":  "#C9543B",
  "역사":       "#8A6C3B",
  "과학·자연":  "#4E8AAB",
  "철학":       "#6E4A8A",
  "자유":     "#A36BC2",
  "용기": "#B8743B",
  "경제":       "#5C7A4A",
  "예술":       "#9A4763",
  "사랑": "#3D8AAB",
};

/** 첫 카테고리 색을 표지색으로. */
export function coverColorFor(categories: string[]): string {
  for (const c of categories) {
    if (isCategory(c)) return CATEGORY_COLORS[c];
  }
  return "#5A78C2";
}
