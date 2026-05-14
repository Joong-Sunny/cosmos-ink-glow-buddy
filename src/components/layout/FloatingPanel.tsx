import type { ReactNode, CSSProperties } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Tailwind max-width class, default max-w-[560px] */
  maxWidthClass?: string;
  /** Where to anchor on screen */
  position?: "center" | "right" | "left";
  padding?: string;
};

export function FloatingPanel({
  children,
  className = "",
  style,
  maxWidthClass = "max-w-[560px]",
  position = "center",
  padding = "p-8",
}: Props) {
  const align =
    position === "right"
      ? "ml-auto mr-12"
      : position === "left"
      ? "mr-auto ml-12"
      : "mx-auto";
  return (
    <div
      className={`relative z-10 w-full ${maxWidthClass} ${align} ${padding} ${className}`}
      style={{
        background: "rgba(7,9,26,0.6)",
        border: "1px solid var(--ink-faint)",
        borderRadius: 20,
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        boxShadow:
          "0 24px 80px -20px rgba(0,0,0,0.55), 0 0 0 1px rgba(143,184,255,0.04) inset",
        animation: "rise 0.6s var(--ease-cosmos) both",
        ...style,
      }}
    >
      {children}
    </div>
  );
}