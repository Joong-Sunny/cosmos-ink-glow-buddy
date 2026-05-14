import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/closing")({
  component: Page,
});

function Page() {
  return (
    <main
      className="fixed inset-0 z-10 flex flex-col items-center justify-center px-6 text-center"
      style={{
        background:
          "radial-gradient(circle at 50% 45%, #1A2A50 0%, #07091A 75%)",
        animation: "rise 0.8s var(--ease-cosmos) both",
      }}
    >
      <h1
        style={{
          fontFamily: "var(--font-display-italic)",
          fontStyle: "italic",
          fontSize: 64,
          color: "var(--gold-soft)",
          lineHeight: 1,
          letterSpacing: "-0.02em",
        }}
      >
        fiat lux.
      </h1>
    </main>
  );
}
