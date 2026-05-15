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
import { CATEGORY_ANCHORS } from "./categories";

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
const HUB_ANCHORS: Record<string, { x: number; y: number }> = CATEGORY_ANCHORS;

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

  // d3 forceLink mutates link.source / link.target into node references
  // during the simulation, so we must extract `.id` to get back to strings.
  const linkSourceId = (l: GraphLink): string =>
    typeof l.source === "string" ? l.source : (l.source as GraphNode).id;
  const linkTargetId = (l: GraphLink): string =>
    typeof l.target === "string" ? l.target : (l.target as GraphNode).id;

  const starHubs: Record<string, string[]> = {};
  const hubStars: Record<string, string[]> = {};
  for (const l of links) {
    const src = linkSourceId(l);
    const tgt = linkTargetId(l);
    (starHubs[src] ??= []).push(tgt);
    (hubStars[tgt] ??= []).push(src);
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
