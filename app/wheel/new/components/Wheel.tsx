"use client";

import { useMemo, useRef, useState } from "react";

const SIZE = 400;
const C = SIZE / 2;
const R = 182;

const COLORS = ["#7d0d1c", "#17120f", "#a5172b", "#241a12"];

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

type WheelProps = {
  names: string[];
  onWinner?: (index: number) => void;
};

export default function Wheel({ names, onWinner }: WheelProps) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const rotRef = useRef(0);

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
    if (spinning || n < 2) return;
    const winner = Math.floor(Math.random() * n);
    const center = (winner + 0.5) * seg;
    const current = rotRef.current;
    const jitter = (Math.random() - 0.5) * seg * 0.6;
    const delta =
      360 * 7 + ((((360 - center - jitter - (current % 360)) % 360) + 360) % 360);
    const next = current + delta;
    rotRef.current = next;
    setRotation(next);
    setSpinning(true);
    setTimeout(() => {
      setSpinning(false);
      onWinner?.(winner);
    }, 5400);
  }

  return (
    <div className="wheel-wrap">
      <div className="pointer" aria-hidden="true" />
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="wheel-svg"
        role="img"
        aria-label="নামের চাকা"
      >
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
          <circle
            key={i}
            cx={x}
            cy={y}
            r={4}
            className={i % 2 ? "bulb bulb-b" : "bulb bulb-a"}
          />
        ))}

        <g
          className="rotor"
          style={{
            transform: `rotate(${rotation}deg)`,
            transformOrigin: "50% 50%",
            transition: spinning
              ? "transform 5.2s cubic-bezier(0.12, 0.7, 0.1, 1)"
              : "none",
          }}
        >
          {n === 0 && <circle cx={C} cy={C} r={R} fill="#241a12" />}
          {names.map((name, i) => {
            const a0 = i * seg;
            const a1 = (i + 1) * seg;
            const mid = a0 + seg / 2;
            const label = name.length > maxChars ? name.slice(0, maxChars - 1) + "…" : name;
            const [tx, ty] = polar(mid, R - 16);
            return (
              <g key={i}>
                {n === 1 ? (
                  <circle cx={C} cy={C} r={R} fill={COLORS[0]} />
                ) : (
                  <path
                    d={slicePath(a0, a1)}
                    fill={COLORS[i % COLORS.length]}
                    stroke="#e9b949"
                    strokeWidth="1.5"
                  />
                )}
                <text
                  x={tx}
                  y={ty}
                  transform={`rotate(${mid - 90} ${tx} ${ty})`}
                  textAnchor="end"
                  dominantBaseline="central"
                  fontSize={fontSize}
                  fontWeight="600"
                  fill="#ffe9a8"
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
      </svg>

      <button
        type="button"
        className="spin-btn"
        onClick={spin}
        disabled={spinning || n < 2}
        aria-label="চাকা ঘোরান"
      >
        {spinning ? "…" : "SPIN"}
      </button>
    </div>
  );
}
