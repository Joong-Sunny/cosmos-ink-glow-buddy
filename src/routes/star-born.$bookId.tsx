import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/star-born/$bookId")({
  component: Page,
});

function Page() {
  const navigate = useNavigate();

  useEffect(() => {
    const t = window.setTimeout(() => {
      navigate({ to: "/constellation/$keyword", params: { keyword: "사회·정의" } });
    }, 3200);
    return () => window.clearTimeout(t);
  }, [navigate]);

  return (
    <main
      className="fixed inset-0 z-20 flex flex-col items-center justify-center text-center"
      style={{
        background:
          "radial-gradient(circle at 50% 40%, #1A2A50 0%, #07091A 70%)",
        animation: "rise 0.4s var(--ease-cosmos) both",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          letterSpacing: "0.2em",
          color: "var(--gold)",
          opacity: 0,
          animation: "rise 0.6s var(--ease-cosmos) 0.3s forwards",
        }}
      >
        A NEW STAR
      </div>

      <h1
        className="mt-6"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 30,
          color: "var(--ink-primary)",
          opacity: 0,
          animation: "rise 0.6s var(--ease-cosmos) 0.5s forwards",
        }}
      >
        오늘의{" "}
        <em
          style={{
            fontFamily: "var(--font-display-italic)",
            fontStyle: "italic",
            color: "var(--star-active)",
          }}
        >
          생각
        </em>
        이 별이 되었어요
      </h1>

      <div
        className="mt-12 pulse-glow"
        style={{
          width: 120,
          height: 120,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 50% 40%, #E8F0FF 0%, #8FB8FF 55%, rgba(143,184,255,0) 75%)",
          opacity: 0,
          animation: "rise 0.8s var(--ease-cosmos) 0.8s forwards",
        }}
      />

      <button
        onClick={() =>
          navigate({ to: "/constellation/$keyword", params: { keyword: "사회·정의" } })
        }
        className="mt-12 rounded-full px-7 py-3 transition-transform active:scale-[0.98]"
        style={{
          border: "1px solid var(--gold)",
          color: "var(--gold)",
          fontFamily: "var(--font-body)",
          fontSize: 14,
          background: "rgba(232,181,71,0.06)",
          opacity: 0,
          animation: "rise 0.6s var(--ease-cosmos) 1.6s forwards",
        }}
      >
        별자리에서 보기 →
      </button>
    </main>
  );
}
