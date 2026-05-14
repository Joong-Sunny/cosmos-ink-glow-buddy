import { memo, useMemo } from "react";
import type { ArcanumType } from "@/lib/types";

export type ArcanumCardProps = {
  romanNumeral: string;
  nameKrLine1: string; // e.g. "권력을"
  nameKrItalic: string; // e.g. "의심하는 자"
  nameEn: string;
  arcanumType: ArcanumType;
  quoteLine1: string;
  quoteLine2: string;
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

function DoubtArcanum() {
  return (
    <g transform="translate(140 190)">
      <defs>
        <radialGradient id="ac-doubt-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E8B547" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#E8B547" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle r={64} fill="url(#ac-doubt-halo)" />
      <circle r={58} fill="none" stroke="var(--gold)" strokeWidth={0.6} strokeDasharray="2 2" opacity={0.5} />
      <circle r={50} fill="none" stroke="var(--gold)" strokeWidth={0.8} opacity={0.7} />

      {/* 8 small stars on r=44 */}
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i * Math.PI) / 4;
        const x = Math.cos(a) * 44;
        const y = Math.sin(a) * 44;
        return (
          <g key={i} transform={`translate(${x} ${y})`}>
            <path
              d="M 0 -2 L 0.6 -0.6 L 2 0 L 0.6 0.6 L 0 2 L -0.6 0.6 L -2 0 L -0.6 -0.6 Z"
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
          x2={Math.cos((deg * Math.PI) / 180) * 24}
          y2={Math.sin((deg * Math.PI) / 180) * 24}
          stroke="var(--gold)"
          strokeWidth={0.4}
          opacity={0.3}
        />
      ))}
      {/* Eye */}
      <path
        d="M -22 0 Q 0 -16 22 0 Q 0 16 -22 0 Z"
        fill="#08050C"
        stroke="var(--gold)"
        strokeWidth={1}
      />
      <circle cx={0} cy={0} r={10} fill="var(--gold-soft)" />
      <circle cx={0} cy={0} r={5} fill="#08050C" />
      <circle cx={-1.6} cy={-1.6} r={1.2} fill="#FFFFFF" />
    </g>
  );
}

function SeekerArcanum() {
  return (
    <g transform="translate(140 190)">
      <circle r={56} fill="none" stroke="var(--gold)" strokeWidth={0.5} strokeDasharray="2 2" opacity={0.5} />
      <path
        d="M 0 -36 L 8 -8 L 36 0 L 8 8 L 0 36 L -8 8 L -36 0 L -8 -8 Z"
        fill="var(--gold-soft)"
        opacity={0.85}
      />
    </g>
  );
}

