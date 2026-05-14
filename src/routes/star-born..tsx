import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useUniverseStore } from "@/lib/store";
import { DONGMUL_QUESTIONS, SIMULATED_ANSWERS } from "@/lib/dongmul-nongjang-data";

export const Route = createFileRoute("/star-born/")({
  component: Page,
});

const KEYWORDS = ["권력", "평등", "변화"];
const SUMMARY = "권력은 처음의 평등을 흔든다. 나폴레옹의 변화는 인간에게도 일어날 수 있다.";

function Page() {
  const { bookId } = Route.useParams();
  const navigate = useNavigate();
  const [exiting, setExiting] = useState(false);
  const playedRef = useRef(false);

  // Persist state on mount (idempotent)
  useEffect(() => {
    if (playedRef.current) return;
    playedRef.current = true;
    const state = useUniverseStore.getState();
    const exists = state.books.some((b) => b.id === bookId);
    if (!exists) {
      state.addBook({
        id: bookId,
        title: "동물농장",
        author: "George Orwell",
        coverColor: "#C9543B",
        keywords: ["권력", "평등", "변화"],
        registeredAt: new Date().toISOString(),
        starState: "lit",
      });
    }
    // Push thread turns once
    const already = state.threads.some((t) => t.bookId === bookId);
    if (!already) {
      const now = Date.now();
      [DONGMUL_QUESTIONS[0], DONGMUL_QUESTIONS[1]].forEach((q, i) => {
        state.addThreadTurn({
          id: `${bookId}-${q.id}`,
          bookId,
          question: { ...q, bookId },
          answer: SIMULATED_ANSWERS[q.id] ?? "",
          createdAt: new Date(now + i).toISOString(),
        });
      });
    }
    state.setCurrentBook(bookId);

    // Tiny chime via Web Audio API at T+0.8s
    const t = setTimeout(() => {
      try {
        type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };
        const Ctx =
          typeof window !== "undefined"
            ? window.AudioContext ?? (window as WebkitWindow).webkitAudioContext
            : undefined;
        if (!Ctx) return;
        const ac = new Ctx();
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, ac.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1320, ac.currentTime + 0.6);
        gain.gain.setValueAtTime(0.0001, ac.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.08, ac.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.9);
        osc.connect(gain).connect(ac.destination);
        osc.start();
        osc.stop(ac.currentTime + 0.95);
      } catch {
        /* silent */
      }
    }, 800);
    return () => clearTimeout(t);
  }, [bookId]);

  const handleCta = () => {
    if (exiting) return;
    setExiting(true);
    setTimeout(() => {
      navigate({ to: "/constellation/$keyword", params: { keyword: "권력" } });
    }, 400);
  };

  return (
    <main
      className="fixed inset-0 z-20 overflow-hidden text-center"
      style={{
        background:
          "radial-gradient(circle at 50% 40%, #1A2A50 0%, #07091A 70%)",
      }}
    >
      <DenseStars />

      <div
        className="relative mx-auto flex h-full max-w-[430px] flex-col px-6"
        style={{
          opacity: exiting ? 0 : 1,
          transform: exiting ? "scale(1.1)" : "scale(1)",
          transition:
            "opacity 0.4s var(--ease-cosmos), transform 0.4s var(--ease-cosmos)",
          animation: "rise 0.4s var(--ease-cosmos) both",
        }}
      >
        {/* Top label T+0.3s */}
        <div
          className="text-meta mt-[max(env(safe-area-inset-top),16px)] pt-12"
          style={{
            color: "var(--gold)",
            letterSpacing: "0.3em",
            fontSize: 11,
            opacity: 0,
            animation: "rise 0.6s var(--ease-cosmos) 0.3s forwards",
          }}
        >
          A NEW STAR
        </div>

        {/* Header T+0.5s */}
        <h1
          className="mt-3"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 26,
            lineHeight: 1.35,
            color: "var(--ink-primary)",
            opacity: 0,
            animation: "rise 0.6s var(--ease-cosmos) 0.5s forwards",
          }}
        >
          오늘의 <em style={{ fontFamily: "var(--font-display-italic)", fontStyle: "italic", color: "var(--gold-soft)" }}>생각</em>이 별이 되었어요
        </h1>

        {/* Center star T+0.8s */}
        <div className="relative mx-auto mt-8" style={{ width: 240, height: 240 }}>
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              opacity: 0,
              animation:
                "starBirth 0.7s var(--ease-cosmos) 0.8s forwards",
            }}
          >
            <svg width={240} height={240} viewBox="0 0 240 240" className="pulse-glow rounded-full">
              <defs>
                <radialGradient id="sb-outer" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#8FB8FF" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#8FB8FF" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="sb-inner" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#B8D0FF" stopOpacity="0.55" />
                  <stop offset="100%" stopColor="#8FB8FF" stopOpacity="0" />
                </radialGradient>
              </defs>
              <circle cx="120" cy="120" r="120" fill="url(#sb-outer)" />
              <circle cx="120" cy="120" r="70" fill="url(#sb-inner)" />
              <circle cx="120" cy="120" r="28" fill="var(--star-active)" />
              <circle cx="120" cy="120" r="10" fill="#FFFFFF" opacity="0.85" />
            </svg>
          </div>
        </div>

        {/* Summary card T+1.6s */}
        <div
          className="mx-auto mt-6 w-full max-w-[360px] rounded-2xl px-5 py-4 text-left"
          style={{
            background: "rgba(19,26,50,0.6)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid var(--ink-faint)",
            borderLeft: "2px solid var(--star-active)",
            opacity: 0,
            animation: "rise 0.6s var(--ease-cosmos) 1.6s forwards",
            boxShadow: "0 0 30px rgba(143,184,255,0.10)",
          }}
        >
          <div
            className="text-meta"
            style={{ color: "var(--gold)", fontSize: 9, letterSpacing: "0.25em" }}
          >
            TODAY&apos;S THOUGHT
          </div>
          <p
            className="mt-2"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 14,
              lineHeight: 1.7,
              color: "var(--ink-primary)",
            }}
          >
            {SUMMARY}
          </p>
        </div>

        {/* Keyword chips T+1.9s */}
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {KEYWORDS.map((kw, i) => (
            <span
              key={kw}
              style={{
                opacity: 0,
                animation: `rise 0.5s var(--ease-cosmos) ${1.9 + i * 0.12}s forwards`,
                border: "1px solid var(--gold)",
                color: "var(--gold)",
                background: "rgba(232,181,71,0.08)",
                borderRadius: 16,
                padding: "6px 14px",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.05em",
              }}
            >
              #{kw}
            </span>
          ))}
        </div>

        <div className="flex-1" />

        {/* CTA T+2.4s */}
        <div
          className="mb-[max(env(safe-area-inset-bottom),20px)] flex justify-center pb-4"
          style={{
            opacity: 0,
            animation: "rise 0.6s var(--ease-cosmos) 2.4s forwards",
          }}
        >
          <button
            onClick={handleCta}
            className="w-[88%] active:scale-[0.98]"
            style={{
              height: 56,
              borderRadius: 28,
              background: "var(--gold)",
              color: "var(--bg-deep)",
              fontFamily: "var(--font-body)",
              fontSize: 16,
              fontWeight: 500,
              transition: "transform 0.2s var(--ease-cosmos)",
              boxShadow: "0 8px 30px rgba(232,181,71,0.25)",
            }}
          >
            별자리에서 만나기 →
          </button>
        </div>
      </div>

      <style>{`
        @keyframes starBirth {
          0%   { opacity: 0; transform: scale(0); }
          60%  { opacity: 1; transform: scale(1.2); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </main>
  );
}

function DenseStars() {
  // Deterministic dense starfield, some blue
  const stars = Array.from({ length: 90 }, (_, i) => {
    const r = mulberry(i + 1);
    return {
      x: r(),
      y: r(),
      s: 0.4 + r() * 1.6,
      blue: r() > 0.55,
      delay: r() * 2.5,
      op: 0.3 + r() * 0.6,
    };
  });
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      {stars.map((st, i) => (
        <circle
          key={i}
          cx={st.x * 100}
          cy={st.y * 100}
          r={st.s * 0.18}
          fill={st.blue ? "#8FB8FF" : "#F4F4ED"}
          opacity={st.op}
          className="twinkle"
          style={{ animationDelay: `${st.delay}s` }}
        />
      ))}
    </svg>
  );
}

function mulberry(seed: number) {
  let s = seed * 0x6d2b79f5;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
