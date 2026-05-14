import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  Crosshair,
  ScanBarcode,
  PencilLine,
  Search as SearchIcon,
  X,
} from "lucide-react";
import { useUniverseStore } from "@/lib/store";
import { FloatingPanel } from "@/components/layout/FloatingPanel";
import { searchBooks, type CsvBook } from "@/lib/book-database";
import { coverColorFor } from "@/lib/categories";
import type { Book } from "@/lib/types";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [{ title: "새로운 별 · 반짝북짝" }],
  }),
  component: RegisterPage,
});

const DEMO_TARGET_BOOK_ID = "b01"; // 동물농장 — 카메라/바코드 시연용

function bookIdForCsv(csv: CsvBook): string {
  return csv.id; // already prefixed with `csv-` (see book-database.ts)
}

function RegisterPage() {
  const navigate = useNavigate();
  const setCurrentBook = useUniverseStore((s) => s.setCurrentBook);
  const addBook = useUniverseStore((s) => s.addBook);
  const existingBooks = useUniverseStore((s) => s.books);
  const [igniting, setIgniting] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  function startDemoFlow() {
    if (igniting) return;
    setIgniting(true);
    setCurrentBook(DEMO_TARGET_BOOK_ID);
    window.setTimeout(() => {
      navigate({
        to: "/analyzing/$bookId",
        params: { bookId: DEMO_TARGET_BOOK_ID },
      });
    }, 1200);
  }

  function registerCsvBook(csv: CsvBook) {
    if (igniting) return;
    const id = bookIdForCsv(csv);
    const existing = existingBooks.find((b) => b.id === id);
    if (!existing) {
      const newBook: Book = {
        id,
        title: csv.title,
        author: csv.author || "작자 미상",
        coverColor: coverColorFor(csv.categories),
        keywords: csv.categories,
        registeredAt: new Date().toISOString(),
        starState: "lit",
        answeredKeywordIndices: [],
        questionsAnswered: 0,
      };
      addBook(newBook);
    }
    setIgniting(true);
    setCurrentBook(id);
    setSearchOpen(false);
    window.setTimeout(() => {
      navigate({ to: "/analyzing/$bookId", params: { bookId: id } });
    }, 1000);
  }

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center px-6 py-12">
      <Link
        to="/"
        className="fixed left-8 top-8 z-20 grid h-10 w-10 place-items-center rounded-full border border-[var(--ink-faint)] bg-[var(--bg-elevated)]/40 text-[var(--ink-secondary)] backdrop-blur-md transition-colors hover:text-[var(--star-active)]"
        aria-label="뒤로"
      >
        <ChevronLeft size={20} strokeWidth={1.5} />
      </Link>

      <FloatingPanel maxWidthClass="max-w-[560px]" padding="px-10 py-12">
      <header
        className="text-center transition-opacity duration-700"
        style={{ opacity: igniting ? 0.25 : 1 }}
      >
        <div className="text-meta text-[var(--gold)]" style={{ letterSpacing: "0.2em" }}>
          새로운 별
        </div>
        <h1
          className="mt-4 font-display text-[32px] leading-[1.25] tracking-[-0.02em] text-[var(--ink-primary)]"
        >
          이번엔 어떤{" "}
          <span className="font-display-italic text-[var(--star-active)]">책</span>
          을<br />우주에 더할까요?
        </h1>
      </header>

      {/* Center star */}
      <div className="mt-10 flex justify-center">
        <button
          onClick={startDemoFlow}
          aria-label="책 추가하기"
          className="relative grid place-items-center"
          style={{ width: 160, height: 160 }}
        >
          <svg
            width={160}
            height={160}
            viewBox="0 0 160 160"
            className="overflow-visible"
          >
            <defs>
              <radialGradient id="addHalo" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#B8D0FF" stopOpacity="0.55" />
                <stop offset="60%" stopColor="#8FB8FF" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#8FB8FF" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="addCore" cx="50%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#E8F0FF" stopOpacity="1" />
                <stop offset="60%" stopColor="#8FB8FF" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#5A78C2" stopOpacity="0.55" />
              </radialGradient>
            </defs>
            <circle cx={80} cy={80} r={72} fill="url(#addHalo)" />
            <circle
              cx={80}
              cy={80}
              r={44}
              fill="url(#addCore)"
              className="pulse-glow"
              style={{ animationDuration: igniting ? "1.2s" : "2.5s" }}
            />
            {/* + symbol */}
            <line x1={80} y1={68} x2={80} y2={92} stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" />
            <line x1={68} y1={80} x2={92} y2={80} stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Cards */}
      <div
        className="mt-10 flex flex-col gap-3 transition-opacity duration-700"
        style={{ opacity: igniting ? 0 : 1, pointerEvents: igniting ? "none" : "auto" }}
      >
        <RegisterCard
          icon={<Crosshair size={20} strokeWidth={1.4} />}
          label="표지 촬영으로 등록"
          primary
          onClick={startDemoFlow}
        />
        <RegisterCard
          icon={<ScanBarcode size={20} strokeWidth={1.4} />}
          label="바코드 스캔"
          onClick={startDemoFlow}
        />
        <RegisterCard
          icon={<PencilLine size={20} strokeWidth={1.4} />}
          label="제목으로 직접 검색"
          onClick={() => setSearchOpen(true)}
        />
      </div>
      </FloatingPanel>

      {searchOpen && (
        <BookSearchDialog
          onClose={() => setSearchOpen(false)}
          onPick={registerCsvBook}
        />
      )}
    </main>
  );
}

