import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/constellation/$keyword")({
  component: Page,
});

/** 시연용 "권력 별자리" 6개 별. 중심별(동물농장) + 5개 흰별. */
const CENTER = { id: "b01", title: "동물농장", x: 720, y: 420 };

const BRANCHES: Array<{
  id: string;
  title: string;
  x: number;
  y: number;
  /** stagger 등장 시점 (s) */
  delay: number;
}> = [
  { id: "b1984", title: "1984", x: 480, y: 250, delay: 0.4 },
  { id: "b11", title: "우리들의 일그러진 영웅", x: 960, y: 250, delay: 0.7 },
  { id: "bgiver", title: "기억 전달자", x: 1080, y: 480, delay: 1.0 },
  { id: "bmocking", title: "앵무새 죽이기", x: 900, y: 660, delay: 1.3 },
  { id: "bsuho", title: "수호의 파수꾼", x: 520, y: 600, delay: 1.6 },
];

/** 열린 트리 — 상·우하·좌하 세 방향의 후보 가지. */
const CANDIDATES: Array<{
  x: number;
  y: number;
  /** 가지의 시작점 (중심별 반경 바깥에서) */
  start: { x: number; y: number };
  label?: string;
}> = [
  { start: { x: 720, y: 380 }, x: 720, y: 130, label: "다음 별?" }, // 상
  { start: { x: 760, y: 460 }, x: 1240, y: 760 }, // 우하
  { start: { x: 680, y: 460 }, x: 200, y: 760 }, // 좌하
];

function Page() {
  const { keyword } = Route.useParams();
  const navigate = useNavigate();
  const [ctaVisible, setCtaVisible] = useState(false);

  // 자동 이동 제거 — CTA만 6초 후 등장.
  useEffect(() => {
    const t = window.setTimeout(() => setCtaVisible(true), 6000);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      {/* Top bar */}
      <header className="fixed inset-x-0 top-0 z-20 flex items-center justify-between px-10 py-6">
        <Link
          to="/"
          className="grid h-10 w-10 place-items-center rounded-full border border-[var(--ink-faint)] bg-[var(--bg-elevated)]/40 text-[var(--ink-secondary)] backdrop-blur-md hover:text-[var(--star-active)]"
          aria-label="홈으로"
        >
          <ArrowLeft size={20} />
        </Link>
        <div
          className="text-center"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.2em",
            color: "var(--gold)",
          }}
        >
          CONSTELLATION · {keyword}
        </div>
        <div className="w-10" />
      </header>

      {/* Header text */}
      <div className="fixed left-1/2 top-24 z-10 -translate-x-1/2 text-center">
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 28,
            color: "var(--ink-primary)",
          }}
        >
          {keyword}의{" "}
          <em
            style={{
              fontFamily: "var(--font-display-italic)",
              fontStyle: "italic",
              color: "var(--gold-soft)",
            }}
          >
            별자리
          </em>
        </h1>
      </div>

      {/* SVG universe */}
      <ConstellationCanvas keyword={keyword} />

      {/* CTA — 6초 후 등장, 자동 이동 없음 */}
      <button
        onClick={() => navigate({ to: "/worldview-new" })}
        className="fixed bottom-10 right-10 z-20 flex items-center gap-2 rounded-full px-5 py-3 active:scale-[0.98]"
        style={{
          border: "1px solid var(--gold)",
          background: "rgba(232,181,71,0.08)",
          color: "var(--gold)",
          fontFamily: "var(--font-body)",
          fontSize: 13,
          backdropFilter: "blur(10px)",
          opacity: ctaVisible ? 1 : 0,
          transform: ctaVisible ? "translateY(0)" : "translateY(8px)",
          transition:
            "opacity 0.6s var(--ease-cosmos), transform 0.6s var(--ease-cosmos)",
          pointerEvents: ctaVisible ? "auto" : "none",
        }}
      >
        새로운 세계관 카드가 도착했어요 →
      </button>
    </main>
  );
}

