import { Link } from "@tanstack/react-router";
import { useUniverseStore } from "@/lib/store";

const ROUTES: Array<{ to: string; label: string; params?: Record<string, string> }> = [
  { to: "/", label: "/" },
  { to: "/register", label: "/register" },
  { to: "/analyzing/$bookId", label: "/analyzing/b01", params: { bookId: "b01" } },
  { to: "/questions/$bookId", label: "/questions/b01", params: { bookId: "b01" } },
  {
    to: "/answer/$bookId/$questionId",
    label: "/answer/b01/q1",
    params: { bookId: "b01", questionId: "q1" },
  },
  { to: "/star-born/$bookId", label: "/star-born/b01", params: { bookId: "b01" } },
  { to: "/constellation/$keyword", label: "/constellation/권력", params: { keyword: "권력" } },
  { to: "/worldview", label: "/worldview" },
  { to: "/worldview/$cardId", label: "/worldview/wc-i", params: { cardId: "wc-i" } },
  { to: "/search", label: "/search" },
];

export function DevNav() {
  const hidden = useUniverseStore((s) => s.devNavHidden);
  const setHidden = useUniverseStore((s) => s.setDevNavHidden);

  if (hidden) {
    return (
      <button
        onClick={() => setHidden(false)}
        className="fixed bottom-3 left-3 z-50 rounded-full border border-[var(--ink-faint)] bg-[var(--bg-deep)]/80 px-3 py-1 text-meta text-[var(--ink-secondary)] backdrop-blur-md hover:text-[var(--star-active)]"
      >
        DEV
      </button>
    );
  }

  return (
    <div className="fixed bottom-3 left-3 z-50 max-h-[60vh] w-56 overflow-auto rounded-xl border border-[var(--ink-faint)] bg-[var(--bg-deep)]/85 p-3 backdrop-blur-md">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-meta text-[var(--gold)]">DEV · ROUTES</span>
        <button
          onClick={() => setHidden(true)}
          className="text-meta text-[var(--ink-secondary)] hover:text-[var(--star-active)]"
        >
          HIDE
        </button>
      </div>
      <ul className="space-y-1">
        {ROUTES.map((r) => (
          <li key={r.label}>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <Link
              to={r.to as never}
              params={(r.params ?? {}) as never}
              className="block rounded px-2 py-1 text-caption text-[var(--ink-secondary)] hover:bg-[var(--bg-card-hi)] hover:text-[var(--ink-primary)]"
              activeProps={{ className: "text-[var(--star-active)]" }}
            >
              {r.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
