import { memo, useMemo } from "react";
import type { ArcanumType } from "@/lib/types";

export type ArcanumCardProps = {
  romanNumeral: string;
  nameKrLine1: string; // e.g. "권력을"
  nameKrItalic: string; // e.g. "의심하는 자"
  nameEn: string;
  arcanumType: ArcanumType;
  /** Preferred: a single quote string. Will auto-wrap inside the card. */
  quote?: string;
  /** Legacy two-line quote — joined with a space if `quote` not supplied. */
  quoteLine1?: string;
  quoteLine2?: string;
  quoteSource?: string;
  books: number;
  stars: number;
  date: string; // "26·05·14"
  width?: number;
  height?: number;
};

function corner(transform: string) {
  return (
    <g transform={transform} stroke="var(--gold)" fill="none" opacity={0.85}>
      <path d="M0 14 Q 0 0 14 0" strokeWidth={0.7} />
      <circle cx="0" cy="0" r="1.8" fill="var(--gold)" stroke="none" />
      <line x1="6" y1="0" x2="14" y2="0" strokeWidth={0.5} />
      <line x1="0" y1="6" x2="0" y2="14" strokeWidth={0.5} />
    </g>
  );
}

/* ---------- Arcanum illustrations (compact: ~r=40 outer halo) ---------- */

function DoubtArcanum() {
  return (
    <g transform="translate(140 120)">
      <defs>
        <radialGradient id="ac-doubt-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E8B547" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#E8B547" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle r={40} fill="url(#ac-doubt-halo)" />
      <circle r={36} fill="none" stroke="var(--gold)" strokeWidth={0.6} strokeDasharray="2 2" opacity={0.5} />
      <circle r={32} fill="none" stroke="var(--gold)" strokeWidth={0.8} opacity={0.7} />

      {/* 8 small stars on r=22 */}
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i * Math.PI) / 4;
        const x = Math.cos(a) * 22;
        const y = Math.sin(a) * 22;
        return (
          <g key={i} transform={`translate(${x} ${y})`}>
            <path
              d="M 0 -1.6 L 0.5 -0.5 L 1.6 0 L 0.5 0.5 L 0 1.6 L -0.5 0.5 L -1.6 0 L -0.5 -0.5 Z"
              fill="var(--gold)"
            />
          </g>
        );
      })}
      {/* diagonal rays */}
      {[45, 135, 225, 315].map((deg) => (
        <line
          key={deg}
          x1={0}
          y1={0}
          x2={Math.cos((deg * Math.PI) / 180) * 14}
          y2={Math.sin((deg * Math.PI) / 180) * 14}
          stroke="var(--gold)"
          strokeWidth={0.4}
          opacity={0.3}
        />
      ))}
      {/* Eye (compact: -12,12) */}
      <path
        d="M -12 0 Q 0 -9 12 0 Q 0 9 -12 0 Z"
        fill="#08050C"
        stroke="var(--gold)"
        strokeWidth={1}
      />
      <circle cx={0} cy={0} r={5.5} fill="var(--gold-soft)" />
      <circle cx={0} cy={0} r={2.8} fill="#08050C" />
      <circle cx={-1} cy={-1} r={0.8} fill="#FFFFFF" />
    </g>
  );
}

function SeekerArcanum() {
  return (
    <g transform="translate(140 120)">
      <circle r={36} fill="none" stroke="var(--gold)" strokeWidth={0.5} strokeDasharray="2 2" opacity={0.5} />
      <path
        d="M 0 -22 L 5 -5 L 22 0 L 5 5 L 0 22 L -5 5 L -22 0 L -5 -5 Z"
        fill="var(--gold-soft)"
        opacity={0.85}
      />
    </g>
  );
}

