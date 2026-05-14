import { useEffect } from "react";
import type { Book } from "@/lib/types";
import { BookDetailPanel } from "./BookDetailPanel";

/**
 * BookSheet — full-height right drawer for a single book.
 *
 * Layout contract:
 *   - The drawer is `fixed top-0 bottom-0 right-0` so it always fills the
 *     full viewport height. Width is capped (440px desktop, slightly
 *     narrower on small screens via Tailwind responsive prefix).
 *   - Backdrop is a SIBLING of the drawer (not a child) so the drawer's
 *     `transform` does not constrain it, and it always covers the viewport.
 *   - The drawer itself is just a flex container; *internal* scrolling
 *     lives inside BookDetailPanel so the close button can stay sticky.
 *
 * Close paths — every "deselect" routes through `onClose`:
 *   - Backdrop click
 *   - X button in the panel header
 *   - Escape key
 *   - (Parent: clearSelection on SVG bg click)
 */

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
      {/* Backdrop — clicking anywhere outside the panel closes it. */}
      {open && (
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          tabIndex={-1}
          className="fixed inset-0 z-[35] cursor-default bg-[var(--bg-deep)]/40 backdrop-blur-[2px]"
          style={{ animation: "rise 0.25s var(--ease-cosmos) both" }}
        />
      )}

      {/* Drawer — full viewport height, slides in from the right. */}
      <aside
        aria-hidden={!open}
        className="fixed bottom-0 right-0 top-0 z-40 flex w-full max-w-[440px] flex-col transition-transform duration-500"
        style={{
          transform: open ? "translateX(0)" : "translateX(100%)",
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
