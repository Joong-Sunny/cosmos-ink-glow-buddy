import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Search as SearchIcon, X } from "lucide-react";
import { useUniverseStore } from "@/lib/store";
import { ArcanumCard, type ArcanumCardProps } from "@/components/worldview/ArcanumCard";
import type { WorldviewCard } from "@/lib/types";

export const Route = createFileRoute("/search")({
  component: Page,
});

const CHIPS = ["권력", "정의", "공감", "자유", "정체성"];

type ThoughtCard = {
  bookId: string;
  bookTitle: string;
  date: string;
  excerpt: string;
};

const POWER_THOUGHTS: ThoughtCard[] = [
  {
    bookId: "b01",
    bookTitle: "동물농장",
    date: "2026.05.14",
    excerpt:
      "나폴레옹은 처음엔 다른 돼지들과 똑같았는데, 점점 자기만 우유랑 사과를 더 먹기 시작했다. 권력은 가지는 게 아니라, 익숙해지는 것 같다.",
  },
  {
    bookId: "b15",
    bookTitle: "1984",
    date: "2026.04.22",
    excerpt:
      "빅브라더가 무서운 건 보고 있다는 사실보다, 사람들이 그걸 당연하게 받아들인다는 거다. 감시는 카메라가 아니라 익숙함에서 시작된다.",
  },
  {
    bookId: "b10",
    bookTitle: "스노볼",
    date: "2026.04.10",
    excerpt:
      "등급이 매겨지는 사회에서 누가 가장 손해를 볼까. 등급이 낮은 사람들이 아니라 등급 자체를 믿는 사람들이 가장 자유를 잃는다.",
  },
  {
    bookId: "b05",
    bookTitle: "기억 전달자",
    date: "2026.03.28",
    excerpt:
      "기억이 없으면 슬픔도 없지만, 사랑도 없다. 평화는 무엇을 포기해야 얻어지는 걸까. 무감각은 평화가 아니다.",
  },
];

