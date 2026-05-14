/**
 * UniverseView
 * ============
 * The home page's star map. Renders 4 visual layers on top of a single
 * animated SVG viewport, and drives every interaction through the
 * `selection` field in ui-store (see ui-store.ts for the model).
 *
 * Responsibilities (only):
 *   1. Build the graph (stars, hubs, links, candidate branches) from books
 *   2. Pick a viewbox based on `selection` and animate to it
 *   3. Render the 4 layers with dim/highlight derived from `selection`
 *   4. Translate user clicks into selection actions (selectStar /
 *      selectKeyword / clearSelection)
 *   5. Mount the BookSheet bound to `focusedBook`
 *
 * Anything NOT in this list (route navigation, modal opening, intro
 * copy fade, FAB) belongs to the parent route, not here.
 *
 * Selection model recap (mirror of ui-store):
 *   none      → all stars visible, planets visible, no halos on non-lit
 *   keyword   → focus on hub's books, dim rest, viewbox zooms to hub
 *   book      → focus on one star, dim rest, viewbox zooms, BookSheet open
 *
 * All "deselect" paths (sheet close, bg click, ESC) call clearSelection().
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useUniverseStore } from "@/lib/store";
import {
  useUiStore,
  homeActiveKeyword,
  homeFocusedBookId,
} from "@/lib/ui-store";
import { BookSheet } from "./BookSheet";
import {
  buildUniverseGraph,
  bookCompletion,
  UNIVERSE_VIEWBOX,
} from "@/lib/universe-graph";
import type { Book } from "@/lib/types";

// ─── Layout constants ────────────────────────────────────────────────
const W = UNIVERSE_VIEWBOX.width;
const H = UNIVERSE_VIEWBOX.height;
const FULL_VB: ViewBox = [0, 0, W, H];
const EXPLORE_VB: ViewBox = [80, 50, W - 160, H - 100];

type ViewBox = [number, number, number, number];

type Planet = {
  id: string;
  label: string;
  kind: string;
  cx: number;
  cy: number;
  r: number;
  color: string;
};

/** Top-level "planet" groups that frame the universe. Decorative only. */
const PLANETS: Planet[] = [
  { id: "self", label: "나와 성장", kind: "GROWTH / IDENTITY",
    cx: 370, cy: 400, r: 300, color: "#8FB8FF" },
  { id: "society", label: "세상과 마주", kind: "SOCIETY / HISTORY",
    cx: 1170, cy: 520, r: 290, color: "#C9543B" },
  { id: "discover", label: "상상과 발견", kind: "IMAGINATION / SCIENCE",
    cx: 800, cy: 420, r: 330, color: "#E8B547" },
];

// ─── Component ───────────────────────────────────────────────────────
type Props = {
  mode?: "intro" | "explore";
  starOpacity?: number;
};

