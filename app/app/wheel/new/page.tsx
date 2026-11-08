
type Props = {}

export default function page({}: Props) {
  return (
    <div>page</div>
  )
};
// //=================== package.json ===================

// //=================== data/names.json ===================


// //=================== app/layout.js ===================
// import "./globals.css";
// import { Hind_Siliguri, Cinzel } from "next/font/google";

// const bangla = Hind_Siliguri({
//   subsets: ["bengali", "latin"],
//   weight: ["400", "500", "600", "700"],
//   variable: "--font-bangla",
//   display: "swap",
// });

// const display = Cinzel({
//   subsets: ["latin"],
//   weight: ["600", "800"],
//   variable: "--font-display",
//   display: "swap",
// });

// export const metadata = {
//   title: "ভাগ্যচক্র | Premium Spin Wheel",
//   description: "নাম লিখে চাকা ঘোরান, ভাগ্যবান বিজয়ী বেছে নিন।",
// };

// export const viewport = {
//   width: "device-width",
//   initialScale: 1,
//   themeColor: "#12060a",
// };

// export default function RootLayout({ children }) {
//   return (
//     <html lang="bn">
//       <body className={`${bangla.variable} ${display.variable}`}>{children}</body>
//     </html>
//   );
// }

// //=================== app/page.js ===================
// "use client";

// import { useState } from "react";
// import Wheel from "../components/Wheel";
// import data from "../data/names.json";

// export default function Home() {
//   const [names, setNames] = useState(data.names);
//   const [input, setInput] = useState("");
//   const [winner, setWinner] = useState(null);
//   const [removeWinner, setRemoveWinner] = useState(false);

//   function addName(e) {
//     e.preventDefault();
//     const parts = input
//       .split(/[\n,]/)
//       .map((s) => s.trim())
//       .filter(Boolean);
//     if (!parts.length) return;
//     setNames((prev) => [...prev, ...parts].slice(0, 40));
//     setInput("");
//   }

//   function removeName(i) {
//     setNames((prev) => prev.filter((_, idx) => idx !== i));
//   }

//   function handleWinner(index) {
//     setWinner(names[index]);
//   }

//   function closeModal() {
//     if (removeWinner && winner) {
//       setNames((prev) => {
//         const i = prev.indexOf(winner);
//         return i === -1 ? prev : prev.filter((_, idx) => idx !== i);
//       });
//     }
//     setWinner(null);
//   }

//   return (
//     <main className="page">
//       <header className="head">
//         <h1 className="title">{data.title}</h1>
//         <p className="sub">নাম যোগ করুন, চাকা ঘোরান, বিজয়ী বেছে নিন</p>
//       </header>

//       <section className="stage">
//         <Wheel names={names} onWinner={handleWinner} />

//         <aside className="panel">
//           <form onSubmit={addName} className="add">
//             <input
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               placeholder="নাম লিখুন (কমা দিয়ে একাধিক)"
//               aria-label="নতুন নাম"
//             />
//             <button type="submit">যোগ করুন</button>
//           </form>

//           <label className="check">
//             <input
//               type="checkbox"
//               checked={removeWinner}
//               onChange={(e) => setRemoveWinner(e.target.checked)}
//             />
//             বিজয়ীকে তালিকা থেকে সরান
//           </label>

//           <div className="list-head">
//             <span>অংশগ্রহণকারী ({names.length})</span>
//             {names.length > 0 && (
//               <button className="link" onClick={() => setNames([])}>
//                 সব মুছুন
//               </button>
//             )}
//           </div>

//           <ul className="names">
//             {names.map((n, i) => (
//               <li key={`${n}-${i}`}>
//                 <span>{n}</span>
//                 <button onClick={() => removeName(i)} aria-label={`${n} মুছুন`}>
//                   ×
//                 </button>
//               </li>
//             ))}
//             {names.length < 2 && (
//               <li className="hint">চাকা ঘোরাতে কমপক্ষে ২টি নাম দিন</li>
//             )}
//           </ul>
//         </aside>
//       </section>

//       {winner && (
//         <div className="overlay" onClick={closeModal} role="dialog" aria-modal="true">
//           <div className="modal" onClick={(e) => e.stopPropagation()}>
//             <p className="modal-label">অভিনন্দন! বিজয়ী</p>
//             <h2 className="modal-name">{winner}</h2>
//             <button className="modal-btn" onClick={closeModal}>
//               ঠিক আছে
//             </button>
//           </div>
//         </div>
//       )}
//     </main>
//   );
// }

