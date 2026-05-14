import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, Crosshair, ScanBarcode, PencilLine } from "lucide-react";
import { useUniverseStore } from "@/lib/store";
import { FloatingPanel } from "@/components/layout/FloatingPanel";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [{ title: "새로운 별 · 반짝북짝" }],
  }),
  component: RegisterPage,
});

const TARGET_BOOK_ID = "b01"; // 동물농장 — 시연용 고정

function RegisterPage() {
  const navigate = useNavigate();
  const setCurrentBook = useUniverseStore((s) => s.setCurrentBook);
  const [igniting, setIgniting] = useState(false);

  function startFlow() {
    if (igniting) return;
    setIgniting(true);
    setCurrentBook(TARGET_BOOK_ID);
    window.setTimeout(() => {
      navigate({ to: "/analyzing/$bookId", params: { bookId: TARGET_BOOK_ID } });
    }, 1200);
  }

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center px-6 py-12">
      <Link
        to="/"
        className="fixed left-8 top-8 z-20 grid h-10 w-10 place-items-center rounded-full border border-[var(--ink-faint)] bg-[var(--bg-elevated)]/40 text-[var(--ink-secondary)] backdrop-blur-md transition-colors hover:text-[var(--star-active)]"
        aria-label="뒤로"
      >
        <ChevronLeft size={20} strokeWidth={1.5} />
      </Link>

      <FloatingPanel maxWidthClass="max-w-[560px]" padding="px-10 py-12">
      <header
        className="text-center transition-opacity duration-700"
        style={{ opacity: igniting ? 0.25 : 1 }}
      >
        <div className="text-meta text-[var(--gold)]" style={{ letterSpacing: "0.2em" }}>
          새로운 별
        </div>
        <h1
          className="mt-4 font-display text-[32px] leading-[1.25] tracking-[-0.02em] text-[var(--ink-primary)]"
        >
          이번엔 어떤{" "}
          <span className="font-display-italic text-[var(--star-active)]">책</span>
          을<br />우주에 더할까요?
        </h1>
      </header>

      {/* Center star */}
      <div className="mt-10 flex justify-center">
        <button
          onClick={startFlow}
          aria-label="책 추가하기"
          className="relative grid place-items-center"
          style={{ width: 160, height: 160 }}
        >
          <svg
            width={160}
            height={160}
            viewBox="0 0 160 160"
            className="overflow-visible"
          >
            <defs>
              <radialGradient id="addHalo" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#B8D0FF" stopOpacity="0.55" />
                <stop offset="60%" stopColor="#8FB8FF" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#8FB8FF" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="addCore" cx="50%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#E8F0FF" stopOpacity="1" />
                <stop offset="60%" stopColor="#8FB8FF" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#5A78C2" stopOpacity="0.55" />
              </radialGradient>
            </defs>
            <circle cx={80} cy={80} r={72} fill="url(#addHalo)" />
            <circle
              cx={80}
              cy={80}
              r={44}
              fill="url(#addCore)"
              className="pulse-glow"
              style={{ animationDuration: igniting ? "1.2s" : "2.5s" }}
            />
            {/* + symbol */}
            <line x1={80} y1={68} x2={80} y2={92} stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" />
            <line x1={68} y1={80} x2={92} y2={80} stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Cards */}
      <div
        className="mt-10 flex flex-col gap-3 transition-opacity duration-700"
        style={{ opacity: igniting ? 0 : 1, pointerEvents: igniting ? "none" : "auto" }}
      >
        <RegisterCard
          icon={<Crosshair size={20} strokeWidth={1.4} />}
          label="표지 촬영으로 등록"
          primary
          onClick={startFlow}
        />
        <RegisterCard
          icon={<ScanBarcode size={20} strokeWidth={1.4} />}
          label="바코드 스캔"
          onClick={startFlow}
        />
        <RegisterCard
          icon={<PencilLine size={20} strokeWidth={1.4} />}
          label="제목으로 직접 검색"
          onClick={startFlow}
        />
      </div>
      </FloatingPanel>
    </main>
  );
}

function RegisterCard({
  icon,
  label,
  primary,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  primary?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-4 rounded-[14px] px-4 py-4 text-left transition-colors hover:bg-[var(--bg-card-hi)]/70"
      style={{
        background: "rgba(19,26,50,0.55)",
        border: primary ? "1px solid var(--star-trail)" : "1px solid var(--ink-faint)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <span className="text-[var(--ink-secondary)]">{icon}</span>
      <span className="text-[15px] text-[var(--ink-primary)]">{label}</span>
    </button>
  );
}