export function UniverseView({ mode = "explore", starOpacity = 0.75 }: Props) {
  const books = useUniverseStore((s) => s.books);
  const selection = useUiStore((s) => s.selection);
  const selectStar = useUiStore((s) => s.selectStar);
  const selectKeyword = useUiStore((s) => s.selectKeyword);
  const clearSelection = useUiStore((s) => s.clearSelection);

  // Convenience derived flags
  const activeKeyword = homeActiveKeyword({ selection });
  const focusedBookId = homeFocusedBookId({ selection });
  const hasSelection = selection.kind !== "none";

  const graph = useMemo(() => buildUniverseGraph(books), [books]);

  // The most recently registered book gets the bright blue "today's star" look
  const currentStar = useMemo(() => {
    if (books.length === 0) return null;
    return [...books].sort((a, b) =>
      a.registeredAt < b.registeredAt ? 1 : -1,
    )[0];
  }, [books]);

  // ESC always returns to overview
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") clearSelection();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [clearSelection]);

  // Highlight sets — pure derivations from selection
  const highlightedLinkSet = useMemo(() => {
    const set = new Set<string>();
    if (selection.kind === "book") {
      for (const l of graph.links) {
        if (l.source === selection.bookId) set.add(`${l.source}->${l.target}`);
      }
    } else if (selection.kind === "keyword") {
      for (const l of graph.links) {
        if (l.keyword === selection.keyword) set.add(`${l.source}->${l.target}`);
      }
    }
    return set;
  }, [selection, graph]);

  const highlightedStarIds = useMemo(() => {
    const set = new Set<string>();
    if (selection.kind === "book") set.add(selection.bookId);
    else if (selection.kind === "keyword") {
      const hub = graph.hubByKeyword[selection.keyword];
      if (hub) for (const id of graph.hubStars[hub.id] ?? []) set.add(id);
    }
    return set;
  }, [selection, graph]);

  // Viewbox: overview / explore / focused-on-selection
  const targetVb = useMemo<ViewBox>(() => {
    if (selection.kind === "keyword") {
      const hub = graph.hubByKeyword[selection.keyword];
      if (hub) return fitViewBox([hub, ...starsForHub(graph, hub.id)]);
    }
    if (selection.kind === "book") {
      const star = graph.starById[selection.bookId];
      if (star) {
        // Zoom around the star plus the hubs it connects to
        const points = [
          star,
          ...graph.links
            .filter((l) => l.source === star.id)
            .map((l) => graph.hubByKeyword[l.keyword])
            .filter(Boolean),
        ];
        return fitViewBox(points);
      }
    }
    return mode === "explore" ? EXPLORE_VB : FULL_VB;
  }, [selection, graph, mode]);

  const vb = useAnimatedViewBox(targetVb);

  const focusedBook: Book | null = focusedBookId
    ? books.find((b) => b.id === focusedBookId) ?? null
    : null;

  const linesVisible = mode === "explore";
  const isLone = books.length === 1;

  return (
    <>
      <svg
        viewBox={vb.join(" ")}
        className="absolute inset-0 z-10 h-full w-full"
        preserveAspectRatio="xMidYMid meet"
        onClick={clearSelection /* clicking empty space → overview */}
      >
        <defs>
          <radialGradient id="starGlowBlue" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#B8D0FF" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#8FB8FF" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#8FB8FF" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="starGlowWhite" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F4F4ED" stopOpacity="0.55" />
            <stop offset="45%" stopColor="#F4F4ED" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#F4F4ED" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="starGlowFull" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF6D6" stopOpacity="0.7" />
            <stop offset="35%" stopColor="#E8B547" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#E8B547" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* L0 — planets (overview decor, hidden during any selection) */}
        <PlanetLayer hidden={!linesVisible || hasSelection} />

        {/* L1 — dashed "next star?" candidate branches */}
        <CandidateLayer
          visible={linesVisible}
          candidates={graph.candidates}
        />

        {/* L2 — star ↔ hub links (only highlighted ones show) */}
        <LinkLayer
          graph={graph}
          highlightedSet={highlightedLinkSet}
          hasSelection={hasSelection}
          visible={linesVisible}
        />

        {/* L3 — keyword hubs (clickable) */}
        <HubLayer
          hubs={graph.hubs}
          activeKeyword={activeKeyword}
          hasSelection={hasSelection}
          visible={linesVisible}
          onPick={selectKeyword}
        />

        {/* L4 — stars (clickable) */}
        <StarLayer
          stars={graph.stars}
          currentStarId={currentStar?.id ?? null}
          highlightedSet={highlightedStarIds}
          hasSelection={hasSelection}
          opacity={starOpacity}
          onPick={selectStar}
        />
      </svg>

      <BookSheet
        book={focusedBook}
        // ↓↓↓ THE FIX: sheet close = full deselect, so dim/highlight cannot
        // linger after the sheet is gone (root-cause of the "screen stays
        // dim" bug).
        onClose={clearSelection}
        getBook={(id) => books.find((b) => b.id === id)}
      />

      {isLone && mode === "explore" && (
        <div className="pointer-events-none absolute inset-x-0 top-[58%] z-20 flex justify-center">
          <div
            className="rounded-full px-4 py-2"
            style={{
              background: "rgba(7,9,26,0.55)",
              border: "1px solid var(--ink-faint)",
              backdropFilter: "blur(10px)",
              fontFamily: "var(--font-body)",
              fontSize: 12,
              color: "var(--ink-secondary)",
            }}
          >
            아직 별자리가 없어요. 다른 책을 더해서 별자리를 만들어요.
          </div>
        </div>
      )}
    </>
  );
}