// =================== app/globals.css ===================
// :root {
//   --bg: #12060a;
//   --bg-2: #1d0a10;
//   --gold: #f3cf6b;
//   --gold-deep: #c9922f;
//   --cream: #fff4d6;
//   --red: #a5172b;
//   --line: rgba(243, 207, 107, 0.25);
// }

// * { box-sizing: border-box; margin: 0; padding: 0; }
// html, body { min-height: 100%; }

// body {
//   font-family: var(--font-bangla), system-ui, sans-serif;
//   color: var(--cream);
//   background:
//     radial-gradient(ellipse at 50% 0%, #3a0f1a 0%, transparent 60%),
//     linear-gradient(180deg, var(--bg-2), var(--bg));
//   background-attachment: fixed;
//   -webkit-tap-highlight-color: transparent;
// }

// .page {
//   max-width: 1100px;
//   margin: 0 auto;
//   padding: 24px 16px 48px;
// }

// .head { text-align: center; margin-bottom: 20px; }

// .title {
//   font-size: clamp(2rem, 8vw, 3.4rem);
//   font-weight: 700;
//   line-height: 1.2;
//   background: linear-gradient(180deg, #fff1b8 0%, #f3cf6b 45%, #b8862b 100%);
//   -webkit-background-clip: text;
//   background-clip: text;
//   color: transparent;
// }

// .sub { color: #d9c58f; margin-top: 6px; font-size: clamp(0.9rem, 3.5vw, 1.05rem); }

// .stage {
//   display: grid;
//   grid-template-columns: 1fr;
//   gap: 28px;
//   align-items: start;
// }

// @media (min-width: 900px) {
//   .stage { grid-template-columns: 1.15fr 0.85fr; gap: 40px; }
// }

// /* ---------- Wheel ---------- */
// .wheel-wrap {
//   position: relative;
//   width: min(100%, 520px);
//   margin: 0 auto;
//   aspect-ratio: 1;
//   filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.6));
// }

// .wheel-svg { width: 100%; height: 100%; display: block; }

// .pointer {
//   position: absolute;
//   top: -4px;
//   left: 50%;
//   width: 0; height: 0;
//   transform: translateX(-50%);
//   border-left: 16px solid transparent;
//   border-right: 16px solid transparent;
//   border-top: 34px solid #ff3b4e;
//   filter: drop-shadow(0 3px 4px rgba(0, 0, 0, 0.6));
//   z-index: 3;
// }

// .bulb-a { fill: #fff2b0; animation: blinkA 1.2s infinite; }
// .bulb-b { fill: #ffb92e; animation: blinkB 1.2s infinite; }

// @keyframes blinkA { 0%,100% { opacity: 1; } 50% { opacity: 0.25; } }
// @keyframes blinkB { 0%,100% { opacity: 0.25; } 50% { opacity: 1; } }

// .spin-btn {
//   position: absolute;
//   top: 50%; left: 50%;
//   transform: translate(-50%, -50%);
//   width: 19%; aspect-ratio: 1;
//   border-radius: 50%;
//   border: 3px solid #fff1b8;
//   background: radial-gradient(circle at 35% 30%, #ff5468, #a5172b 60%, #5e0c18);
//   color: #fff4d6;
//   font-family: var(--font-display), serif;
//   font-weight: 800;
//   font-size: clamp(0.7rem, 3vw, 1.1rem);
//   letter-spacing: 0.04em;
//   cursor: pointer;
//   box-shadow: 0 6px 18px rgba(0, 0, 0, 0.6), inset 0 2px 6px rgba(255, 255, 255, 0.35);
//   z-index: 4;
//   transition: transform 0.15s;
// }
// .spin-btn:active:not(:disabled) { transform: translate(-50%, -50%) scale(0.94); }
// .spin-btn:disabled { filter: grayscale(0.5) brightness(0.8); cursor: not-allowed; }
// .spin-btn:focus-visible, button:focus-visible, input:focus-visible {
//   outline: 2px solid var(--gold);
//   outline-offset: 2px;
// }

// /* ---------- Panel ---------- */
// .panel {
//   background: linear-gradient(160deg, rgba(255, 244, 214, 0.06), rgba(255, 244, 214, 0.02));
//   border: 1px solid var(--line);
//   border-radius: 20px;
//   padding: 18px;
// }

// .add { display: flex; gap: 8px; }

