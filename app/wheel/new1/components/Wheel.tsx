"use client";

import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from "react";

export type WheelHandle = { spin: () => void };

type WheelProps = {
  names: string[];
  onWinner?: (name: string) => void;
  onSpinningChange?: (spinning: boolean) => void;
};

const SIZE = 400;
const C = SIZE / 2;
const R = 182;

const SCHEMES = [
  { bg: "#b3121f", fg: "#fff4d6" }, // slot red
  { bg: "#fff1c1", fg: "#7d0d1c" }, // reel cream
  { bg: "#e0a22b", fg: "#3a1204" }, // gold
];

function schemeIndex(i: number, n: number) {
  if (n > 1 && i === n - 1 && i % 3 === 0) return 1;
  return i % 3;
}

function polar(angleDeg: number, radius: number): [number, number] {
  const a = (angleDeg * Math.PI) / 180;
  return [C + radius * Math.sin(a), C - radius * Math.cos(a)];
}

function slicePath(a0: number, a1: number): string {
  const [x0, y0] = polar(a0, R);
  const [x1, y1] = polar(a1, R);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M ${C} ${C} L ${x0} ${y0} A ${R} ${R} 0 ${large} 1 ${x1} ${y1} Z`;
}

const Wheel = forwardRef<WheelHandle, WheelProps>(function Wheel(
  { names, onWinner, onSpinningChange },
  ref
) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const rotRef = useRef(0);
  const busy = useRef(false);

  const n = names.length;
  const seg = 360 / Math.max(n, 1);

  const fontSize = useMemo(() => {
    if (n <= 6) return 19;
    if (n <= 12) return 16;
    if (n <= 20) return 13;
    return 10;
  }, [n]);

  const maxChars = n <= 8 ? 14 : n <= 16 ? 11 : 8;

  const lights = useMemo(
    () => Array.from({ length: 28 }, (_, i) => polar((360 / 28) * i, 193)),
    []
  );

  function spin() {
    if (busy.current || n < 2) return;
    const winnerIndex = Math.floor(Math.random() * n);
    const winnerName = names[winnerIndex];
    const center = (winnerIndex + 0.5) * seg;
    const current = rotRef.current;
    const jitter = (Math.random() - 0.5) * seg * 0.6;
    const delta =
      360 * 7 + ((((360 - center - jitter - (current % 360)) % 360) + 360) % 360);
    const next = current + delta;
    rotRef.current = next;
    busy.current = true;
    setRotation(next);
    setSpinning(true);
    onSpinningChange?.(true);
    setTimeout(() => {
      busy.current = false;
      setSpinning(false);
      onSpinningChange?.(false);
      onWinner?.(winnerName);
    }, 5400);
  }

  useImperativeHandle(ref, () => ({ spin }));

  return (
    <div className="wheel-wrap">
      <div className="pointer" aria-hidden="true" />
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="wheel-svg" role="img" aria-label="নামের চাকা">
        <defs>
          <radialGradient id="rim" cx="50%" cy="50%" r="50%">
            <stop offset="88%" stopColor="#ffe28a" />
            <stop offset="94%" stopColor="#c9922f" />
            <stop offset="100%" stopColor="#6e4a12" />
          </radialGradient>
          <radialGradient id="hub" cx="40%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#fff1b8" />
            <stop offset="55%" stopColor="#e0a93a" />
            <stop offset="100%" stopColor="#7a5314" />
          </radialGradient>
        </defs>

        <circle cx={C} cy={C} r={199} fill="url(#rim)" />
        {lights.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={4} className={i % 2 ? "bulb bulb-b" : "bulb bulb-a"} />
        ))}

        <g
          style={{
            transform: `rotate(${rotation}deg)`,
            transformOrigin: "50% 50%",
            transition: spinning ? "transform 5.2s cubic-bezier(0.12, 0.7, 0.1, 1)" : "none",
          }}
        >
          {n === 0 && <circle cx={C} cy={C} r={R} fill="#fff1c1" />}
          {names.map((name, i) => {
            const a0 = i * seg;
            const a1 = (i + 1) * seg;
            const mid = a0 + seg / 2;
            const sc = SCHEMES[schemeIndex(i, n)];
            const label = name.length > maxChars ? name.slice(0, maxChars - 1) + "…" : name;
            const [tx, ty] = polar(mid, R - 16);
            return (
              <g key={i}>
                {n === 1 ? (
                  <circle cx={C} cy={C} r={R} fill={sc.bg} />
                ) : (
                  <path d={slicePath(a0, a1)} fill={sc.bg} stroke="#8a5a10" strokeWidth="1.5" />
                )}
                <text
                  x={tx}
                  y={ty}
                  transform={`rotate(${mid - 90} ${tx} ${ty})`}
                  textAnchor="end"
                  dominantBaseline="central"
                  fontSize={fontSize}
                  fontWeight="700"
                  fill={sc.fg}
                  style={{ fontFamily: "var(--font-bangla), sans-serif" }}
                >
                  {label}
                </text>
              </g>
            );
          })}
        </g>

        <circle cx={C} cy={C} r={R + 3} fill="none" stroke="#f3cf6b" strokeWidth="3" />
        <circle cx={C} cy={C} r={38} fill="url(#hub)" stroke="#fff1b8" strokeWidth="2" />
        <text
          x={C}
          y={C + 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="44"
          fontWeight="800"
          fill="#b3121f"
          stroke="#fff1b8"
          strokeWidth="1"
          style={{ fontFamily: "var(--font-display), serif" }}
        >
          7
        </text>
      </svg>
    </div>
  );
});

export default Wheel;