function StarAlightArcanum() {
  return (
    <g transform="translate(140 190)">
      <circle r={6} fill="var(--gold-soft)" />
      {[0, 120, 240].map((deg) => {
        const r1 = 36;
        const r2 = 56;
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
            <circle cx={Math.cos(a) * r1} cy={Math.sin(a) * r1} r={2.4} fill="var(--gold-soft)" />
            <circle cx={Math.cos(a) * r2} cy={Math.sin(a) * r2} r={1.4} fill="var(--gold)" opacity={0.5} />
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

      {/* roman numeral */}
      <g>
        <text
          x={140}
          y={46}
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
        <text x={140 - 22} y={42} textAnchor="middle" fill="var(--gold)" opacity={0.55} style={{ fontSize: 6 }}>
          ◆
        </text>
        <text x={140 + 22} y={42} textAnchor="middle" fill="var(--gold)" opacity={0.55} style={{ fontSize: 6 }}>
          ◆
        </text>
      </g>

      {/* ARCANUM */}
      <text
        x={140}
        y={72}
        textAnchor="middle"
        fill="var(--gold-deep)"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 6.5,
          letterSpacing: 3.5,
        }}
      >
        ARCANUM
      </text>

      {/* arcanum image */}
      {arcanumType === "doubt" && <DoubtArcanum />}
      {arcanumType === "seeker" && <SeekerArcanum />}
      {arcanumType === "starAlight" && <StarAlightArcanum />}

      {/* divider y=275 */}
      <g>
        <line x1={48} y1={275} x2={128} y2={275} stroke="var(--gold)" strokeWidth={0.5} opacity={0.7} />
        <line x1={152} y1={275} x2={232} y2={275} stroke="var(--gold)" strokeWidth={0.5} opacity={0.7} />
        <circle cx={48} cy={275} r={1.2} fill="var(--gold)" />
        <circle cx={232} cy={275} r={1.2} fill="var(--gold)" />
        <g transform="translate(140 275) rotate(45)">
          <rect x={-3} y={-3} width={6} height={6} fill="var(--gold)" />
        </g>
      </g>

      {/* name KR line 1 */}
      <text
        x={140}
        y={300}
        textAnchor="middle"
        fill="#F4F4ED"
        style={{ fontFamily: "var(--font-display)", fontSize: 14 }}
      >
        {nameKrLine1}
      </text>

      {/* italic name */}
      <text
        x={140}
        y={326}
        textAnchor="middle"
        fill="var(--gold-soft)"
        style={{
          fontFamily: "var(--font-display-italic)",
          fontStyle: "italic",
          fontSize: 26,
        }}
      >
        {nameKrItalic}
      </text>

      {/* English subtitle */}
      <text
        x={140}
        y={348}
        textAnchor="middle"
        fill="var(--gold-deep)"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 6.5,
          letterSpacing: 2.5,
        }}
      >
        {nameEn}
      </text>

      {/* Quote */}
      <text
        x={36}
        y={380}
        fill="var(--gold)"
        opacity={0.35}
        style={{ fontFamily: "var(--font-display-italic)", fontStyle: "italic", fontSize: 14 }}
      >
        “
      </text>
      <text
        x={140}
        y={380}
        textAnchor="middle"
        fill="#b8d0ff"
        opacity={0.95}
        style={{
          fontFamily: "var(--font-display-italic)",
          fontStyle: "italic",
          fontSize: 9.5,
        }}
      >
        {quoteLine1}
      </text>
      <text
        x={140}
        y={394}
        textAnchor="middle"
        fill="#b8d0ff"
        opacity={0.95}
        style={{
          fontFamily: "var(--font-display-italic)",
          fontStyle: "italic",
          fontSize: 9.5,
        }}
      >
        {quoteLine2}
      </text>
      <text
        x={244}
        y={394}
        fill="var(--gold)"
        opacity={0.35}
        style={{ fontFamily: "var(--font-display-italic)", fontStyle: "italic", fontSize: 14 }}
      >
        ”
      </text>

      {/* source */}
      <text
        x={140}
        y={408}
        textAnchor="middle"
        fill="#9aa0bd"
        opacity={0.75}
        style={{ fontFamily: "var(--font-display-italic)", fontStyle: "italic", fontSize: 8 }}
      >
        {quoteSource}
      </text>

      {/* meta band */}
      <line x1={30} y1={418} x2={250} y2={418} stroke="var(--gold)" strokeWidth={0.5} opacity={0.7} />
      <line x1={30} y1={422} x2={250} y2={422} stroke="var(--gold)" strokeWidth={0.5} opacity={0.4} />
      <text
        x={36}
        y={432}
        fill="var(--gold-deep)"
        style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 1 }}
      >
        {books} BOOKS
      </text>
      <text
        x={140}
        y={432}
        textAnchor="middle"
        fill="var(--gold)"
        style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 1 }}
      >
        ✦ {stars} STARS ✦
      </text>
      <text
        x={244}
        y={432}
        textAnchor="end"
        fill="var(--gold-deep)"
        style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 1 }}
      >
        {date}
      </text>
    </svg>
  );
});

export const CARD_III: ArcanumCardProps = {
  romanNumeral: "III",
  nameKrLine1: "스스로",
  nameKrItalic: "빛나는 별",
  nameEn: "A STAR ALIGHT",
  arcanumType: "starAlight",
  quoteLine1: "내 안의 질문이 켜질 때,",
  quoteLine2: "별은 비로소 스스로 빛난다.",
  books: 5,
  stars: 12,
  date: "26·05·14",
};