// ─── Layer sub-components (each is pure / depends only on its props) ──

function PlanetLayer({ hidden }: { hidden: boolean }) {
  return (
    <g
      style={{
        opacity: hidden ? 0 : 1,
        transition: "opacity 900ms var(--ease-cosmos)",
      }}
    >
      {PLANETS.map((p) => (
        <g key={p.id}>
          <defs>
            <radialGradient id={`pl-${p.id}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={p.color} stopOpacity="0.10" />
              <stop offset="70%" stopColor={p.color} stopOpacity="0.025" />
              <stop offset="100%" stopColor={p.color} stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx={p.cx} cy={p.cy} r={p.r} fill={`url(#pl-${p.id})`} />
          <circle
            cx={p.cx}
            cy={p.cy}
            r={p.r}
            fill="none"
            stroke={p.color}
            strokeOpacity={0.1}
            strokeDasharray="3 6"
          />
          <text
            x={p.cx}
            y={p.cy - p.r + 26}
            textAnchor="middle"
            fill="var(--gold-deep)"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 20,
              letterSpacing: "0.02em",
              opacity: 0.55,
            }}
          >
            {p.label}
          </text>
          <text
            x={p.cx}
            y={p.cy - p.r + 42}
            textAnchor="middle"
            fill="var(--gold-deep)"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 8.5,
              letterSpacing: "0.2em",
              opacity: 0.4,
            }}
          >
            PLANET · {p.kind}
          </text>
        </g>
      ))}
    </g>
  );
}

type Graph = ReturnType<typeof buildUniverseGraph>;

function CandidateLayer({
  visible,
  candidates,
}: {
  visible: boolean;
  candidates: Graph["candidates"];
}) {
  return (
    <g
      style={{
        opacity: visible ? 0.55 : 0,
        transition: "opacity 900ms var(--ease-cosmos)",
      }}
    >
      {candidates.map((c, i) => (
        // pointer-events: none so ghost rings can't intercept clicks meant for the SVG bg
        <g key={i} style={{ pointerEvents: "none" }}>
          <line
            x1={c.fromX}
            y1={c.fromY}
            x2={c.x}
            y2={c.y}
            stroke="var(--ink-muted)"
            strokeWidth={1}
            strokeDasharray="2 3"
            opacity={0.6}
          />
          <circle
            cx={c.x}
            cy={c.y}
            r={3.2}
            fill="none"
            stroke="var(--ink-muted)"
            strokeWidth={0.6}
            strokeDasharray="1.5 2"
            opacity={0.5}
          />
          <circle cx={c.x} cy={c.y} r={0.9} fill="var(--ink-muted)" opacity={0.55} />
          {c.isLabel && (
            <text
              x={c.x + 10}
              y={c.y + 4}
              fill="var(--ink-muted)"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                opacity: 0.6,
              }}
            >
              다음 별 ?
            </text>
          )}
        </g>
      ))}
    </g>
  );
}

