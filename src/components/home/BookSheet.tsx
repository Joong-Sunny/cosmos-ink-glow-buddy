import { useEffect } from "react";
import type { Book } from "@/lib/types";
import { BookDetailPanel } from "./BookDetailPanel";

type Props = {
  book: Book | null;
  onClose: () => void;
  getBook: (id: string) => Book | undefined;
};

export function BookSheet({ book, onClose }: Props) {
  const open = !!book;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop — sibling, not child, so the parent's `transform` doesn't
          constrain it. z-35 sits above the SVG (z-10) and below the panel (z-40). */}
      {open && (
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          tabIndex={-1}
          className="fixed inset-0 z-[35] bg-[var(--bg-deep)]/30 backdrop-blur-[2px] cursor-default"
          style={{
            animation: "rise 0.25s var(--ease-cosmos) both",
          }}
        />
      )}
      <aside
        aria-hidden={!open}
        className="fixed right-8 top-1/2 z-40 w-[440px] max-h-[80vh] -translate-y-1/2 overflow-y-auto transition-all duration-500"
        style={{
          transform: open ? "translate(0, -50%)" : "translate(120%, -50%)",
          transitionTimingFunction: "var(--ease-cosmos)",
          pointerEvents: open ? "auto" : "none",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {book && <BookDetailPanel book={book} onClose={onClose} />}
      </aside>
    </>
  );
}
