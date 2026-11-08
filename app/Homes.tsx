"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  Variants,
  useMotionValue,
  useSpring,
  useTransform,
  useScroll,
} from "framer-motion";
import { useRouter } from "next/navigation";
import Homepages from "./Home";
import Footers from "./footers/page";
import PremiumSlider from "./Slider_img/page";

import {
  ShoppingBag, Sun, Moon, Search,
  LogIn, LogOut, User,
  AlertTriangle, Smartphone, X, Sparkles, TrendingUp, TrendingDown, Home as HomeIcon, ArrowUp,
} from "lucide-react";

import { AreaChart, Area, Tooltip, ResponsiveContainer } from "recharts";
import Image from "next/image";
import CountUp from "react-countup";
import { FaFacebook } from "react-icons/fa";

/* ------------------------------------------------------------------ */
/*  Neon ৩ডি শেপ কালেকশন (শুধু CSS, কোনো লাইব্রেরি লাগে না)             */
/*  Cube, Pyramid, Gyro (৩ রিং), Orb + ব্যাকগ্রাউন্ড ফিল্ড              */
/*  সাইজ clamp() দিয়ে PC ও মোবাইলে নিজে নিজে মানিয়ে নেয়              */
/* ------------------------------------------------------------------ */

const NEON = {
  cyan: "#22d3ee",
  pink: "#f472b6",
  violet: "#a78bfa",
  lime: "#a3e635",
  amber: "#fbbf24",
  blue: "#60a5fa",
};

type ShapeProps = {
  color?: string;
  size?: string; // যেমন "clamp(34px, 7vw, 72px)"
  className?: string;
  delay?: number;
};

const faceBase = (c: string): React.CSSProperties => ({
  position: "absolute",
  inset: 0,
  border: `2px solid ${c}`,
  background: `linear-gradient(135deg, ${c}33, transparent 60%, ${c}22)`,
  boxShadow: `0 0 14px ${c}, inset 0 0 16px ${c}66`,
  backfaceVisibility: "visible",
});

