// Hand-placed coordinates for 6 constellations (viewBox 0 0 1440 900).
// PC landscape composition — internal edges never cross other constellations.
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
    labelX: 360,
    labelY: 110,
    stars: [
      { id: "s1", x: 200, y: 170, bookId: "b16" },
      { id: "s2", x: 320, y: 140, center: true, bookId: "b29" },
      { id: "s3", x: 280, y: 250, bookId: "b27" },
    ],
    edges: [["s1", "s2"], ["s2", "s3"]],
  },
  {
    keyword: "권력",
    labelX: 770,
    labelY: 360,
    stars: [
      { id: "p1", x: 580, y: 240, bookId: "b04" },
      { id: "p2", x: 700, y: 180, bookId: "b15" },
      { id: "p3", x: 780, y: 280, center: true, bookId: "b10" },
      { id: "p4", x: 690, y: 360, bookId: "b25" },
      { id: "p5", x: 580, y: 320, bookId: "b26" },
    ],
    edges: [["p1", "p2"], ["p2", "p3"], ["p3", "p4"], ["p4", "p5"], ["p5", "p1"]],
  },
  {
    keyword: "공감",
    labelX: 1140,
    labelY: 200,
    stars: [
      { id: "e1", x: 1100, y: 240, bookId: "b02" },
      { id: "e2", x: 1220, y: 320, center: true, bookId: "b14" },
      { id: "e3", x: 1310, y: 230, bookId: "b18" },
    ],
    edges: [["e1", "e2"], ["e2", "e3"], ["e3", "e1"]],
  },
  {
    keyword: "자유",
    labelX: 200,
    labelY: 580,
    stars: [
      { id: "f1", x: 210, y: 620, bookId: "b05" },
      { id: "f2", x: 310, y: 690, center: true, bookId: "b19" },
      { id: "f3", x: 230, y: 780, bookId: "b23" },
      { id: "f4", x: 380, y: 760, bookId: "b28" },
    ],
    edges: [["f1", "f2"], ["f2", "f3"], ["f2", "f4"]],
  },
  {
    keyword: "정체성",
    labelX: 1140,
    labelY: 580,
    stars: [
      { id: "i1", x: 1120, y: 620, bookId: "b07" },
      { id: "i2", x: 1240, y: 720, center: true, bookId: "b17" },
      { id: "i3", x: 1320, y: 620, bookId: "b21" },
    ],
    edges: [["i1", "i2"], ["i2", "i3"]],
  },
  {
    keyword: "정의",
    labelX: 770,
    labelY: 620,
    stars: [
      { id: "j1", x: 660, y: 660, bookId: "b08" },
      { id: "j2", x: 760, y: 740, center: true, bookId: "b22" },
      { id: "j3", x: 660, y: 820, bookId: "b30" },
      { id: "j4", x: 850, y: 810, bookId: "b27" },
    ],
    edges: [["j1", "j2"], ["j2", "j3"], ["j2", "j4"]],
  },
];

export const CANDIDATE_STAR = {
  fromX: 700,
  fromY: 180,
  x: 920,
  y: 90,
  labelX: 940,
  labelY: 70,
};

export function findStarBook(books: Book[], bookId?: string): Book | undefined {
  if (!bookId) return undefined;
  return books.find((b) => b.id === bookId);
}
