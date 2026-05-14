import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  forceX,
  forceY,
} from "d3-force";
import type { Book } from "./types";

export type StarNode = {
  id: string;
  type: "star";
  book: Book;
  keywords: string[];
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
};

export type KeywordHub = {
  id: string;
  type: "hub";
  keyword: string;
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
};

export type GraphNode = StarNode | KeywordHub;

export type GraphLink = {
  source: string;
  target: string;
  keyword: string;
};

export type CandidateBranch = {
  hubId: string;
  keyword: string;
  fromX: number;
  fromY: number;
  x: number;
  y: number;
  isLabel?: boolean;
};

export type UniverseGraph = {
  stars: StarNode[];
  hubs: KeywordHub[];
  links: GraphLink[];
  /** Quick lookup */
  starById: Record<string, StarNode>;
  hubByKeyword: Record<string, KeywordHub>;
  /** open-tree extension branches dangling off hubs */
  candidates: CandidateBranch[];
  /** which star.id → all hub.id it connects to */
  starHubs: Record<string, string[]>;
  /** which hub.id → all star.id it connects to */
  hubStars: Record<string, string[]>;
};

// Tiny deterministic PRNG so layout is identical every render
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const WIDTH = 1440;
const HEIGHT = 900;

// Anchor each keyword to a stable point on the canvas so the layout is
// recognisable across re-renders even if book set changes slightly.
const HUB_ANCHORS: Record<string, { x: number; y: number }> = {
  "권력":   { x: 720, y: 320 },
  "선과 악": { x: 320, y: 220 },
  "공감":   { x: 1180, y: 260 },
  "자유":   { x: 1100, y: 660 },
  "정체성": { x: 760, y: 640 },
  "정의":   { x: 360, y: 640 },
  "배신":   { x: 540, y: 160 },
  "비겁":   { x: 540, y: 460 },
  "사랑":   { x: 1280, y: 460 },
  "희생":   { x: 1320, y: 760 },
  "통제":   { x: 1000, y: 760 },
  "진실":   { x: 200, y: 460 },
  "우정":   { x: 240, y: 780 },
  "이중성": { x: 880, y: 480 },
  "선택":   { x: 600, y: 760 },
  "책임":   { x: 460, y: 800 },
  "미디어": { x: 920, y: 200 },
  "편견":   { x: 200, y: 320 },
  "고독":   { x: 1000, y: 540 },
  "기억":   { x: 1240, y: 580 },
};

function anchorFor(keyword: string, idx: number): { x: number; y: number } {
  if (HUB_ANCHORS[keyword]) return HUB_ANCHORS[keyword];
  // Spread unknown keywords on an outer ring
  const angle = (idx * 137.5 * Math.PI) / 180;
  const r = 380;
  return { x: WIDTH / 2 + Math.cos(angle) * r, y: HEIGHT / 2 + Math.sin(angle) * r };
}

export function buildUniverseGraph(books: Book[]): UniverseGraph {
  const rng = mulberry32(20260514);

  const allKeywords = Array.from(
    new Set(books.flatMap((b) => b.keywords)),
  );

  const hubs: KeywordHub[] = allKeywords.map((keyword, i) => {
    const a = anchorFor(keyword, i);
    return {
      id: `kw:${keyword}`,
      type: "hub",
      keyword,
      x: a.x,
      y: a.y,
      // soft anchor — let force pull it slightly but stay near
      fx: a.x,
      fy: a.y,
    };
  });

  const stars: StarNode[] = books.map((b) => {
    // Initial position near the average of its hub anchors so simulation
    // converges fast and deterministically.
    const anchors = b.keywords
      .map((k) => HUB_ANCHORS[k])
      .filter(Boolean) as { x: number; y: number }[];
    const cx = anchors.length
      ? anchors.reduce((s, a) => s + a.x, 0) / anchors.length
      : WIDTH / 2;
    const cy = anchors.length
      ? anchors.reduce((s, a) => s + a.y, 0) / anchors.length
      : HEIGHT / 2;
    return {
      id: b.id,
      type: "star",
      book: b,
      keywords: b.keywords,
      x: cx + (rng() - 0.5) * 60,
      y: cy + (rng() - 0.5) * 60,
    };
  });

  const links: GraphLink[] = books.flatMap((b) =>
    b.keywords.map((k) => ({
      source: b.id,
      target: `kw:${k}`,
      keyword: k,
    })),
  );

  const nodes: GraphNode[] = [...stars, ...hubs];

  const sim = forceSimulation(nodes as never)
    .force(
      "link",
      forceLink(links as never)
        .id((d) => (d as GraphNode).id)
        .distance(110)
        .strength(0.55),
    )
    .force("charge", forceManyBody().strength(-160))
    .force("center", forceCenter(WIDTH / 2, HEIGHT / 2).strength(0.02))
    .force("collide", forceCollide(20))
    .force("x", forceX(WIDTH / 2).strength(0.015))
    .force("y", forceY(HEIGHT / 2).strength(0.015))
    .stop();

  for (let i = 0; i < 320; i++) sim.tick();

  // Release hub anchors so we can read final positions
  for (const h of hubs) {
    h.fx = null;
    h.fy = null;
  }

  // Build lookups
  const starById: Record<string, StarNode> = {};
  for (const s of stars) starById[s.id] = s;
  const hubByKeyword: Record<string, KeywordHub> = {};
  for (const h of hubs) hubByKeyword[h.keyword] = h;

  const starHubs: Record<string, string[]> = {};
  const hubStars: Record<string, string[]> = {};
  for (const l of links) {
    (starHubs[l.source] ??= []).push(l.target);
    (hubStars[l.target] ??= []).push(l.source);
  }

  // Open-tree dashed branches: pick up to 3 hubs (most populous) and add a
  // dim candidate star pointing outward from the canvas center.
  const populous = [...hubs]
    .sort((a, b) => (hubStars[b.id]?.length ?? 0) - (hubStars[a.id]?.length ?? 0))
    .slice(0, 3);

  const candidates: CandidateBranch[] = populous.map((h, idx) => {
    const dx = h.x - WIDTH / 2;
    const dy = h.y - HEIGHT / 2;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    const dist = 110;
    return {
      hubId: h.id,
      keyword: h.keyword,
      fromX: h.x,
      fromY: h.y,
      x: h.x + ux * dist,
      y: h.y + uy * dist,
      isLabel: idx === 0,
    };
  });

  return {
    stars,
    hubs,
    links,
    starById,
    hubByKeyword,
    candidates,
    starHubs,
    hubStars,
  };
}

export function bookCompletion(b: Book): 0 | 1 | 2 | 3 {
  const n = b.questionsAnswered ?? 0;
  if (n >= 3) return 3;
  if (n >= 1) return n === 2 ? 2 : 1;
  return 0;
}

export const UNIVERSE_VIEWBOX = { width: WIDTH, height: HEIGHT };