function LinkLayer({
  graph,
  highlightedSet,
  hasSelection,
  visible,
}: {
  graph: Graph;
  highlightedSet: Set<string>;
  hasSelection: boolean;
  visible: boolean;
}) {
  return (
    <g
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 900ms var(--ease-cosmos)",
      }}
    >
      {graph.links.map((l, i) => {
        const star = graph.starById[l.source];
        const hub = graph.hubByKeyword[l.keyword];
        if (!star || !hub) return null;
        const key = `${l.source}->${l.target}`;
        const isOn = highlightedSet.has(key);
        // Without a selection, links stay invisible too — overview is calmer
        const op = isOn ? 0.6 : hasSelection ? 0 : 0;
        return (
          <line
            key={i}
            x1={star.x}
            y1={star.y}
            x2={hub.x}
            y2={hub.y}
            stroke="var(--constellation)"
            strokeWidth={isOn ? 1.3 : 1}
            strokeOpacity={op}
            strokeLinecap="round"
            style={{
              transition:
                "stroke-opacity 600ms var(--ease-cosmos), stroke-width 600ms var(--ease-cosmos)",
            }}
          />
        );
      })}
    </g>
  );
}

function HubLayer({
  hubs,
  activeKeyword,
  hasSelection,
  visible,
  onPick,
}: {
  hubs: Graph["hubs"];
  activeKeyword: string | null;
  hasSelection: boolean;
  visible: boolean;
  onPick: (keyword: string) => void;
}) {
  return (
    <g
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 900ms var(--ease-cosmos)",
      }}
    >
      {hubs.map((h) => {
        const isActive = activeKeyword === h.keyword;
        const dim = hasSelection && !isActive;
        return (
          <g
            key={h.id}
            onClick={(e) => {
              e.stopPropagation();
              onPick(h.keyword);
            }}
            style={{ cursor: "pointer" }}
          >
            <circle
              cx={h.x}
              cy={h.y}
              r={2}
              fill="var(--ink-muted)"
              opacity={dim ? 0.1 : 0.35}
            />
            {/* Larger invisible hit area for easier label clicking */}
            <circle cx={h.x} cy={h.y} r={28} fill="transparent" />
            <text
              x={h.x + 12}
              y={h.y + 4}
              fill="var(--constellation)"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 13,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                opacity: dim ? 0.18 : isActive ? 0.95 : 0.55,
                transition: "opacity 600ms var(--ease-cosmos)",
                userSelect: "none",
              }}
            >
              #{h.keyword}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function StarLayer({
  stars,
  currentStarId,
  highlightedSet,
  hasSelection,
  opacity,
  onPick,
}: {
  stars: Graph["stars"];
  currentStarId: string | null;
  highlightedSet: Set<string>;
  hasSelection: boolean;
  opacity: number;
  onPick: (bookId: string) => void;
}) {
  return (
    <g
      style={{
        opacity,
        transition: "opacity 1200ms var(--ease-cosmos)",
      }}
    >
      {stars.map((s) => (
        <Star
          key={s.id}
          star={s}
          isCurrent={s.id === currentStarId}
          isHighlighted={highlightedSet.has(s.id)}
          hasSelection={hasSelection}
          onPick={onPick}
        />
      ))}
    </g>
  );
}

// ─── Single star ─────────────────────────────────────────────────────

