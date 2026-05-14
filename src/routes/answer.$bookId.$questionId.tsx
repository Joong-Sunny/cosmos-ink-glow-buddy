import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, Mic, Camera, ArrowRight, SkipForward } from "lucide-react";
import { useUniverseStore } from "@/lib/store";
import { FloatingPanel } from "@/components/layout/FloatingPanel";
import {
  followUpQuestions,
  getCardsForBook,
  LEVEL_META,
  SIMULATED_ANSWERS,
  type CardQuestion,
} from "@/lib/dongmul-nongjang-data";

export const Route = createFileRoute("/answer/$bookId/$questionId")({
  head: () => ({ meta: [{ title: "답변 · 반짝북짝" }] }),
  component: AnswerPage,
});

const SHORT_THRESHOLD = 30; // chars
const SOFT_THRESHOLD = 60; // chars

type Turn = {
  question: Pick<CardQuestion, "id" | "level" | "text">;
  answer?: string;
  arriving?: boolean;
};

function AnswerPage() {
  const { bookId, questionId } = Route.useParams();
  const navigate = useNavigate();

  const book = useUniverseStore((s) => s.books.find((b) => b.id === bookId));
  const cards = useMemo(() => getCardsForBook(book), [book]);
  const initialQ = useMemo(
    () => cards.find((c) => c.id === questionId) ?? cards[0],
    [cards, questionId],
  );

  const demoMode = useUniverseStore((s) => s.demoMode);
  const autoSimEnabled = useUniverseStore((s) => s.autoSimEnabled);
  const markCardAnswered = useUniverseStore((s) => s.markCardAnswered);
  const addThreadTurn = useUniverseStore((s) => s.addThreadTurn);

  const [mode, setMode] = useState<"compose" | "transcript" | "thinking">(
    "compose",
  );
  const [draft, setDraft] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [activeQ, setActiveQ] = useState<CardQuestion | undefined>(initialQ);
  const [hint, setHint] = useState<"more" | null>(null);

  const transcriptRef = useRef<HTMLDivElement>(null);
  const typingTimers = useRef<number[]>([]);
  const hintTimer = useRef<number | null>(null);

  // Re-sync if URL changes
  useEffect(() => {
    if (initialQ) setActiveQ(initialQ);
  }, [initialQ]);

  // Auto-typing simulation — only when demo + sim enabled
  useEffect(() => {
    clearTimers();
    if (mode !== "compose" || !activeQ) return;
    if (!(demoMode && autoSimEnabled)) return;
    const target = SIMULATED_ANSWERS[activeQ.id];
    if (!target) return;

    setDraft("");
    let i = 0;
    const tick = () => {
      i++;
      setDraft(target.slice(0, i));
      if (i < target.length) {
        const delay = 35 + Math.floor(Math.random() * 35);
        typingTimers.current.push(window.setTimeout(tick, delay));
      }
    };
    typingTimers.current.push(window.setTimeout(tick, 800));
    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, activeQ?.id, demoMode, autoSimEnabled]);

  function clearTimers() {
    typingTimers.current.forEach((t) => window.clearTimeout(t));
    typingTimers.current = [];
  }

  function clearHintLater() {
    if (hintTimer.current) window.clearTimeout(hintTimer.current);
    hintTimer.current = window.setTimeout(() => setHint(null), 3000);
  }

  function send() {
    if (!activeQ) return;
    const len = draft.trim().length;
    if (len < SHORT_THRESHOLD) {
      setHint("more");
      clearHintLater();
      return;
    }
    setHint(null);

    const newTurn: Turn = { question: activeQ, answer: draft.trim() };
    const nextTurns = [...turns, newTurn];

    // Persist to global store: mark this keyword answered + record turn
    if (initialQ) {
      markCardAnswered(bookId, initialQ.keywordIndex);
    }
    addThreadTurn({
      id: `${activeQ.id}:${Date.now()}`,
      bookId,
      question: {
        id: activeQ.id,
        bookId,
        level: activeQ.level,
        text: activeQ.text,
        category: activeQ.category ?? "inference",
      },
      answer: draft.trim(),
      createdAt: new Date().toISOString(),
    });

    // Determine next follow-up based on the originally-picked card
    const followUps = followUpQuestions[initialQ?.id ?? ""] ?? [];
    const askedIds = nextTurns.map((t) => t.question.id);
    const nextFollow = followUps.find((f) => !askedIds.includes(f.id));

    if (!nextFollow) {
      setTurns(nextTurns);
      setMode("transcript");
      window.setTimeout(() => {
        navigate({ to: "/star-born/$bookId", params: { bookId } });
      }, 1800);
      return;
    }

    // 1) commit answer + show "AI is reading…" 1.2s
    setTurns(nextTurns);
    setMode("thinking");
    setDraft("");

    window.setTimeout(() => {
      // 2) reveal the new question with rise + JUST ARRIVED
      setTurns([
        ...nextTurns,
        {
          question: { id: nextFollow.id, level: nextFollow.level, text: nextFollow.text },
          arriving: true,
        },
      ]);
      setMode("transcript");
    }, 1200);

    window.setTimeout(() => {
      // 3) switch back to compose with the new active question
      setActiveQ({
        id: nextFollow.id,
        bookId: activeQ.bookId,
        keyword: activeQ.keyword,
        keywordIndex: activeQ.keywordIndex,
        level: nextFollow.level,
        text: nextFollow.text,
      });
      setMode("compose");
    }, 2400);
  }

  // auto-scroll transcript
  useEffect(() => {
    if ((mode === "transcript" || mode === "thinking") && transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [turns, mode]);

  function skipToStarBorn() {
    clearTimers();
    navigate({ to: "/star-born/$bookId", params: { bookId } });
  }

  if (!activeQ) {
    return (
      <main className="grid min-h-screen w-full place-items-center text-[var(--ink-muted)]">
        질문을 찾을 수 없습니다.
      </main>
    );
  }

  const len = draft.trim().length;
  const sendActive = len >= SHORT_THRESHOLD;

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center px-6 py-10">
      <FloatingPanel
        maxWidthClass="max-w-[680px]"
        padding="p-0"
        className="flex flex-col"
        style={{ height: "min(82vh, 760px)" }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-6 py-5"
          style={{ borderBottom: "1px solid var(--ink-faint)" }}
        >
          <Link
            to="/questions/$bookId"
            params={{ bookId }}
            className="grid h-9 w-9 shrink-0 place-items-center text-[var(--ink-secondary)] hover:text-[var(--star-active)]"
            aria-label="뒤로"
          >
            <ChevronLeft size={22} strokeWidth={1.5} />
          </Link>
          <CompressedQuestion q={activeQ} />
        </div>

        {/* Body */}
        <div className="flex min-h-0 flex-1 flex-col">
          {mode === "compose" ? (
            <ComposeView
              draft={draft}
              setDraft={(v) => {
                setDraft(v);
                if (hint) setHint(null);
              }}
              hint={hint}
              len={len}
            />
          ) : (
            <TranscriptView
              ref={transcriptRef}
              turns={turns}
              thinking={mode === "thinking"}
            />
          )}
        </div>

        {/* Bottom bar */}
        {mode === "compose" && (
          <div
            className="flex items-center justify-between gap-3 px-6 py-4"
            style={{ borderTop: "1px solid var(--ink-faint)" }}
          >
            <div className="flex items-center gap-3 text-[var(--ink-muted)]">
              <button aria-label="음성" className="hover:text-[var(--star-active)]">
                <Mic size={20} strokeWidth={1.4} />
              </button>
              <button aria-label="사진" className="hover:text-[var(--star-active)]">
                <Camera size={20} strokeWidth={1.4} />
              </button>
            </div>
            <button
              onClick={send}
              className="flex items-center gap-2 rounded-full px-5 py-3 text-[14px] font-medium transition-all"
              style={{
                background: "var(--star-active)",
                color: "var(--bg-deep)",
                opacity: sendActive ? 1 : 0.55,
                boxShadow: sendActive
                  ? "0 0 24px rgba(143,184,255,0.35)"
                  : "none",
              }}
            >
              AI에게 보내기
              <ArrowRight size={16} strokeWidth={2} />
            </button>
          </div>
        )}
      </FloatingPanel>

      {/* Demo skip */}
      <button
        onClick={skipToStarBorn}
        aria-label="시연 건너뛰기"
        className="fixed bottom-3 right-3 z-40 grid h-10 w-10 place-items-center rounded-full border border-[var(--ink-faint)] bg-[var(--bg-deep)]/80 text-[var(--ink-muted)] backdrop-blur-md hover:text-[var(--gold)]"
      >
        <SkipForward size={14} />
      </button>
    </main>
  );
}

function CompressedQuestion({ q }: { q: CardQuestion | Turn["question"] }) {
  return (
    <div
      className="flex-1 rounded-[10px] py-2 pl-3 pr-3"
      style={{
        background: "rgba(143,184,255,0.06)",
        borderLeft: "2px solid var(--star-trail)",
      }}
    >
      <div className="text-meta text-[var(--ink-muted)]" style={{ fontSize: 8 }}>
        QUESTION · {q.level}
      </div>
      <div className="mt-0.5 line-clamp-2 font-display text-[14px] leading-[1.4] text-[var(--ink-primary)]">
        {q.text}
      </div>
    </div>
  );
}

function ComposeView({
  draft,
  setDraft,
  hint,
  len,
}: {
  draft: string;
  setDraft: (v: string) => void;
  hint: "more" | null;
  len: number;
}) {
  const showSoftHint = !hint && len >= SHORT_THRESHOLD && len < SOFT_THRESHOLD;
  return (
    <section className="flex flex-1 flex-col px-6 pt-5 pb-3">
      <div
        className="text-meta text-[var(--gold)]"
        style={{ letterSpacing: "0.2em", fontSize: 9 }}
      >
        YOUR ANSWER
      </div>
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="여기에 너의 생각을 자유롭게 적어보자..."
        className="mt-3 min-h-[200px] flex-1 resize-none rounded-[12px] bg-transparent p-4 text-[var(--ink-primary)] placeholder:text-[var(--ink-muted)] focus:outline-none"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 15,
          lineHeight: 1.7,
          border: "1px solid var(--ink-faint)",
          letterSpacing: "-0.01em",
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "var(--star-trail)")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "var(--ink-faint)")}
      />

      <div className="mt-3 min-h-[44px]">
        {hint === "more" && (
          <div
            className="rise rounded-[10px] px-3 py-2"
            style={{
              border: "1px solid rgba(232,181,71,0.4)",
              background: "rgba(232,181,71,0.06)",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                letterSpacing: "0.2em",
                color: "var(--gold)",
              }}
            >
              MORE THOUGHTS
            </div>
            <p
              className="mt-1 font-display text-[13px] text-[var(--ink-secondary)]"
              style={{ lineHeight: 1.5 }}
            >
              조금만 더 생각해볼까? 떠오르는 단어 하나라도 좋아.
            </p>
          </div>
        )}
        {showSoftHint && (
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: "0.15em",
              color: "var(--ink-muted)",
              opacity: 0.7,
            }}
          >
            조금 더 적어볼 수도 있어.
          </p>
        )}
      </div>
    </section>
  );
}

