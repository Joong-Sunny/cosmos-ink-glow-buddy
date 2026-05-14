import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { HomeHeader } from "@/components/home/HomeHeader";
import { AddStarFab } from "@/components/home/AddStarFab";
import { UniverseView } from "@/components/home/UniverseView";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "반짝북짝 · The Book Universe" },
      {
        name: "description",
        content: "별을 모아 별자리를 잇고, 별자리를 모아 나만의 세계관을 발견한다.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const [active, setActive] = useState<string | null>(null);
  const [mode, setMode] = useState<"intro" | "explore">("intro");
  // intro star brightness staging: 0.15 → 0.35
  const [introStarOpacity, setIntroStarOpacity] = useState(0.15);
  const [showCopy, setShowCopy] = useState(false);
  const [showCta, setShowCta] = useState(false);

  useEffect(() => {
    const t1 = window.setTimeout(() => setIntroStarOpacity(0.35), 600);
    const t2 = window.setTimeout(() => setShowCopy(true), 1800);
    const t3 = window.setTimeout(() => setShowCta(true), 2600);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, []);

  function enterExplore() {
    setShowCopy(false);
    setShowCta(false);
    // delay until copy fades, then brighten universe
    window.setTimeout(() => setMode("explore"), 450);
  }

  const starOpacity = mode === "intro" ? introStarOpacity : 0.75;

  return (
    <main
      className="relative h-screen w-screen overflow-hidden"
      style={{ background: "var(--bg-cosmos)" }}
    >
      {mode === "explore" && <HomeHeader />}

      <section className="absolute inset-0">
        <UniverseView
          active={active}
          onActiveChange={setActive}
          mode={mode}
          starOpacity={starOpacity}
        />
      </section>

      {mode === "explore" && <AddStarFab />}

      {/* Intro literary overlay */}
      <div
        aria-hidden={!showCopy}
        className="pointer-events-none fixed inset-0 z-20 flex items-center justify-center px-8 text-center"
        style={{
          opacity: showCopy ? 1 : 0,
          transition: "opacity 800ms var(--ease-cosmos)",
        }}
      >
        <div className="pointer-events-auto max-w-[820px]">
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 44,
              lineHeight: 1.45,
              color: "var(--ink-primary)",
              letterSpacing: "-0.01em",
            }}
          >
            별을 모아 별자리를 잇고,
            <br />
            별자리를 모아{" "}
            <em
              style={{
                fontFamily: "var(--font-display-italic)",
                fontStyle: "italic",
                color: "var(--gold-soft)",
              }}
            >
              나만의 세계관
            </em>
            을 발견한다.
          </p>

          <div
            className="mt-10"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.2em",
              color: "var(--gold-deep)",
              textTransform: "uppercase",
            }}
          >
            청소년 AI 독서 플랫폼 · 반짝북짝
          </div>

          <button
            onClick={enterExplore}
            className="mt-12"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 14,
              color: "var(--gold)",
              letterSpacing: "0.05em",
              opacity: showCta ? 1 : 0,
              transform: showCta ? "translateY(0)" : "translateY(8px)",
              transition:
                "opacity 700ms var(--ease-cosmos), transform 700ms var(--ease-cosmos)",
            }}
          >
            별자리 보기 →
          </button>
        </div>
      </div>
    </main>
  );
}
