import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/constellation/")({
  component: Page,
});

type StarNode = {
  id: string;
  title: string;
  cx: number;
  cy: number;
  delay: number;
};

const CENTER: StarNode = { id: "b01", title: "동물농장", cx: 195, cy: 250, delay: 0 };

const NEIGHBORS: StarNode[] = [
  { id: "n1", title: "1984", cx: 95, cy: 165, delay: 0.4 },
  { id: "n2", title: "시민의 불복종", cx: 200, cy: 110, delay: 1.1 },
  { id: "n3", title: "파리대왕", cx: 305, cy: 170, delay: 0.8 },
  { id: "n4", title: "멋진 신세계", cx: 110, cy: 370, delay: 1.5 },
  { id: "n5", title: "자유로부터", cx: 290, cy: 350, delay: 2.0 },
];

const CANDIDATES: { from: StarNode; tx: number; ty: number; r: number; op: number; delay: number }[] = [
  { from: NEIGHBORS[1], tx: 230, ty: 50, r: 1.8, op: 0.4, delay: 1.2 },
  { from: NEIGHBORS[2], tx: 370, ty: 230, r: 1.5, op: 0.35, delay: 1.8 },
  { from: NEIGHBORS[4], tx: 320, ty: 470, r: 1.5, op: 0.3, delay: 2.4 },
];

