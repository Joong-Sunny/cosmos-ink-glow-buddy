import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/constellation/$keyword")({
  component: Page,
});

function Page() {
  const { keyword } = Route.useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const t = window.setTimeout(() => {
      navigate({ to: "/worldview-new" });
    }, 5000);
    return () => window.clearTimeout(t);
  }, [navigate]);

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

      {/* Universe canvas (already wide) */}
      <ConstellationCanvas keyword={keyword} />

      {/* Indicator → worldview */}
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
        <radialGradient id="csCenter" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F4F4ED" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#F4F4ED" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* core 5-star pentagon (권력) */}
      <g>
        {[
          [580, 320],
          [720, 240],
          [880, 320],
          [820, 500],
          [640, 500],
        ].map(([x, y], i) => (
          <line
            key={i}
            x1={x}
            y1={y}
            x2={[720, 880, 820, 640, 580][i]}
            y2={[240, 320, 500, 500, 320][i]}
            stroke="var(--constellation)"
            strokeOpacity={0.6}
            strokeWidth={1.4}
          />
        ))}
        {[
          [580, 320],
          [720, 240],
          [880, 320],
          [820, 500],
          [640, 500],
        ].map(([x, y], i) => (
          <g key={`s${i}`}>
            <circle cx={x} cy={y} r={20} fill="url(#csCenter)" opacity={0.7} />
            <circle
              cx={x}
              cy={y}
              r={9}
              fill="var(--constellation)"
              className="twinkle"
              style={{ animationDelay: `${(i * 0.3).toFixed(2)}s` }}
            />
          </g>
        ))}
        {/* Center new star */}
        <circle cx={730} cy={400} r={44} fill="url(#csCenter)" />
        <circle cx={730} cy={400} r={14} fill="#F4F4ED" className="pulse-glow" />
        <text
          x={730}
          y={448}
          textAnchor="middle"
          fill="var(--gold-soft)"
          style={{
            fontFamily: "var(--font-display-italic)",
            fontStyle: "italic",
            fontSize: 14,
          }}
        >
          동물농장
        </text>
      </g>
      {/* Open candidate branches */}
      {[
        [880, 320, 1080, 220],
        [820, 500, 1020, 640],
        [580, 320, 380, 220],
      ].map(([x1, y1, x2, y2], i) => (
        <g key={`c${i}`}>
          <line
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="var(--ink-muted)"
            strokeWidth={1}
            className="flow"
          />
          <circle
            cx={x2}
            cy={y2}
            r={6}
            fill="var(--ink-muted)"
            className="twinkle"
            style={{ animationDelay: `${1 + i * 0.4}s`, opacity: 0.6 }}
          />
        </g>
      ))}
      <style>{`
        @keyframes flow { to { stroke-dashoffset: -10; } }
        .flow { stroke-dasharray: 2 3; animation: flow 6s linear infinite; }
      `}</style>
      <text
        x={730}
        y={870}
        textAnchor="middle"
        fill="var(--ink-muted)"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          letterSpacing: "0.2em",
        }}
      >
        {keyword.toUpperCase()} · 5 STARS · 3 BRANCHES OPEN
      </text>
    </svg>
  );
}
