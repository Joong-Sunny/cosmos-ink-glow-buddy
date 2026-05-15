import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useUniverseStore } from "@/lib/store";
import { FloatingPanel } from "@/components/layout/FloatingPanel";
import { useSmartBack } from "@/hooks/use-smart-back";
import {
  getCardsForBook,
  LEVEL_META,
  type CardQuestion,
} from "@/lib/dongmul-nongjang-data";

export const Route = createFileRoute("/questions/$bookId")({
  head: () => ({ meta: [{ title: "질문 고르기 · 반짝북짝" }] }),
  component: QuestionsPage,
});

function QuestionsPage() {
  const { bookId } = Route.useParams();
  const navigate = useNavigate();
  const goBack = useSmartBack("/");
  const book = useUniverseStore((s) => s.books.find((b) => b.id === bookId));
  const cards = useMemo(() => getCardsForBook(book), [book]);
  const total = cards.length;
  const [selected, setSelected] = useState(0);
  const [igniting, setIgniting] = useState(false);

  const startX = useRef<number | null>(null);

  function pick(idx: number) {
    setSelected(Math.max(0, Math.min(total - 1, idx)));
  }
  function onTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (startX.current === null) return;
    const dx = e.changedTouches[0].clientX - startX.current;
    if (Math.abs(dx) > 40) pick(selected + (dx > 0 ? -1 : 1));
    startX.current = null;
  }
  function confirm() {
    if (igniting || total === 0) return;
    setIgniting(true);
    const q = cards[selected];
    window.setTimeout(() => {
      navigate({
        to: "/answer/$bookId/$questionId",
        params: { bookId, questionId: q.id },
      });
    }, 600);
  }

  const title = book?.title ?? "동물농장";
  const author = book?.author ?? "George Orwell";
  const arrivedLabel = `${total} QUESTION${total === 1 ? "" : "S"} ARRIVED`;

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center px-6 py-10">
      <button
        type="button"
        onClick={goBack}
        className="fixed left-8 top-8 z-20 grid h-10 w-10 place-items-center rounded-full border border-[var(--ink-faint)] bg-[var(--bg-elevated)]/40 text-[var(--ink-secondary)] backdrop-blur-md hover:text-[var(--star-active)]"
        aria-label="뒤로"
      >
        <ChevronLeft size={20} strokeWidth={1.5} />
      </button>

      <FloatingPanel maxWidthClass="max-w-[760px]" padding="px-12 py-12">
        <div
          className="text-center text-meta text-[var(--gold)]"
          style={{ letterSpacing: "0.2em" }}
        >
          {arrivedLabel}
        </div>

        <header className="mt-4 text-center">
          <h1 className="font-display text-[24px] leading-[1.35] tracking-[-0.02em] text-[var(--ink-primary)]">
            마음에 드는{" "}
            <span className="font-display-italic text-[var(--star-active)]">질문</span>
            을<br />하나 골라보세요
          </h1>
          <p className="text-caption mt-3 text-[var(--ink-muted)]">
            {title} · {author}
          </p>
        </header>

        <section
          className="relative mt-8 flex h-[340px] items-center justify-center"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onClick={(e) => e.stopPropagation()}
        >
          {cards.map((q, i) => {
            const offset = i - selected;
            const stride = total === 2 ? 55 : 65;
            return (
              <QuestionCard
                key={q.id}
                q={q}
                offset={offset}
                stride={stride}
                igniting={igniting && offset === 0}
                onTap={() => (offset === 0 ? confirm() : pick(i))}
              />
            );
          })}
        </section>

        <div className="mt-8 flex flex-col items-center">
          {total > 1 && (
            <div className="mb-6 flex items-center gap-2">
              {cards.map((_, i) => (
                <button
                  key={i}
                  onClick={() => pick(i)}
                  aria-label={`question ${i + 1}`}
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: i === selected ? 22 : 6,
                    background:
                      i === selected ? "var(--star-active)" : "var(--ink-faint)",
                  }}
                />
              ))}
            </div>
          )}
          <button
            onClick={confirm}
            className="h-14 w-full max-w-[400px] rounded-full font-medium text-[16px] transition-transform active:scale-[0.98]"
            style={{
              background: "var(--star-active)",
              color: "var(--bg-deep)",
              boxShadow: "0 0 28px rgba(143,184,255,0.35)",
            }}
          >
            이 질문으로 시작하기
          </button>
        </div>
      </FloatingPanel>
    </main>
  );
}

function QuestionCard({
  q,
  offset,
  stride,
  igniting,
  onTap,
}: {
  q: CardQuestion;
  offset: number;
  stride: number;
  igniting: boolean;
  onTap: () => void;
}) {
  const meta = LEVEL_META[q.level];
  const isCenter = offset === 0;

  const tx = offset * stride;
  const scale = isCenter ? (igniting ? 1.05 : 1) : 0.85;
  const rotate = offset * 6;
  const opacity = isCenter ? 1 : 0.4;
  const z = isCenter ? 3 : 1;

  return (
    <button
      onClick={onTap}
      className="absolute h-[300px] w-[220px] rounded-[18px] text-left transition-all duration-500"
      style={{
        transform: `translateX(${tx}%) scale(${scale}) rotate(${rotate}deg)`,
        transitionTimingFunction: "var(--ease-cosmos)",
        opacity,
        zIndex: z,
        background: "linear-gradient(180deg, #1A2240 0%, #0E1428 100%)",
        border: isCenter ? "1.5px solid var(--star-trail)" : "1px solid var(--ink-faint)",
        boxShadow: isCenter
          ? igniting
            ? "0 0 80px rgba(143,184,255,0.6)"
            : "0 0 40px rgba(143,184,255,0.25)"
          : "none",
        padding: 18,
      }}
    >
      <div className="flex items-start justify-between">
        <span
          className="rounded text-meta"
          style={{
            color: meta.color,
            background: meta.bg,
            padding: "3px 8px",
            letterSpacing: "0.15em",
          }}
        >
          {meta.label}
        </span>
        <span className="font-mono text-[12px] tracking-wide text-[var(--ink-secondary)]">
          #{q.keyword}
        </span>
      </div>

      {/* The big "❝" watermark used to sit here at fontSize 56 + opacity 0.2,
          but it bled into the Korean question text. A small inline quote
          glyph above the text reads as a flourish without overlapping. */}
      <div className="mt-8">
        <span
          aria-hidden
          className="font-display-italic block leading-none text-[var(--ink-secondary)]"
          style={{ fontSize: 22, opacity: 0.35 }}
        >
          “
        </span>
        <p
          className="mt-1 font-display text-[20px] leading-[1.5] text-[var(--ink-primary)]"
          style={{ letterSpacing: "-0.01em" }}
        >
          {q.text}
        </p>
      </div>

      <div className="absolute inset-x-[18px] bottom-[18px]">
        <div className="h-px w-full bg-[var(--ink-faint)]" />
        <div
          className="mt-3 text-center text-meta text-[var(--ink-muted)]"
          style={{ letterSpacing: "0.2em" }}
        >
          TAP TO CHOOSE
        </div>
      </div>
    </button>
  );
}
