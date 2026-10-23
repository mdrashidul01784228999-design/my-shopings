"use client";

import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useState, useCallback, useRef } from "react";

const COIN_SYMBOLS = ["৳", "$", "৳", "💵", "💸", "৳", "💰"];

/* ---------------------- সোনার কয়েন ---------------------- */
function Coin({ symbol, size }: { symbol: string; size: number }) {
  const isCurrency = symbol === "৳" || symbol === "$";
  if (!isCurrency) {
    return (
      <span
        style={{ fontSize: `${size}px` }}
        className="drop-shadow-[0_0_12px_rgba(250,204,21,0.8)] select-none"
      >
        {symbol}
      </span>
    );
  }
  return (
    <div
      style={{ width: `${size}px`, height: `${size}px`, fontSize: `${size * 0.5}px` }}
      className="rounded-full flex items-center justify-center font-black text-amber-900 bg-gradient-to-br from-yellow-100 via-yellow-400 to-amber-600 border-2 border-yellow-200/80 shadow-[0_0_18px_rgba(250,204,21,0.8)] select-none"
    >
      <span className="rounded-full border border-amber-700/50 w-[78%] h-[78%] flex items-center justify-center">
        {symbol}
      </span>
    </div>
  );
}

/* ---------------------- ৩ডি এক্সট্রুড টেক্সট ---------------------- */
function Text3D({
  text,
  className = "",
  faceClass = "",
  hue = 38,
  depth = 10,
  step = 1,
}: {
  text: string;
  className?: string;
  faceClass?: string;
  hue?: number;
  depth?: number;
  step?: number;
}) {
  return (
    <span className={`relative inline-block whitespace-nowrap ${className}`}>
      {Array.from({ length: depth }).map((_, i) => {
        const n = depth - i;
        return (
          <span
            key={i}
            aria-hidden="true"
            className="absolute inset-0 select-none pointer-events-none"
            style={{
              transform: `translate(${n * step * 0.8}px, ${n * step * 1.3}px)`,
              color: `hsl(${hue}, 75%, ${14 + (depth - n) * 2.2}%)`,
            }}
          >
            {text}
          </span>
        );
      })}
      <span className={`relative ${faceClass}`}>{text}</span>
    </span>
  );
}

/* ---------------------- মজার আর্নিং মিটার ---------------------- */
function EarningTicker() {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setValue((v) => (v >= 9999 ? 0 : v + Math.floor(Math.random() * 240) + 40));
    }, 90);
    return () => clearInterval(id);
  }, []);

  const shown = Math.min(value, 9999);

  return (
    <motion.div
      animate={{ y: [0, -6, 0] }}
      transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
      className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-yellow-300/30 shadow-[0_0_25px_rgba(250,204,21,0.35)] text-sm md:text-base"
    >
      <span>💸</span>
      <span className="text-yellow-200 font-semibold">Earning</span>
      <span className="font-black tabular-nums text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-400">
        ৳ {shown.toLocaleString("en-US")}
      </span>
      <span className="text-gray-400 hidden sm:inline">...কিন্তু পেজ নেই 🤣</span>
    </motion.div>
  );
}

/* ---------------------- প্রধান NotFound পেজ ---------------------- */
interface FallingCoin {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  symbol: string;
}

interface Spark {
  id: string;
  x: number;
  y: number;
  angle: number;
  dist: number;
  symbol: string;
}

