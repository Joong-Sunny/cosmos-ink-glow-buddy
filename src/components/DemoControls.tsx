import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Settings2, X, RotateCcw, Sparkles } from "lucide-react";
import { useUniverseStore } from "@/lib/store";

type Stop = {
  to: string;
  label: string;
  params?: Record<string, string>;
};

const STOPS: Stop[] = [
  { to: "/", label: "홈" },
  { to: "/register", label: "등록" },
  { to: "/analyzing/$bookId", label: "분석", params: { bookId: "b01" } },
  { to: "/questions/$bookId", label: "질문", params: { bookId: "b01" } },
  {
    to: "/answer/$bookId/$questionId",
    label: "답변",
    params: { bookId: "b01", questionId: "q1" },
  },
  { to: "/star-born/$bookId", label: "별생성", params: { bookId: "b01" } },
  {
    to: "/constellation/$keyword",
    label: "별자리",
    params: { keyword: "사회·정의" },
  },
  { to: "/worldview-new", label: "카드" },
  { to: "/worldview", label: "도감" },
  { to: "/search", label: "꺼내기" },
  { to: "/closing", label: "클로징" },
];

function findCurrentIndex(pathname: string): number {
  const match = STOPS.findIndex((s) => {
    const re = s.to.replace(/\$\w+/g, "[^/]+");
    return new RegExp(`^${re}$`).test(pathname);
  });
  return match;
}