function Star({
  star,
  isCurrent,
  isHighlighted,
  hasSelection,
  onPick,
}: {
  star: Graph["stars"][number];
  isCurrent: boolean;
  isHighlighted: boolean;
  hasSelection: boolean;
  onPick: (bookId: string) => void;
}) {
  const tier = bookCompletion(star.book);
  const dim = hasSelection && !isHighlighted && !isCurrent;
  const isLit = tier >= 1;

  // Size — tier 0 is markedly smaller, tier 3 noticeably bigger
  const r = isCurrent ? 5.5 : tier === 3 ? 4 : tier >= 1 ? 3 : 2;
  // Tier 0 still gets a faint halo so users see it's a real book, not decor
  const haloR = isCurrent ? 22 : tier === 3 ? 18 : tier >= 1 ? 11 : 6;

  const fill = isCurrent
    ? "#E8F0FF"
    : isHighlighted
    ? "#FFFFFF"
    : isLit
    ? "#F4F4ED"
    : "#5A6B8E";

  const baseOp = isCurrent
    ? 1
    : dim
    ? 0.12
    : isHighlighted
    ? 1
    : tier === 0
    ? 0.42
    : tier === 3
    ? 0.95
    : 0.72;

  const haloFill = isCurrent
    ? "url(#starGlowBlue)"
    : tier === 3
    ? "url(#starGlowFull)"
    : "url(#starGlowWhite)";

  const showHalo = haloR > 0 && !dim;
  const spikes = (tier === 3 || isCurrent) && !dim;
  const spikeLen = isCurrent ? 14 : 11;
  const spikeColor = isCurrent ? "#B8D0FF" : "#F4F4ED";
  const shimmer = isLit && !isCurrent;

  return (
    <g
      onClick={(e) => {
        e.stopPropagation();
        onPick(star.id);
      }}
      style={{ cursor: "pointer" }}
    >
      {showHalo && (
        <circle
          cx={star.x}
          cy={star.y}
          r={haloR}
          fill={haloFill}
          className={isCurrent || tier === 3 ? "star-halo-breathe" : undefined}
          style={{
            animationDelay:
              isCurrent || tier === 3 ? `${twinkleDelay(star.id)}s` : undefined,
          }}
        />
      )}
      {spikes && (
        <g opacity={isCurrent ? 0.7 : 0.5} style={{ mixBlendMode: "screen" }}>
          <line
            x1={star.x - spikeLen}
            y1={star.y}
            x2={star.x + spikeLen}
            y2={star.y}
            stroke={spikeColor}
            strokeWidth={0.6}
            strokeLinecap="round"
          />
          <line
            x1={star.x}
            y1={star.y - spikeLen}
            x2={star.x}
            y2={star.y + spikeLen}
            stroke={spikeColor}
            strokeWidth={0.6}
            strokeLinecap="round"
          />
        </g>
      )}
      {/* Invisible hit area larger than the visible dot */}
      <circle cx={star.x} cy={star.y} r={14} fill="transparent" />
      <circle
        cx={star.x}
        cy={star.y}
        r={r}
        fill={fill}
        opacity={baseOp}
        className={isCurrent ? "pulse-glow" : shimmer ? "star-shimmer" : undefined}
        style={{
          animationDelay: shimmer ? `${twinkleDelay(star.id)}s` : undefined,
          ...(shimmer
            ? ({ ["--star-base-op" as never]: baseOp } as React.CSSProperties)
            : {}),
          transition: "opacity 600ms var(--ease-cosmos)",
        }}
      />
    </g>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────

function twinkleDelay(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return ((h % 280) / 100).toFixed(2);
}

/** Fit a viewbox around given points, padded, preserving canvas ratio. */
function fitViewBox(points: Array<{ x: number; y: number }>): ViewBox {
  if (points.length === 0) return FULL_VB;
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const padX = 220;
  const padY = 180;
  const minX = Math.min(...xs) - padX;
  const minY = Math.min(...ys) - padY;
  const maxX = Math.max(...xs) + padX;
  const maxY = Math.max(...ys) + padY;
  let w = maxX - minX;
  let h = maxY - minY;
  const r = W / H;
  if (w / h > r) h = w / r;
  else w = h * r;
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  return [cx - w / 2, cy - h / 2, w, h];
}

function starsForHub(graph: Graph, hubId: string) {
  const ids = graph.hubStars[hubId] ?? [];
  return ids.map((id) => graph.starById[id]).filter(Boolean);
}

/** Smoothly tween between viewbox targets (cubic ease-out, 800ms). */
function useAnimatedViewBox(target: ViewBox): ViewBox {
  const [vb, setVb] = useState(target);
  const fromRef = useRef(target);
  const key = target.join(",");
  useEffect(() => {
    const from = fromRef.current;
    const to = target;
    const start = performance.now();
    const dur = 800;
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const e = ease(t);
      const next: ViewBox = [
        from[0] + (to[0] - from[0]) * e,
        from[1] + (to[1] - from[1]) * e,
        from[2] + (to[2] - from[2]) * e,
        from[3] + (to[3] - from[3]) * e,
      ];
      setVb(next);
      fromRef.current = next;
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return vb;
}
