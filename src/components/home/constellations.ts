// Hand-placed coordinates for 6 constellations (viewBox 0 0 390 600).
// Carefully laid out so internal edges never cross other constellations.
import type { Book } from "@/lib/types";

export type StarNode = {
  id: string;
  bookId?: string;
  x: number;
  y: number;
  center?: boolean;
};

export type ConstellationLayout = {
  keyword: string;
  labelX: number;
  labelY: number;
  stars: StarNode[];
  edges: Array<[string, string]>;
};

export const CONSTELLATIONS: ConstellationLayout[] = [
  {
    keyword: "선과 악",
    labelX: 116,
    labelY: 56,
    stars: [
      { id: "s1", x: 56, y: 92, bookId: "b16" },
      { id: "s2", x: 110, y: 74, center: true, bookId: "b29" },
      { id: "s3", x: 92, y: 132, bookId: "b27" },
    ],
    edges: [["s1", "s2"], ["s2", "s3"]],
  },
  {
    keyword: "권력",
    labelX: 232,
    labelY: 226,
    stars: [
      { id: "p1", x: 178, y: 144, bookId: "b04" },
      { id: "p2", x: 222, y: 112, bookId: "b15" },
      { id: "p3", x: 252, y: 168, center: true, bookId: "b10" },
      { id: "p4", x: 208, y: 196, bookId: "b25" },
      { id: "p5", x: 174, y: 178, bookId: "b26" },
    ],
    edges: [["p1", "p2"], ["p2", "p3"], ["p3", "p4"], ["p4", "p5"], ["p5", "p1"]],
  },
  {
    keyword: "공감",
    labelX: 326,
    labelY: 232,
    stars: [
      { id: "e1", x: 320, y: 248, bookId: "b02" },
      { id: "e2", x: 344, y: 296, center: true, bookId: "b14" },
      { id: "e3", x: 296, y: 286, bookId: "b18" },
    ],
    edges: [["e1", "e2"], ["e2", "e3"], ["e3", "e1"]],
  },
  {
    keyword: "자유",
    labelX: 122,
    labelY: 372,
    stars: [
      { id: "f1", x: 52, y: 388, bookId: "b05" },
      { id: "f2", x: 92, y: 422, center: true, bookId: "b19" },
      { id: "f3", x: 60, y: 472, bookId: "b23" },
      { id: "f4", x: 116, y: 460, bookId: "b28" },
    ],
    edges: [["f1", "f2"], ["f2", "f3"], ["f2", "f4"]],
  },
  {
    keyword: "정체성",
    labelX: 290,
    labelY: 410,
    stars: [
      { id: "i1", x: 312, y: 430, bookId: "b07" },
      { id: "i2", x: 342, y: 478, center: true, bookId: "b17" },
      { id: "i3", x: 290, y: 488, bookId: "b21" },
    ],
    edges: [["i1", "i2"], ["i2", "i3"]],
  },
  {
    keyword: "정의",
    labelX: 232,
    labelY: 458,
    stars: [
      { id: "j1", x: 178, y: 472, bookId: "b08" },
      { id: "j2", x: 220, y: 506, center: true, bookId: "b22" },
      { id: "j3", x: 168, y: 544, bookId: "b30" },
      { id: "j4", x: 214, y: 548, bookId: "b27" },
    ],
    edges: [["j1", "j2"], ["j2", "j3"], ["j2", "j4"]],
  },
];

export const CANDIDATE_STAR = {
  fromX: 222,
  fromY: 112,
  x: 298,
  y: 70,
  labelX: 305,
  labelY: 56,
};

export function findStarBook(books: Book[], bookId?: string): Book | undefined {
  if (!bookId) return undefined;
  return books.find((b) => b.id === bookId);
}