// .add input {
//   flex: 1; min-width: 0;
//   padding: 12px 14px;
//   border-radius: 12px;
//   border: 1px solid var(--line);
//   background: rgba(0, 0, 0, 0.35);
//   color: var(--cream);
//   font: inherit;
//   font-size: 16px;
// }
// .add input::placeholder { color: #a89564; }

// .add button {
//   padding: 0 16px;
//   border: none;
//   border-radius: 12px;
//   background: linear-gradient(180deg, #ffe28a, #c9922f);
//   color: #2a1503;
//   font: inherit;
//   font-weight: 700;
//   cursor: pointer;
//   white-space: nowrap;
// }

// .check {
//   display: flex; align-items: center; gap: 8px;
//   margin: 14px 0 6px;
//   font-size: 0.95rem; color: #e6d7a8;
// }
// .check input { accent-color: var(--gold-deep); width: 18px; height: 18px; }

// .list-head {
//   display: flex; justify-content: space-between; align-items: center;
//   margin: 14px 0 8px;
//   color: var(--gold);
//   font-weight: 600;
// }
// .link { background: none; border: none; color: #ff8a98; cursor: pointer; font: inherit; font-size: 0.9rem; }

// .names {
//   list-style: none;
//   max-height: 300px;
//   overflow-y: auto;
//   display: grid;
//   gap: 6px;
//   padding-right: 2px;
// }

// .names li {
//   display: flex; justify-content: space-between; align-items: center;
//   padding: 10px 12px;
//   border-radius: 10px;
//   background: rgba(0, 0, 0, 0.3);
//   border: 1px solid rgba(243, 207, 107, 0.12);
// }
// .names li button {
//   background: none; border: none; color: #ff8a98;
//   font-size: 1.4rem; line-height: 1; cursor: pointer; padding: 0 4px;
// }
// .names li.hint { color: #a89564; justify-content: center; border-style: dashed; }

// /* ---------- Winner modal ---------- */
// .overlay {
//   position: fixed; inset: 0;
//   background: rgba(8, 2, 4, 0.78);
//   display: grid; place-items: center;
//   padding: 20px;
//   z-index: 50;
//   animation: fade 0.3s ease;
// }

// .modal {
//   width: min(100%, 380px);
//   text-align: center;
//   padding: 32px 24px;
//   border-radius: 24px;
//   background: linear-gradient(160deg, #3a0f1a, #17080c);
//   border: 2px solid var(--gold);
//   box-shadow: 0 0 60px rgba(243, 207, 107, 0.35);
//   animation: pop 0.45s cubic-bezier(0.2, 1.4, 0.4, 1);
// }

// .modal-label { color: #d9c58f; margin-bottom: 8px; }

// .modal-name {
//   font-size: clamp(2rem, 9vw, 2.8rem);
//   line-height: 1.25;
//   word-break: break-word;
//   background: linear-gradient(180deg, #fff1b8, #e0a93a);
//   -webkit-background-clip: text;
//   background-clip: text;
//   color: transparent;
//   margin-bottom: 22px;
// }

// .modal-btn {
//   padding: 12px 32px;
//   border: none; border-radius: 999px;
//   background: linear-gradient(180deg, #ffe28a, #c9922f);
//   color: #2a1503; font: inherit; font-weight: 700; font-size: 1rem;
//   cursor: pointer;
// }

// @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
// @keyframes pop { from { transform: scale(0.7); opacity: 0; } to { transform: scale(1); opacity: 1; } }

// @media (prefers-reduced-motion: reduce) {
//   .bulb-a, .bulb-b, .modal, .overlay { animation: none; }
// }

// =================== components/Wheel.js ===================
// "use client";

// import { useMemo, useRef, useState } from "react";

// const SIZE = 400;
// const C = SIZE / 2;
// const R = 182;

// const COLORS = ["#7d0d1c", "#17120f", "#a5172b", "#241a12"];

// function polar(angleDeg, radius) {
//   const a = (angleDeg * Math.PI) / 180;
//   return [C + radius * Math.sin(a), C - radius * Math.cos(a)];
// }

// function slicePath(a0, a1) {
//   const [x0, y0] = polar(a0, R);
//   const [x1, y1] = polar(a1, R);
//   const large = a1 - a0 > 180 ? 1 : 0;
//   return `M ${C} ${C} L ${x0} ${y0} A ${R} ${R} 0 ${large} 1 ${x1} ${y1} Z`;
// }

// export default function Wheel({ names, onWinner }) {
//   const [rotation, setRotation] = useState(0);
//   const [spinning, setSpinning] = useState(false);
//   const rotRef = useRef(0);