function toCardProps(c: WorldviewCard): ArcanumCardProps {
  const parts = c.nameKr.split(" ");
  const nameKrLine1 = parts.length > 1 ? parts[0] : "";
  const nameKrItalic = parts.length > 1 ? parts.slice(1).join(" ") : c.nameKr;
  const [q1, q2 = ""] = c.quote.split(",");
  const date = new Date(c.issuedAt);
  const yy = String(date.getFullYear()).slice(2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return {
    romanNumeral: c.romanNumeral,
    nameKrLine1,
    nameKrItalic,
    nameEn: c.nameEn,
    arcanumType: c.arcanumType,
    quoteLine1: (q1 + (q2 ? "," : "")).trim(),
    quoteLine2: q2.trim(),
    books: c.booksCount,
    stars: c.starsCount,
    date: `${yy}·${mm}·${dd}`,
  };
}

function Page() {
  const cards = useUniverseStore((s) => s.worldviewCards);
  const books = useUniverseStore((s) => s.books);
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const navigate = useNavigate();

  const totals = useMemo(
    () => ({
      stars: books.length + 1,
      constellations: 6,
      cards: cards.length,
    }),
    [books.length, cards.length],
  );

  const matchingCard = useMemo(
    () => cards.find((c) => c.relatedKeyword === submitted),
    [cards, submitted],
  );

  const submit = (q: string) => {
    if (!q.trim()) return;
    setSubmitted(q.trim());
    setShowResults(false);
    setTimeout(() => setShowResults(true), 380);
  };

  const onChipTap = (kw: string) => {
    setQuery(kw);
    submit(kw);
  };

  const isPowerSearch = submitted === "권력";

  return (
    <main
      className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1100px] flex-col px-10 pt-24 pb-12"
      style={{ animation: "rise 0.5s var(--ease-cosmos) both" }}
    >
      <Link
        to="/"
        className="fixed left-8 top-8 z-20 grid h-10 w-10 place-items-center rounded-full border border-[var(--ink-faint)] bg-[var(--bg-elevated)]/40 text-[var(--ink-secondary)] backdrop-blur-md hover:text-[var(--star-active)]"
      >
        <ArrowLeft size={20} />
      </Link>
      <div
        className="text-center"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.2em",
          color: "var(--gold)",
        }}
      >
        생각 꺼내기
      </div>

      {/* Search input */}
      <div className="mt-6">
        <div
          className="flex items-center gap-3 pb-2"
          style={{ borderBottom: "1px solid var(--ink-faint)" }}
        >
          <SearchIcon size={20} style={{ color: "var(--ink-secondary)" }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit(query);
            }}
            placeholder="어떤 생각을 꺼낼까?"
            className="flex-1 bg-transparent outline-none placeholder:text-[var(--ink-muted)]"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 22,
              color: "var(--ink-primary)",
            }}
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                setSubmitted(null);
                setShowResults(false);
              }}
              style={{ color: "var(--ink-muted)" }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Chips */}
        <div className="mt-4 flex flex-wrap gap-2">
          {CHIPS.map((kw) => {
            const active = submitted === kw;
            return (
              <button
                key={kw}
                onClick={() => onChipTap(kw)}
                className="shrink-0"
                style={{
                  borderRadius: 16,
                  padding: "5px 12px",
                  border: `1px solid ${active ? "var(--gold)" : "var(--ink-faint)"}`,
                  background: active ? "rgba(232,181,71,0.12)" : "transparent",
                  color: active ? "var(--gold)" : "var(--ink-secondary)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  letterSpacing: "0.05em",
                  whiteSpace: "nowrap",
                }}
              >
                #{kw}
              </button>
            );
          })}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 pt-8">
        {!submitted && <EmptyState totals={totals} />}

        {submitted && showResults && (
          <div className="grid grid-cols-2 gap-x-8 gap-y-7">
            {/* Section 1: Worldview Cards */}
            {(matchingCard || isPowerSearch) && (
              <Section
                label={`WORLDVIEW CARDS · ${matchingCard ? 1 : 0}`}
                delay={0}
              >
                {matchingCard && (
                  <button
                    onClick={() =>
                      navigate({
                        to: "/worldview/$cardId",
                        params: { cardId: matchingCard.id },
                      })
                    }
                    className="block w-full overflow-hidden rounded-xl active:scale-[0.99]"
                    style={{
                      border: "1px solid var(--ink-faint)",
                      background: "rgba(19,26,50,0.6)",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                      transition: "transform 0.2s var(--ease-cosmos)",
                    }}
                  >
                    <div className="flex items-center gap-3 p-3">
                      <div
                        className="shrink-0 overflow-hidden rounded-md"
                        style={{ width: 96, height: 150 }}
                      >
                        <div
                          style={{
                            transform: "scale(0.34)",
                            transformOrigin: "top left",
                            width: 280,
                            height: 440,
                          }}
                        >
                          <ArcanumCard {...toCardProps(matchingCard)} />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1 text-left">
                        <div
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 8,
                            letterSpacing: "0.2em",
                            color: "var(--gold-deep)",
                          }}
                        >
                          ARCANUM · {matchingCard.romanNumeral}
                        </div>
                        <div
                          className="mt-1"
                          style={{
                            fontFamily: "var(--font-display)",
                            fontSize: 16,
                            color: "var(--ink-primary)",
                          }}
                        >
                          {matchingCard.nameKr}
                        </div>
                        <div
                          className="mt-2"
                          style={{
                            fontFamily: "var(--font-display-italic)",
                            fontStyle: "italic",
                            fontSize: 11,
                            color: "var(--ink-secondary)",
                            lineHeight: 1.5,
                          }}
                        >
                          “{matchingCard.quote}”
                        </div>
                      </div>
                    </div>
                  </button>
                )}
              </Section>
            )}

            {/* Section 2: Constellations */}
            <Section label={`CONSTELLATIONS · 1`} delay={0.08}>
              <button
                onClick={() =>
                  navigate({
                    to: "/constellation/$keyword",
                    params: { keyword: submitted },
                  })
                }
                className="flex w-full items-center gap-3 rounded-xl p-3 active:scale-[0.99]"
                style={{
                  border: "1px solid var(--ink-faint)",
                  background: "rgba(19,26,50,0.6)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  transition: "transform 0.2s var(--ease-cosmos)",
                }}
              >
                <MiniConstellation />
                <div className="min-w-0 flex-1 text-left">
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 15,
                      color: "var(--ink-primary)",
                    }}
                  >
                    {submitted}의{" "}
                    <em
                      style={{
                        fontFamily: "var(--font-display-italic)",
                        fontStyle: "italic",
                        color: "var(--gold-soft)",
                      }}
                    >
                      별자리
                    </em>
                  </div>
                  <div
                    className="mt-1"
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      letterSpacing: "0.15em",
                      color: "var(--ink-muted)",
                    }}
                  >
                    5 STARS · 점선 가지 3
                  </div>
                </div>
                <span style={{ color: "var(--ink-muted)" }}>›</span>
              </button>
            </Section>

            {/* Section 3: Your Thoughts */}
            <Section
              label={`YOUR THOUGHTS · ${isPowerSearch ? POWER_THOUGHTS.length : 1}`}
              delay={0.16}
            >
              <ul className="flex flex-col gap-2.5">
                {(isPowerSearch
                  ? POWER_THOUGHTS
                  : [
                      {
                        bookId: "b01",
                        bookTitle: "동물농장",
                        date: "2026.05.14",
                        excerpt:
                          "권력은 처음의 평등을 흔든다. 나폴레옹의 변화는 인간에게도 일어날 수 있다.",
                      },
                    ]
                ).map((t, i) => (
                  <li key={`${t.bookId}-${i}`}>
                    <Link
                      to="/answer/$bookId/$questionId"
                      params={{ bookId: t.bookId, questionId: "q1" }}
                      className="block rounded-xl p-4 active:scale-[0.99]"
                      style={{
                        border: "1px solid var(--ink-faint)",
                        borderLeft: "2px solid var(--star-active)",
                        background: "rgba(19,26,50,0.6)",
                        backdropFilter: "blur(12px)",
                        WebkitBackdropFilter: "blur(12px)",
                        transition: "transform 0.2s var(--ease-cosmos)",
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 9,
                          letterSpacing: "0.15em",
                          color: "var(--gold-deep)",
                        }}
                      >
                        {t.bookTitle} · {t.date}
                      </div>
                      <p
                        className="mt-2"
                        style={{
                          fontFamily: "var(--font-display-italic)",
                          fontStyle: "italic",
                          fontSize: 13,
                          lineHeight: 1.65,
                          color: "var(--ink-secondary)",
                        }}
                      >
                        {t.excerpt}
                      </p>
                      <div
                        className="mt-2.5"
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: 11,
                          color: "var(--gold)",
                        }}
                      >
                        Q &amp; A 보기 →
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </Section>

            {/* Section 4: CTA */}
            <Section label="" delay={0.24}>
              <button
                onClick={() => setExportOpen(true)}
                className="block w-full active:scale-[0.99]"
                style={{
                  height: 52,
                  borderRadius: 26,
                  border: "1px solid var(--gold)",
                  background: "rgba(232,181,71,0.06)",
                  color: "var(--gold)",
                  fontFamily: "var(--font-body)",
                  fontSize: 14,
                  fontWeight: 500,
                  transition: "transform 0.2s var(--ease-cosmos)",
                }}
              >
                이 검색 결과를 한 페이지로 정리하기 →
              </button>
            </Section>
          </div>
        )}
      </div>

      {exportOpen && (
        <ExportDialog query={submitted ?? ""} onClose={() => setExportOpen(false)} />
      )}

      <style>{`
        @keyframes spin-slow { to { transform: rotate(360deg); } }
        .spin-slow { animation: spin-slow 24s linear infinite; transform-origin: center; }
      `}</style>
    </main>
  );
}