function ConstellationCanvas({ keyword }: { keyword: string }) {
  return (
    <svg
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid meet"
      className="absolute inset-0 z-0 h-full w-full"
    >
      <defs>
        <radialGradient id="csCenterHalo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#8FB8FF" stopOpacity="0.55" />
          <stop offset="60%" stopColor="#8FB8FF" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#8FB8FF" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="csCenterCore" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#E8F0FF" stopOpacity="1" />
          <stop offset="60%" stopColor="#8FB8FF" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#5A78C2" stopOpacity="0.55" />
        </radialGradient>
        <radialGradient id="csOuterHalo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F4F4ED" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#F4F4ED" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* === Tree branches: center → outer (절대 별끼리 직접 연결하지 않음) === */}
      {BRANCHES.map((b) => (
        <g
          key={`line-${b.id}`}
          style={{
            opacity: 0,
            animation: `csLineDraw 0.6s var(--ease-cosmos) ${b.delay.toFixed(
              2,
            )}s forwards`,
            transformOrigin: `${CENTER.x}px ${CENTER.y}px`,
          }}
        >
          <line
            x1={CENTER.x}
            y1={CENTER.y}
            x2={b.x}
            y2={b.y}
            stroke="var(--constellation)"
            strokeOpacity={0.55}
            strokeWidth={0.7}
          />
        </g>
      ))}

      {/* === Outer stars (5개 흰별) === */}
      {BRANCHES.map((b) => (
        <g
          key={`star-${b.id}`}
          style={{
            opacity: 0,
            animation: `csStarRise 0.6s var(--ease-cosmos) ${(b.delay + 0.1).toFixed(
              2,
            )}s forwards`,
          }}
        >
          <circle cx={b.x} cy={b.y} r={20} fill="url(#csOuterHalo)" opacity={0.7} />
          <circle
            cx={b.x}
            cy={b.y}
            r={8}
            fill="var(--constellation)"
            className="twinkle"
            style={{ animationDelay: `${(b.delay * 0.5).toFixed(2)}s` }}
          />
          <text
            x={b.x}
            y={b.y + 26}
            textAnchor="middle"
            fill="var(--ink-secondary)"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 14,
            }}
          >
            {b.title}
          </text>
        </g>
      ))}

      {/* === Candidate branches (점선, 3개) — T+2.5s === */}
      {CANDIDATES.map((c, i) => (
        <g
          key={`cand-${i}`}
          style={{
            opacity: 0,
            animation: `csStarRise 0.7s var(--ease-cosmos) ${(2.5 + i * 0.15).toFixed(
              2,
            )}s forwards`,
          }}
        >
          <line
            x1={c.start.x}
            y1={c.start.y}
            x2={c.x}
            y2={c.y}
            stroke="var(--ink-muted)"
            strokeWidth={0.6}
            strokeDasharray="3 6"
            opacity={0.55}
          />
          <circle cx={c.x} cy={c.y} r={2.5} fill="#8FB8FF" opacity={0.4} />
          {c.label && (
            <text
              x={c.x}
              y={c.y - 14}
              textAnchor="middle"
              fill="var(--gold-deep)"
              opacity={0.5}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.15em",
              }}
            >
              {c.label}
            </text>
          )}
        </g>
      ))}

      {/* === Center star (동물농장) — 최우선 등장 + pulse === */}
      <g
        style={{
          animation: "csCenterRise 0.7s var(--ease-cosmos) 0.0s both",
        }}
      >
        <circle
          cx={CENTER.x}
          cy={CENTER.y}
          r={72}
          fill="url(#csCenterHalo)"
        />
        <circle
          cx={CENTER.x}
          cy={CENTER.y}
          r={24}
          fill="url(#csCenterCore)"
          className="pulse-glow"
          style={{ animationDuration: "2.5s" }}
        />
        <text
          x={CENTER.x}
          y={CENTER.y + 52}
          textAnchor="middle"
          fill="var(--star-active)"
          style={{
            fontFamily: "var(--font-display-italic)",
            fontStyle: "italic",
            fontSize: 16,
          }}
        >
          {CENTER.title}
        </text>
      </g>

      {/* Bottom meta */}
      <text
        x={720}
        y={870}
        textAnchor="middle"
        fill="var(--ink-muted)"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          letterSpacing: "0.2em",
        }}
      >
        {keyword}의 별자리 · 6 STARS CONNECTED · 3 BRANCHES OPEN
      </text>

      <style>{`
        @keyframes csCenterRise {
          0%   { opacity: 0; transform: scale(0.7); transform-origin: ${CENTER.x}px ${CENTER.y}px; }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes csLineDraw {
          0%   { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes csStarRise {
          0%   { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </svg>
  );
}