//   const n = names.length;
//   const seg = 360 / Math.max(n, 1);

//   const fontSize = useMemo(() => {
//     if (n <= 6) return 19;
//     if (n <= 12) return 16;
//     if (n <= 20) return 13;
//     return 10;
//   }, [n]);

//   const maxChars = n <= 8 ? 14 : n <= 16 ? 11 : 8;

//   const lights = useMemo(
//     () => Array.from({ length: 28 }, (_, i) => polar((360 / 28) * i, 193)),
//     []
//   );

//   function spin() {
//     if (spinning || n < 2) return;
//     const winner = Math.floor(Math.random() * n);
//     const center = (winner + 0.5) * seg;
//     const current = rotRef.current;
//     const jitter = (Math.random() - 0.5) * seg * 0.6;
//     const delta =
//       360 * 7 + ((((360 - center - jitter - (current % 360)) % 360) + 360) % 360);
//     const next = current + delta;
//     rotRef.current = next;
//     setRotation(next);
//     setSpinning(true);
//     setTimeout(() => {
//       setSpinning(false);
//       onWinner?.(winner);
//     }, 5400);
//   }

//   return (
//     <div className="wheel-wrap">
//       <div className="pointer" aria-hidden="true" />
//       <svg
//         viewBox={`0 0 ${SIZE} ${SIZE}`}
//         className="wheel-svg"
//         role="img"
//         aria-label="নামের চাকা"
//       >
//         <defs>
//           <radialGradient id="rim" cx="50%" cy="50%" r="50%">
//             <stop offset="88%" stopColor="#ffe28a" />
//             <stop offset="94%" stopColor="#c9922f" />
//             <stop offset="100%" stopColor="#6e4a12" />
//           </radialGradient>
//           <radialGradient id="hub" cx="40%" cy="35%" r="70%">
//             <stop offset="0%" stopColor="#fff1b8" />
//             <stop offset="55%" stopColor="#e0a93a" />
//             <stop offset="100%" stopColor="#7a5314" />
//           </radialGradient>
//         </defs>

//         <circle cx={C} cy={C} r={199} fill="url(#rim)" />
//         {lights.map(([x, y], i) => (
//           <circle
//             key={i}
//             cx={x}
//             cy={y}
//             r={4}
//             className={i % 2 ? "bulb bulb-b" : "bulb bulb-a"}
//           />
//         ))}

//         <g
//           className="rotor"
//           style={{
//             transform: `rotate(${rotation}deg)`,
//             transformOrigin: "50% 50%",
//             transition: spinning
//               ? "transform 5.2s cubic-bezier(0.12, 0.7, 0.1, 1)"
//               : "none",
//           }}
//         >
//           {n === 0 && <circle cx={C} cy={C} r={R} fill="#241a12" />}
//           {names.map((name, i) => {
//             const a0 = i * seg;
//             const a1 = (i + 1) * seg;
//             const mid = a0 + seg / 2;
//             const label = name.length > maxChars ? name.slice(0, maxChars - 1) + "…" : name;
//             const [tx, ty] = polar(mid, R - 16);
//             return (
//               <g key={i}>
//                 {n === 1 ? (
//                   <circle cx={C} cy={C} r={R} fill={COLORS[0]} />
//                 ) : (
//                   <path
//                     d={slicePath(a0, a1)}
//                     fill={COLORS[i % COLORS.length]}
//                     stroke="#e9b949"
//                     strokeWidth="1.5"
//                   />
//                 )}
//                 <text
//                   x={tx}
//                   y={ty}
//                   transform={`rotate(${mid - 90} ${tx} ${ty})`}
//                   textAnchor="end"
//                   dominantBaseline="central"
//                   fontSize={fontSize}
//                   fontWeight="600"
//                   fill="#ffe9a8"
//                   style={{ fontFamily: "var(--font-bangla), sans-serif" }}
//                 >
//                   {label}
//                 </text>
//               </g>
//             );
//           })}
//         </g>

//         <circle cx={C} cy={C} r={R + 3} fill="none" stroke="#f3cf6b" strokeWidth="3" />
//         <circle cx={C} cy={C} r={38} fill="url(#hub)" stroke="#fff1b8" strokeWidth="2" />
//       </svg>

//       <button
//         type="button"
//         className="spin-btn"
//         onClick={spin}
//         disabled={spinning || n < 2}
//         aria-label="চাকা ঘোরান"
//       >
//         {spinning ? "…" : "SPIN"}
//       </button>
//     </div>
//   );
// }
