import { useEffect, useState } from "react";

const MIN_WIDTH = 1280;

export function MinScreenGuard() {
  const [tooSmall, setTooSmall] = useState(false);

  useEffect(() => {
    const check = () => setTooSmall(window.innerWidth < MIN_WIDTH);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (!tooSmall) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center px-8 text-center"
      style={{
        background: "rgba(4,6,15,0.96)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          letterSpacing: "0.2em",
          color: "var(--gold)",
        }}
      >
        FOR DESKTOP VIEWING
      </div>
      <h1
        className="mt-6"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 28,
          color: "var(--ink-primary)",
          lineHeight: 1.4,
        }}
      >
        이 우주는{" "}
        <em
          style={{
            fontFamily: "var(--font-display-italic)",
            fontStyle: "italic",
            color: "var(--gold-soft)",
          }}
        >
          PC 화면
        </em>
        에서 봐주세요
      </h1>
      <p
        className="mt-4"
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 14,
          color: "var(--ink-secondary)",
          lineHeight: 1.7,
          maxWidth: 420,
        }}
      >
        최소 너비 1280px · 권장 1440 × 900
        <br />
        창을 더 넓게 열거나 데스크톱에서 다시 접속해주세요.
      </p>
    </div>
  );
}