import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useUniverseStore } from "@/lib/store";
import { ArcanumCard, type ArcanumCardProps } from "@/components/worldview/ArcanumCard";
import type { WorldviewCard } from "@/lib/types";
import { FloatingPanel } from "@/components/layout/FloatingPanel";

export const Route = createFileRoute("/worldview/$cardId")({
  component: Page,
});

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
  const { cardId } = Route.useParams();
  const navigate = useNavigate();
  const card = useUniverseStore((s) => s.worldviewCards.find((c) => c.id === cardId));
  const allBooks = useUniverseStore((s) => s.books);

  if (!card) {
    return (
      <main className="relative z-10 mx-auto flex min-h-screen w-full flex-col items-center justify-center px-6 text-center">
        <span className="text-meta text-[var(--ink-secondary)]">카드를 찾을 수 없어요</span>
        <Link to="/worldview" className="mt-4" style={{ color: "var(--gold)" }}>
          ← 도감으로
        </Link>
      </main>
    );
  }

  const books = card.relatedBookIds
    .map((id) => allBooks.find((b) => b.id === id))
    .filter((b): b is NonNullable<typeof b> => Boolean(b));

  return (
    <main className="relative flex min-h-screen w-full items-start justify-center gap-10 px-10 py-12">
      <button
        onClick={() => navigate({ to: "/worldview" })}
        className="fixed left-8 top-8 z-20 grid h-10 w-10 place-items-center rounded-full border border-[var(--ink-faint)] bg-[var(--bg-elevated)]/40 text-[var(--ink-secondary)] backdrop-blur-md hover:text-[var(--star-active)]"
      >
        <ArrowLeft size={20} />
      </button>

      {/* Card column */}
      <div className="flex flex-col items-center" style={{ animation: "rise 0.6s var(--ease-cosmos) both" }}>
        <div className="text-center" style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.2em", color: "var(--gold)" }}>
          ARCANUM · {card.romanNumeral}
        </div>
        <div className="mt-4" style={{ filter: "drop-shadow(0 30px 60px rgba(232,181,71,0.18))" }}>
          <ArcanumCard {...toCardProps(card)} width={320} height={500} />
        </div>
      </div>

      {/* Sidebar panel */}
      <FloatingPanel maxWidthClass="max-w-[420px]" padding="p-8" position="center">
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            letterSpacing: "0.2em",
            color: "var(--gold)",
          }}
        >
          이 카드를 만든 별들
        </div>

        <ul className="mt-3 flex flex-col gap-2">
          {books.map((b) => (
            <li key={b.id}>
              <Link
                to="/answer/$bookId/$questionId"
                params={{ bookId: b.id, questionId: "q1" }}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 active:scale-[0.99]"
                style={{
                  background: "rgba(19,26,50,0.6)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  border: "1px solid var(--ink-faint)",
                  transition: "transform 0.2s var(--ease-cosmos)",
                }}
              >
                <span
                  className="block rounded-sm"
                  style={{
                    width: 28,
                    height: 38,
                    background: `linear-gradient(180deg, ${b.coverColor} 0%, color-mix(in srgb, ${b.coverColor} 70%, #000) 100%)`,
                    boxShadow: "inset -2px 0 0 rgba(0,0,0,0.25)",
                  }}
                />
                <span className="min-w-0 flex-1">
                  <span
                    className="block truncate"
                    style={{ fontFamily: "var(--font-display)", fontSize: 14, color: "var(--ink-primary)" }}
                  >
                    {b.title}
                  </span>
                  <span
                    className="block truncate"
                    style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--ink-muted)" }}
                  >
                    {b.author}
                  </span>
                </span>
                <span style={{ color: "var(--ink-muted)" }}>›</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-6">
          <Link
            to="/constellation/$keyword"
            params={{ keyword: card.relatedKeyword }}
            className="inline-block"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 13,
              color: "var(--gold)",
            }}
          >
            관련 별자리 보기 →
          </Link>
        </div>
      </FloatingPanel>
    </main>
  );
}
