import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useUniverseStore } from "@/lib/store";

export const Route = createFileRoute("/star-born/$bookId")({
  component: Page,
});

function Page() {
  const navigate = useNavigate();
  const { bookId } = Route.useParams();
  const book = useUniverseStore((s) => s.books.find((b) => b.id === bookId));

  const targetKeyword = book?.keywords?.[0] ?? "사회·정의";

  const goConstellation = () =>
    navigate({
      to: "/constellation/$keyword",
      params: { keyword: targetKeyword },
    });

  // 자동 이동 제거 — CTA 클릭 시에만 이동.

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

      {/* today's thought 요약 카드 */}
      <div
        style={{
          marginTop: 32,
          padding: "20px 24px",
          maxWidth: 360,
          background: "rgba(143,184,255,0.06)",
          border: "1px solid rgba(143,184,255,0.25)",
          borderRadius: 14,
          opacity: 0,
          animation: "rise 0.8s var(--ease-cosmos) 1.5s forwards",
        }}
      >
        <div
          style={{
            color: "var(--gold-deep)",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.2em",
          }}
        >
          TODAY'S THOUGHT
        </div>
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 16,
            color: "var(--ink-primary)",
            lineHeight: 1.5,
            marginTop: 8,
          }}
        >
          권력은 처음의 평등을 흔든다. 나폴레옹의 변화는 우리에게도 일어날 수 있다.
        </p>
      </div>

      {/* 키워드 칩 3개 — stagger */}
      <div
        style={{
          marginTop: 16,
          display: "flex",
          gap: 8,
          justifyContent: "center",
        }}
      >
        {["권력", "평등", "변화"].map((kw, i) => (
          <span
            key={kw}
            style={{
              padding: "6px 14px",
              borderRadius: 999,
              background: "rgba(232,181,71,0.10)",
              border: "1px solid rgba(232,181,71,0.35)",
              color: "var(--gold-soft)",
              fontFamily: "var(--font-body)",
              fontSize: 13,
              opacity: 0,
              animation: `rise 0.6s var(--ease-cosmos) ${(2.0 + i * 0.12).toFixed(
                2,
              )}s forwards`,
            }}
          >
            #{kw}
          </span>
        ))}
      </div>

      <button
        onClick={goConstellation}
        className="mt-12 rounded-full px-7 py-3 transition-transform active:scale-[0.98]"
        style={{
          border: "1px solid var(--gold)",
          color: "var(--gold)",
          fontFamily: "var(--font-body)",
          fontSize: 14,
          background: "rgba(232,181,71,0.06)",
          opacity: 0,
          animation: "rise 0.6s var(--ease-cosmos) 2.8s forwards",
        }}
      >
        별자리에서 만나기 →
      </button>
    </main>
  );
}
