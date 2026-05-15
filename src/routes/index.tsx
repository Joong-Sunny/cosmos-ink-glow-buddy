import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { HomeHeader } from "@/components/home/HomeHeader";
import { AddStarFab } from "@/components/home/AddStarFab";
import { UniverseView } from "@/components/home/UniverseView";
import { RegisterModal } from "@/components/home/RegisterModal";
import { useUiStore } from "@/lib/ui-store";

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
  // mode + universe selection live in ui-store so they survive in-app
  // navigation (e.g. clicking 도감 → back, or opening RegisterModal → cancel).
  const mode = useUiStore((s) => s.homeMode);
  const setMode = useUiStore((s) => s.setHomeMode);

  // intro star brightness staging is purely visual — local state is fine
  const [introStarOpacity, setIntroStarOpacity] = useState(0.15);
  const [showCopy, setShowCopy] = useState(mode === "intro");
  const [showCta, setShowCta] = useState(mode === "intro");

  useEffect(() => {
    if (mode !== "intro") return;
    const t1 = window.setTimeout(() => setIntroStarOpacity(0.35), 600);
    const t2 = window.setTimeout(() => setShowCopy(true), 1800);
    const t3 = window.setTimeout(() => setShowCta(true), 2600);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [mode]);

  function enterExplore() {
    setShowCopy(false);
    setShowCta(false);
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
        <UniverseView mode={mode} starOpacity={starOpacity} />
      </section>

      {mode === "explore" && <AddStarFab />}

      {/* Register popup — opens via AddStarFab. No route change so the
          universe state (active keyword, explore mode) stays intact. */}
      <RegisterModal />

      {/* Intro literary overlay */}
      {mode === "intro" && (
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
                fontSize: 32,
                lineHeight: 1.5,
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
              className="mt-10 text-base"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.2em",
                color: "var(--gold-soft)",
                opacity: 0.85,
                textTransform: "uppercase",
              }}
            >
              청소년 AI 독서 관리 플랫폼 · 반짝북짝
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
      )}
    </main>
  );
}