export default function NotFound() {
  const [falling, setFalling] = useState<FallingCoin[]>([]);
  const [sparks, setSparks] = useState<Spark[]>([]);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  // মাউস অনুযায়ী ৩ডি টিল্ট
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 80, damping: 15 });
  const sy = useSpring(my, { stiffness: 80, damping: 15 });
  const rotateY = useTransform(sx, [-0.5, 0.5], [-10, 10]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [8, -8]);

  useEffect(() => {
    const count = window.innerWidth < 640 ? 9 : 16;
    setFalling(
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 96,
        size: 22 + Math.random() * 22,
        duration: 7 + Math.random() * 7,
        delay: Math.random() * 8,
        drift: (Math.random() - 0.5) * 80,
        symbol: COIN_SYMBOLS[Math.floor(Math.random() * COIN_SYMBOLS.length)],
      }))
    );

    const activeTimeouts = timeoutsRef.current;
    return () => {
      activeTimeouts.forEach(clearTimeout);
    };
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      mx.set(e.clientX / (window.innerWidth || 1) - 0.5);
      my.set(e.clientY / (window.innerHeight || 1) - 0.5);
    },
    [mx, my]
  );

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const base = `${Date.now()}-${Math.random()}`;
    const batch: Spark[] = Array.from({ length: 9 }, (_, i) => ({
      id: `${base}-${i}`,
      x: e.clientX,
      y: e.clientY,
      angle: (Math.PI * 2 * i) / 9 + Math.random() * 0.4,
      dist: 70 + Math.random() * 90,
      symbol: COIN_SYMBOLS[Math.floor(Math.random() * COIN_SYMBOLS.length)],
    }));

    setSparks((prev) => [...prev, ...batch]);

    const timer = setTimeout(() => {
      setSparks((prev) => prev.filter((s) => !batch.some((b) => b.id === s.id)));
    }, 1000);

    timeoutsRef.current.push(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onPointerMove={handlePointerMove}
      onClick={handleClick}
      className="min-h-screen flex flex-col items-center justify-center bg-black text-white relative overflow-hidden select-none py-10"
    >
      <style>{`
        @keyframes gridMove { from { background-position: 0 0; } to { background-position: 0 60px; } }
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes shimmer { 0% { transform: translateX(-120%) skewX(-20deg); } 100% { transform: translateX(320%) skewX(-20deg); } }
      `}</style>

      {/* Background Neon Glows */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-950 via-fuchsia-950 to-purple-950 opacity-40 blur-3xl pointer-events-none" />

      {/* ৩ডি গ্রিড ফ্লোর */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 h-1/2 pointer-events-none opacity-40"
        style={{
          perspective: 400,
          maskImage: "linear-gradient(to top, black, transparent)",
          WebkitMaskImage: "linear-gradient(to top, black, transparent)",
        }}
      >
        <div
          className="absolute inset-x-[-50%] bottom-0 h-[200%] origin-bottom"
          style={{
            transform: "rotateX(70deg)",
            backgroundImage:
              "linear-gradient(rgba(255,215,0,0.45) 1px, transparent 1px), linear-gradient(90deg, rgba(236,72,153,0.45) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            animation: "gridMove 2.5s linear infinite",
          }}
        />
      </div>

      {/* Floating Orbs */}
      <motion.div
        animate={{ y: [0, -30, 0], scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
        className="absolute top-10 left-20 w-48 h-48 bg-pink-500 rounded-full mix-blend-screen filter blur-3xl opacity-30 pointer-events-none"
      />
      <motion.div
        animate={{ y: [0, 30, 0], scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 0.5 }}
        className="absolute bottom-20 right-20 w-64 h-64 bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 pointer-events-none"
      />

      {/* পড়ন্ত ৩ডি কয়েন */}
      {falling.map((c) => (
        <motion.div
          key={c.id}
          className="absolute top-0 pointer-events-none"
          style={{ left: `${c.left}%`, transformStyle: "preserve-3d" }}
          initial={{ y: "-15vh" }}
          animate={{ y: "115vh", x: [0, c.drift, -c.drift, 0], rotateY: [0, 1080] }}
          transition={{ duration: c.duration, delay: c.delay, repeat: Infinity, ease: "linear" }}
        >
          <Coin symbol={c.symbol} size={c.size} />
        </motion.div>
      ))}

      {/* ক্লিক বার্স্ট */}
      {sparks.map((s) => (
        <motion.div
          key={s.id}
          className="fixed z-50 pointer-events-none"
          style={{ left: s.x - 14, top: s.y - 14 }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x: Math.cos(s.angle) * s.dist,
            y: Math.sin(s.angle) * s.dist,
            opacity: 0,
            scale: 0.4,
            rotate: 360,
          }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          <Coin symbol={s.symbol} size={28} />
        </motion.div>
      ))}

      {/* Main Content Area */}
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 1000 }}
        className="z-10 flex flex-col items-center text-center px-4"
      >
        <motion.div
          initial={{ opacity: 0, y: -40, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", bounce: 0.5, duration: 1 }}
          className="mb-3"
        >
          <div className="flex items-center justify-center gap-3">
            <motion.span
              animate={{ rotateY: [0, 360] }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
              className="inline-block"
            >
              <Coin symbol="৳" size={44} />
            </motion.span>
            <Text3D
              text="my-shop"
              hue={38}
              depth={12}
              className="text-4xl sm:text-5xl md:text-6xl font-black tracking-wide"
              faceClass="text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 via-yellow-400 to-amber-600 drop-shadow-[0_0_18px_rgba(250,204,21,0.7)]"
            />
          </div>
        </motion.div>

        {/* Earning ও Money ব্যাজ */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
          {[
            { label: "Earning", emoji: "💸", from: "from-emerald-400", to: "to-green-600", hue: 150 },
            { label: "Money", emoji: "💰", from: "from-yellow-300", to: "to-orange-500", hue: 35 },
          ].map((chip) => (
            <div
              key={chip.label}
              className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl shadow-lg backdrop-blur-sm"
            >
              <span className="text-2xl drop-shadow-[0_0_12px_rgba(255,255,255,0.6)]">{chip.emoji}</span>
              <Text3D
                text={chip.label}
                hue={chip.hue}
                depth={7}
                className="text-2xl md:text-3xl font-extrabold"
                faceClass={`text-transparent bg-clip-text bg-gradient-to-b ${chip.from} ${chip.to}`}
              />
            </div>
          ))}
        </div>

        {/* Ghost */}
        <div className="text-6xl md:text-7xl mb-2 drop-shadow-[0_0_20px_rgba(255,255,255,0.6)] animate-bounce">
          👻
        </div>

        {/* 404 Text */}
        <Text3D
          text="404"
          hue={285}
          depth={16}
          step={1.3}
          className="text-8xl md:text-9xl font-black tracking-tight"
          faceClass="text-transparent bg-clip-text bg-gradient-to-b from-pink-400 via-purple-500 to-indigo-700 drop-shadow-[0_10px_25px_rgba(236,72,153,0.5)]"
        />

        <p className="mt-6 text-xl md:text-2xl font-medium text-gray-300 max-w-md flex items-center justify-center gap-2">
          Page খুঁজে পাওয়া যাচ্ছে না! 🤔
        </p>

        {/* Earning Ticker */}
        <EarningTicker />

        {/* Home Button */}
        <motion.div
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className="mt-8 rounded-2xl relative overflow-hidden"
        >
          <Link
            href="/"
            className="relative flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 rounded-2xl font-bold text-lg border border-pink-400/20"
          >
            <span>🏠</span>
            <span>বাড়ি ফিরে চল</span>
          </Link>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}


// "use client";

// import Link from "next/link";
// import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
// import { useEffect, useState, useCallback, useRef } from "react";

// const COIN_SYMBOLS = ["৳", "$", "৳", "💵", "💸", "৳", "💰"];

// /* ---------------------- সোনার কয়েন ---------------------- */
// function Coin({ symbol, size }) {
//   const isCurrency = symbol === "৳" || symbol === "$";
//   if (!isCurrency) {
//     return (
//       <span
//         style={{ fontSize: size }}
//         className="drop-shadow-[0_0_12px_rgba(250,204,21,0.8)] select-none"
//       >
//         {symbol}
//       </span>
//     );
//   }
//   return (
//     <div
//       style={{ width: size, height: size, fontSize: size * 0.5 }}
//       className="rounded-full flex items-center justify-center font-black text-amber-900 bg-gradient-to-br from-yellow-100 via-yellow-400 to-amber-600 border-2 border-yellow-200/80 shadow-[0_0_18px_rgba(250,204,21,0.8)] select-none"
//     >
//       <span className="rounded-full border border-amber-700/50 w-[78%] h-[78%] flex items-center justify-center">
//         {symbol}
//       </span>
//     </div>
//   );
// }

// /* ---------------------- ৩ডি এক্সট্রুড টেক্সট ---------------------- */
// function Text3D({
//   text,
//   className = "",
//   faceClass = "",
//   hue = 38,
//   depth = 10,
//   step = 1,
// }) {
//   return (
//     <span className={`relative inline-block whitespace-nowrap ${className}`}>
//       {Array.from({ length: depth }).map((_, i) => {
//         const n = depth - i;
//         return (
//           <span
//             key={i}
//             aria-hidden="true"
//             className="absolute inset-0 select-none pointer-events-none"
//             style={{
//               transform: `translate(${n * step * 0.8}px, ${n * step * 1.3}px)`,
//               color: `hsl(${hue}, 75%, ${14 + (depth - n) * 2.2}%)`,
//             }}
//           >
//             {text}
//           </span>
//         );
//       })}
//       <span className={`relative ${faceClass}`}>{text}</span>
//     </span>
//   );
// }

// /* ---------------------- মজার আর্নিং মিটার ---------------------- */
// function EarningTicker() {
//   const [value, setValue] = useState(0);

//   useEffect(() => {
//     const id = setInterval(() => {
//       setValue((v) => (v >= 9999 ? 0 : v + Math.floor(Math.random() * 240) + 40));
//     }, 90);
//     return () => clearInterval(id);
//   }, []);

//   const shown = Math.min(value, 9999);

//   return (
//     <motion.div
//       animate={{ y: [0, -6, 0] }}
//       transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
//       className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-yellow-300/30 shadow-[0_0_25px_rgba(250,204,21,0.35)] text-sm md:text-base"
//     >
//       <span>💸</span>
//       <span className="text-yellow-200 font-semibold">Earning</span>
//       <span className="font-black tabular-nums text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-400">
//         ৳ {shown.toLocaleString("en-US")}
//       </span>
//       <span className="text-gray-400 hidden sm:inline">...কিন্তু পেজ নেই 🤣</span>
//     </motion.div>
//   );
// }

// export default function NotFound() {
//   const [falling, setFalling] = useState([]);
//   const [sparks, setSparks] = useState([]);
//   const timeoutsRef = useRef([]);

//   // মাউস অনুযায়ী ৩ডি টিল্ট
//   const mx = useMotionValue(0);
//   const my = useMotionValue(0);
//   const sx = useSpring(mx, { stiffness: 80, damping: 15 });
//   const sy = useSpring(my, { stiffness: 80, damping: 15 });
//   const rotateY = useTransform(sx, [-0.5, 0.5], [-10, 10]);
//   const rotateX = useTransform(sy, [-0.5, 0.5], [8, -8]);

//   useEffect(() => {
//     if (typeof window === "undefined") return;

//     const count = window.innerWidth < 640 ? 9 : 16;
//     setFalling(
//       Array.from({ length: count }, (_, i) => ({
//         id: i,
//         left: Math.random() * 96,
//         size: 22 + Math.random() * 22,
//         duration: 7 + Math.random() * 7,
//         delay: Math.random() * 8,
//         drift: (Math.random() - 0.5) * 80,
//         symbol: COIN_SYMBOLS[Math.floor(Math.random() * COIN_SYMBOLS.length)],
//       }))
//     );

//     const activeTimeouts = timeoutsRef.current;
//     return () => {
//       activeTimeouts.forEach(clearTimeout);
//     };
//   }, []);

//   const handlePointerMove = useCallback(
//     (e) => {
//       if (typeof window === "undefined") return;
//       mx.set(e.clientX / (window.innerWidth || 1) - 0.5);
//       my.set(e.clientY / (window.innerHeight || 1) - 0.5);
//     },
//     [mx, my]
//   );

//   const handleClick = useCallback((e) => {
//     const base = Date.now();
//     const batch = Array.from({ length: 9 }, (_, i) => ({
//       id: base + i + Math.random(),
//       x: e.clientX,
//       y: e.clientY,
//       angle: (Math.PI * 2 * i) / 9 + Math.random() * 0.4,
//       dist: 70 + Math.random() * 90,
//       symbol: COIN_SYMBOLS[Math.floor(Math.random() * COIN_SYMBOLS.length)],
//     }));

//     setSparks((p) => [...p, ...batch]);

//     const timer = setTimeout(() => {
//       setSparks((p) => p.filter((s) => !batch.some((b) => b.id === s.id)));
//     }, 1000);

//     timeoutsRef.current.push(timer);
//   }, []);

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       onPointerMove={handlePointerMove}
//       onClick={handleClick}
//       className="min-h-screen flex flex-col items-center justify-center bg-black text-white relative overflow-hidden select-none py-10"
//     >
//       <style>{`
//         @keyframes gridMove { from { background-position: 0 0; } to { background-position: 0 60px; } }
//         @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
//         @keyframes shimmer { 0% { transform: translateX(-120%) skewX(-20deg); } 100% { transform: translateX(320%) skewX(-20deg); } }
//       `}</style>

//       {/* Background Neon Glows */}
//       <div className="absolute inset-0 bg-gradient-to-r from-cyan-950 via-fuchsia-950 to-purple-950 opacity-40 blur-3xl pointer-events-none" />

//       {/* ৩ডি গ্রিড ফ্লোর */}
//       <div
//         aria-hidden="true"
//         className="absolute bottom-0 left-0 right-0 h-1/2 pointer-events-none opacity-40"
//         style={{
//           perspective: 400,
//           maskImage: "linear-gradient(to top, black, transparent)",
//           WebkitMaskImage: "linear-gradient(to top, black, transparent)",
//         }}
//       >
//         <div
//           className="absolute inset-x-[-50%] bottom-0 h-[200%] origin-bottom"
//           style={{
//             transform: "rotateX(70deg)",
//             backgroundImage:
//               "linear-gradient(rgba(255,215,0,0.45) 1px, transparent 1px), linear-gradient(90deg, rgba(236,72,153,0.45) 1px, transparent 1px)",
//             backgroundSize: "60px 60px",
//             animation: "gridMove 2.5s linear infinite",
//           }}
//         />
//       </div>

//       {/* Floating Orbs */}
//       <motion.div
//         animate={{ y: [0, -30, 0], scale: [1, 1.1, 1] }}
//         transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
//         className="absolute top-10 left-20 w-48 h-48 bg-pink-500 rounded-full mix-blend-screen filter blur-3xl opacity-30 pointer-events-none"
//       />
//       <motion.div
//         animate={{ y: [0, 30, 0], scale: [1, 1.1, 1] }}
//         transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 0.5 }}
//         className="absolute bottom-20 right-20 w-64 h-64 bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 pointer-events-none"
//       />

//       {/* পড়ন্ত ৩ডি কয়েন */}
//       {falling.map((c) => (
//         <motion.div
//           key={c.id}
//           className="absolute top-0 pointer-events-none"
//           style={{ left: `${c.left}%`, transformStyle: "preserve-3d" }}
//           initial={{ y: "-15vh" }}
//           animate={{ y: "115vh", x: [0, c.drift, -c.drift, 0], rotateY: [0, 1080] }}
//           transition={{ duration: c.duration, delay: c.delay, repeat: Infinity, ease: "linear" }}
//         >
//           <Coin symbol={c.symbol} size={c.size} />
//         </motion.div>
//       ))}

//       {/* ক্লিক বার্স্ট */}
//       {sparks.map((s) => (
//         <motion.div
//           key={s.id}
//           className="fixed z-50 pointer-events-none"
//           style={{ left: s.x - 14, top: s.y - 14 }}
//           initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
//           animate={{
//             x: Math.cos(s.angle) * s.dist,
//             y: Math.sin(s.angle) * s.dist,
//             opacity: 0,
//             scale: 0.4,
//             rotate: 360,
//           }}
//           transition={{ duration: 0.9, ease: "easeOut" }}
//         >
//           <Coin symbol={s.symbol} size={28} />
//         </motion.div>
//       ))}

//       {/* Main Content Area */}
//       <motion.div
//         style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 1000 }}
//         className="z-10 flex flex-col items-center text-center px-4"
//       >
//         <motion.div
//           initial={{ opacity: 0, y: -40, scale: 0.8 }}
//           animate={{ opacity: 1, y: 0, scale: 1 }}
//           transition={{ type: "spring", bounce: 0.5, duration: 1 }}
//           className="mb-3"
//         >
//           <div className="flex items-center justify-center gap-3">
//             <motion.span
//               animate={{ rotateY: [0, 360] }}
//               transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
//               className="inline-block"
//             >
//               <Coin symbol="৳" size={44} />
//             </motion.span>
//             <Text3D
//               text="my-shop"
//               hue={38}
//               depth={12}
//               className="text-4xl sm:text-5xl md:text-6xl font-black tracking-wide"
//               faceClass="text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 via-yellow-400 to-amber-600 drop-shadow-[0_0_18px_rgba(250,204,21,0.7)]"
//             />
//           </div>
//         </motion.div>

//         {/* Earning ও Money ব্যাজ */}
//         <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
//           {[
//             { label: "Earning", emoji: "💸", from: "from-emerald-400", to: "to-green-600", hue: 150 },
//             { label: "Money", emoji: "💰", from: "from-yellow-300", to: "to-orange-500", hue: 35 },
//           ].map((chip) => (
//             <div
//               key={chip.label}
//               className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl shadow-lg backdrop-blur-sm"
//             >
//               <span className="text-2xl drop-shadow-[0_0_12px_rgba(255,255,255,0.6)]">{chip.emoji}</span>
//               <Text3D
//                 text={chip.label}
//                 hue={chip.hue}
//                 depth={7}
//                 className="text-2xl md:text-3xl font-extrabold"
//                 faceClass={`text-transparent bg-clip-text bg-gradient-to-b ${chip.from} ${chip.to}`}
//               />
//             </div>
//           ))}
//         </div>

//         {/* Ghost */}
//         <div className="text-6xl md:text-7xl mb-2 drop-shadow-[0_0_20px_rgba(255,255,255,0.6)] animate-bounce">
//           👻
//         </div>

//         {/* 404 Text */}
//         <Text3D
//           text="404"
//           hue={285}
//           depth={16}
//           step={1.3}
//           className="text-8xl md:text-9xl font-black tracking-tight"
//           faceClass="text-transparent bg-clip-text bg-gradient-to-b from-pink-400 via-purple-500 to-indigo-700 drop-shadow-[0_10px_25px_rgba(236,72,153,0.5)]"
//         />

//         <p className="mt-6 text-xl md:text-2xl font-medium text-gray-300 max-w-md flex items-center justify-center gap-2">
//           Page খুঁজে পাওয়া যাচ্ছে না! 🤔
//         </p>

//         {/* Earning Ticker */}
//         <EarningTicker />

//         {/* Home Button */}
//         <motion.div
//           whileHover={{ scale: 1.08 }}
//           whileTap={{ scale: 0.95 }}
//           className="mt-8 rounded-2xl relative overflow-hidden"
//         >
//           <Link
//             href="/"
//             className="relative flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 rounded-2xl font-bold text-lg border border-pink-400/20"
//           >
//             <span>🏠</span>
//             <span>বাড়ি ফিরে চল</span>
//           </Link>
//         </motion.div>
//       </motion.div>
//     </motion.div>
//   );
// }


// // "use client";

// // import Link from "next/link";
// // import { motion } from "framer-motion";

// // export default function NotFound() {
// //   return (
// //     <motion.div
// //       initial={{ opacity: 0 }}
// //       animate={{ opacity: 1 }}
// //       className="h-screen flex flex-col items-center justify-center bg-black text-white relative overflow-hidden select-none"
// //     >
// //       {/* Background Neon Glows */}
// //       <div className="absolute inset-0 bg-gradient-to-r from-cyan-950 via-fuchsia-950 to-purple-950 opacity-40 blur-3xl" />

// //       {/* 3D Floating Orbs */}
// //       <motion.div 
// //         animate={{ y: [0, -30, 0], scale: [1, 1.1, 1] }}
// //         transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
// //         className="absolute top-10 left-20 w-48 h-48 bg-pink-500 rounded-full mix-blend-screen filter blur-3xl opacity-30"
// //       />
// //       <motion.div 
// //         animate={{ y: [0, 30, 0], scale: [1, 1.1, 1] }}
// //         transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 0.5 }}
// //         className="absolute bottom-20 right-20 w-64 h-64 bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl opacity-20"
// //       />

// //       {/* Floating Space Emojis (নড়াচড়া করা ব্যাকগ্রাউন্ড ইমোজি) */}
// //       <motion.div 
// //         animate={{ y: [0, -15, 0], rotate: [0, 10, -10, 0] }}
// //         transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
// //         className="absolute top-1/4 left-12 text-5xl md:text-6xl drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]"
// //       >
// //         🚀
// //       </motion.div>

// //       <motion.div 
// //         animate={{ y: [0, 20, 0], rotate: [0, -15, 15, 0] }}
// //         transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 0.3 }}
// //         className="absolute bottom-1/4 right-16 text-5xl md:text-6xl drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]"
// //       >
// //         🛸
// //       </motion.div>

// //       <motion.div 
// //         animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
// //         transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
// //         className="absolute top-1/3 right-1/4 text-3xl"
// //       >
// //         ✨
// //       </motion.div>

// //       {/* Main Content Area */}
// //       <div className="z-10 flex flex-col items-center text-center px-4">
        
// //         {/* Animated Ghost Emoji */}
// //         <motion.div
// //           animate={{ 
// //             y: [0, -12, 0],
// //             rotateY: [0, 180, 180, 0] // ভূতটি এদিক ওদিক তাকাবে
// //           }}
// //           transition={{ 
// //             y: { repeat: Infinity, duration: 2, ease: "easeInOut" },
// //             rotateY: { repeat: Infinity, duration: 6, ease: "easeInOut", repeatDelay: 2 }
// //           }}
// //           className="text-7xl mb-2 drop-shadow-[0_0_20px_rgba(255,255,255,0.6)]"
// //         >
// //           👻
// //         </motion.div>

// //         {/* 3D Styled 404 Text */}
// //         <h1 className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-pink-400 via-purple-500 to-indigo-700 drop-shadow-[0_10px_25px_rgba(236,72,153,0.5)] tracking-tight">
// //           404
// //         </h1>

// //         {/* Sad Thinking Emoji */}
// //         <p className="mt-4 text-xl md:text-2xl font-medium text-gray-300 max-w-md flex items-center justify-center gap-2">
// //           Page খুঁজে পাওয়া যাচ্ছে না! 
// //           <motion.span
// //             animate={{ rotate: [0, -10, 10, -10, 0] }}
// //             transition={{ repeat: Infinity, duration: 2.5, repeatDelay: 1 }}
// //             className="inline-block"
// //           >
// //             🤔
// //           </motion.span>
// //         </p>

// //         {/* Interactive 3D Home Button */}
// //         <motion.div
// //           whileHover={{ 
// //             scale: 1.08, 
// //             rotateX: 10, 
// //             rotateY: -10,
// //             boxShadow: "0px 15px 35px rgba(236, 72, 153, 0.6)"
// //           }}
// //           whileTap={{ scale: 0.95 }}
// //           style={{ transformStyle: "preserve-3d" }}
// //           className="mt-10 transition-all duration-200"
// //         >
// //           <Link
// //             href="/"
// //             className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 rounded-2xl font-bold text-lg border border-pink-400/20"
// //           >
// //             {/* Pulsing Home Emoji */}
// //             <motion.span 
// //               animate={{ scale: [1, 1.2, 1] }}
// //               transition={{ repeat: Infinity, duration: 1.5 }}
// //             >
// //               🏠
// //             </motion.span>
// //             <span>বাড়ি ফিরে চল</span>
// //           </Link>
// //         </motion.div>
// //       </div>
// //     </motion.div>
// //   );
// // }