const TranscriptView = forwardRef<
  HTMLDivElement,
  { turns: Turn[]; thinking: boolean }
>(function TranscriptView({ turns, thinking }, ref) {
  return (
    <section ref={ref} className="flex-1 overflow-y-auto px-6 pb-6 pt-5">
      <div
        className="text-meta text-[var(--gold)]"
        style={{ letterSpacing: "0.2em", fontSize: 9 }}
      >
        TRANSCRIPT
      </div>
      <div className="mt-4 flex flex-col gap-4">
        {turns.map((t, i) => (
          <TurnBlock key={`${t.question.id}-${i}`} turn={t} />
        ))}
        {thinking && <ThinkingBubble />}
      </div>
    </section>
  );
});

function ThinkingBubble() {
  return (
    <div className="rise flex items-center gap-3 self-start rounded-[10px] px-3.5 py-3"
      style={{
        background: "rgba(143,184,255,0.06)",
        border: "1px solid var(--ink-faint)",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          letterSpacing: "0.2em",
          color: "var(--gold)",
        }}
      >
        AI READING
      </span>
      <span className="flex items-center gap-1.5 text-[var(--ink-secondary)]">
        <span className="twinkle inline-block h-[5px] w-[5px] rounded-full bg-current" style={{ animationDelay: "0s" }} />
        <span className="twinkle inline-block h-[5px] w-[5px] rounded-full bg-current" style={{ animationDelay: "0.3s" }} />
        <span className="twinkle inline-block h-[5px] w-[5px] rounded-full bg-current" style={{ animationDelay: "0.6s" }} />
      </span>
      <span className="font-display text-[13px] text-[var(--ink-secondary)]">
        AI가 너의 답변을 읽고 있어…
      </span>
    </div>
  );
}

