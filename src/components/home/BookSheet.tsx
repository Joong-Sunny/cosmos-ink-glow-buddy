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
    <div
      aria-hidden={!open}
      className="fixed right-8 top-1/2 z-40 w-[440px] max-h-[80vh] -translate-y-1/2 overflow-y-auto transition-all duration-500"
      style={{
        transform: open ? "translate(0, -50%)" : "translate(120%, -50%)",
        transitionTimingFunction: "var(--ease-cosmos)",
      }}
    >
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 -z-10 bg-[var(--bg-deep)]/30 backdrop-blur-[2px]"
        />
      )}
      {book && <BookDetailPanel book={book} onClose={onClose} />}
    </div>
  );
}
