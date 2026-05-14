import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search as SearchIcon, X } from "lucide-react";
import { useUniverseStore } from "@/lib/store";
import { useUiStore } from "@/lib/ui-store";
import { searchBooks, type CsvBook } from "@/lib/book-database";
import { coverColorFor } from "@/lib/categories";
import type { Book } from "@/lib/types";

/**
 * Title-search popup for adding a new book. Replaces the legacy /register
 * page so users don't change routes when they tap "+" — and so cancelling
 * doesn't lose their universe-view state (active keyword, intro/explore mode).
 */
export function RegisterModal() {
  const open = useUiStore((s) => s.registerOpen);
  const close = useUiStore((s) => s.closeRegister);
  const navigate = useNavigate();

  const addBook = useUniverseStore((s) => s.addBook);
  const setCurrentBook = useUniverseStore((s) => s.setCurrentBook);
  const existingBooks = useUniverseStore((s) => s.books);

  const [query, setQuery] = useState("");
  const [igniting, setIgniting] = useState(false);

  // Reset internal state when modal closes so reopening starts fresh
  useEffect(() => {
    if (!open) {
      setQuery("");
      setIgniting(false);
    }
  }, [open]);

  // ESC closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return searchBooks(query, 12);
  }, [query]);

  function pick(csv: CsvBook) {
    if (igniting) return;
    const id = csv.id; // already `csv-…`
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
    // Close immediately, then navigate after a short beat so the transition
    // feels intentional rather than abrupt
    close();
    window.setTimeout(() => {
      navigate({ to: "/analyzing/$bookId", params: { bookId: id } });
    }, 350);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]"
      style={{ background: "rgba(4,6,15,0.7)", backdropFilter: "blur(8px)" }}
      onClick={close}
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
          <div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.2em",
                color: "var(--gold)",
              }}
            >
              새로운 별
            </div>
            <div
              className="mt-1"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 16,
                color: "var(--ink-primary)",
              }}
            >
              제목으로 책 찾기
            </div>
          </div>
          <button
            onClick={close}
            aria-label="닫기"
            className="p-1"
            style={{ color: "var(--ink-muted)" }}
          >
            <X size={18} />
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
            <Hint />
          ) : results.length === 0 ? (
            <NoResults query={query} />
          ) : (
            <ul className="flex flex-col">
              {results.map((b) => (
                <li key={b.id}>
                  <button
                    onClick={() => pick(b)}
                    disabled={igniting}
                    className="flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-[var(--bg-card-hi)]/70 disabled:opacity-50"
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

function Hint() {
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
