/**
 * 11 카테고리 (= 키워드).
 * books.csv의 카테고리 필드와 정확히 동일한 문자열을 사용한다.
 */
export const CATEGORIES = [
  "성장",
  "가족·우정",
  "사회·정의",
  "역사",
  "과학·자연",
  "철학",
  "상상력",
  "용기·리더십",
  "경제",
  "예술",
  "공감·다양성",
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
  // 나와 성장 — 좌측 클러스터
  "성장":       { x: 320, y: 240 },
  "가족·우정":  { x: 520, y: 320 },
  "공감·다양성": { x: 240, y: 460 },
  "철학":       { x: 480, y: 540 },
  // 세상과 마주 — 우측 클러스터
  "사회·정의":  { x: 1100, y: 280 },
  "역사":       { x: 1280, y: 460 },
  "용기·리더십": { x: 1080, y: 600 },
  "경제":       { x: 1240, y: 760 },
  // 상상과 발견 — 중앙·상단·하단
  "상상력":     { x: 720, y: 160 },
  "예술":       { x: 900, y: 240 },
  "과학·자연":  { x: 780, y: 700 },
};

/** 책 표지에 쓰일 카테고리 대표색 (deterministic). */
export const CATEGORY_COLORS: Record<Category, string> = {
  "성장":       "#6FA686",
  "가족·우정":  "#D4A14A",
  "사회·정의":  "#C9543B",
  "역사":       "#8A6C3B",
  "과학·자연":  "#4E8AAB",
  "철학":       "#6E4A8A",
  "상상력":     "#A36BC2",
  "용기·리더십": "#B8743B",
  "경제":       "#5C7A4A",
  "예술":       "#9A4763",
  "공감·다양성": "#3D8AAB",
};

/** 첫 카테고리 색을 표지색으로. */
export function coverColorFor(categories: string[]): string {
  for (const c of categories) {
    if (isCategory(c)) return CATEGORY_COLORS[c];
  }
  return "#5A78C2";
}