export function DemoControls() {
  const navigate = useNavigate();
  const location = useLocation();
  const demoMode = useUniverseStore((s) => s.demoMode);
  const setDemoMode = useUniverseStore((s) => s.setDemoMode);
  const simSpeed = useUniverseStore((s) => s.simSpeed);
  const setSimSpeed = useUniverseStore((s) => s.setSimSpeed);
  const autoAdvance = useUniverseStore((s) => s.autoAdvance);
  const setAutoAdvance = useUniverseStore((s) => s.setAutoAdvance);
  const autoSimEnabled = useUniverseStore((s) => s.autoSimEnabled);
  const setAutoSimEnabled = useUniverseStore((s) => s.setAutoSimEnabled);
  const resetUniverse = useUniverseStore((s) => s.resetUniverse);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowRight") {
        const i = findCurrentIndex(location.pathname);
        const next = STOPS[Math.min(STOPS.length - 1, (i < 0 ? -1 : i) + 1)];
        if (next) navigate({ to: next.to, params: next.params } as never);
      } else if (e.key === "ArrowLeft") {
        const i = findCurrentIndex(location.pathname);
        const prev = STOPS[Math.max(0, (i < 0 ? 1 : i) - 1)];
        if (prev) navigate({ to: prev.to, params: prev.params } as never);
      } else if (e.key === "r" || e.key === "R") {
        resetUniverse();
        setToast("우주 리셋");
        setTimeout(() => setToast(null), 1200);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [location.pathname, navigate, resetUniverse]);

  if (!demoMode) {
    // Tiny gear so we can re-enable demo mode
    return (
      <button
        onClick={() => setDemoMode(true)}
        aria-label="시연 모드 켜기"
        className="fixed bottom-3 right-3 z-50 flex h-8 w-8 items-center justify-center rounded-full opacity-30 hover:opacity-100"
        style={{
          background: "rgba(7,9,26,0.6)",
          border: "1px solid var(--ink-faint)",
          color: "var(--ink-secondary)",
          backdropFilter: "blur(8px)",
        }}
      >
        <Settings2 size={14} />
      </button>
    );
  }

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="시연자 컨트롤 열기"
          className="fixed bottom-3 right-3 z-50 flex h-9 w-9 items-center justify-center rounded-full"
          style={{
            background: "rgba(7,9,26,0.85)",
            border: "1px solid var(--ink-faint)",
            color: "var(--gold)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 6px 18px -8px rgba(0,0,0,0.6)",
          }}
        >
          <Settings2 size={16} />
        </button>
      )}

      {open && (
        <div
          className="fixed bottom-3 right-3 z-50 w-[260px] overflow-hidden rounded-2xl"
          style={{
            background: "rgba(7,9,26,0.92)",
            border: "1px solid var(--ink-faint)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            boxShadow: "0 24px 60px -20px rgba(0,0,0,0.7)",
          }}
        >
          <div
            className="flex items-center justify-between px-3 py-2"
            style={{ borderBottom: "1px solid var(--ink-faint)" }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                letterSpacing: "0.2em",
                color: "var(--gold)",
              }}
            >
              DEMO · CONTROL
            </span>
            <button
              onClick={() => setOpen(false)}
              aria-label="닫기"
              style={{ color: "var(--ink-muted)" }}
            >
              <X size={14} />
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-3">
            <Section label="JUMP">
              <ul className="grid grid-cols-3 gap-1">
                {STOPS.map((s) => (
                  <li key={s.label}>
                    <Link
                      to={s.to as never}
                      params={(s.params ?? {}) as never}
                      onClick={() => setOpen(false)}
                      className="block rounded-md px-2 py-1.5 text-center"
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: 11,
                        color: "var(--ink-secondary)",
                        background: "rgba(15,20,40,0.6)",
                        border: "1px solid var(--ink-faint)",
                      }}
                      activeProps={{
                        style: {
                          color: "var(--gold)",
                          borderColor: "var(--gold)",
                          background: "rgba(232,181,71,0.08)",
                        },
                      }}
                      activeOptions={{ exact: true }}
                    >
                      {s.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </Section>

            <Section label="SPEED">
              <div className="flex gap-1">
                {([0.5, 1, 2] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSimSpeed(s)}
                    className="flex-1 rounded-md py-1.5"
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: simSpeed === s ? "var(--bg-deep)" : "var(--ink-secondary)",
                      background: simSpeed === s ? "var(--gold)" : "rgba(15,20,40,0.6)",
                      border: "1px solid var(--ink-faint)",
                    }}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </Section>

            <Section label="AUTO ADVANCE">
              <button
                onClick={() => setAutoAdvance(!autoAdvance)}
                className="w-full rounded-md py-1.5"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: autoAdvance ? "var(--bg-deep)" : "var(--ink-secondary)",
                  background: autoAdvance ? "var(--gold)" : "rgba(15,20,40,0.6)",
                  border: "1px solid var(--ink-faint)",
                }}
              >
                {autoAdvance ? "ON" : "OFF"}
              </button>
            </Section>

            <Section label="자동 답변 시뮬레이션">
              <button
                onClick={() => setAutoSimEnabled(!autoSimEnabled)}
                className="w-full rounded-md py-1.5"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: autoSimEnabled ? "var(--bg-deep)" : "var(--ink-secondary)",
                  background: autoSimEnabled ? "var(--gold)" : "rgba(15,20,40,0.6)",
                  border: "1px solid var(--ink-faint)",
                }}
              >
                {autoSimEnabled ? "ON · 자동 타이핑" : "OFF · 직접 입력"}
              </button>
            </Section>

            <Section label="STATE">
              <button
                onClick={() => {
                  resetUniverse();
                  setToast("기존 우주로 되돌림");
                  setTimeout(() => setToast(null), 1400);
                }}
                className="flex w-full items-center justify-center gap-1.5 rounded-md py-1.5"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 11,
                  color: "var(--ink-secondary)",
                  background: "rgba(15,20,40,0.6)",
                  border: "1px solid var(--ink-faint)",
                }}
              >
                <RotateCcw size={12} />
                기존 우주로 되돌리기
              </button>
            </Section>

            <Section label="SCENARIO">
              <button
                onClick={() => {
                  setOpen(false);
                  navigate({ to: "/worldview-new" });
                }}
                className="flex w-full items-center justify-center gap-1.5 rounded-md py-1.5"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 11,
                  color: "var(--bg-deep)",
                  background: "var(--gold)",
                  border: "1px solid var(--gold)",
                }}
              >
                <Sparkles size={12} />
                3번째 세계관 카드 발급
              </button>
            </Section>

            <Section label="MODE">
              <button
                onClick={() => {
                  setDemoMode(false);
                  setOpen(false);
                }}
                className="w-full rounded-md py-1.5"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  letterSpacing: "0.15em",
                  color: "var(--ink-muted)",
                  background: "transparent",
                  border: "1px dashed var(--ink-faint)",
                }}
              >
                일반 사용자 모드
              </button>
            </Section>

            <p
              className="mt-2"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 8.5,
                letterSpacing: "0.1em",
                color: "var(--ink-muted)",
                lineHeight: 1.6,
              }}
            >
              ← / → 이동 · R 리셋
            </p>
          </div>
        </div>
      )}

      {toast && (
        <div
          className="pointer-events-none fixed bottom-16 right-3 z-50 rounded-md px-3 py-1.5"
          style={{
            background: "rgba(7,9,26,0.9)",
            border: "1px solid var(--ink-faint)",
            color: "var(--gold)",
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.1em",
            backdropFilter: "blur(8px)",
            animation: "rise 0.3s var(--ease-cosmos)",
          }}
        >
          {toast}
        </div>
      )}
    </>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: import("react").ReactNode;
}) {
  return (
    <div className="mt-2 first:mt-0">
      <div
        className="mb-1.5"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 8.5,
          letterSpacing: "0.2em",
          color: "var(--ink-muted)",
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}