function StarAlightArcanum() {
  return (
    <g transform="translate(140 120)">
      <circle r={4} fill="var(--gold-soft)" />
      {[0, 120, 240].map((deg) => {
        const r1 = 20;
        const r2 = 32;
        const a = (deg * Math.PI) / 180;
        return (
          <g key={deg}>
            <line
              x1={0}
              y1={0}
              x2={Math.cos(a) * r1}
              y2={Math.sin(a) * r1}
              stroke="var(--gold)"
              strokeWidth={0.6}
              opacity={0.7}
            />
            <line
              x1={Math.cos(a) * r1}
              y1={Math.sin(a) * r1}
              x2={Math.cos(a) * r2}
              y2={Math.sin(a) * r2}
              stroke="var(--gold)"
              strokeWidth={0.4}
              strokeDasharray="2 3"
              opacity={0.5}
            />
            <circle cx={Math.cos(a) * r1} cy={Math.sin(a) * r1} r={1.8} fill="var(--gold-soft)" />
            <circle cx={Math.cos(a) * r2} cy={Math.sin(a) * r2} r={1.1} fill="var(--gold)" opacity={0.5} />
          </g>
        );
      })}
    </g>
  );
}

export const ArcanumCard = memo(function ArcanumCard({
  romanNumeral,
  nameKrLine1,
  nameKrItalic,
  nameEn,
  arcanumType,
  quote,
  quoteLine1,
  quoteLine2,
  quoteSource = "— 너의 오늘의 생각에서",
  books,
  stars,
  date,
  width = 280,
  height = 440,
}: ArcanumCardProps) {
  const dots = useMemo(() => {
    let s = 31337;
    const r = () => {
      s = (s * 16807) % 2147483647;
      return s / 2147483647;
    };
    return Array.from({ length: 30 }, () => ({
      x: 14 + r() * 252,
      y: 14 + r() * 412,
      rad: 0.4 + r() * 0.6,
      op: 0.1 + r() * 0.08,
    }));
  }, []);

  const quoteText =
    quote ?? [quoteLine1, quoteLine2].filter(Boolean).join(" ");

  return (
    <svg viewBox="0 0 280 440" width={width} height={height} style={{ display: "block" }}>
      <defs>
        <linearGradient id="ac-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#211810" />
          <stop offset="50%" stopColor="#161028" />
          <stop offset="100%" stopColor="#0c0818" />
        </linearGradient>
      </defs>

      {/* body */}
      <rect x={0} y={0} width={280} height={440} rx={14} fill="url(#ac-bg)" stroke="var(--gold)" strokeWidth={1.1} />
      {/* inner border */}
      <rect x={12} y={12} width={256} height={416} rx={10} fill="none" stroke="var(--gold)" strokeWidth={0.4} opacity={0.45} />

      {/* star noise */}
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={d.rad} fill="#FFFFFF" opacity={d.op} />
      ))}

      {/* corners */}
      {corner("translate(20 20)")}
      {corner("translate(260 20) rotate(90)")}
      {corner("translate(260 420) rotate(180)")}
      {corner("translate(20 420) rotate(270)")}

      {/* Roman numeral band (y 0~56) */}
      <g>
        <text
          x={140}
          y={36}
          textAnchor="middle"
          fill="var(--gold-soft)"
          style={{
            fontFamily: "var(--font-display-italic)",
            fontStyle: "italic",
            fontWeight: 500,
            fontSize: 22,
            letterSpacing: 3,
          }}
        >
          {romanNumeral}
        </text>
        <text x={140 - 22} y={32} textAnchor="middle" fill="var(--gold)" opacity={0.55} style={{ fontSize: 6 }}>
          ◆
        </text>
        <text x={140 + 22} y={32} textAnchor="middle" fill="var(--gold)" opacity={0.55} style={{ fontSize: 6 }}>
          ◆
        </text>
      </g>

      {/* ARCANUM label */}
      <text
        x={140}
        y={56}
        textAnchor="middle"
        fill="var(--gold-soft)"
        opacity={0.85}
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          letterSpacing: 3.5,
        }}
      >
        ARCANUM
      </text>

      {/* Arcanum illustration (centered at y=120, ~25% of card area) */}
      {arcanumType === "doubt" && <DoubtArcanum />}
      {arcanumType === "seeker" && <SeekerArcanum />}
      {arcanumType === "starAlight" && <StarAlightArcanum />}

      {/* Divider y=185 */}
      <g>
        <line x1={48} y1={185} x2={128} y2={185} stroke="var(--gold)" strokeWidth={0.5} opacity={0.7} />
        <line x1={152} y1={185} x2={232} y2={185} stroke="var(--gold)" strokeWidth={0.5} opacity={0.7} />
        <circle cx={48} cy={185} r={1.2} fill="var(--gold)" />
        <circle cx={232} cy={185} r={1.2} fill="var(--gold)" />
        <g transform="translate(140 185) rotate(45)">
          <rect x={-3} y={-3} width={6} height={6} fill="var(--gold)" />
        </g>
      </g>

      {/* KR plain line "권력을" */}
      <text
        x={140}
        y={210}
        textAnchor="middle"
        fill="#F4F4ED"
        style={{ fontFamily: "var(--font-display)", fontSize: 15 }}
      >
        {nameKrLine1}
      </text>

      {/* KR italic title "의심하는 자" — Korean falls back to RIDIBatang serif */}
      <text
        x={140}
        y={244}
        textAnchor="middle"
        fill="var(--gold-soft)"
        style={{
          fontFamily: "var(--font-display-italic)",
          fontStyle: "italic",
          fontSize: 30,
          letterSpacing: "-0.01em",
          fontWeight: 500,
        }}
      >
        {nameKrItalic}
      </text>

      {/* English subtitle */}
      <text
        x={140}
        y={266}
        textAnchor="middle"
        fill="var(--gold-soft)"
        opacity={0.85}
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          letterSpacing: 2.0,
        }}
      >
        {nameEn}
      </text>

      {/* Quote zone — y 285~345 (h=60), foreignObject for natural Korean wrap.
          Decorative quotes sit at the corners with X-offset to avoid overlap. */}
      <text
        x={28}
        y={296}
        fill="var(--gold)"
        opacity={0.35}
        style={{ fontFamily: "var(--font-display-italic)", fontStyle: "italic", fontSize: 18 }}
      >
        “
      </text>
      <text
        x={252}
        y={342}
        textAnchor="end"
        fill="var(--gold)"
        opacity={0.35}
        style={{ fontFamily: "var(--font-display-italic)", fontStyle: "italic", fontSize: 18 }}
      >
        ”
      </text>
      <foreignObject x={42} y={285} width={196} height={62}>
        <div
          xmlns="http://www.w3.org/1999/xhtml"
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            fontFamily: "var(--font-display-italic)",
            fontStyle: "italic",
            fontSize: 12,
            lineHeight: 1.55,
            color: "#C8D4F0",
            wordBreak: "keep-all",
            overflowWrap: "break-word",
            WebkitFontSmoothing: "antialiased",
          }}
        >
          {quoteText}
        </div>
      </foreignObject>

      {/* Source */}
      <text
        x={140}
        y={365}
        textAnchor="middle"
        fill="#C8CCDC"
        opacity={0.85}
        style={{ fontFamily: "var(--font-display-italic)", fontStyle: "italic", fontSize: 9.5 }}
      >
        {quoteSource}
      </text>

      {/* Meta band (lines y=400/404, text y=414) */}
      <line x1={30} y1={400} x2={250} y2={400} stroke="var(--gold)" strokeWidth={0.5} opacity={0.7} />
      <line x1={30} y1={404} x2={250} y2={404} stroke="var(--gold)" strokeWidth={0.5} opacity={0.4} />
      <text
        x={36}
        y={418}
        fill="var(--gold-soft)"
        opacity={0.9}
        style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: 1 }}
      >
        {books} BOOKS
      </text>
      <text
        x={140}
        y={418}
        textAnchor="middle"
        fill="var(--gold)"
        style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 1 }}
      >
        ✦ {stars} STARS ✦
      </text>
      <text
        x={244}
        y={418}
        textAnchor="end"
        fill="var(--gold-soft)"
        opacity={0.9}
        style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: 1 }}
      >
        {date}
      </text>
    </svg>
  );
});

export const CARD_III: ArcanumCardProps = {
  romanNumeral: "III",
  nameKrLine1: "권력을",
  nameKrItalic: "의심하는 자",
  nameEn: "THE ONE WHO QUESTIONS POWER",
  arcanumType: "starAlight",
  quote:
    "평등은 한 번 만든다고 끝이 아니라, 매일 지켜내야 하는 약속이다.",
  quoteSource: "— 너의 동물농장 답변에서",
  books: 6,
  stars: 12,
  date: "26·05·14",
};
