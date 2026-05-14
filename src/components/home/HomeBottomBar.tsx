import { Link } from "@tanstack/react-router";
import { Plus, Stars, BookOpen } from "lucide-react";

export function HomeBottomBar() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[430px] px-6 pb-[max(env(safe-area-inset-bottom),18px)] pt-3"
      style={{
        background:
          "linear-gradient(0deg, rgba(7,9,26,0.95) 0%, rgba(7,9,26,0.65) 60%, rgba(7,9,26,0) 100%)",
      }}
    >
      <div className="flex items-end justify-between">
        <Link
          to="/"
          className="flex flex-col items-center gap-1 text-[var(--star-active)]"
        >
          <Stars size={18} />
          <span className="text-meta">별자리</span>
        </Link>

        <div className="flex flex-col items-center -mt-8">
          <span
            className="text-[9px] mb-2 text-[var(--ink-secondary)]"
            style={{ letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.7 }}
          >
            새로운 별을 더하기
          </span>
          <Link
            to="/register"
            className="pulse-glow grid h-14 w-14 place-items-center rounded-full"
            style={{
              border: "1.5px solid var(--gold)",
              background:
                "radial-gradient(circle at 50% 40%, rgba(143,184,255,0.18) 0%, rgba(15,20,40,0.85) 70%)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
            aria-label="새 별 등록"
          >
            <Plus size={26} className="text-[var(--star-active)]" strokeWidth={1.5} />
          </Link>
        </div>

        <Link
          to="/worldview"
          className="flex flex-col items-center gap-1 text-[var(--ink-secondary)] transition-colors hover:text-[var(--gold-soft)]"
        >
          <BookOpen size={18} />
          <span className="text-meta">도감</span>
        </Link>
      </div>
    </nav>
  );
}
