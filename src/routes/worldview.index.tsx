import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Search } from "lucide-react";
import { useUniverseStore } from "@/lib/store";
import { ArcanumCard, type ArcanumCardProps } from "@/components/worldview/ArcanumCard";
import type { WorldviewCard } from "@/lib/types";
import { FloatingPanel } from "@/components/layout/FloatingPanel";
import { useSmartBack } from "@/hooks/use-smart-back";

export const Route = createFileRoute("/worldview/")({
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
  const cards = useUniverseStore((s) => s.worldviewCards);
  const navigate = useNavigate();
  const goBack = useSmartBack("/");

  // Newest on top
  const ordered = [...cards].sort(
    (a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime(),
  );

  return (
    <main className="relative flex min-h-screen w-full items-start justify-center px-6 py-12">
      <button
        type="button"
        onClick={goBack}
        aria-label="뒤로"
        className="fixed left-8 top-8 z-20 grid h-10 w-10 place-items-center rounded-full border border-[var(--ink-faint)] bg-[var(--bg-elevated)]/40 text-[var(--ink-secondary)] backdrop-blur-md hover:text-[var(--star-active)]"
      >
        <ArrowLeft size={20} />
      </button>
      <Link
        to="/search"
        className="fixed right-8 top-8 z-20 grid h-10 w-10 place-items-center rounded-full border border-[var(--ink-faint)] bg-[var(--bg-elevated)]/40 text-[var(--ink-secondary)] backdrop-blur-md hover:text-[var(--star-active)]"
      >
        <Search size={18} />
      </Link>

      <FloatingPanel maxWidthClass="max-w-[520px]" padding="px-10 py-10">
        <div className="text-center" style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.2em", color: "var(--gold)" }}>
          COLLECTION
        </div>
        <h1 className="mt-3 text-center" style={{ fontFamily: "var(--font-display)", fontSize: 28, color: "var(--ink-primary)" }}>
          내 <em style={{ fontFamily: "var(--font-display-italic)", fontStyle: "italic", color: "var(--gold-soft)" }}>생각 도감</em>
        </h1>
        <div className="mt-1 text-center" style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--ink-secondary)" }}>
          세계관 카드{" "}
          <em style={{ fontFamily: "var(--font-display-italic)", fontStyle: "italic", color: "var(--gold)" }}>
            {ordered.length}장
          </em>
        </div>

        <div className="mt-8">
          <div className="relative mx-auto" style={{ width: 280, height: 440 + (ordered.length - 1) * 18 }}>
          {ordered.map((c, i) => {
            const offset = i * 18;
            const props = toCardProps(c);
            return (
              <button
                key={c.id}
                onClick={() => navigate({ to: "/worldview/$cardId", params: { cardId: c.id } })}
                className="absolute left-0 active:scale-[0.99]"
                style={{
                  top: offset,
                  zIndex: 100 - i,
                  filter: i === 0 ? "none" : `brightness(${1 - i * 0.12})`,
                  transform: i === 0 ? "scale(1)" : `scale(${1 - i * 0.025})`,
                  transformOrigin: "top center",
                  transition: "transform 0.3s var(--ease-cosmos)",
                  borderRadius: 14,
                  boxShadow: i === 0 ? "0 24px 60px -20px rgba(232,181,71,0.25)" : "0 8px 24px -10px rgba(0,0,0,0.5)",
                }}
              >
                <ArcanumCard {...props} />
              </button>
            );
          })}
          </div>
        </div>

        <div className="mt-8">
          <Link
            to="/search"
            className="block w-full text-center active:scale-[0.99]"
            style={{
              height: 52,
              lineHeight: "50px",
              borderRadius: 26,
              border: "1px solid var(--gold)",
              color: "var(--gold)",
              fontFamily: "var(--font-body)",
              fontSize: 15,
              fontWeight: 500,
              background: "rgba(232,181,71,0.06)",
              transition: "transform 0.2s var(--ease-cosmos)",
            }}
          >
            생각 꺼내기 →
          </Link>
        </div>
      </FloatingPanel>
    </main>
  );
}