function Page() {
  const { keyword } = Route.useParams();
  const navigate = useNavigate();
  const [active, setActive] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Auto-trigger /worldview-new after 5s
  useEffect(() => {
    const t = setTimeout(() => {
      navigate({ to: "/worldview-new" }).catch(() => {});
    }, 5000);
    return () => clearTimeout(t);
  }, [navigate]);

  const renderStar = (n: StarNode, isCenter = false) => {
    const dim = active && active !== n.id;
    const isActive = active === n.id;
    const scale = isActive ? 1.2 : 1;
    return (
      <g
        key={n.id}
        onClick={(e) => {
          e.stopPropagation();
          setActive(n.id);
        }}
        style={{
          cursor: "pointer",
          opacity: dim ? 0.35 : 1,
          transition: "opacity 0.4s var(--ease-cosmos), transform 0.4s var(--ease-cosmos)",
          transformOrigin: `${n.cx}px ${n.cy}px`,
          transform: `scale(${scale})`,
        }}
      >
        {isCenter && (
          <>
            <circle cx={n.cx} cy={n.cy} r={30} fill="#8FB8FF" opacity={0.12} />
            <circle cx={n.cx} cy={n.cy} r={18} fill="#B8D0FF" opacity={0.3} />
            <circle cx={n.cx} cy={n.cy} r={8} fill="var(--star-active)" className="pulse-glow" />
          </>
        )}
        {!isCenter && (
          <circle
            cx={n.cx}
            cy={n.cy}
            r={isActive ? 6 : 4}
            fill="var(--constellation)"
            opacity={0.85}
            className="twinkle"
            style={{ animationDelay: `${n.delay}s` }}
          />
        )}
        <text
          x={n.cx}
          y={n.cy + (isCenter ? 36 : 18)}
          textAnchor="middle"
          fill={isCenter ? "var(--ink-primary)" : "var(--ink-secondary)"}
          opacity={isCenter ? 1 : 0.8}
          style={{
            fontFamily: "var(--font-display)",
            fontSize: isCenter ? 12 : 11,
          }}
        >
          {n.title}
        </text>
      </g>
    );
  };

  return (
    <main
      className="relative z-10 mx-auto flex min-h-screen max-w-[430px] flex-col"
      style={{ animation: "rise 0.6s var(--ease-cosmos) both" }}
      onClick={() => setActive(null)}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-30 px-4"
        style={{
          paddingTop: "max(env(safe-area-inset-top), 16px)",
          background: "rgba(7,9,26,0.6)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <div className="grid grid-cols-[40px_1fr_40px] items-center pb-3">
          <Link
            to="/"
            className="flex h-10 w-10 items-center justify-center rounded-full"
            style={{ color: "var(--ink-secondary)" }}
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="text-center">
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                letterSpacing: "0.25em",
                color: "var(--gold)",
              }}
            >
              CONSTELLATION · {keyword}
            </div>
          </div>
          <div />
        </div>
        <h1
          className="pb-3 text-center"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 24,
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
      </header>

      {/* SVG constellation */}
      <div className="relative flex-1 px-2">
        <svg
          viewBox="0 0 390 500"
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Active solid lines: center ↔ neighbors */}
          {NEIGHBORS.map((n) => (
            <line
              key={`l-${n.id}`}
              x1={CENTER.cx}
              y1={CENTER.cy}
              x2={n.cx}
              y2={n.cy}
              stroke="var(--constellation)"
              strokeOpacity={0.55}
              strokeWidth={0.7}
            />
          ))}

          {/* Expansion dashed branches */}
          {CANDIDATES.map((c, i) => (
            <g key={`c-${i}`}>
              <line
                x1={c.from.cx}
                y1={c.from.cy}
                x2={c.tx}
                y2={c.ty}
                stroke="var(--star-active)"
                strokeOpacity={0.35}
                strokeWidth={0.5}
                className="flow"
              />
              <circle
                cx={c.tx}
                cy={c.ty}
                r={c.r}
                fill="var(--star-active)"
                opacity={c.op}
                className="twinkle"
                style={{ animationDelay: `${c.delay}s`, cursor: "pointer" }}
                onClick={(e) => {
                  e.stopPropagation();
                  setToast("이 자리에 책 등록하기");
                  setTimeout(() => navigate({ to: "/register" }), 700);
                }}
              />
              <text
                x={c.tx}
                y={c.ty - 12}
                textAnchor="middle"
                fill="var(--ink-secondary)"
                opacity={0.5}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 7,
                  letterSpacing: "0.15em",
                }}
              >
                다음 별 ?
              </text>
            </g>
          ))}

          {/* Stars (rendered after lines so they sit on top) */}
          {NEIGHBORS.map((n) => renderStar(n))}
          {renderStar(CENTER, true)}
        </svg>

        <style>{`
          @keyframes flow { to { stroke-dashoffset: -10; } }
          .flow { stroke-dasharray: 2 3; animation: flow 6s linear infinite; }
        `}</style>
      </div>

      {/* Bottom card */}
      <div
        className="px-4"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 24px)" }}
      >
        <div
          className="rounded-2xl px-5 py-4"
          style={{
            background: "rgba(19,26,50,0.6)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid var(--ink-faint)",
            borderLeft: "2px solid var(--star-active)",
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 16,
                  color: "var(--ink-primary)",
                }}
              >
                동물농장 · George Orwell
              </div>
              <div
                className="mt-1.5"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 12,
                  color: "var(--ink-muted)",
                }}
              >
                5개 별 연결 · 마지막 별 &lsquo;오늘&rsquo;
              </div>
              <button
                className="mt-3"
                onClick={(e) => {
                  e.stopPropagation();
                  setToast("이 별의 생각 보기");
                }}
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 12,
                  color: "var(--gold)",
                }}
              >
                이 별의 생각 보기 →
              </button>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate({ to: "/worldview-new" }).catch(() => {});
              }}
              className="flex flex-col items-end gap-1.5 pt-0.5"
              style={{ minWidth: 92 }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 8,
                  letterSpacing: "0.18em",
                  color: "var(--gold)",
                  textAlign: "right",
                  lineHeight: 1.4,
                }}
              >
                12 STARS<br />CARD III SOON
              </div>
              <div
                className="h-[3px] w-[80px] overflow-hidden rounded-full"
                style={{ background: "rgba(232,181,71,0.15)" }}
              >
                <div
                  style={{
                    width: "88%",
                    height: "100%",
                    background: "var(--gold)",
                    boxShadow: "0 0 8px var(--gold)",
                  }}
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className="pointer-events-none fixed left-1/2 z-50 -translate-x-1/2 rounded-full px-4 py-2"
          style={{
            bottom: "max(env(safe-area-inset-bottom), 24px)",
            transform: "translate(-50%, -120%)",
            background: "rgba(15,20,40,0.92)",
            border: "1px solid var(--ink-faint)",
            color: "var(--ink-primary)",
            fontFamily: "var(--font-body)",
            fontSize: 12,
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            animation: "rise 0.4s var(--ease-cosmos)",
          }}
          onAnimationEnd={() => setTimeout(() => setToast(null), 1400)}
        >
          {toast}
        </div>
      )}
    </main>
  );
}