function RegisterCard({
  icon,
  label,
  primary,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  primary?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-4 rounded-[14px] px-4 py-4 text-left transition-colors hover:bg-[var(--bg-card-hi)]/70"
      style={{
        background: "rgba(19,26,50,0.55)",
        border: primary ? "1px solid var(--star-trail)" : "1px solid var(--ink-faint)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <span className="text-[var(--ink-secondary)]">{icon}</span>
      <span className="text-[15px] text-[var(--ink-primary)]">{label}</span>
    </button>
  );
}

function BookSearchDialog({
  onClose,
  onPick,
}: {
  onClose: () => void;
  onPick: (book: CsvBook) => void;
}) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return searchBooks(query, 12);
  }, [query]);

  return (
    <div
      className="fixed inset-0 z-40 flex items-start justify-center px-4 pt-[12vh]"
      style={{ background: "rgba(4,6,15,0.7)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[520px] overflow-hidden rounded-2xl"
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--ink-faint)",
          boxShadow: "0 30px 60px -20px rgba(0,0,0,0.6)",
          animation: "rise 0.4s var(--ease-cosmos) both",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid var(--ink-faint)" }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: "0.2em",
              color: "var(--gold)",
            }}
          >
            제목으로 책 찾기
          </div>
          <button
            onClick={onClose}
            aria-label="닫기"
            style={{ color: "var(--ink-muted)" }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Input */}
        <div
          className="flex items-center gap-3 px-5 py-3"
          style={{ borderBottom: "1px solid var(--ink-faint)" }}
        >
          <SearchIcon size={18} style={{ color: "var(--ink-secondary)" }} />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="책 제목이나 작가 이름을 입력하세요"
            className="flex-1 bg-transparent outline-none placeholder:text-[var(--ink-muted)]"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 15,
              color: "var(--ink-primary)",
            }}
          />
          {query && (
            <button onClick={() => setQuery("")} style={{ color: "var(--ink-muted)" }}>
              <X size={14} />
            </button>
          )}
        </div>

        {/* Results */}
        <div className="max-h-[55vh] overflow-y-auto px-2 py-2">
          {!query.trim() ? (
            <EmptyHint />
          ) : results.length === 0 ? (
            <NoResults query={query} />
          ) : (
            <ul className="flex flex-col">
              {results.map((b) => (
                <li key={b.id}>
                  <button
                    onClick={() => onPick(b)}
                    className="flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-[var(--bg-card-hi)]/70"
                  >
                    <div
                      className="mt-0.5 h-10 w-1.5 shrink-0 rounded-sm"
                      style={{
                        backgroundColor: coverColorFor(b.categories),
                        boxShadow: `0 0 12px ${coverColorFor(b.categories)}55`,
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <div
                        className="truncate"
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: 15,
                          color: "var(--ink-primary)",
                        }}
                      >
                        {b.title}
                      </div>
                      <div
                        className="mt-0.5 truncate"
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: 12,
                          color: "var(--ink-secondary)",
                        }}
                      >
                        {b.author || "작자 미상"}
                      </div>
                      {b.categories.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {b.categories.map((c) => (
                            <span
                              key={c}
                              className="rounded-full px-1.5 py-0.5"
                              style={{
                                border: "1px solid var(--ink-faint)",
                                background: "rgba(15,20,40,0.6)",
                                fontFamily: "var(--font-mono)",
                                fontSize: 9.5,
                                letterSpacing: "0.05em",
                                color: "var(--ink-secondary)",
                              }}
                            >
                              #{c}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyHint() {
  return (
    <div className="px-3 py-10 text-center">
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 13,
          color: "var(--ink-muted)",
          lineHeight: 1.7,
        }}
      >
        책 제목 또는 작가 이름을 입력해 보세요.
        <br />
        검색 결과에서 책을 고르면 별이 됩니다.
      </p>
    </div>
  );
}

function NoResults({ query }: { query: string }) {
  return (
    <div className="px-3 py-10 text-center">
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 13,
          color: "var(--ink-muted)",
          lineHeight: 1.7,
        }}
      >
        “{query}”에 해당하는 책을 찾지 못했어요.
      </p>
    </div>
  );
}