function Section({
  label,
  delay,
  children,
}: {
  label: string;
  delay: number;
  children: import("react").ReactNode;
}) {
  return (
    <section
      style={{
        opacity: 0,
        animation: `rise 0.5s var(--ease-cosmos) ${delay}s forwards`,
      }}
    >
      {label && (
        <div
          className="mb-2.5"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            letterSpacing: "0.2em",
            color: "var(--gold)",
          }}
        >
          {label}
        </div>
      )}
      {children}
    </section>
  );
}

function MiniConstellation() {
  return (
    <svg width={64} height={64} viewBox="0 0 64 64" className="shrink-0">
      <line x1="32" y1="32" x2="14" y2="18" stroke="var(--constellation)" strokeOpacity={0.5} strokeWidth={0.6} />
      <line x1="32" y1="32" x2="50" y2="14" stroke="var(--constellation)" strokeOpacity={0.5} strokeWidth={0.6} />
      <line x1="32" y1="32" x2="18" y2="50" stroke="var(--constellation)" strokeOpacity={0.5} strokeWidth={0.6} />
      <line x1="32" y1="32" x2="52" y2="48" stroke="var(--constellation)" strokeOpacity={0.5} strokeWidth={0.6} />
      <line x1="50" y1="14" x2="60" y2="6" stroke="var(--star-active)" strokeOpacity={0.4} strokeWidth={0.4} strokeDasharray="2 3" />
      <circle cx="14" cy="18" r="1.5" fill="var(--constellation)" opacity={0.85} />
      <circle cx="50" cy="14" r="1.5" fill="var(--constellation)" opacity={0.85} />
      <circle cx="18" cy="50" r="1.5" fill="var(--constellation)" opacity={0.85} />
      <circle cx="52" cy="48" r="1.5" fill="var(--constellation)" opacity={0.85} />
      <circle cx="60" cy="6" r="1" fill="var(--star-active)" opacity={0.5} />
      <circle cx="32" cy="32" r="3.5" fill="var(--star-active)" />
      <circle cx="32" cy="32" r="6" fill="var(--star-active)" opacity={0.25} />
    </svg>
  );
}

