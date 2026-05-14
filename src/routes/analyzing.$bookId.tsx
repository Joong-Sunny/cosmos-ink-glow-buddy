import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Sparkle } from "lucide-react";
import { useUniverseStore } from "@/lib/store";
import { FloatingPanel } from "@/components/layout/FloatingPanel";

export const Route = createFileRoute("/analyzing/$bookId")({
  head: () => ({
    meta: [{ title: "분석 중 · 반짝북짝" }],
  }),
  component: AnalyzingPage,
});

function AnalyzingPage() {
  const { bookId } = Route.useParams();
  const navigate = useNavigate();
  const book = useUniverseStore((s) => s.books.find((b) => b.id === bookId));

  useEffect(() => {
    const t = window.setTimeout(() => {
      navigate({ to: "/questions/$bookId", params: { bookId } });
    }, 2800);
    return () => window.clearTimeout(t);
  }, [bookId, navigate]);

  const title = book?.title ?? "동물농장";
  const author = book?.author ?? "George Orwell";

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center px-6 py-12">
      <div className="fixed left-10 top-8 z-20 flex items-center gap-2">
        <Sparkle
          size={12}
          fill="currentColor"
          strokeWidth={0}
          className="twinkle text-[var(--star-active)]"
        />
        <span className="font-display text-[14px] text-[var(--ink-primary)]">반짝북짝</span>
      </div>

      <FloatingPanel maxWidthClass="max-w-[480px]" padding="px-10 py-14">
        <div className="flex flex-col items-center">
          <BookCover title={title} author={author} />
          <div className="mt-10 flex flex-col items-center text-center">
            <div className="text-meta text-[var(--gold)]" style={{ letterSpacing: "0.2em" }}>
              ANALYZING
            </div>
            <p className="mt-6 font-display text-[22px] tracking-[-0.02em] text-[var(--ink-primary)]">
              AI가 책을 분석하고 있습니다
            </p>
            <div className="mt-4 flex items-center gap-2 text-[var(--ink-secondary)]">
              <Dot delay="0s" />
              <Dot delay="0.3s" />
              <Dot delay="0.6s" />
            </div>
          </div>
        </div>
      </FloatingPanel>
    </main>
  );
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="twinkle inline-block h-[6px] w-[6px] rounded-full bg-current"
      style={{ animationDelay: delay, fontSize: 12 }}
    />
  );
}

function BookCover({ title, author }: { title: string; author: string }) {
  return (
    <div className="relative">
      {/* Outer breathing blue halo (this will become a star) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-12 rounded-[32px]"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(143,184,255,0.55) 0%, rgba(143,184,255,0.18) 40%, rgba(143,184,255,0) 75%)",
          animation: "cover-breathe 2.5s ease-in-out infinite",
        }}
      />
      {/* Inner gold spine glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-3 top-0 h-full w-3 rounded-l-[8px]"
        style={{
          background:
            "linear-gradient(180deg, rgba(244,212,161,0.55) 0%, rgba(232,181,71,0.4) 50%, rgba(138,104,22,0.2) 100%)",
          filter: "blur(8px)",
          animation: "cover-breathe 2.5s ease-in-out infinite",
        }}
      />
      <svg
        width={130}
        height={180}
        viewBox="0 0 130 180"
        className="relative drop-shadow-[0_0_38px_rgba(143,184,255,0.45)]"
      >
        <defs>
          <linearGradient id="coverGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1B2548" />
            <stop offset="55%" stopColor="#0F1733" />
            <stop offset="100%" stopColor="#0A0F22" />
          </linearGradient>
          <linearGradient id="spineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F4D4A1" />
            <stop offset="50%" stopColor="#E8B547" />
            <stop offset="100%" stopColor="#8A6816" />
          </linearGradient>
        </defs>
        {/* Cover */}
        <rect x="0" y="0" width="130" height="180" rx="3" fill="url(#coverGrad)" />
        {/* Inner border accent */}
        <rect
          x="10"
          y="10"
          width="110"
          height="160"
          rx="1.5"
          fill="none"
          stroke="rgba(244,244,237,0.08)"
          strokeWidth={0.6}
        />
        {/* Gold spine on left */}
        <rect x="0" y="0" width="6" height="180" fill="url(#spineGrad)" />
        {/* Tiny constellation marks */}
        <circle cx="32" cy="42" r="1" fill="#F4F4ED" opacity="0.6" />
        <circle cx="44" cy="58" r="0.8" fill="#F4F4ED" opacity="0.5" />
        <circle cx="92" cy="38" r="1" fill="#F4F4ED" opacity="0.55" />
        <line
          x1="32"
          y1="42"
          x2="44"
          y2="58"
          stroke="#F4F4ED"
          strokeOpacity="0.25"
          strokeWidth="0.4"
        />
        {/* Title */}
        <text
          x="65"
          y="92"
          textAnchor="middle"
          fill="#F4F4ED"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 20,
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </text>
        {/* Author */}
        <text
          x="65"
          y="138"
          textAnchor="middle"
          fill="#9AA0BD"
          style={{
            fontFamily: "var(--font-display-italic)",
            fontStyle: "italic",
            fontSize: 11,
          }}
        >
          {author}
        </text>
      </svg>
    </div>
  );
}
