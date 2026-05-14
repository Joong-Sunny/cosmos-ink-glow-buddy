import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";

export function AddStarFab() {
  return (
    <div className="fixed bottom-10 right-10 z-30 flex flex-col items-end gap-3">
      <span
        className="text-[10px]"
        style={{
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--ink-secondary)",
          opacity: 0.7,
        }}
      >
        새로운 별을 더하기
      </span>
      <Link
        to="/register"
        aria-label="새 별 등록"
        className="pulse-glow grid h-16 w-16 place-items-center rounded-full transition-transform hover:scale-105"
        style={{
          border: "1.5px solid var(--gold)",
          background:
            "radial-gradient(circle at 50% 40%, rgba(143,184,255,0.18) 0%, rgba(15,20,40,0.85) 70%)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          boxShadow: "0 8px 32px -8px rgba(232,181,71,0.35)",
        }}
      >
        <Plus size={28} className="text-[var(--star-active)]" strokeWidth={1.5} />
      </Link>
    </div>
  );
}