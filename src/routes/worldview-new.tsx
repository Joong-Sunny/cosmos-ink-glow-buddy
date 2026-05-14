import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArcanumCard, CARD_III } from "@/components/worldview/ArcanumCard";
import { useUniverseStore } from "@/lib/store";

export const Route = createFileRoute("/worldview-new")({
  component: Page,
});

const NEW_CARD_ID = "wc-iii";

function Page() {
  const navigate = useNavigate();
  const [exiting, setExiting] = useState(false);

  const handleStore = () => {
    if (exiting) return;
    setExiting(true);
    const state = useUniverseStore.getState();
    if (!state.worldviewCards.some((c) => c.id === NEW_CARD_ID)) {
      state.addWorldviewCard({
        id: NEW_CARD_ID,
        romanNumeral: "III",
        nameKr: "스스로 빛나는 별",
        nameEn: "A STAR ALIGHT",
        arcanumType: "starAlight",
        quote: "내 안의 질문이 켜질 때, 별은 비로소 스스로 빛난다.",
        booksCount: 5,
        starsCount: 12,
        issuedAt: new Date().toISOString(),
        relatedKeyword: "권력",
        relatedBookIds: ["b01", "b04", "b10", "b15", "b16"],
      });
    }
    setTimeout(() => navigate({ to: "/worldview" }), 350);
  };

  const handleLater = () => navigate({ to: "/" });

  // Audio chime at T+1.2s
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        type WK = Window & { webkitAudioContext?: typeof AudioContext };
        const Ctx = window.AudioContext ?? (window as WK).webkitAudioContext;
        if (!Ctx) return;
        const ac = new Ctx();
        const osc = ac.createOscillator();
        const g = ac.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(660, ac.currentTime);
        osc.frequency.exponentialRampToValueAtTime(990, ac.currentTime + 0.8);
        g.gain.setValueAtTime(0.0001, ac.currentTime);
        g.gain.exponentialRampToValueAtTime(0.06, ac.currentTime + 0.05);
        g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 1.0);
        osc.connect(g).connect(ac.destination);
        osc.start();
        osc.stop(ac.currentTime + 1.05);
      } catch { /* silent */ }
    }, 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <main
      className="fixed inset-0 z-30 flex flex-col items-center overflow-hidden"
      style={{
        background: "rgba(4,6,15,0.95)",
        opacity: exiting ? 0 : 1,
        transition: "opacity 0.35s var(--ease-cosmos)",
        animation: "rise 0.4s var(--ease-cosmos) both",
      }}
    >
      <div className="mx-auto flex w-full max-w-[640px] flex-1 flex-col items-center px-6">
        {/* Top label T+0.4s */}
        <div
          className="text-meta mt-[max(env(safe-area-inset-top),20px)] pt-10"
          style={{
            color: "var(--gold)",
            fontSize: 11,
            letterSpacing: "0.2em",
            opacity: 0,
            animation: "rise 0.6s var(--ease-cosmos) 0.4s forwards",
          }}
        >
          A NEW WORLDVIEW CARD
        </div>

        {/* Header T+0.7s */}
        <h1
          className="mt-3 text-center"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 22,
            color: "var(--ink-primary)",
            opacity: 0,
            animation: "rise 0.6s var(--ease-cosmos) 0.7s forwards",
          }}
        >
          3번째{" "}
          <em
            style={{
              fontFamily: "var(--font-display-italic)",
              fontStyle: "italic",
              color: "var(--gold-soft)",
            }}
          >
            세계관 카드
          </em>
          가 도착했어요
        </h1>

        {/* Card T+1.2s */}
        <div className="relative mt-8 flex items-center justify-center">
          <div
            className="absolute inset-0 -z-0"
            style={{
              opacity: 0,
              animation: "cardGlow 1.4s var(--ease-cosmos) 1.2s forwards",
              background:
                "radial-gradient(circle at 50% 50%, rgba(232,181,71,0.45) 0%, rgba(232,181,71,0) 65%)",
              filter: "blur(8px)",
              borderRadius: 200,
            }}
          />
          <div
            style={{
              opacity: 0,
              animation: "cardArrive 1.0s var(--ease-cosmos) 1.2s forwards",
              transformOrigin: "center",
            }}
          >
            <ArcanumCard {...CARD_III} />
          </div>
        </div>

        {/* Caption T+2.5s */}
        <div
          className="mt-6 text-center"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 13,
            color: "var(--ink-secondary)",
            opacity: 0,
            animation: "rise 0.6s var(--ease-cosmos) 2.5s forwards",
          }}
        >
          이 카드를 도감에 더할까요?
        </div>

        <div className="flex-1" />

        {/* CTAs T+2.8s */}
        <div
          className="mb-[max(env(safe-area-inset-bottom),20px)] flex w-full items-center justify-between gap-3 pb-4"
          style={{
            opacity: 0,
            animation: "rise 0.6s var(--ease-cosmos) 2.8s forwards",
          }}
        >
          <button
            onClick={handleLater}
            className="px-4 py-3"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 14,
              color: "var(--ink-secondary)",
            }}
          >
            나중에
          </button>
          <button
            onClick={handleStore}
            className="flex-1 active:scale-[0.98]"
            style={{
              height: 52,
              borderRadius: 26,
              background: "var(--gold)",
              color: "var(--bg-deep)",
              fontFamily: "var(--font-body)",
              fontSize: 15,
              fontWeight: 500,
              transition: "transform 0.2s var(--ease-cosmos)",
              boxShadow: "0 8px 28px rgba(232,181,71,0.3)",
            }}
          >
            도감에 보관 →
          </button>
        </div>
      </div>

      <style>{`
        @keyframes cardArrive {
          0%   { opacity: 0; transform: scale(0.3) rotate(-8deg); }
          60%  { opacity: 1; transform: scale(1.04) rotate(1deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes cardGlow {
          0%   { opacity: 0; transform: scale(0.4); }
          50%  { opacity: 1; transform: scale(1.2); }
          100% { opacity: 0; transform: scale(1.5); }
        }
      `}</style>
    </main>
  );
}