function TurnBlock({ turn }: { turn: Turn }) {
  const meta = LEVEL_META[turn.question.level];
  return (
    <div className={turn.arriving ? "rise" : ""}>
      {/* Q bubble */}
      <div
        className="max-w-[88%] rounded-[10px] px-3.5 py-3"
        style={{
          background: "rgba(143,184,255,0.08)",
          borderLeft: `2px solid ${meta.color}`,
          boxShadow: turn.arriving
            ? "0 0 30px rgba(143,184,255,0.15)"
            : "none",
        }}
      >
        <div
          className="text-meta text-[var(--ink-muted)]"
          style={{ fontSize: 10 }}
        >
          Q · {turn.question.level}
          {turn.arriving && (
            <span className="ml-1.5 text-[var(--gold)]">· JUST ARRIVED</span>
          )}
        </div>
        <p className="mt-1 font-display text-[15px] leading-[1.5] text-[var(--ink-primary)]">
          {turn.question.text}
        </p>
      </div>

      {/* Answer bubble */}
      {turn.answer && (
        <div className="mt-3 flex justify-end">
          <div
            className="max-w-[85%] rounded-[10px] px-3.5 py-3"
            style={{ background: "rgba(244,244,237,0.03)" }}
          >
            <div
              className="text-right text-meta text-[var(--ink-muted)]"
              style={{ fontSize: 10 }}
            >
              YOU
            </div>
            <p className="mt-1 font-display-italic text-[14px] leading-[1.4] text-[var(--ink-secondary)]">
              {turn.answer}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
