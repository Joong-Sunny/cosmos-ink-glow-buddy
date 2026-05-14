import { useEffect, useMemo, useRef, useState } from "react";
import { useUniverseStore } from "@/lib/store";
import { BookSheet } from "./BookSheet";
import {
  buildUniverseGraph,
  bookCompletion,
  UNIVERSE_VIEWBOX,
} from "@/lib/universe-graph";
import type { Book } from "@/lib/types";

function twinkleDelay(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return ((h % 280) / 100).toFixed(2);
}

type Props = {
  active: string | null;
  onActiveChange: (k: string | null) => void;
  mode?: "intro" | "explore";
  starOpacity?: number;
};

const W = UNIVERSE_VIEWBOX.width;
const H = UNIVERSE_VIEWBOX.height;
const FULL_VB: [number, number, number, number] = [0, 0, W, H];
const EXPLORE_VB: [number, number, number, number] = [80, 50, W - 160, H - 100];

type Planet = {
  id: string;
  label: string;
  kind: string;
  cx: number;
  cy: number;
  r: number;
  color: string;
};

/** Top-level "planet" categories that group keyword hubs. */
const PLANETS: Planet[] = [
  // 성장(320,240) · 가족·우정(520,320) · 공감·다양성(240,460) · 철학(480,540)
  { id: "self", label: "나와 성장", kind: "GROWTH / IDENTITY",
    cx: 370, cy: 400, r: 300, color: "#8FB8FF" },
  // 사회·정의(1100,280) · 역사(1280,460) · 용기·리더십(1080,600) · 경제(1240,760)
  { id: "society", label: "세상과 마주", kind: "SOCIETY / HISTORY",
    cx: 1170, cy: 520, r: 290, color: "#C9543B" },
  // 상상력(720,160) · 예술(900,240) · 과학·자연(780,700)
  { id: "discover", label: "상상과 발견", kind: "IMAGINATION / SCIENCE",
    cx: 800, cy: 420, r: 330, color: "#E8B547" },
];

