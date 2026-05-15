import { Link } from "@tanstack/react-router";
import { Search, Sparkle } from "lucide-react";

export function HomeHeader() {
  return (
    <header
      className="fixed inset-x-0 top-0 z-30 flex w-full items-center justify-between px-10 py-5"
      style={{
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        background:
          "linear-gradient(180deg, rgba(7,9,26,0.7) 0%, rgba(7,9,26,0.35) 70%, rgba(7,9,26,0) 100%)",
      }}
    >
      <Link to="/" className="flex items-center gap-3">
        <span className="relative flex h-5 w-5 items-center justify-center">
          <Sparkle
            size={18}
            className="twinkle text-[var(--star-active)]"
            fill="currentColor"
            strokeWidth={0}
          />
        </span>
        <div className="leading-none">
          <div className="font-display text-[18px] tracking-tight text-[var(--ink-primary)]">
            반짝북짝
          </div>
          <div className="font-display-italic mt-1 text-[12px] tracking-wide text-[var(--gold-soft)] opacity-85">
            The Book Universe
          </div>
        </div>
      </Link>

      <div className="flex items-center gap-3">
        <Link
          to="/search"
          className="flex h-10 items-center gap-2 rounded-full border border-[var(--ink-faint)] bg-[var(--bg-elevated)]/40 px-4 text-[var(--ink-secondary)] transition-colors hover:text-[var(--star-active)]"
        >
          <Search size={15} />
          <span className="text-[12px]" style={{ letterSpacing: "0.08em" }}>
            생각 꺼내기
          </span>
        </Link>
        <Link
          to="/worldview"
          className="flex h-10 items-center gap-2 rounded-full border border-[var(--ink-faint)] bg-[var(--bg-elevated)]/40 px-4 text-[var(--ink-secondary)] transition-colors hover:text-[var(--gold-soft)]"
        >
          <BookOpen size={15} />
          <span className="text-[12px]" style={{ letterSpacing: "0.08em" }}>
            도감
          </span>
        </Link>
        <button
          className="h-10 w-10 rounded-full border border-[var(--ink-faint)]"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, var(--star-trail) 0%, var(--bg-elevated) 70%)",
          }}
          aria-label="profile"
        />
      </div>
    </header>
  );
}
