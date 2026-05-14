import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, Plus, X } from "lucide-react";
import type { Book } from "@/lib/types";
import { useUniverseStore } from "@/lib/store";
import { getCardsForBook } from "@/lib/dongmul-nongjang-data";

type Props = {
  book: Book;
  onClose: () => void;
};

export function BookDetailPanel({ book, onClose }: Props) {
  const threads = useUniverseStore((s) => s.threads);
  const addKeyword = useUniverseStore((s) => s.addKeywordToBook);
  const cards = useMemo(() => getCardsForBook(book), [book]);
  const answered = new Set(book.answeredKeywordIndices ?? []);
  const [openTranscriptIdx, setOpenTranscriptIdx] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [newKw, setNewKw] = useState("");

  const transcriptForKw = (kwIndex: number) => {
    const cardId = `${book.id}:k${kwIndex}`;
    return threads
      .filter((t) => t.bookId === book.id && t.question.id.startsWith(cardId))
      .map((t) => t.answer);
  };

  return (
    <div
      className="card-cosmic relative px-6 pb-6 pt-5"
      style={{
        background:
          "linear-gradient(180deg, rgba(26,34,64,0.88) 0%, rgba(15,20,40,0.94) 100%)",
        borderRadius: 20,
        border: "1px solid var(--ink-faint)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 text-[var(--ink-muted)] hover:text-[var(--ink-primary)]"
        aria-label="닫기"
      >
        <X size={16} />
      </button>

      {/* header */}
      <div className="flex items-start gap-3">
        <div
          className="h-12 w-2 shrink-0 rounded-sm"
          style={{
            backgroundColor: book.coverColor,
            boxShadow: `0 0 12px ${book.coverColor}55`,
          }}
        />
        <div className="min-w-0 flex-1">
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              letterSpacing: "0.2em",
              color: "var(--star-active)",
            }}
          >
            A LIT STAR
          </div>
          <h3
            className="mt-1 truncate"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 20,
              color: "var(--ink-primary)",
            }}
          >
            {book.title}
          </h3>
          <p
            className="mt-0.5"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 12,
              color: "var(--ink-secondary)",
            }}
          >
            {book.author}
          </p>
        </div>
      </div>

      {/* keywords + add */}
      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        {book.keywords.map((k) => (
          <span
            key={k}
            className="rounded-full border border-[var(--ink-faint)] bg-[var(--bg-elevated)]/60 px-2 py-0.5"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: "0.05em",
              color: "var(--ink-secondary)",
            }}
          >
            #{k}
          </span>
        ))}
        {adding ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (newKw.trim()) {
                addKeyword(book.id, newKw);
                setNewKw("");
                setAdding(false);
              }
            }}
            className="flex items-center gap-1"
          >
            <input
              autoFocus
              value={newKw}
              onChange={(e) => setNewKw(e.target.value)}
              onBlur={() => !newKw && setAdding(false)}
              placeholder="새 키워드"
              className="rounded-full border px-2 py-0.5 outline-none"
              style={{
                background: "rgba(232,181,71,0.06)",
                borderColor: "var(--gold)",
                color: "var(--gold-soft)",
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                width: 90,
              }}
            />
          </form>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1 rounded-full border px-2 py-0.5"
            style={{
              borderColor: "var(--gold)",
              color: "var(--gold)",
              background: "rgba(232,181,71,0.06)",
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: "0.05em",
            }}
          >
            <Plus size={10} /> 키워드
          </button>
        )}
      </div>

      {/* question cards */}
      <div className="mt-5 space-y-2">
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            letterSpacing: "0.2em",
            color: "var(--ink-muted)",
          }}
        >
          QUESTION CARDS · {cards.length}
        </div>
        {cards.map((card) => {
          const isDone = answered.has(card.keywordIndex);
          const isOpen = openTranscriptIdx === card.keywordIndex;
          const transcripts = isDone ? transcriptForKw(card.keywordIndex) : [];
          return (
            <div
              key={card.id}
              className="rounded-xl border p-3 transition-all"
              style={{
                borderColor: isDone ? "var(--ink-faint)" : "var(--star-trail)",
                background: isDone
                  ? "rgba(15,20,40,0.45)"
                  : "rgba(143,184,255,0.06)",
                opacity: isDone ? 0.6 : 1,
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div
                    className="flex items-center gap-1.5"
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 8.5,
                      letterSpacing: "0.2em",
                      color: isDone ? "var(--gold)" : "var(--star-active)",
                    }}
                  >
                    {isDone ? (
                      <>
                        <Check size={10} /> 답변 완료 · #{card.keyword}
                      </>
                    ) : (
                      <>● #{card.keyword} · {card.level}</>
                    )}
                  </div>
                  <p
                    className="mt-1.5"
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: 13,
                      lineHeight: 1.5,
                      color: isDone ? "var(--ink-muted)" : "var(--ink-primary)",
                    }}
                  >
                    {card.text}
                  </p>
                </div>
              </div>
              {isDone ? (
                <button
                  onClick={() =>
                    setOpenTranscriptIdx(isOpen ? null : card.keywordIndex)
                  }
                  className="mt-2"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 9.5,
                    letterSpacing: "0.2em",
                    color: "var(--ink-secondary)",
                  }}
                >
                  {isOpen ? "▴ 닫기" : "▾ 내 답변 보기"}
                </button>
              ) : (
                <Link
                  to="/answer/$bookId/$questionId"
                  params={{ bookId: book.id, questionId: card.id }}
                  onClick={onClose}
                  className="mt-3 inline-block rounded-full border px-3 py-1.5"
                  style={{
                    borderColor: "var(--star-trail)",
                    color: "var(--star-active)",
                    fontFamily: "var(--font-body)",
                    fontSize: 11,
                  }}
                >
                  이 질문으로 시작하기 →
                </Link>
              )}
              {isDone && isOpen && (
                <div
                  className="mt-2 rounded-lg p-2"
                  style={{
                    background: "rgba(7,9,26,0.6)",
                    border: "1px solid var(--ink-faint)",
                  }}
                >
                  {transcripts.length === 0 ? (
                    <p
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: 12,
                        color: "var(--ink-muted)",
                        fontStyle: "italic",
                      }}
                    >
                      (시연 데이터: 답변 트랜스크립트는 아직 비어 있어요.)
                    </p>
                  ) : (
                    transcripts.map((t, i) => (
                      <p
                        key={i}
                        className="mb-1.5 last:mb-0"
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: 12,
                          lineHeight: 1.55,
                          color: "var(--ink-secondary)",
                        }}
                      >
                        {t}
                      </p>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