function useAnimatedViewBox(target: [number, number, number, number]) {
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
      const next: [number, number, number, number] = [
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

export function UniverseView({
  active,
  onActiveChange,
  mode = "explore",
  starOpacity = 0.75,
}: Props) {
  const books = useUniverseStore((s) => s.books);
  const [openBookId, setOpenBookId] = useState<string | null>(null);
  /** focus = a star id user clicked (lights all of its keyword links) */
  const [focusStarId, setFocusStarId] = useState<string | null>(null);

  const graph = useMemo(() => buildUniverseGraph(books), [books]);

  // Most recently registered book = "today's star" (active blue)
  const currentStar = useMemo(() => {
    if (books.length === 0) return null;
    return [...books].sort((a, b) =>
      a.registeredAt < b.registeredAt ? 1 : -1,
    )[0];
  }, [books]);

  // Compute focus viewBox for active keyword
  const targetVb = useMemo<[number, number, number, number]>(() => {
    if (active) {
      const hub = graph.hubByKeyword[active];
      if (hub) {
        const starIds = graph.hubStars[hub.id] ?? [];
        const stars = starIds.map((id) => graph.starById[id]).filter(Boolean);
        const xs = [hub.x, ...stars.map((s) => s.x)];
        const ys = [hub.y, ...stars.map((s) => s.y)];
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
    }
    return mode === "explore" ? EXPLORE_VB : FULL_VB;
  }, [active, graph, mode]);

  const vb = useAnimatedViewBox(targetVb);

  // ESC clears focus & active
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setFocusStarId(null);
        onActiveChange(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onActiveChange]);

  // What links / stars are highlighted right now?
  // - active keyword: all links with that keyword
  // - focus star: all links from that star
  const highlightedLinkSet = useMemo(() => {
    const set = new Set<string>();
    if (focusStarId) {
      for (const l of graph.links) {
        if (l.source === focusStarId) set.add(`${l.source}->${l.target}`);
      }
    }
    if (active) {
      for (const l of graph.links) {
        if (l.keyword === active) set.add(`${l.source}->${l.target}`);
      }
    }
    return set;
  }, [focusStarId, active, graph]);

  const highlightedStarIds = useMemo(() => {
    const set = new Set<string>();
    if (focusStarId) set.add(focusStarId);
    if (active) {
      const hub = graph.hubByKeyword[active];
      if (hub) for (const id of graph.hubStars[hub.id] ?? []) set.add(id);
    }
    return set;
  }, [focusStarId, active, graph]);

  const linesVisible = mode === "explore";
  const hasSelection = !!focusStarId || !!active;

  const openBook: Book | null = openBookId
    ? books.find((b) => b.id === openBookId) ?? null
    : null;

  const isLone = books.length === 1;

  return (
    <>
      <svg
        viewBox={vb.join(" ")}
        className="absolute inset-0 z-10 h-full w-full"
        preserveAspectRatio="xMidYMid meet"
        onClick={() => {
          setFocusStarId(null);
          onActiveChange(null);
        }}
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

        {/* === Layer 0: planets (top-level categories) === */}
        <g
          style={{
            opacity: linesVisible && !hasSelection ? 1 : 0,
            transition: "opacity 900ms var(--ease-cosmos)",
          }}
        >
          {PLANETS.map((p) => {
            const cx = p.cx;
            const cy = p.cy;
            return (
              <g key={p.id}>
                <defs>
                  <radialGradient id={`pl-${p.id}`} cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor={p.color} stopOpacity="0.10" />
                    <stop offset="70%" stopColor={p.color} stopOpacity="0.025" />
                    <stop offset="100%" stopColor={p.color} stopOpacity="0" />
                  </radialGradient>
                </defs>
                <circle cx={cx} cy={cy} r={p.r} fill={`url(#pl-${p.id})`} />
                <circle
                  cx={cx}
                  cy={cy}
                  r={p.r}
                  fill="none"
                  stroke={p.color}
                  strokeOpacity={0.10}
                  strokeDasharray="3 6"
                />
                <text
                  x={cx}
                  y={cy - p.r + 26}
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
                  x={cx}
                  y={cy - p.r + 42}
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
            );
          })}
        </g>

        {/* === Layer 1: dashed open-tree candidate branches === */}
        <g
          style={{
            opacity: linesVisible ? 0.55 : 0,
            transition: "opacity 900ms var(--ease-cosmos)",
          }}
        >
          {graph.candidates.map((c, i) => (
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
              {/* Ghost ring — visually distinct from real book stars */}
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
              <circle
                cx={c.x}
                cy={c.y}
                r={0.9}
                fill="var(--ink-muted)"
                opacity={0.55}
              />
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

        {/* === Layer 2: links (only visible when something selected) === */}
        <g
          style={{
            opacity: linesVisible ? 1 : 0,
            transition: "opacity 900ms var(--ease-cosmos)",
          }}
        >
          {graph.links.map((l, i) => {
            const star = graph.starById[l.source];
            const hub = graph.hubByKeyword[l.keyword];
            if (!star || !hub) return null;
            const key = `${l.source}->${l.target}`;
            const isOn = highlightedLinkSet.has(key);
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

        {/* === Layer 3: keyword hubs + labels === */}
        <g
          style={{
            opacity: linesVisible ? 1 : 0,
            transition: "opacity 900ms var(--ease-cosmos)",
          }}
        >
          {graph.hubs.map((h) => {
            const isActive = active === h.keyword;
            const dim = hasSelection && !isActive;
            return (
              <g
                key={h.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setFocusStarId(null);
                  onActiveChange(isActive ? null : h.keyword);
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
                {/* invisible larger hit area */}
                <circle
                  cx={h.x}
                  cy={h.y}
                  r={28}
                  fill="transparent"
                />
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

        {/* === Layer 4: stars === */}
        <g
          style={{
            opacity: starOpacity,
            transition: "opacity 1200ms var(--ease-cosmos)",
          }}
        >
          {graph.stars.map((s) => {
            const tier = bookCompletion(s.book);
            const isCurrent = currentStar?.id === s.id;
            const isHighlighted = highlightedStarIds.has(s.id);
            const dim = hasSelection && !isHighlighted && !isCurrent;
            const isLit = tier >= 1; // 1+ keyword answered = "read"

            // Sizing — tier 0 is markedly smaller, tier 3 noticeably bigger
            const r = isCurrent ? 5.5 : tier === 3 ? 4 : tier >= 1 ? 3 : 2;
            // Tier 0 still gets a faint halo so users see it's a real book, not a decorative dot
            const haloR = isCurrent ? 22 : tier === 3 ? 18 : tier >= 1 ? 11 : 6;

            // Color: current = bright blue; lit = warm white; unread = faint grey
            const fill = isCurrent
              ? "#E8F0FF"
              : isHighlighted
              ? "#FFFFFF"
              : isLit
              ? "#F4F4ED"
              : "#5A6B8E"; // dim grey-blue for unread

            // Base opacity per state
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
            // Cross spikes for fully-read / current — gives a real "star" silhouette
            const spikes = (tier === 3 || isCurrent) && !dim;
            const spikeLen = isCurrent ? 14 : 11;
            const spikeColor = isCurrent ? "#B8D0FF" : "#F4F4ED";

            // Subtle ambient shimmer for all lit stars (current uses pulse-glow instead)
            const shimmer = isLit && !isCurrent;

            return (
              <g
                key={s.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setFocusStarId(s.id);
                  onActiveChange(null);
                  setOpenBookId(s.id);
                }}
                style={{ cursor: "pointer" }}
              >
                {showHalo && (
                  <circle
                    cx={s.x}
                    cy={s.y}
                    r={haloR}
                    fill={haloFill}
                    className={isCurrent || tier === 3 ? "star-halo-breathe" : undefined}
                    style={{
                      animationDelay: isCurrent || tier === 3 ? `${twinkleDelay(s.id)}s` : undefined,
                    }}
                  />
                )}
                {spikes && (
                  <g
                    opacity={isCurrent ? 0.7 : 0.5}
                    style={{ mixBlendMode: "screen" }}
                  >
                    <line
                      x1={s.x - spikeLen}
                      y1={s.y}
                      x2={s.x + spikeLen}
                      y2={s.y}
                      stroke={spikeColor}
                      strokeWidth={0.6}
                      strokeLinecap="round"
                    />
                    <line
                      x1={s.x}
                      y1={s.y - spikeLen}
                      x2={s.x}
                      y2={s.y + spikeLen}
                      stroke={spikeColor}
                      strokeWidth={0.6}
                      strokeLinecap="round"
                    />
                  </g>
                )}
                {/* invisible hit area */}
                <circle cx={s.x} cy={s.y} r={14} fill="transparent" />
                <circle
                  cx={s.x}
                  cy={s.y}
                  r={r}
                  fill={fill}
                  opacity={baseOp}
                  className={
                    isCurrent
                      ? "pulse-glow"
                      : shimmer
                      ? "star-shimmer"
                      : undefined
                  }
                  style={{
                    animationDelay: shimmer ? `${twinkleDelay(s.id)}s` : undefined,
                    ...(shimmer
                      ? ({
                          ["--star-base-op" as never]: baseOp,
                        } as React.CSSProperties)
                      : {}),
                    transition: "opacity 600ms var(--ease-cosmos)",
                  }}
                />
              </g>
            );
          })}
        </g>
      </svg>

      <BookSheet
        book={openBook}
        onClose={() => setOpenBookId(null)}
        getBook={(id) => books.find((b) => b.id === id)}
      />
      {isLone && mode === "explore" && (
        <div
          className="pointer-events-none absolute inset-x-0 top-[58%] z-20 flex justify-center"
        >
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