function EmptyState({
  totals,
}: {
  totals: { stars: number; constellations: number; cards: number };
}) {
  return (
    <div className="flex flex-col items-center justify-center pt-20">
      <svg width={120} height={120} viewBox="0 0 120 120" className="spin-slow">
        <defs>
          <radialGradient id="se-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8FB8FF" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#8FB8FF" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={60} cy={60} r={60} fill="url(#se-glow)" />
        <path
          d="M 60 22 L 66 54 L 98 60 L 66 66 L 60 98 L 54 66 L 22 60 L 54 54 Z"
          fill="var(--star-active)"
          opacity={0.95}
        />
        <circle cx={60} cy={60} r={4} fill="white" opacity={0.85} />
      </svg>
      <p
        className="mt-8 text-center"
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 13,
          color: "var(--ink-secondary)",
          lineHeight: 1.7,
        }}
      >
        지금까지 별 {totals.stars}개 · 별자리 {totals.constellations}개
        <br />
        세계관 카드 {totals.cards}장
      </p>
    </div>
  );
}

function ExportDialog({ query, onClose }: { query: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center px-4 sm:items-center"
      style={{ background: "rgba(4,6,15,0.7)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[400px] rounded-2xl p-6"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--ink-faint)",
          boxShadow: "0 30px 60px -20px rgba(0,0,0,0.6)",
          marginBottom: "max(env(safe-area-inset-bottom), 16px)",
          animation: "rise 0.4s var(--ease-cosmos) both",
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
          PDF 자료로 내보내기
        </div>
        <h2
          className="mt-2"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 20,
            color: "var(--ink-primary)",
          }}
        >
          “{query}” 검색 결과
        </h2>
        <p
          className="mt-2"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 13,
            color: "var(--ink-secondary)",
            lineHeight: 1.7,
          }}
        >
          관련 세계관 카드 1장 · 별자리 1개 · 내가 쓴 생각 4편을 한 페이지로 묶어
          PDF로 내보냅니다.
          <br />
          자기소개서 · 수행평가에 그대로 첨부할 수 있어요.
        </p>
        <div className="mt-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1"
            style={{
              height: 48,
              borderRadius: 24,
              border: "1px solid var(--ink-faint)",
              color: "var(--ink-secondary)",
              fontFamily: "var(--font-body)",
              fontSize: 14,
            }}
          >
            취소
          </button>
          <button
            onClick={onClose}
            className="flex-1"
            style={{
              height: 48,
              borderRadius: 24,
              background: "var(--gold)",
              color: "var(--bg-deep)",
              fontFamily: "var(--font-body)",
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            PDF로 내보내기
          </button>
        </div>
      </div>
    </div>
  );
}