/* ---------------- Cube ---------------- */
function Cube({ color = NEON.cyan, size = "clamp(34px, 7vw, 72px)", className, delay = 0 }: ShapeProps) {
  const faces = [
    "rotateY(0deg)",
    "rotateY(90deg)",
    "rotateY(180deg)",
    "rotateY(-90deg)",
    "rotateX(90deg)",
    "rotateX(-90deg)",
  ];
  return (
    <div className={className} style={{ perspective: 700 }} aria-hidden>
      <div className="ns-float" style={{ animationDelay: `${delay}s` }}>
        <div
          className="ns-spin-cube"
          style={{ width: size, height: size, position: "relative", transformStyle: "preserve-3d", animationDelay: `${delay}s` }}
        >
          {faces.map((f, i) => (
            <div key={i} style={{ ...faceBase(color), transform: `${f} translateZ(calc(${size} / 2))` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Pyramid ---------------- */
function Pyramid({ color = NEON.pink, size = "clamp(36px, 7vw, 76px)", className, delay = 0 }: ShapeProps) {
  return (
    <div className={className} style={{ perspective: 700 }} aria-hidden>
      <div className="ns-float" style={{ animationDelay: `${delay}s` }}>
        <div
          className="ns-spin-y"
          style={{ width: size, height: size, position: "relative", transformStyle: "preserve-3d", animationDelay: `${delay}s` }}
        >
          {[0, 90, 180, 270].map((deg) => (
            <div
              key={deg}
              style={{
                position: "absolute",
                left: 0,
                bottom: 0,
                width: "100%",
                height: "111.8%",
                transformOrigin: "50% 100%",
                transform: `rotateY(${deg}deg) translateZ(calc(${size} / 2)) rotateX(26.57deg)`,
                clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
                background: `linear-gradient(180deg, ${color}, ${color}22)`,
                filter: `drop-shadow(0 0 8px ${color})`,
                opacity: 0.85,
              }}
            />
          ))}
          {/* বেস */}
          <div style={{ ...faceBase(color), transform: `rotateX(90deg) translateZ(calc(${size} / -2))`, opacity: 0.5 }} />
        </div>
      </div>
    </div>
  );
}

/* ---------------- Gyro (৩টি ঘূর্ণায়মান নিয়ন রিং) ---------------- */
function Gyro({ color = NEON.violet, size = "clamp(48px, 9vw, 96px)", className, delay = 0 }: ShapeProps) {
  const ring = (anim: string, c: string, inset: string): React.CSSProperties => ({
    position: "absolute",
    inset,
    borderRadius: "9999px",
    border: `3px solid ${c}`,
    boxShadow: `0 0 14px ${c}, inset 0 0 14px ${c}88`,
    animation: `${anim} 7s linear infinite`,
    animationDelay: `${delay}s`,
  });
  return (
    <div className={className} style={{ perspective: 700 }} aria-hidden>
      <div className="ns-float" style={{ animationDelay: `${delay}s` }}>
        <div style={{ width: size, height: size, position: "relative", transformStyle: "preserve-3d" }}>
          <div style={ring("nsRX", color, "0")} />
          <div style={ring("nsRY", NEON.cyan, "10%")} />
          <div style={ring("nsRZ", NEON.pink, "20%")} />
          <div
            style={{
              position: "absolute",
              inset: "42%",
              borderRadius: "9999px",
              background: "#fff",
              boxShadow: `0 0 18px 6px ${color}`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

/* ---------------- Orb (গ্লসি নিয়ন গোলক) ---------------- */
function Orb({ color = NEON.lime, size = "clamp(26px, 5vw, 54px)", className, delay = 0 }: ShapeProps) {
  return (
    <div className={className} aria-hidden>
      <div
        className="ns-float"
        style={{
          width: size,
          height: size,
          borderRadius: "9999px",
          animationDelay: `${delay}s`,
          background: `radial-gradient(circle at 30% 28%, #ffffffcc 0%, ${color} 28%, ${color}88 55%, #00000088 100%)`,
          boxShadow: `0 0 22px ${color}, 0 0 50px ${color}77, inset -6px -8px 14px #00000066`,
        }}
      />
    </div>
  );
}

/* ---------------- ব্যাকগ্রাউন্ড শেপ ফিল্ড ---------------- */
function NeonShapes() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <style>{`
        @keyframes nsFloat { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-18px) } }
        @keyframes nsSpinCube { from { transform: rotateX(-25deg) rotateY(0deg) } to { transform: rotateX(335deg) rotateY(360deg) } }
        @keyframes nsSpinY { from { transform: rotateX(-18deg) rotateY(0deg) } to { transform: rotateX(-18deg) rotateY(360deg) } }
        @keyframes nsRX { to { transform: rotateX(360deg) } }
        @keyframes nsRY { to { transform: rotateY(360deg) } }
        @keyframes nsRZ { from { transform: rotateY(70deg) rotateZ(0deg) } to { transform: rotateY(70deg) rotateZ(360deg) } }
        .ns-float { animation: nsFloat 5.5s ease-in-out infinite; }
        .ns-spin-cube { animation: nsSpinCube 14s linear infinite; }
        .ns-spin-y { animation: nsSpinY 11s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .ns-float, .ns-spin-cube, .ns-spin-y { animation: none !important; }
        }
      `}</style>

      {/* সবগুলো স্ক্রিনে দেখা যায় (ছোট সাইজে) */}
      <Cube className="absolute top-[14%] left-[4%] opacity-80" color={NEON.cyan} delay={0} />
      <Pyramid className="absolute top-[30%] right-[5%] opacity-80" color={NEON.pink} delay={1.2} />
      <Orb className="absolute top-[55%] left-[7%] opacity-90" color={NEON.lime} delay={0.6} />
      <Gyro className="absolute bottom-[12%] right-[8%] opacity-80" color={NEON.violet} delay={2} />

      {/* শুধু ট্যাবলেট ও PC এ বাড়তি শেপ */}
      <Cube className="hidden md:block absolute top-[62%] right-[22%] opacity-70" color={NEON.amber} delay={1.8} />
      <Orb className="hidden md:block absolute top-[10%] right-[30%] opacity-90" color={NEON.pink} delay={0.3} />
      <Pyramid className="hidden lg:block absolute bottom-[8%] left-[28%] opacity-70" color={NEON.blue} delay={2.4} />
      <Gyro className="hidden lg:block absolute top-[44%] left-[46%] opacity-40" color={NEON.cyan} delay={1} />
    </div>
  );
}

// টাইপ ডেফিনিশন
interface TickerType {
  symbol: string;
  name: string;
  price: number;
  change: number;
}

// Data
const marketData = Array.from({ length: 24 }).map((_, i) => ({
  time: `${i}:00`,
  price: 100 + Math.sin(i / 2) * 8 + (i % 5),
}));

const tickers: TickerType[] = [
  { symbol: "R-coin", name: "R Coin", price: 15.0, change: +2.3 },
  { symbol: "G-coin", name: "G-coin", price: 1.0, change: -0.8 },
  { symbol: "M-coin", name: "M-coin", price: 2.0, change: +1.1 },
  { symbol: "P-coin", name: "P-coin", price: 2.0, change: +0.4 },
];

// প্রতিটি টিকারের নিজস্ব রঙ
const tickerGlow = ["#38bdf8", "#f472b6", "#a78bfa", "#34d399"];

const fadeUp = (delay: number = 0): Variants => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, delay, type: "spring", bounce: 0.3 } },
});

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

/* ------------------------------------------------------------------ */
/*  ৩ডি টিল্ট র‍্যাপার (মাউস + টাচ), গ্লেয়ার সহ                          */
/* ------------------------------------------------------------------ */
function Tilt({
  children,
  className,
  max = 10,
  lift = 0,
}: {
  children: React.ReactNode;
  className?: string;
  max?: number;
  lift?: number;
}) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 170, damping: 18 });
  const sy = useSpring(my, { stiffness: 170, damping: 18 });
  const rotateX = useTransform(sy, [-0.5, 0.5], [max, -max]);
  const rotateY = useTransform(sx, [-0.5, 0.5], [-max, max]);
  const glareX = useTransform(sx, [-0.5, 0.5], ["0%", "100%"]);
  const glareY = useTransform(sy, [-0.5, 0.5], ["0%", "100%"]);

  return (
    <div style={{ perspective: 1100 }} className={className}>
      <motion.div
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          mx.set((e.clientX - r.left) / r.width - 0.5);
          my.set((e.clientY - r.top) / r.height - 0.5);
        }}
        onPointerLeave={() => {
          mx.set(0);
          my.set(0);
        }}
        whileHover={{ y: -lift, scale: 1.02 }}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d", touchAction: "pan-y" }}
        className="relative h-full group"
      >
        {children}
        {/* গ্লেয়ার */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute w-40 h-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/25 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-soft-light"
          style={{ left: glareX, top: glareY }}
        />
      </motion.div>
    </div>
  );
}


/* ------------------------------------------------------------------ */
/*  LUXURY: সোনালি ধুলো, ৩ডি গোল্ড কয়েন, ডিভাইডার                        */
/* ------------------------------------------------------------------ */
function GoldDust() {
  const [dots, setDots] = useState<{ l: number; t: number; s: number; d: number; du: number }[]>([]);
  useEffect(() => {
    const n = window.innerWidth < 640 ? 14 : 30;
    setDots(
      Array.from({ length: n }, () => ({
        l: Math.random() * 100,
        t: Math.random() * 100,
        s: 2 + Math.random() * 4,
        d: Math.random() * 6,
        du: 6 + Math.random() * 8,
      }))
    );
  }, []);
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-[5] overflow-hidden">
      {dots.map((p, i) => (
        <span
          key={i}
          className="hs-anim absolute rounded-full"
          style={{
            left: `${p.l}%`,
            top: `${p.t}%`,
            width: p.s,
            height: p.s,
            background: "radial-gradient(circle,#fff7cc,#fbbf24 60%,transparent)",
            boxShadow: "0 0 10px 2px rgba(251,191,36,.8)",
            animation: `hsDust ${p.du}s ease-in-out ${p.d}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ---- Bitcoin স্টাইল "R" চিহ্ন (হেলানো R + ওপরে-নিচে দুটো করে দাগ) ---- */
function BitR({ size }: { size: string }) {
  const bar: React.CSSProperties = {
    position: "absolute",
    width: `calc(${size} * 0.03)`,
    height: `calc(${size} * 0.09)`,
    background: "#fff",
    borderRadius: 2,
    boxShadow: "0 0 6px #fffa",
  };
  return (
    <div style={{ position: "relative", display: "inline-block", transform: "rotate(14deg)", lineHeight: 1 }}>
      <span
        style={{
          fontSize: `calc(${size} * 0.52)`,
          fontWeight: 900,
          color: "#fff",
          fontFamily: "system-ui, sans-serif",
          textShadow: "0 2px 0 #b45309, 0 5px 12px rgba(124,45,18,.75)",
        }}
      >
        R
      </span>
      <i style={{ ...bar, left: "30%", top: "-8%" }} />
      <i style={{ ...bar, left: "52%", top: "-8%" }} />
      <i style={{ ...bar, left: "30%", bottom: "-8%" }} />
      <i style={{ ...bar, left: "52%", bottom: "-8%" }} />
    </div>
  );
}

function CoinFace({ size, flip }: { size: string; flip?: boolean }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: "50%",
        // দাঁতওয়ালা (serrated) কিনারা
        background: "repeating-conic-gradient(from 0deg, #fff1b8 0 3deg, #b45309 3deg 6deg)",
        boxShadow: "inset 0 0 0 2px #78350f",
        transform: `${flip ? "rotateY(180deg) translateZ(14px)" : "translateZ(14px)"}`,
        backfaceVisibility: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "6%",
          borderRadius: "50%",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "radial-gradient(circle at 30% 25%, #ffe29a 0%, #f7931a 38%, #c2410c 100%)",
          boxShadow: "inset 0 0 20px #7c2d12, inset 0 3px 6px #fff8",
        }}
      >
        <div style={{ position: "absolute", inset: "7%", borderRadius: "50%", border: "2px dashed rgba(255,255,255,.55)" }} />
        <BitR size={size} />
        {/* হলোগ্রাফিক রংধনু শিন */}
        <div
          className="hs-anim"
          style={{
            position: "absolute",
            inset: "-10%",
            background: "conic-gradient(from 0deg,#ff00cc66,#00ffff66,#ffee0066,#00ff9966,#ff00cc66)",
            mixBlendMode: "color-dodge",
            opacity: 0.6,
            animation: "hsSpin 6s linear infinite",
          }}
        />
        {/* গ্লস */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(135deg, rgba(255,255,255,.6) 0%, transparent 38%, transparent 62%, rgba(255,255,255,.22) 100%)",
          }}
        />
      </div>
    </div>
  );
}

function GoldCoin({ size = "clamp(100px, 21vw, 160px)" }: { size?: string }) {
  return (
    // filter বাইরে রাখা হয়েছে, কারণ ৩ডি এলিমেন্টে filter দিলে ৩ডি চ্যাপ্টা হয়ে যায়
    <div className="hs-anim relative" aria-hidden style={{ animation: "hsCoinGlow 4s ease-in-out infinite" }}>
      {/* ঘূর্ণায়মান রংধনু হ্যালো */}
      <div
        className="hs-anim absolute -inset-5 -z-10 rounded-full blur-2xl opacity-70"
        style={{ background: "conic-gradient(#f7931a,#ec4899,#22d3ee,#a3e635,#f7931a)", animation: "hsSpin 8s linear infinite" }}
      />
      {/* অরবিটিং রঙিন স্পার্কল */}
      <div className="hs-anim pointer-events-none absolute -inset-7" style={{ animation: "hsSpin 5s linear infinite" }}>
        <span className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-cyan-300 shadow-[0_0_14px_4px_#22d3ee]" />
        <span className="absolute bottom-[10%] left-[8%] h-2 w-2 rounded-full bg-pink-400 shadow-[0_0_12px_4px_#f472b6]" />
        <span className="absolute bottom-[10%] right-[8%] h-2 w-2 rounded-full bg-lime-300 shadow-[0_0_12px_4px_#a3e635]" />
      </div>

      <div style={{ perspective: 900 }}>
        <div
          className="hs-anim"
          style={{
            width: size,
            height: size,
            position: "relative",
            transformStyle: "preserve-3d",
            animation: "hsCoinSpin 7s linear infinite",
          }}
        >
          {/* কয়েনের পুরুত্ব (ধারে সোনা-কমলা দাগ) */}
          {Array.from({ length: 11 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                background: i % 2 ? "#fbbf24" : "#b45309",
                transform: `translateZ(${(i - 5) * 2.6}px)`,
              }}
            />
          ))}
          <CoinFace size={size} />
          <CoinFace size={size} flip />
        </div>
      </div>
    </div>
  );
}

/* ছোট R কয়েন আইকন (নেভবার চিপের জন্য) */
function MiniCoin() {
  return (
    <span
      aria-hidden
      className="hs-anim relative inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
      style={{
        background: "radial-gradient(circle at 30% 25%, #ffe29a 0%, #f7931a 45%, #c2410c 100%)",
        border: "2px solid #fde68a",
        boxShadow: "0 0 10px rgba(247,147,26,.9), inset 0 0 6px #7c2d12",
        animation: "hsMiniPulse 2.4s ease-in-out infinite",
      }}
    >
      <span style={{ position: "relative", display: "inline-block", transform: "rotate(14deg)", color: "#fff", fontWeight: 900, fontSize: 12, lineHeight: 1, textShadow: "0 1px 0 #b45309" }}>
        R
        <i style={{ position: "absolute", left: "24%", top: "-30%", width: 1.5, height: 4, background: "#fff" }} />
        <i style={{ position: "absolute", left: "56%", top: "-30%", width: 1.5, height: 4, background: "#fff" }} />
        <i style={{ position: "absolute", left: "24%", bottom: "-30%", width: 1.5, height: 4, background: "#fff" }} />
        <i style={{ position: "absolute", left: "56%", bottom: "-30%", width: 1.5, height: 4, background: "#fff" }} />
      </span>
    </span>
  );
}

function LuxDivider({ title }: { title: string }) {
  return (
    <div className="mx-auto max-w-5xl px-6 py-6 flex items-center gap-3 sm:gap-5">
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-400 to-amber-300" />
      <span className="hs-anim h-2.5 w-2.5 rotate-45 bg-gradient-to-br from-amber-200 to-amber-500 shadow-[0_0_14px_3px_rgba(251,191,36,.9)]" style={{ animation: "hsSpin 6s linear infinite" }} />
      <span className="hs-gold-text text-sm sm:text-lg font-black tracking-[0.25em] uppercase text-center">{title}</span>
      <span className="hs-anim h-2.5 w-2.5 rotate-45 bg-gradient-to-br from-amber-200 to-amber-500 shadow-[0_0_14px_3px_rgba(251,191,36,.9)]" style={{ animation: "hsSpin 6s linear infinite reverse" }} />
      <span className="h-px flex-1 bg-gradient-to-l from-transparent via-amber-400 to-amber-300" />
    </div>
  );
}

export default function HomeShowcasePage() {
  const router = useRouter();
  const [coins, setCoins] = useState<number>(0);
  const [dark, setDark] = useState<boolean>(true);
  const [q, setQ] = useState<string>("");
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);
  const [names, setNames] = useState<string | null>(null);
  const [images, setImages] = useState<string>("");

  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [searchedValue, setSearchedValue] = useState<string>(" ");

  // LUXURY: স্পটলাইট, স্ক্রল বার, ক্লিক স্পার্কল
  const spotRef = useRef<HTMLDivElement>(null);
  const [bursts, setBursts] = useState<{ id: number; x: number; y: number; sp: { dx: number; dy: number; s: number; c: string }[] }[]>([]);
  const { scrollYProgress } = useScroll();
  const barScale = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });

  // UPGRADE: স্প্ল্যাশ, কয়েন টোস্ট, টপে ফেরার বাটন
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [showTop, setShowTop] = useState<boolean>(false);
  const [toast, setToast] = useState<{ id: number; amount: number } | null>(null);
  const prevCoins = useRef<number>(0);
  const ready = useRef<boolean>(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowSplash(false), 1300);
    const t2 = setTimeout(() => {
      ready.current = true;
    }, 2200);
    const onScroll = () => setShowTop(window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // কয়েন বাড়লে সুন্দর টোস্ট (পেজ লোডের সময় দেখাবে না)
  useEffect(() => {
    if (!ready.current) {
      prevCoins.current = coins;
      return;
    }
    if (coins > prevCoins.current) {
      const id = Date.now();
      setToast({ id, amount: coins - prevCoins.current });
      setTimeout(() => setToast((t) => (t && t.id === id ? null : t)), 3500);
    }
    prevCoins.current = coins;
  }, [coins]);

  const goTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const goSearch = () => {
    goTop();
    setTimeout(() => document.getElementById("hero-search")?.focus(), 500);
  };

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (spotRef.current) {
      spotRef.current.style.transform = `translate3d(${e.clientX - 220}px, ${e.clientY - 220}px, 0)`;
      spotRef.current.style.opacity = e.pointerType === "mouse" ? "1" : "0";
    }
  };

  const handleBurst = (e: React.MouseEvent<HTMLDivElement>) => {
    const id = Date.now() + Math.random();
    const cols = ["#fde68a", "#fbbf24", "#f472b6", "#22d3ee", "#a78bfa"];
    const sp = Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2 + Math.random() * 0.5;
      const d = 40 + Math.random() * 70;
      return { dx: Math.cos(a) * d, dy: Math.sin(a) * d, s: 3 + Math.random() * 5, c: cols[Math.floor(Math.random() * cols.length)] };
    });
    setBursts((p) => [...p.slice(-5), { id, x: e.clientX, y: e.clientY, sp }]);
    setTimeout(() => setBursts((p) => p.filter((b) => b.id !== id)), 900);
  };

  // ডার্ক মোড প্রিফারেন্স
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setDark(true);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData") || "[]");
    if (userData[0]) {
      setNames(userData[0].name || "test-name");
      setImages(userData[0].img || "");
    }
  }, []);

  const handleLogout = () => {
    if (window.confirm("Are you sure?")) {
      localStorage.removeItem("userData");
      setNames(null);
      router.push("/Login");
    }
  };

  const hander_redires = (id: string) => {
    if (id === "Login") router.push("/Login");
    else if (id === "profile") router.push("/profile");
  };

  useEffect(() => {
    const updateCoins = () => {
      const userData = localStorage.getItem("coin");
      if (userData) setCoins(Number(userData) || 0);
    };
    updateCoins();
    const interval = setInterval(updateCoins, 1000);
    return () => clearInterval(interval);
  }, []);

  const triggerSearch = (e: React.FormEvent) => {
    if (e) e.preventDefault();
    if (q.trim() !== "") {
      setSearchedValue(q);
      setIsSearchModalOpen(true);
    }
  };

  return (
    <div onPointerMove={handleMove} onClick={handleBurst} className="relative isolate min-h-screen pb-20 md:pb-0 overflow-x-clip bg-[#f5f3ff] dark:bg-[#05030f] text-slate-900 dark:text-slate-100 transition-colors duration-500">
      {/* কাস্টম কীফ্রেম */}
      <style>{`
        @keyframes hsSpin { to { transform: rotate(360deg); } }
        @keyframes hsGradient { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        @keyframes hsBlob1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(70px,-50px) scale(1.2); } }
        @keyframes hsBlob2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-80px,50px) scale(1.15); } }
        @keyframes hsBlob3 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(50px,70px) scale(1.25); } }
        @keyframes hsMarquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes hsShine { 0%,60% { transform: translateX(-130%); } 100% { transform: translateX(130%); } }
        @keyframes hsCoin { 0%,100% { transform: rotateY(0deg); } 50% { transform: rotateY(180deg); } }
        @keyframes hsCoinGlow { 0%,100% { filter: drop-shadow(0 0 18px rgba(247,147,26,.95)); } 33% { filter: drop-shadow(0 0 26px rgba(236,72,153,.9)); } 66% { filter: drop-shadow(0 0 26px rgba(34,211,238,.9)); } }
        @keyframes hsMiniPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.12); } }
        @keyframes hsFoil { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        @keyframes hsDust { 0%,100% { transform: translateY(0) scale(1); opacity: .2; } 50% { transform: translateY(-40px) scale(1.6); opacity: 1; } }
        @keyframes hsCoinSpin { from { transform: rotateY(0deg) rotateX(12deg); } to { transform: rotateY(360deg) rotateX(12deg); } }
        @keyframes hsReveal { from { opacity: 0; transform: translateY(30px) rotateX(-18deg); } to { opacity: 1; transform: none; } }
        .hs-gold-text { background-image: linear-gradient(100deg,#b45309,#fde68a,#f59e0b,#fff7cc,#b45309); background-size: 250% 100%; animation: hsFoil 5s ease-in-out infinite; -webkit-background-clip: text; background-clip: text; color: transparent; filter: drop-shadow(0 0 8px rgba(251,191,36,.55)); }
        .hs-gold-card { background-image: linear-gradient(135deg,#fde68a,#b45309,#fde68a,#f59e0b,#fff7cc); background-size: 300% 300%; animation: hsFoil 6s ease-in-out infinite; }
        .hs-noise::after { content:""; position:absolute; inset:0; pointer-events:none; opacity:.05; background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>"); mix-blend-mode: overlay; }
        @media (prefers-reduced-motion: reduce) { .hs-gold-text, .hs-gold-card { animation: none !important; } }
        @keyframes hsNeonPulse { 0%,100% { filter: drop-shadow(0 0 4px rgba(236,72,153,.8)) drop-shadow(0 0 12px rgba(99,102,241,.6)); } 50% { filter: drop-shadow(0 0 8px rgba(34,211,238,.95)) drop-shadow(0 0 26px rgba(217,70,239,.85)); } }
        @keyframes hsNeonBox { 0%,100% { box-shadow: 0 0 8px rgba(251,146,60,.7), 0 0 22px rgba(236,72,153,.5); } 50% { box-shadow: 0 0 16px rgba(34,211,238,.9), 0 0 42px rgba(217,70,239,.8), 0 0 70px rgba(99,102,241,.5); } }
        .hs-neon-glow { animation: hsNeonPulse 3s ease-in-out infinite; }
        .hs-neon-box { animation: hsNeonBox 3s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .hs-neon-glow, .hs-neon-box { animation: none !important; } }
        .hs-grad-text { background-image: linear-gradient(90deg,#6366f1,#ec4899,#f59e0b,#10b981,#6366f1); background-size: 300% 100%; animation: hsGradient 7s ease-in-out infinite; -webkit-background-clip: text; background-clip: text; color: transparent; }
        @media (prefers-reduced-motion: reduce) { .hs-anim, .hs-grad-text { animation: none !important; } }
      `}</style>

      {/* ---------- LUXURY ওভারলে ---------- */}
      <motion.div
        aria-hidden
        className="fixed top-0 left-0 right-0 h-[3px] z-[70] origin-left bg-[linear-gradient(90deg,#b45309,#fde68a,#f59e0b,#fff7cc)] shadow-[0_0_14px_#fbbf24]"
        style={{ scaleX: barScale }}
      />
      <div
        ref={spotRef}
        aria-hidden
        className="hidden md:block pointer-events-none fixed top-0 left-0 -z-[1] h-[440px] w-[440px] rounded-full opacity-0 transition-opacity duration-300 bg-[radial-gradient(circle,rgba(251,191,36,.16),rgba(167,139,250,.1)_45%,transparent_70%)]"
      />
      <GoldDust />

      {/* ---------- UPGRADE: স্প্ল্যাশ ইন্ট্রো ---------- */}
      <AnimatePresence>
        {showSplash && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.08 }}
            transition={{ duration: 0.6 }}
            className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-8 bg-[radial-gradient(circle_at_center,#1e1b4b,#05030f_70%)]"
          >
            <GoldCoin size="clamp(90px, 26vw, 130px)" />
            <div className="hs-gold-text text-2xl sm:text-3xl font-black tracking-[0.4em] uppercase">MyShops</div>
            <div className="h-1 w-40 overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                className="h-full rounded-full bg-[linear-gradient(90deg,#f7931a,#ec4899,#22d3ee)] shadow-[0_0_12px_#f7931a]"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* কয়েন যোগ হলে টোস্ট */}
      <div className="pointer-events-none fixed inset-x-0 top-20 z-[120] flex justify-center px-4" style={{ perspective: 800 }}>
        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -40, scale: 0.8, rotateX: -40 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
              exit={{ opacity: 0, y: -30, scale: 0.9 }}
              transition={{ type: "spring", bounce: 0.4 }}
              className="hs-gold-card rounded-2xl p-[1.5px] shadow-[0_15px_50px_rgba(247,147,26,.55)]"
            >
              <div className="flex items-center gap-3 rounded-[14px] bg-white/95 dark:bg-slate-950/95 px-4 py-3">
                <MiniCoin />
                <div className="leading-tight">
                  <p className="hs-gold-text text-base font-black">+{toast.amount.toLocaleString()} R</p>
                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">কয়েন যোগ হয়েছে</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* টপে ফেরার বাটন (স্ক্রল রিংসহ) */}
      <AnimatePresence>
        {showTop && (
          <motion.button
            aria-label="উপরে যান"
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5 }}
            whileHover={{ scale: 1.1, rotate: -6 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              goTop();
            }}
            className="fixed right-4 bottom-24 md:bottom-8 z-[60] flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 via-orange-500 to-pink-600 text-white shadow-[0_0_24px_rgba(247,147,26,.8)] cursor-pointer"
          >
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 48 48" aria-hidden>
              <circle cx="24" cy="24" r="21" fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="3" />
              <motion.circle cx="24" cy="24" r="21" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" style={{ pathLength: barScale }} />
            </svg>
            <ArrowUp size={20} className="relative" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* মোবাইল বটম নেভিগেশন */}
      <nav
        aria-label="মোবাইল নেভিগেশন"
        onClick={(e) => e.stopPropagation()}
        className="md:hidden fixed bottom-3 inset-x-3 z-[60] grid grid-cols-4 items-end rounded-3xl border border-white/60 dark:border-white/10 bg-white/75 dark:bg-slate-900/75 backdrop-blur-2xl px-2 py-2 shadow-[0_10px_40px_rgba(99,102,241,.4)]"
      >
        <div aria-hidden className="absolute top-0 left-6 right-6 h-px bg-[linear-gradient(90deg,transparent,#fbbf24,#ec4899,#22d3ee,transparent)]" />
        {[
          { label: "হোম", icon: <HomeIcon size={20} />, onClick: goTop },
          { label: "সার্চ", icon: <Search size={20} />, onClick: goSearch },
          {
            label: `${coins.toLocaleString()} R`,
            icon: <MiniCoin />,
            onClick: () => document.getElementById("premium-club")?.scrollIntoView({ behavior: "smooth" }),
            gold: true,
          },
          { label: "প্রোফাইল", icon: <User size={20} />, onClick: () => hander_redires(names ? "profile" : "Login") },
        ].map((it) => (
          <motion.button
            key={it.label}
            whileTap={{ scale: 0.88, y: 2 }}
            onClick={it.onClick}
            className={cn(
              "flex flex-col items-center gap-1 rounded-2xl py-1.5 text-[10px] font-bold",
              it.gold ? "text-amber-600 dark:text-amber-300" : "text-slate-500 dark:text-slate-300"
            )}
          >
            <span className={cn("flex h-7 items-center justify-center", it.gold && "-mt-5 h-10 w-10 rounded-full bg-white dark:bg-slate-900 shadow-[0_0_20px_rgba(247,147,26,.8)] ring-2 ring-amber-300")}>
              {it.icon}
            </span>
            <span className="truncate max-w-full">{it.label}</span>
          </motion.button>
        ))}
      </nav>

      <AnimatePresence>
        {bursts.map((b) => (
          <div key={b.id} className="pointer-events-none fixed z-[90]" style={{ left: b.x, top: b.y }}>
            {b.sp.map((sp, i) => (
              <motion.span
                key={i}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{ x: sp.dx, y: sp.dy, opacity: 0, scale: 0.2, rotate: 200 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute rounded-sm"
                style={{ width: sp.s, height: sp.s, background: sp.c, boxShadow: `0 0 10px ${sp.c}` }}
              />
            ))}
          </div>
        ))}
      </AnimatePresence>

      {/* ---------- রঙিন অ্যানিমেটেড ব্যাকগ্রাউন্ড ---------- */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,#e0e7ff_0%,#fdf2f8_45%,#f5f3ff_100%)] dark:bg-[radial-gradient(ellipse_at_top_left,#1e1b4b_0%,#0b0620_45%,#02010a_100%)]" />
        <div className="hs-anim absolute -top-24 -left-24 h-80 w-80 sm:h-[26rem] sm:w-[26rem] rounded-full bg-fuchsia-500/30 dark:bg-fuchsia-600/30 blur-[100px]" style={{ animation: "hsBlob1 14s ease-in-out infinite" }} />
        <div className="hs-anim absolute top-1/3 -right-24 h-80 w-80 sm:h-[28rem] sm:w-[28rem] rounded-full bg-cyan-400/30 dark:bg-cyan-500/25 blur-[110px]" style={{ animation: "hsBlob2 16s ease-in-out infinite" }} />
        <div className="hs-anim absolute bottom-0 left-1/4 h-80 w-80 sm:h-[26rem] sm:w-[26rem] rounded-full bg-amber-400/25 dark:bg-amber-500/20 blur-[100px]" style={{ animation: "hsBlob3 18s ease-in-out infinite" }} />
        {/* Neon ৩ডি শেপ */}
        <NeonShapes />
        {/* গ্রিড */}
        <div className="absolute inset-0 opacity-[0.07] dark:opacity-[0.09] bg-[linear-gradient(#6366f1_1px,transparent_1px),linear-gradient(90deg,#6366f1_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      </div>

      {/* --- PREMIUM TOPBAR --- */}
      <nav className="sticky top-0 z-50 bg-white/65 dark:bg-slate-950/60 backdrop-blur-2xl border-b border-white/40 dark:border-white/10 shadow-[0_8px_30px_rgba(99,102,241,0.12)]">
        {/* গ্রেডিয়েন্ট লাইন */}
        <div className="hs-anim absolute bottom-0 left-0 h-[2px] w-full bg-[linear-gradient(90deg,#6366f1,#ec4899,#f59e0b,#10b981,#6366f1)] bg-[length:300%_100%]" style={{ animation: "hsGradient 6s linear infinite" }} />
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div style={{ perspective: 600 }}>
              <motion.div
                whileHover={{ rotateY: 180, scale: 1.1 }}
                transition={{ duration: 0.7 }}
                style={{ transformStyle: "preserve-3d" }}
                className="relative p-[3px] rounded-2xl bg-[conic-gradient(from_0deg,#6366f1,#ec4899,#f59e0b,#10b981,#6366f1)] shadow-[0_8px_25px_rgba(236,72,153,0.4)]"
              >
                <Image src="/favicon.png" alt="logo" width={38} height={38} className="rounded-xl bg-white p-0.5" />
              </motion.div>
            </div>
            <div className="flex flex-col leading-none">
              <span className="hs-grad-text hs-neon-glow font-black text-lg sm:text-2xl tracking-tighter uppercase">
                MyShops
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] hidden sm:flex items-center gap-1">
                <Sparkles size={10} className="text-amber-400" /> Official
              </span>
            </div>
          </div>

          {/* Search */}
          <form onSubmit={triggerSearch} className="hidden lg:flex flex-1 max-w-md mx-10 relative group">
            <div className="absolute -inset-[2px] rounded-2xl bg-[linear-gradient(90deg,#6366f1,#ec4899,#f59e0b)] opacity-0 group-focus-within:opacity-100 blur-[2px] transition-opacity" />
            <Search className="absolute z-10 left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-fuchsia-500 transition-colors" />
            <input
              className="relative w-full bg-white/80 dark:bg-slate-800/70 border border-slate-200/70 dark:border-white/10 rounded-2xl py-2.5 pl-11 pr-4 text-sm outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 dark:text-white text-slate-900 shadow-inner"
              placeholder="পণ্য বা অ্যাপ খুঁজুন..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </form>

          {/* Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* কয়েন চিপ */}
            <motion.div
              whileHover={{ scale: 1.06, rotate: -1 }}
              className="relative overflow-hidden flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-pink-500 text-white hs-neon-box cursor-help"
            >
              <MiniCoin />
              <span className="font-black text-xs sm:text-sm drop-shadow">
                <CountUp end={coins} duration={1} separator="," /> R
              </span>
              <span aria-hidden className="hs-anim absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent" style={{ animation: "hsShine 3s ease-in-out infinite" }} />
            </motion.div>

            {/* Utility */}
            <div className="flex items-center bg-white/70 dark:bg-slate-800/70 backdrop-blur rounded-2xl p-1 gap-1 border border-white/60 dark:border-white/10 shadow">
              <button onClick={() => router.push("/test")} className="p-2 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-xl transition-all text-blue-600 hover:scale-110">
                <FaFacebook size={18} />
              </button>
              <button onClick={() => setDark(!dark)} className="p-2 hover:bg-amber-50 dark:hover:bg-slate-700 rounded-xl transition-all flex items-center justify-center hover:scale-110 hover:rotate-12">
                {dark ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-indigo-500" />}
              </button>
            </div>

            {/* Profile */}
            <div className="relative group ml-0.5">
              <motion.div
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.08 }}
                className="w-10 h-10 rounded-full p-[2.5px] bg-[conic-gradient(from_0deg,#6366f1,#ec4899,#f59e0b,#10b981,#6366f1)] shadow-[0_0_18px_rgba(236,72,153,0.5)] cursor-pointer"
              >
                <img
                  src={
                    images
                      ? `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}/profile_users/${images}`
                      : `https://api.dicebear.com/7.x/avataaars/svg?seed=Felix`
                  }
                  alt="avatar"
                  className="w-full h-full object-cover rounded-full bg-white"
                />
              </motion.div>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10, rotateX: -15 }}
                    animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    className="absolute right-0 mt-3 w-56 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-[24px] shadow-[0_20px_60px_rgba(99,102,241,0.35)] border border-white/60 dark:border-white/10 p-2 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b dark:border-slate-800 bg-gradient-to-r from-indigo-500/10 via-fuchsia-500/10 to-amber-500/10 rounded-2xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Account</p>
                      <p className="font-bold truncate text-sm text-slate-900 dark:text-white">{names || "Welcome, Guest"}</p>
                    </div>
                    <div className="p-1 space-y-1 mt-1">
                      <button onClick={() => hander_redires("profile")} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
                        <User size={16} /> প্রোফাইল
                      </button>
                      {names ? (
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors">
                          <LogOut size={16} /> লগ আউট
                        </button>
                      ) : (
                        <button onClick={() => hander_redires("Login")} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                          <LogIn size={16} /> লগ ইন
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* লাইভ টিকার মার্কি */}
        <div className="relative overflow-hidden border-t border-white/40 dark:border-white/5 bg-gradient-to-r from-indigo-500/10 via-fuchsia-500/10 to-amber-500/10">
          <div className="hs-anim flex w-max gap-8 py-1.5 text-[11px] font-bold" style={{ animation: "hsMarquee 22s linear infinite" }}>
            {[...tickers, ...tickers, ...tickers, ...tickers].map((t, i) => (
              <span key={i} className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="text-slate-500 dark:text-slate-400">{t.symbol}</span>
                <span className="text-slate-800 dark:text-slate-100">৳{t.price.toFixed(2)}</span>
                <span className={t.change >= 0 ? "text-emerald-500" : "text-rose-500"}>
                  {t.change >= 0 ? "▲" : "▼"} {Math.abs(t.change)}%
                </span>
              </span>
            ))}
          </div>
        </div>
      </nav>

      {/* --- HERO & MARKET DASHBOARD --- */}
      <section className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 min-w-0">
            <motion.div initial="initial" animate="animate" variants={fadeUp(0)}>
              <Tilt max={4}>
                <div className="relative rounded-[28px] p-[2px] bg-[conic-gradient(from_0deg,#6366f1,#ec4899,#f59e0b,#10b981,#6366f1)] hs-neon-box">
                  <div className="rounded-[26px] overflow-hidden bg-white dark:bg-slate-950">
                    <PremiumSlider />
                  </div>
                  {/* কোণার ৩ডি নিয়ন শেপ */}
                  <div className="pointer-events-none absolute -top-5 -right-2 sm:-top-8 sm:-right-6 z-20" style={{ transform: "translateZ(60px)" }}>
                    <Gyro size="clamp(40px, 8vw, 80px)" />
                  </div>
                  <div className="pointer-events-none absolute -bottom-4 -left-2 sm:-bottom-6 sm:-left-5 z-20">
                    <Pyramid size="clamp(30px, 6vw, 56px)" />
                  </div>
                </div>
              </Tilt>
            </motion.div>

            {/* সার্চ বক্স */}
            <motion.div initial="initial" animate="animate" variants={fadeUp(0.2)}>
              <form onSubmit={triggerSearch} className="relative group">
                <div className="absolute -inset-1 rounded-3xl bg-[linear-gradient(90deg,#6366f1,#ec4899,#f59e0b,#10b981)] bg-[length:300%_100%] opacity-40 group-hover:opacity-80 blur-lg transition-opacity hs-anim" style={{ animation: "hsGradient 6s ease-in-out infinite" }} />
                <div className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur rounded-2xl flex items-center px-4 py-3 shadow-2xl border border-white/70 dark:border-white/10">
                  <Smartphone className="text-fuchsia-500 mr-3 shrink-0" size={20} />
                  <input
                    className="bg-transparent border-none outline-none w-full text-sm font-medium dark:text-white text-slate-900 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    id="hero-search"
                    placeholder="আইডি বা মোবাইল নাম্বার দিন..."
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.1, rotate: 8 }}
                    whileTap={{ scale: 0.9 }}
                    className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-fuchsia-600 to-pink-500 text-white p-2.5 rounded-xl shadow-[0_6px_20px_rgba(217,70,239,0.5)] cursor-pointer"
                  >
                    <Search size={18} className="relative z-10" />
                    <span aria-hidden className="hs-anim absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent" style={{ animation: "hsShine 3s ease-in-out infinite" }} />
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>

          {/* Right: ৩ডি মার্কেট কার্ড */}
          <motion.div initial="initial" animate="animate" variants={fadeUp(0.3)} className="lg:col-span-5 min-w-0">
            <Tilt max={9} lift={4}>
              <div className="relative">
                {/* কোণার ৩ডি নিয়ন শেপ */}
                <div className="pointer-events-none absolute -top-6 -right-2 sm:-top-10 sm:-right-6 z-20" style={{ transform: "translateZ(70px)" }}>
                  <Cube size="clamp(30px, 6vw, 56px)" />
                </div>
                <div className="pointer-events-none absolute -bottom-5 -left-2 sm:-bottom-8 sm:-left-6 z-20" style={{ transform: "translateZ(50px)" }}>
                  <Orb size="clamp(24px, 5vw, 46px)" />
                </div>
                {/* পেছনের গভীরতা */}
                <div aria-hidden className="absolute inset-0 rounded-[34px] bg-gradient-to-br from-fuchsia-500 to-indigo-600 opacity-40 blur-[3px]" style={{ transform: "translateZ(-40px) scale(0.95)" }} />
                {/* ঘূর্ণায়মান বর্ডার */}
                <div aria-hidden className="absolute -inset-[3px] rounded-[35px] overflow-hidden pointer-events-none">
                  <div className="hs-anim absolute -inset-[60%] bg-[conic-gradient(from_0deg,#6366f1,#ec4899,#f59e0b,#10b981,#06b6d4,#6366f1)]" style={{ animation: "hsSpin 8s linear infinite", filter: "drop-shadow(0 0 14px rgba(236,72,153,0.8))" }} />
                </div>

                <div className="relative bg-white dark:bg-slate-950 rounded-[32px] overflow-hidden shadow-[0_30px_80px_rgba(99,102,241,0.4)]">
                  {/* Notice */}
                  <div className="bg-gradient-to-r from-rose-500/15 via-orange-500/10 to-amber-500/15 px-5 sm:px-6 py-4 flex items-center gap-3 sm:gap-4">
                    <div className="p-2 bg-gradient-to-br from-rose-500 to-orange-500 rounded-lg text-white animate-pulse shadow-[0_0_18px_rgba(244,63,94,0.7)] shrink-0" style={{ transform: "translateZ(40px)" }}>
                      <AlertTriangle size={20} />
                    </div>
                    <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400 leading-tight">
                      বিজ্ঞপ্তি: এই কয়েন কেবলমাত্র নিবন্ধিত মালিককে পাঠাবেন। অন্যথায় একাউন্ট বাতিল হতে পারে।
                    </p>
                  </div>

                  <div className="p-5 sm:p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="font-black text-sm uppercase tracking-widest hs-grad-text hs-neon-glow flex items-center gap-2">
                        Market Charts
                      </h3>
                      <div className="flex gap-1.5">
                        {["#6366f1", "#ec4899", "#f59e0b"].map((c) => (
                          <div key={c} className="w-2 h-2 rounded-full animate-pulse" style={{ background: c, boxShadow: `0 0 8px ${c}` }} />
                        ))}
                      </div>
                    </div>

                    <div className="h-44 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={marketData}>
                          <defs>
                            <linearGradient id="colorPr" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#d946ef" stopOpacity={0.5} />
                              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="strokePr" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="#6366f1" />
                              <stop offset="50%" stopColor="#ec4899" />
                              <stop offset="100%" stopColor="#f59e0b" />
                            </linearGradient>
                          </defs>
                          <Area type="monotone" dataKey="price" stroke="url(#strokePr)" strokeWidth={3.5} fill="url(#colorPr)" />
                          <Tooltip contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-6" style={{ transformStyle: "preserve-3d" }}>
                      {tickers.map((t, i) => (
                        <motion.div
                          key={t.symbol}
                          whileHover={{ y: -6, scale: 1.04 }}
                          className={cn(
                            "relative overflow-hidden rounded-2xl p-3 border transition-all duration-300 backdrop-blur",
                            t.change >= 0
                              ? "bg-emerald-50/70 dark:bg-emerald-900/15 border-emerald-200/60 dark:border-emerald-800/40"
                              : "bg-rose-50/70 dark:bg-rose-900/15 border-rose-200/60 dark:border-rose-800/40"
                          )}
                          style={{ boxShadow: `0 10px 25px -10px ${tickerGlow[i % tickerGlow.length]}` }}
                        >
                          <span aria-hidden className="absolute -top-6 -right-6 h-16 w-16 rounded-full blur-2xl opacity-60" style={{ background: tickerGlow[i % tickerGlow.length] }} />
                          <div className="relative flex justify-between items-start mb-1">
                            <span className="font-black text-xs text-slate-600 dark:text-slate-300">{t.symbol}</span>
                            <span className={cn("flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md text-white shadow", t.change >= 0 ? "bg-gradient-to-r from-emerald-500 to-teal-500" : "bg-gradient-to-r from-rose-500 to-pink-500")}>
                              {t.change >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                              {t.change}%
                            </span>
                          </div>
                          <div className="relative font-black text-lg text-slate-800 dark:text-slate-100">৳{t.price.toFixed(2)}</div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Tilt>
          </motion.div>
        </div>
      </section>

      {/* --- LUXURY স্ট্যাটস --- */}
      <section id="premium-club" className="relative mx-auto max-w-6xl px-3 sm:px-6 py-6 sm:py-10 scroll-mt-24">
        <LuxDivider title="Premium Club" />
        <div className="grid items-center gap-8 md:grid-cols-[1fr_auto_1fr] mt-4">
          {/* বাম কার্ড */}
          {[
            // নিজের আসল সংখ্যা এখানে বসান (এগুলো নমুনা মান)
            { label: "সক্রিয় সদস্য", value: 12480, suffix: "+", hue: "#38bdf8" },
            { label: "সম্পন্ন অর্ডার", value: 58240, suffix: "+", hue: "#f472b6" },
          ].map((st, i) => (
            <motion.div
              key={st.label}
              initial={{ opacity: 0, y: 40, rotateX: -20 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, delay: i * 0.15, type: "spring", bounce: 0.35 }}
              className={i === 0 ? "md:col-start-1 md:row-start-1" : "md:col-start-3 md:row-start-1"}
            >
              <Tilt max={10} lift={4}>
                <div className="hs-gold-card rounded-3xl p-[1.5px] shadow-[0_18px_50px_rgba(245,158,11,0.3)]">
                  <div className="hs-noise relative overflow-hidden rounded-[22px] bg-white/90 dark:bg-slate-950/90 backdrop-blur p-5 sm:p-6 text-center">
                    <span aria-hidden className="absolute -top-8 -right-8 h-24 w-24 rounded-full blur-2xl opacity-60" style={{ background: st.hue }} />
                    <p className="relative text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400">{st.label}</p>
                    <p className="relative hs-gold-text mt-2 text-3xl sm:text-4xl font-black">
                      <CountUp end={st.value} duration={2.2} separator="," />
                      {st.suffix}
                    </p>
                  </div>
                </div>
              </Tilt>
            </motion.div>
          ))}

          {/* মাঝে ৩ডি গোল্ড কয়েন */}
          <div className="order-first md:order-none md:col-start-2 md:row-start-1 flex flex-col items-center gap-3">
            <GoldCoin />
            <div className="hs-gold-card rounded-full p-[1.5px]">
              <div className="rounded-full bg-white/90 dark:bg-slate-950/90 px-4 py-1.5 text-xs sm:text-sm font-black hs-gold-text">
                আপনার ব্যালেন্স: <CountUp end={coins} duration={1} separator="," /> R
              </div>
            </div>
          </div>
        </div>
      </section>

      <LuxDivider title="Our Collection" />

      {/* --- PRODUCT CONTENT --- */}
      <div className="relative py-10">
        <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-transparent dark:via-white/[0.03]" />
        <div className="relative">
          <Homepages />
        </div>
      </div>

      <Footers />

      {/* --- PRODUCT SEARCH MODAL --- */}
      <AnimatePresence>
        {isSearchModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ perspective: 1200 }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSearchModalOpen(false)}
              className="absolute inset-0 bg-gradient-to-br from-indigo-950/80 via-fuchsia-950/60 to-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 40, rotateX: -25 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20, rotateX: 15 }}
              transition={{ type: "spring", duration: 0.6, bounce: 0.35 }}
              className="relative w-full max-w-md rounded-[32px] p-[2px] bg-[conic-gradient(from_0deg,#6366f1,#ec4899,#f59e0b,#10b981,#6366f1)] shadow-[0_30px_90px_rgba(217,70,239,0.5)]"
            >
              <div className="relative overflow-hidden rounded-[30px] bg-white dark:bg-slate-900 p-6">
                <button
                  onClick={() => setIsSearchModalOpen(false)}
                  className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:rotate-90 transition-all cursor-pointer"
                >
                  <X size={18} />
                </button>

                <div className="mt-2 flex flex-col items-center text-center">
                  <motion.div
                    animate={{ y: [0, -6, 0], rotateY: [0, 360] }}
                    transition={{ y: { duration: 3, repeat: Infinity }, rotateY: { duration: 8, repeat: Infinity, ease: "linear" } }}
                    className="mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-pink-500 p-3.5 text-white shadow-[0_10px_30px_rgba(217,70,239,0.55)]"
                  >
                    <ShoppingBag size={28} />
                  </motion.div>

                  <h3 className="text-lg font-black tracking-tight hs-grad-text">প্রোডাক্ট অনুসন্ধানের ফলাফল</h3>
                  <p className="mt-1 text-xs text-slate-400 font-medium uppercase tracking-wider">Searched Criteria / Product Value</p>

                  <div className="mt-4 w-full rounded-2xl bg-gradient-to-br from-indigo-50 via-fuchsia-50 to-amber-50 border border-fuchsia-100 p-4 dark:from-indigo-950/50 dark:via-fuchsia-950/40 dark:to-amber-950/30 dark:border-white/10 break-all">
                    <span className="text-xl font-extrabold hs-grad-text">&quot;{searchedValue}&quot;</span>
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    আপনার অনুসন্ধানকৃত মানটি সিস্টেমে প্রক্রিয়াজাত করা হচ্ছে। বিস্তারিত বিবরণ এবং স্টক দেখতে নিচে ক্লিক করুন।
                  </p>

                  <div className="mt-6 flex w-full gap-3">
                    <button
                      onClick={() => setIsSearchModalOpen(false)}
                      className="flex-1 rounded-xl bg-slate-100 py-3 text-sm font-bold text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/80 transition-colors cursor-pointer"
                    >
                      বন্ধ করুন
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setIsSearchModalOpen(false)}
                      className="relative overflow-hidden flex-1 rounded-xl bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-pink-500 py-3 text-sm font-bold text-white shadow-[0_8px_25px_rgba(217,70,239,0.5)] cursor-pointer"
                    >
                      <span className="relative z-10">বিস্তারিত দেখুন</span>
                      <span aria-hidden className="hs-anim absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent" style={{ animation: "hsShine 3s ease-in-out infinite" }} />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}



// "use client";

// import React, { useEffect, useMemo, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { useRouter } from "next/navigation"; // 'redirect' এর বদলে 'useRouter' যুক্ত করা হয়েছে
// import Homepages from './Home';
// import Footers from './footers/page';
// import FSearcModel from './test/Search';
// import PremiumSlider from "./Slider_img/page";

// import {
//   Home, ShoppingBag, Sparkles, Sun, Moon, Search, 
//   ChevronRight, TrendingUp, Clock, ShieldCheck, 
//   Star, Flame, LogIn, LogOut, User, Coins, 
//   MessageCircleIcon, AlertTriangle, Bell, Zap, Laptop, Smartphone, X
// } from "lucide-react";

// import {
//   AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
// } from "recharts";
// import Image from "next/image";
// import CountUp from "react-countup";
// import { FaFacebook } from "react-icons/fa";

// // Data
// const marketData = Array.from({ length: 24 }).map((_, i) => ({
//   time: `${i}:00`,
//   price: 100 + Math.sin(i / 2) * 8 + (i % 5),
// }));

// const tickers = [
//   { symbol: "R-coin", name: "R Coin", price: 15.0, change: +2.3 },
//   { symbol: "G-coin", name: "G-coin", price: 1.0, change: -0.8 },
//   { symbol: "M-coin", name: "M-coin", price: 2.0, change: +1.1 },
//   { symbol: "P-coin", name: "P-coin", price: 2.0, change: +0.4 },
// ];

// const categories = [
//   { key: "all", label: "সব" },
//   { key: "new", label: "নতুন" },
//   { key: "old", label: "পুরাতন" },
//   { key: "electronics", label: "ইলেকট্রনিক্স" },
//   { key: "fashion", label: "ফ্যাশন" },
//   { key: "home", label: "হোম" },
// ];

// const fadeUp = (delay = 0) => ({
//   initial: { opacity: 0, y: 20 },
//   animate: { opacity: 1, y: 0, transition: { duration: 0.5, delay } },
// });

// function cn(...classes) {
//   return classes.filter(Boolean).join(" ");
// }

// export default function HomeShowcasePage() {
//   const router = useRouter(); // নেভিগেশনের জন্য হুক ইনিশিয়ালাইজেশন
//   const [coins, setCoins] = useState(0);
//   const [dark, setDark] = useState(true);
//   const [q, setQ] = useState("");
//   const [activeCat, setActiveCat] = useState("all");
//   const [showProfileMenu, setShowProfileMenu] = useState(false);
//   const [names, setNames] = useState(null);
//   const [images, setImages] = useState('');
  
//   // NEW STATES FOR RESPONSIVE SEARCH MODAL
//   const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
//   const [searchedValue, setSearchedValue] = useState("");

//   // লোকাল স্টোরেজ থেকে ডার্ক মোডের প্রিফারেন্স ডিটেক্ট এবং সিনক্রোনাইজেশন
//   useEffect(() => {
//     const savedTheme = localStorage.getItem("theme");
//     if (savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
//       setDark(true);
//     }
//   }, []);

//   useEffect(() => {
//     const root = document.documentElement;
//     if (dark) {
//       root.classList.add("dark");
//       localStorage.setItem("theme", "dark");
//     } else {
//       root.classList.remove("dark");
//       localStorage.setItem("theme", "light");
//     }
//   }, [dark]);

//   useEffect(() => {
//     const userData = JSON.parse(localStorage.getItem('userData') || '[]');
//     if (userData[0]) {
//       setNames(userData[0].name || 'test-name');
//       setImages(userData[0].img || '');
//     }
//   }, []);

//   const handleLogout = () => {
//     if (window.confirm("Are you sure?")) {
//       localStorage.removeItem("userData");
//       setNames(null);
//       router.push("/Login");
//     }
//   };

//   const hander_redires = (id) => {
//     if (id === 'Login') router.push('/Login');
//     else if (id === 'profile') router.push('/profile');
//   };

//   useEffect(() => {
//     const updateCoins = () => {
//       const userData = localStorage.getItem("coin");
//       if (userData) setCoins(Number(userData) || 0);
//     };
//     updateCoins();
//     const interval = setInterval(updateCoins, 1000);
//     return () => clearInterval(interval);
//   }, []);

//   const triggerSearch = (e) => {
//     if (e) e.preventDefault();
//     if (q.trim() !== "") {
//       setSearchedValue(q);
//       setIsSearchModalOpen(true);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-slate-100 transition-colors duration-500">
      
//       {/* --- PREMIUM TOPBAR --- */}
//       <nav className="sticky top-0 z-50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-sm">
//         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          
//           {/* Logo Section */}
//           <div className="flex items-center gap-3">
//             <motion.div 
//               whileHover={{ rotate: 12, scale: 1.1 }}
//               className="relative p-1 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-400 shadow-lg shadow-blue-500/20"
//             >
//               <Image src="/favicon.png" alt="logo" width={38} height={38} className="rounded-lg bg-white p-0.5" />
//             </motion.div>
//             <div className="flex flex-col">
//               <span className="font-black text-xl tracking-tighter bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent uppercase">
//                 MyShops
//               </span>
//               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:block">Official</span>
//             </div>
//           </div>

//           {/* Centered Search - Tablet/PC Wrapped with Submit Action */}
//           <form onSubmit={triggerSearch} className="hidden lg:flex flex-1 max-w-md mx-12 relative group">
//             <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
//             <input
//               className="w-full bg-slate-100 dark:bg-slate-800/50 border-none rounded-2xl py-2.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-blue-500/50 transition-all outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 dark:text-white text-slate-900"
//               placeholder="পণ্য বা অ্যাপ খুঁজুন..."
//               value={q}
//               onChange={(e) => setQ(e.target.value)}
//             />
//           </form>

//           {/* Right Actions */}
//           <div className="flex items-center gap-2 sm:gap-4">
//             {/* Real-time Coins */}
//             <motion.div 
//               whileHover={{ scale: 1.05 }}
//               className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 shadow-sm cursor-help"
//             >
//               <Coins className="w-4 h-4 text-amber-500 animate-bounce" />
//               <span className="font-black text-amber-600 dark:text-amber-400 text-sm">
//                 <CountUp end={coins} duration={1} separator="," /> R
//               </span>
//             </motion.div>

//             {/* Utility Icons */}
//             <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-2xl p-1 gap-1">
//               <button onClick={() => router.push('/test')} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all text-blue-600">
//                 <FaFacebook size={18} />
//               </button>
//               <button onClick={() => setDark(!dark)} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all text-slate-500 flex items-center justify-center">
//                 {dark ? <Sun size={18} className="text-yellow-500" /> : <Moon size={18} className="text-slate-750" />}
//               </button>
//             </div>

//             {/* Profile Circle */}
//             <div className="relative group ml-1">
//               <motion.div 
//                 onClick={() => setShowProfileMenu(!showProfileMenu)}
//                 whileTap={{ scale: 0.95 }}
//                 className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-700 shadow-md cursor-pointer overflow-hidden relative"
//               >
//                 <img 
//                   src={images ? `http://localhost:8000/profile_users/${images}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=Felix`} 
//                   alt="avatar" className="w-full h-full object-cover" 
//                 />
//               </motion.div>
              
//               <AnimatePresence>
//                 {showProfileMenu && (
//                   <motion.div 
//                     initial={{ opacity: 0, scale: 0.95, y: 10 }}
//                     animate={{ opacity: 1, scale: 1, y: 0 }}
//                     exit={{ opacity: 0, scale: 0.95, y: 10 }}
//                     className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-900 rounded-[24px] shadow-2xl border border-slate-100 dark:border-slate-800 p-2 overflow-hidden"
//                   >
//                     <div className="px-4 py-3 border-b dark:border-slate-800">
//                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Account</p>
//                        <p className="font-bold truncate text-sm text-slate-900 dark:text-white">{names || 'Welcome, Guest'}</p>
//                     </div>
//                     <div className="p-1 space-y-1">
//                       <button onClick={()=>hander_redires('profile')} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
//                         <User size={16} /> প্রোফাইল
//                       </button>
//                       {names ? (
//                         <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors">
//                           <LogOut size={16} /> লগ আউট
//                         </button>
//                       ) : (
//                         <button onClick={()=>hander_redires('Login')} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
//                           <LogIn size={16} /> লগ ইন
//                         </button>
//                       )}
//                     </div>
//                   </motion.div>
//                 )}
//               </AnimatePresence>
//             </div>
//           </div>
//         </div>
//       </nav>

//       {/* --- HERO & MARKET DASHBOARD --- */}
//       <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
//         <div className="grid lg:grid-cols-12 gap-10 items-center">
          
//           {/* Left Text */}
//           <div className="lg:col-span-7 space-y-8">
//             <motion.div {...fadeUp(0)}>
//               <PremiumSlider />
//             </motion.div>

//             {/* CTA / Search Box */}
//             <motion.div {...fadeUp(0.2)} className="flex flex-col sm:flex-row gap-4">
//               <form onSubmit={triggerSearch} className="relative flex-1 group">
//                  <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
//                  <div className="relative bg-white dark:bg-slate-800 rounded-2xl flex items-center px-4 py-3 shadow-xl border border-slate-100 dark:border-slate-700">
//                    <Smartphone className="text-slate-400 mr-3" size={20} />
//                    <input 
//                     className="bg-transparent border-none outline-none w-full text-sm font-medium dark:text-white text-slate-900 placeholder:text-slate-400 dark:placeholder:text-slate-500" 
//                     placeholder="আইডি বা মোবাইল নাম্বার দিন..."
//                     value={q}
//                     onChange={(e)=>setQ(e.target.value)}
//                    />
//                    <button type="submit" className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 cursor-pointer">
//                      <Search size={18} />
//                    </button>
//                  </div>
//               </form>
//             </motion.div>
//           </div>

//           {/* Right Dashboard Card */}
//           <motion.div {...fadeUp(0.3)} className="lg:col-span-5">
//             <div className="relative group">
//               <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-[34px] blur opacity-10 group-hover:opacity-20 transition-opacity"></div>
//               <div className="relative bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800">
                
//                 {/* Notice Alert */}
//                 <div className="bg-rose-500/10 dark:bg-rose-500/20 px-6 py-4 flex items-center gap-4">
//                    <div className="p-2 bg-rose-500 rounded-lg text-white animate-pulse">
//                      <AlertTriangle size={20} />
//                    </div>
//                    <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400 leading-tight">
//                      বিজ্ঞপ্তি: এই কয়েন কেবলমাত্র নিবন্ধিত মালিককে পাঠাবেন। অন্যথায় একাউন্ট বাতিল হতে পারে।
//                    </p>
//                 </div>

//                 <div className="p-6">
//                   <div className="flex items-center justify-between mb-6">
//                     <h3 className="font-black text-sm uppercase tracking-widest text-slate-400 flex items-center gap-2">
//                        Market Charts
//                     </h3>
//                     <div className="flex gap-1">
//                       {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700"></div>)}
//                     </div>
//                   </div>

//                   <div className="h-44 w-full">
//                     <ResponsiveContainer width="100%" height="100%">
//                       <AreaChart data={marketData}>
//                         <defs>
//                           <linearGradient id="colorPr" x1="0" y1="0" x2="0" y2="1">
//                             <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
//                             <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
//                           </linearGradient>
//                         </defs>
//                         <Area type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={3} fill="url(#colorPr)" />
//                         <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
//                       </AreaChart>
//                     </ResponsiveContainer>
//                   </div>

//                   <div className="grid grid-cols-2 gap-3 mt-6">
//                     {tickers.map((t) => (
//                       <motion.div
//                         key={t.symbol}
//                         whileHover={{ y: -5 }}
//                         className={cn(
//                           "rounded-2xl p-3 border transition-all duration-300",
//                           t.change >= 0 
//                             ? "bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-950/30 text-slate-900 dark:text-emerald-400" 
//                             : "bg-rose-50/50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-950/30 text-slate-900 dark:text-rose-400"
//                         )}
//                       >
//                         <div className="flex justify-between items-start mb-1">
//                           <span className="font-black text-xs text-slate-500 dark:text-slate-400">{t.symbol}</span>
//                           <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-md", t.change >= 0 ? "bg-emerald-500 text-white" : "bg-rose-500 text-white")}>
//                             {t.change}%
//                           </span>
//                         </div>
//                         <div className="font-black text-slate-800 dark:text-slate-100">৳{t.price.toFixed(2)}</div>
//                       </motion.div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </motion.div>
//         </div>
//       </section>

//       {/* --- PRODUCT CONTENT --- */}
//       <div className="bg-white/50 dark:bg-slate-900/30 py-10">
//         <Homepages />
//       </div>

//       <Footers />

//       {/* --- PRODUCT SEARCH MODAL --- */}
//       <AnimatePresence>
//         {isSearchModalOpen && (
//           <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               onClick={() => setIsSearchModalOpen(false)}
//               className="absolute inset-0 bg-black/60 backdrop-blur-sm"
//             />
            
//             <motion.div
//               initial={{ opacity: 0, scale: 0.9, y: 20 }}
//               animate={{ opacity: 1, scale: 1, y: 0 }}
//               exit={{ opacity: 0, scale: 0.9, y: 20 }}
//               transition={{ type: "spring", duration: 0.5 }}
//               className="relative w-full max-w-md overflow-hidden rounded-[32px] bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-100 dark:border-slate-800"
//             >
//               <button
//                 onClick={() => setIsSearchModalOpen(false)}
//                 className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
//               >
//                 <X size={18} />
//               </button>

//               <div className="mt-2 flex flex-col items-center text-center">
//                 <div className="mb-4 rounded-2xl bg-blue-50 p-3 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
//                   <ShoppingBag size={28} />
//                 </div>
                
//                 <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
//                   প্রোডাক্ট অনুসন্ধানের ফলাফল
//                 </h3>
//                 <p className="mt-1 text-xs text-slate-400 font-medium uppercase tracking-wider">
//                   Searched Criteria / Product Value
//                 </p>

//                 <div className="mt-4 w-full rounded-2xl bg-slate-50 border border-slate-100 p-4 dark:bg-slate-800/50 dark:border-slate-800 break-all">
//                   <span className="text-xl font-extrabold text-blue-600 dark:text-blue-400">
//                     "{searchedValue}"
//                   </span>
//                 </div>

//                 <p className="mt-4 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
//                   আপনার অনুসন্ধানকৃত মানটি সিস্টেমে প্রক্রিয়াজাত করা হচ্ছে। বিস্তারিত বিবরণ এবং স্টক দেখতে নিচে ক্লিক করুন।
//                 </p>

//                 <div className="mt-6 flex w-full gap-3">
//                   <button
//                     onClick={() => setIsSearchModalOpen(false)}
//                     className="flex-1 rounded-xl bg-slate-100 py-3 text-sm font-bold text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/80 transition-colors cursor-pointer"
//                   >
//                     বন্ধ করুন
//                   </button>
//                   <button
//                     onClick={() => setIsSearchModalOpen(false)}
//                     className="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-colors cursor-pointer"
//                   >
//                     বিস্তারিত দেখুন
//                   </button>
//                 </div>
//               </div>
//             </motion.div>
//           </div>
//         )}
//       </AnimatePresence>

//     </div>
//   );
// }
