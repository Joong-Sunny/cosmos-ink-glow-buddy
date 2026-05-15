import { useUiStore } from "@/lib/ui-store";

/**
 * Bottom-center "add a new star" action — pill-shaped, with a tiny
 * cross-spike star matching the universe rendering. Replaces the
 * mobile-style corner FAB so the home feels more like a desktop
 * observatory and less like a phone app.
 */
export function AddStarFab() {
  const open = useUiStore((s) => s.openRegister);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-10 z-30 flex justify-center">
      <button
        type="button"
        onClick={open}
        aria-label="새로운 별 더하기"
        className="group pointer-events-auto relative flex items-center gap-4 rounded-full px-7 py-3.5 transition-all duration-300 hover:scale-[1.02] active:scale-[0.99]"
        style={{
          border: "1px solid var(--gold)",
          background:
            "linear-gradient(180deg, rgba(232,181,71,0.08) 0%, rgba(15,20,40,0.78) 65%)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          boxShadow:
            "0 12px 40px -10px rgba(232,181,71,0.32), 0 0 0 1px rgba(232,181,71,0.18) inset",
        }}
      >
        <MiniStar />
        <span className="flex flex-col items-start leading-tight text-left">
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.24em",
              color: "var(--gold-soft)",
            }}
          >
            ADD&nbsp;·&nbsp;A NEW STAR
          </span>
          <span
            className="mt-1"
            style={{
              fontFamily: "var(--font-display-italic)",
              fontStyle: "italic",
              fontSize: 16,
              color: "var(--gold-soft)",
              letterSpacing: "-0.005em",
            }}
          >
            새로운 별을 더하기
          </span>
        </span>
        <span
          aria-hidden
          className="ml-1 transition-transform duration-300 group-hover:translate-x-0.5"
          style={{
            fontFamily: "var(--font-display-italic)",
            fontStyle: "italic",
            fontSize: 18,
            color: "var(--gold)",
            opacity: 0.7,
          }}
        >
          ⌖
        </span>
      </button>
    </div>
  );
}

function MiniStar() {
  return (
    <span className="relative grid h-9 w-9 place-items-center">
      <svg width="36" height="36" viewBox="-18 -18 36 36" className="overflow-visible">
        <defs>
          <radialGradient id="addStarHalo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E8F0FF" stopOpacity="0.65" />
            <stop offset="55%" stopColor="#8FB8FF" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#8FB8FF" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="addStarCore" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
            <stop offset="60%" stopColor="#E8F0FF" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#8FB8FF" stopOpacity="0.55" />
          </radialGradient>
        </defs>
        <circle r="17" fill="url(#addStarHalo)" className="star-halo-breathe" />
        {/* cross spikes */}
        <g style={{ mixBlendMode: "screen" }} opacity="0.75">
          <line x1="-12" y1="0" x2="12" y2="0" stroke="#E8F0FF" strokeWidth="0.7" strokeLinecap="round" />
          <line x1="0" y1="-12" x2="0" y2="12" stroke="#E8F0FF" strokeWidth="0.7" strokeLinecap="round" />
        </g>
        {/* diagonal soft rays */}
        <g opacity="0.45">
          <line x1="-7" y1="-7" x2="7" y2="7" stroke="#B8D0FF" strokeWidth="0.45" strokeLinecap="round" />
          <line x1="-7" y1="7" x2="7" y2="-7" stroke="#B8D0FF" strokeWidth="0.45" strokeLinecap="round" />
        </g>
        <circle r="3.2" fill="url(#addStarCore)" />
      </svg>
    </span>
  );
}
