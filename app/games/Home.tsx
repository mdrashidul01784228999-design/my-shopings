"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import {
  ShoppingBag,
  TrendingUp,
  Gamepad2,
  Gift,
  User,
  Settings,
  LogOut,
  Sparkles,
  ChevronDown,
  Coins,
  PlusCircle,
  Bell,
  Crosshair,
  Zap,
  Home,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Hind_Siliguri } from "next/font/google";

const bangla = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const SITE_URL = "https://my-shopings.com"; // <-- আপনার আসল ডোমেইন দিন

/* ─────────────────────────────────────────────────────────────
   ছবি সেট করার নিয়ম (খুব সহজ):
   1) নিজের ছবি:  public/games/snake.jpg রাখুন  →  img: "/games/snake.jpg"
   2) অনলাইন লিংক: img: "https://example.com/photo.jpg"
   3) Unsplash ID:  img: "photo-1606813902818-87952c3b42e0"
   ছবি লোড না হলে নিজে থেকে নিয়ন গ্রেডিয়েন্ট ফলব্যাক দেখাবে।
   (বাইরের লিংক ব্যবহার করলে next.config.js এ domain/remotePatterns যোগ করুন)
   ───────────────────────────────────────────────────────────── */
const resolveImg = (v: string) =>
  v.startsWith("http") || v.startsWith("/")
    ? v
    : `https://images.unsplash.com/${v}?auto=format&fit=crop&w=1600&q=100`;

type Kind = "game" | "shop";

type Category = {
  id: string;
  title: string;
  kind: Kind;
  icon: React.ReactNode;
  img: string; // লোকাল পাথ / URL / Unsplash ID
  color: string; // টেইলউইন্ড গ্রেডিয়েন্ট
  glow: string; // নিয়ন রঙ "r,g,b"
  link: string;
  description: string;
  reward?: number; // গেমে জেতা G-Coin (ঐচ্ছিক ব্যাজ)
  badge?: string; // HOT / NEW ইত্যাদি
  cutout?: boolean; // true = ট্রান্সপারেন্ট PNG (bg রিমুভ করা ছবি), কার্ড থেকে ভেসে উঠবে
};

const ic = "w-6 h-6 md:w-8 md:h-8";

const categories: Category[] = [
  {
    id: "games-target",
    title: "টারগেট গেমস",
    kind: "game",
    icon: <Gamepad2 className={`${ic} text-yellow-300`} />,
    img: "photo-1606813902818-87952c3b42e0", // 👈 এখানে আপনার গেম ছবি বসান
    color: "from-amber-600/50 via-orange-700/30 to-black/95",
    glow: "245,158,11",
    link: "/games/terget",
    description: "জনপ্রিয় অনলাইন ও অ্যাকশন গেমসের সেরা কালেকশন খেলুন কোনো ডাউনলোড ছাড়াই।",
    reward: 50,
    badge: "HOT",
  },
  {
    id: "shopping",
    title: "প্রিমিয়াম শপিং",
    kind: "shop",
    icon: <ShoppingBag className={`${ic} text-pink-300`} />,
    img: "photo-1483985988355-763728e1935b",
    color: "from-rose-600/50 via-pink-700/30 to-black/95",
    glow: "244,63,94",
    link: "/shopping",
    description: "সেরা ব্র্যান্ডের গিজমোস, প্রিমিয়াম অ্যাক্সেসরিজ ও ট্রেন্ডি কালেকশন।",
  },
  {
    id: "games-shoter",
    title: "শুটার",
    kind: "game",
    icon: <Crosshair className={`${ic} text-orange-300`} />,
    img: "photo-1542751371-adc38448a05e", // 👈 /games/shooter.jpg
    color: "from-orange-600/50 via-red-700/30 to-black/95",
    glow: "249,115,22",
    link: "/games/shoter",
    description: "দ্রুত গতির শুটিং গেমে নিশানা ঠিক রেখে হাই-স্কোর গড়ুন।",
    reward: 80,
  },
  {
    id: "trending",
    title: "ট্রেন্ডিং নাউ",
    kind: "shop",
    icon: <TrendingUp className={`${ic} text-purple-300`} />,
    img: "photo-1511512578047-dfb367046420",
    color: "from-violet-600/50 via-purple-700/30 to-black/95",
    glow: "139,92,246",
    link: "/trending",
    description: "এই সপ্তাহের সবচেয়ে হট এবং ভাইরাল আইটেমগুলো দেখে নিন এক নজরে।",
  },
  {
    id: "games-snake",
    title: "ক্লাসিক স্নেক",
    kind: "game",
    icon: <Gamepad2 className={`${ic} text-emerald-300`} />,
    img: "photo-1627856013091-fed6e4e30025", // 👈 /games/snake.jpg
    color: "from-emerald-600/50 via-teal-700/30 to-black/95",
    glow: "16,185,129",
    link: "/games/Snack",
    description: "নস্টালজিক রেট্রো স্নেক গেম খেলুন মডার্ন গ্লিচ থিম ও হাই-স্কোর ট্র্যাকিং সহ।",
    reward: 30,
  },
  {
    id: "games-jam",
    title: "এরিনা জ্যাম",
    kind: "game",
    icon: <Gamepad2 className={`${ic} text-cyan-300`} />,
    img: "photo-1542751371-adc38448a05e", // 👈 /games/jam.jpg
    color: "from-cyan-600/50 via-blue-700/30 to-black/95",
    glow: "6,182,212",
    link: "/games/Jam",
    description: "মাল্টিপ্লেয়ার গেমপ্লে এবং দৈনিক জ্যাম টুর্নামেন্টে অংশ নিয়ে পয়েন্ট জিতুন।",
    reward: 120,
    badge: "NEW",
  },
  {
    id: "gifts",
    title: "এক্সক্লুসিভ গিফট",
    kind: "shop",
    icon: <Gift className={`${ic} text-red-300`} />,
    img: "photo-1549465220-1a8b9238cd48",
    color: "from-red-600/50 via-rose-800/30 to-black/95",
    glow: "239,68,68",
    link: "/gifts",
    description: "জমানো G-Coin দিয়ে রিডিম করুন গুগল প্লে, স্টিম এবং এক্সবক্স গিফট কার্ড।",
  },
  {
    id: "games-babull",
    title: "বাবুল সুটার গেম",
    kind: "game",
    icon: <Crosshair className={`${ic} text-fuchsia-300`} />,
    img: "photo-1511512578047-dfb367046420", // 👈 /games/babul.jpg
    color: "from-fuchsia-600/50 via-purple-800/30 to-black/95",
    glow: "217,70,239",
    link: "/games/babull",
    description: "বাবুলের সাথে অ্যাকশন-প্যাকড শুটার গেম খেলুন এবং G-Coin জিতুন।",
    reward: 60,
  },
  {
    id: "games-gemetrics",
    title: "জেমিতিক্স গেম এন্ড G-Coin আর্নিং গেম",
    kind: "game",
    icon: <Zap className={`${ic} text-lime-300`} />,
    img: "photo-1511512578047-dfb367046420", // 👈 /games/qs.jpg
    color: "from-lime-600/50 via-green-800/30 to-black/95",
    glow: "132,204,22",
    link: "/games/qs",
    description: "জ্যামিতির ধাঁধা সমাধান করুন, দ্রুত উত্তর দিন এবং প্রতিটি সঠিক উত্তরে G-Coin আয় করুন।",
    reward: 40,
  },
  {
    id: "games-number",
    title: "নাম্বার গেম ক্লিক এন্ড G-Coin আর্নিং গেম",
    kind: "game",
    icon: <Zap className={`${ic} text-sky-300`} />,
    img: "photo-1511512578047-dfb367046420", // 👈 /games/number.jpg
    color: "from-sky-600/50 via-indigo-800/30 to-black/95",
    glow: "56,189,248",
    link: "/games/number",
    description: "নাম্বার ক্লিক করে স্কোর বাড়ান — যত দ্রুত ক্লিক, তত বেশি G-Coin।",
    reward: 25,
  },
  {
    id: "market-real",
    title: "ভার্চুয়াল মার্কেট",
    kind: "shop",
    icon: <ShoppingBag className={`${ic} text-teal-300`} />,
    img: "photo-1483985988355-763728e1935b",
    color: "from-teal-600/50 via-cyan-800/30 to-black/95",
    glow: "20,184,166",
    link: "/real_shop",
    description: "ভার্চুয়াল মার্কেটে ঘুরে পছন্দের পণ্য দেখুন ও কিনুন।",
  },
  {
    id: "market-call",
    title: "ভার্চুয়াল মার্কেট কল",
    kind: "shop",
    icon: <ShoppingBag className={`${ic} text-blue-300`} />,
    img: "photo-1549465220-1a8b9238cd48",
    color: "from-blue-600/50 via-indigo-800/30 to-black/95",
    glow: "59,130,246",
    link: "/call/app",
    description: "বিক্রেতার সাথে সরাসরি কলে কথা বলে নিশ্চিন্তে কেনাকাটা করুন।",
  },
  {
    id: "games-coin-earning",
    title: "G-Coin আর্নিং গেম",
    kind: "game",
    icon: <Coins className={`${ic} text-yellow-300`} />,
    img: "photo-1511512578047-dfb367046420", // 👈 /games/real.jpg
    color: "from-yellow-600/50 via-amber-800/30 to-black/95",
    glow: "250,204,21",
    link: "/games/real",
    description: "মজার গেম খেলে প্রতিদিন G-Coin জমান এবং গিফট কার্ড রিডিম করুন।",
    reward: 100,
    badge: "HOT",
  },{
    id: "games-coin-earning",
    title: "G-Coin আর্নিং গেম",
    kind: "game",
    icon: <Coins className={`${ic} text-yellow-300`} />,
    img: "photo-1511512578047-dfb367046420", // 👈 /games/real.jpg
    color: "from-yellow-600/50 via-amber-800/30 to-black/95",
    glow: "250,204,21",
    link: "/games/vu",
    description: "মজার গেম খেলে প্রতিদিন G-Coin জমান এবং গিফট কার্ড রিডিম করুন।",
    reward: 100,
    badge: "HOT",
  },{
    id: "games-coin-earning",
    title: "G-Coin আর্নিং গেম ভূত",
    kind: "game",
    icon: <Coins className={`${ic} text-yellow-300`} />,
    img: "photo-1511512578047-dfb367046420", // 👈 /games/real.jpg
    color: "from-yellow-600/50 via-amber-800/30 to-black/95",
    glow: "250,204,21",
    link: "/games/vut_kha",
    description: "মজার গেম খেলে প্রতিদিন G-Coin জমান এবং গিফট কার্ড রিডিম করুন।",
    reward: 100,
    badge: "HOT",
  },
  
  {
    id: "games-coin-earning",
    title: "G-Coin আর্নিং গেম ভূত",
    kind: "game",
    icon: <Coins className={`${ic} text-yellow-300`} />,
    img: "photo-1511512578047-dfb367046420", // 👈 /games/real.jpg
    color: "from-yellow-600/50 via-amber-800/30 to-black/95",
    glow: "250,204,21",
    link: "/games/up",
    description: "মজার গেম খেলে প্রতিদিন G-Coin জমান এবং গিফট কার্ড রিডিম করুন।",
    reward: 100,
    badge: "HOT",
  },

{
    id: "games-coin-earning",
    title: "G-Coin আর্নিং গেম snack",
    kind: "game",
    icon: <Coins className={`${ic} text-yellow-300`} />,
    img: "photo-1511512578047-dfb367046420", // 👈 /games/real.jpg
    color: "from-yellow-600/50 via-amber-800/30 to-black/95",
    glow: "250,204,21",
    link: "/games/snack2",
    description: "মজার গেম খেলে প্রতিদিন G-Coin জমান এবং গিফট কার্ড রিডিম করুন।",
    reward: 100,
    badge: "HOT",
  },
  {
    id: "games-coin-earning",
    title: "G-Coin আর্নিং গেম snack-1",
    kind: "game",
    icon: <Coins className={`${ic} text-yellow-300`} />,
    img: "photo-1511512578047-dfb367046420", // 👈 /games/real.jpg
    color: "from-yellow-600/50 via-amber-800/30 to-black/95",
    glow: "250,204,21",
    link: "/games/qs",
    description: "মজার গেম খেলে প্রতিদিন G-Coin জমান এবং গিফট কার্ড রিডিম করুন।",
    reward: 100,
    badge: "HOT",
  },
    {
    id: "games-coin-earning",
    title: "G-Coin আর্নিং গেম sky-1",
    kind: "game",
    icon: <Coins className={`${ic} text-yellow-300`} />,
    img: "photo-1511512578047-dfb367046420", // 👈 /games/real.jpg
    color: "from-yellow-600/50 via-amber-800/30 to-black/95",
    glow: "250,204,21",
    link: "/games/sky",
    description: "মজার গেম খেলে প্রতিদিন G-Coin জমান এবং গিফট কার্ড রিডিম করুন।",
    reward: 100,
    badge: "HOT",
  },
  {
    id: "games-coin-earning",
    title: "G-Coin আর্নিং গেম নৌকা",
    kind: "game",
    icon: <Coins className={`${ic} text-yellow-300`} />,
    img: "photo-1511512578047-dfb367046420", // 👈 /games/real.jpg
    color: "from-yellow-600/50 via-amber-800/30 to-black/95",
    glow: "250,204,21",
    link: "/games/nouka",
    description: "মজার গেম খেলে প্রতিদিন G-Coin জমান এবং গিফট কার্ড রিডিম করুন।",
    reward: 100,
    badge: "HOT",
  },
   {
    id: "games-coin-earning",
    title: "G-Coin আর্নিং গেম ফ্রিফাইয়ার",
    kind: "game",
    icon: <Coins className={`${ic} text-yellow-300`} />,
    img: "photo-1511512578047-dfb367046420", // 👈 /games/real.jpg
    color: "from-yellow-600/50 via-amber-800/30 to-black/95",
    glow: "250,204,21",
    link: "/games/nouka",
    description: "মজার গেম খেলে প্রতিদিন G-Coin জমান এবং গিফট কার্ড রিডিম করুন।",
    reward: 100,
    badge: "HOT",
  },
   {
    id: "games-coin-earning",
    title: "G-Coin আর্নিং গেম ফ্রিফাইয়ার",
    kind: "game",
    icon: <Coins className={`${ic} text-yellow-300`} />,
    img: "photo-1511512578047-dfb367046420", // 👈 /games/real.jpg
    color: "from-yellow-600/50 via-amber-800/30 to-black/95",
    glow: "250,204,21",
    link: "/games/new",
    description: "মজার গেম খেলে প্রতিদিন G-Coin জমান এবং গিফট কার্ড রিডিম করুন।",
    reward: 100,
    badge: "HOT",
  },
   {
    id: "games-coin-earning",
    title: "G-Coin আর্নিং গেম ফ্রিফাইয়ার",
    kind: "game",
    icon: <Coins className={`${ic} text-yellow-300`} />,
    img: "photo-1511512578047-dfb367046420", // 👈 /games/real.jpg
    color: "from-yellow-600/50 via-amber-800/30 to-black/95",
    glow: "250,204,21",
    link: "/games/new2",
    description: "মজার গেম খেলে প্রতিদিন G-Coin জমান এবং গিফট কার্ড রিডিম করুন।",
    reward: 100,
    badge: "HOT",
  },
     {
    id: "games-coin-earning",
    title: "G-Coin আর্নিং গেম ফ্রিফাইয়ার",
    kind: "game",
    icon: <Coins className={`${ic} text-yellow-300`} />,
    img: "photo-1511512578047-dfb367046420", // 👈 /games/real.jpg
    color: "from-yellow-600/50 via-amber-800/30 to-black/95",
    glow: "250,204,21",
    link: "/games/free",
    description: "মজার গেম খেলে প্রতিদিন G-Coin জমান এবং গিফট কার্ড রিডিম করুন।",
    reward: 100,
    badge: "HOT",
  },
  {
    id: "games-coin-earning",
    title: "G-Coin আর্নিং গেম challi challi",
    kind: "game",
    icon: <Coins className={`${ic} text-yellow-300`} />,
    img: "photo-1511512578047-dfb367046420", // 👈 /games/real.jpg
    color: "from-yellow-600/50 via-amber-800/30 to-black/95",
    glow: "250,204,21",
    link: "/games/challi",
    description: "মজার গেম খেলে প্রতিদিন G-Coin জমান এবং গিফট কার্ড রিডিম করুন।",
    reward: 100,
    badge: "HOT",
  },
];

const filters: { id: "all" | Kind; label: string }[] = [
  { id: "all", label: "সব" },
  { id: "game", label: "🎮 গেমস" },
  { id: "shop", label: "🛍️ শপিং" },
];

const gridVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
};
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 50, rotateX: -18, scale: 0.94 },
  show: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 110, damping: 16 },
  },
};

/* ───────── G-Coin আইকন ───────── */
function GCoinIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`${className} inline-flex items-center justify-center rounded-full bg-gradient-to-br from-yellow-200 via-amber-400 to-amber-600 text-[0.55em] font-black text-neutral-900 shadow-[0_0_10px_rgba(251,191,36,0.9)]`}
      style={{ fontSize: "0.6rem" }}
    >
      G
    </span>
  );
}

/* ───────── 3D টিল্ট কার্ড + নিয়ন বর্ডার ───────── */
function TiltCard({ cat, index }: { cat: Category; index: number }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [imgFailed, setImgFailed] = useState(false);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const spring = { stiffness: 180, damping: 18, mass: 0.6 };
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [11, -11]), spring);
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-13, 13]), spring);
  const gx = useTransform(mx, [-0.5, 0.5], [0, 100]);
  const gy = useTransform(my, [-0.5, 0.5], [0, 100]);
  const glare = useMotionTemplate`radial-gradient(420px circle at ${gx}% ${gy}%, rgba(255,255,255,0.22), transparent 55%)`;
  const floorX = useTransform(mx, [-0.5, 0.5], [18, -18]);
  // মাউসের উল্টো দিকে সরে যাওয়া রিয়েল ড্রপ-শ্যাডো
  const shX = useSpring(useTransform(mx, [-0.5, 0.5], [34, -34]), spring);
  const shY = useSpring(useTransform(my, [-0.5, 0.5], [22, 58]), spring);

  const onMove = (e: React.PointerEvent) => {
    if (reduce || e.pointerType === "touch" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  const neonVar = { ["--g" as string]: cat.glow } as React.CSSProperties;
  const isGame = cat.kind === "game";

  return (
    <motion.article
      layout={!reduce}
      variants={cardVariants}
      className="group [perspective:1400px]"
      style={neonVar}
    >
      <Link
        href={cat.link}
        aria-label={`${cat.title} - এক্সপ্লোর করুন`}
        className="block rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300"
      >
        <motion.div
          ref={ref}
          onPointerMove={onMove}
          onPointerLeave={onLeave}
          whileHover={reduce ? undefined : { y: -12, scale: 1.035 }}
          whileTap={{ scale: 0.97, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          style={{
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
          }}
          className="relative h-[240px] sm:h-[290px] md:h-[350px] rounded-2xl sm:rounded-[28px] md:rounded-[32px]"
        >
          {/* ৩ডি ড্রপ-শ্যাডো: কার্ডের পেছনে, মাউসের উল্টো দিকে সরে */}
          <motion.div
            aria-hidden
            style={{
              x: shX,
              y: shY,
              transform: "translateZ(-70px)",
              background: "rgba(0,0,0,0.85)",
              boxShadow: `0 0 60px 10px rgba(${cat.glow},0.35)`,
            }}
            className="absolute inset-3 sm:inset-4 rounded-[inherit] blur-2xl opacity-70 group-hover:opacity-100 transition-opacity duration-300"
          />

          {/* ৩ডি পুরুত্ব: একটার পেছনে একটা লেয়ার (কার্ডের এজ) */}
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              aria-hidden
              style={{
                transform: `translateZ(${-n * 7}px) scale(${1 - n * 0.006})`,
                background: `linear-gradient(160deg, rgba(${cat.glow},${0.35 - n * 0.06}), #05040a 70%)`,
                borderColor: `rgba(${cat.glow},${0.45 - n * 0.08})`,
              }}
              className="absolute inset-0 rounded-[inherit] border"
            />
          ))}

          {/* নিয়ন গ্লো (ব্লার) */}
          <div
            aria-hidden
            className="neon-ring absolute -inset-[2px] rounded-[inherit] blur-md opacity-60 group-hover:opacity-100 transition-opacity duration-300"
          />
          {/* ঘুরতে থাকা নিয়ন বর্ডার */}
          <div
            aria-hidden
            className="neon-ring absolute -inset-[2px] rounded-[inherit]"
          />

          {/* কার্ডের ভেতরের অংশ */}
          <div
            style={{
              transform: "translateZ(6px)",
              boxShadow: [
                "inset 0 2px 0 rgba(255,255,255,0.22)", // ওপরের বেভেল হাইলাইট
                "inset 0 -14px 30px rgba(0,0,0,0.55)", // নিচের ভেতরের ছায়া
                "0 2px 4px rgba(0,0,0,0.6)",
                "0 10px 18px -4px rgba(0,0,0,0.75)",
                "0 24px 40px -10px rgba(0,0,0,0.9)",
                `0 46px 80px -24px rgba(${cat.glow},0.55)`,
              ].join(", "),
            }}
            className="absolute inset-0 rounded-[inherit] overflow-hidden bg-neutral-950"
          >
            {/* ব্যাকগ্রাউন্ড ইমেজ */}
            <div
              className="absolute inset-0 z-0"
              style={
                cat.cutout
                  ? { background: `radial-gradient(circle at 50% 35%, rgba(${cat.glow},0.55), rgba(${cat.glow},0.08) 60%, #06050a 100%)` }
                  : undefined
              }
            >
              {!imgFailed ? (
                <Image
                  src={resolveImg(cat.img)}
                  alt={`${cat.title} - প্রিমিয়াম পোর্টাল ক্যাটাগরি`}
                  fill
                  quality={100}
                  sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  priority={index < 4}
                  onError={() => setImgFailed(true)}
                  className={
                    cat.cutout
                      ? "object-contain object-center p-3 pb-16 transition-transform duration-[900ms] ease-out group-hover:scale-110 group-hover:-translate-y-1 drop-shadow-[0_18px_22px_rgba(0,0,0,0.75)]"
                      : "object-cover transition-transform duration-[900ms] ease-out group-hover:scale-110"
                  }
                />
              ) : (
                <div
                  className="absolute inset-0"
                  style={{
                    background: `radial-gradient(circle at 30% 20%, rgba(${cat.glow},0.55), transparent 60%), linear-gradient(135deg, #0a0a12, #14101f)`,
                  }}
                />
              )}
            </div>

            {/* কালার ও ডেপথ লেয়ার */}
            {/* ভারী ওভারলে সরানো হয়েছে — ছবি ১০০% ক্লিয়ার; শুধু লেখার জন্য নিচে হালকা ফেড */}
            <div className="absolute inset-x-0 bottom-0 h-[58%] z-10 bg-gradient-to-t from-black/80 via-black/25 to-transparent pointer-events-none" />

            {/* স্ক্যানলাইন (শুধু গেম কার্ডে) */}
            {isGame && (
              <div className="scanlines absolute inset-0 z-10 pointer-events-none opacity-30 mix-blend-overlay" />
            )}

            {/* মাউসের সাথে চলা আলোর ঝলক */}
            <motion.div
              style={{ background: glare }}
              className="absolute inset-0 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-soft-light pointer-events-none"
            />
            {/* শাইন সোয়াইপ */}
            <div className="absolute inset-0 z-20 w-[200%] -skew-x-12 -translate-x-[150%] group-hover:translate-x-[150%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-[1100ms] ease-out pointer-events-none" />

            {/* ওপরের ব্যাজ: HOT/NEW + G-Coin রিওয়ার্ড */}
            <div className="absolute top-2.5 left-2.5 right-2.5 sm:top-4 sm:left-4 sm:right-4 z-30 flex items-start justify-between gap-2">
              {cat.badge ? (
                <span
                  className="neon-badge px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-black tracking-wider text-white"
                  style={{
                    background: `rgba(${cat.glow},0.25)`,
                    border: `1px solid rgba(${cat.glow},0.9)`,
                    boxShadow: `0 0 12px rgba(${cat.glow},0.8)`,
                  }}
                >
                  {cat.badge}
                </span>
              ) : (
                <span />
              )}
              {cat.reward ? (
                <motion.span
                  animate={reduce ? undefined : { scale: [1, 1.07, 1] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: (index % 4) * 0.3 }}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 border border-amber-300/60 text-[10px] sm:text-xs font-extrabold text-amber-200 backdrop-blur-md shadow-[0_0_14px_rgba(251,191,36,0.55)]"
                >
                  <GCoinIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />+{cat.reward}
                </motion.span>
              ) : null}
            </div>

            {/* কনটেন্ট */}
            <div
              style={{ transform: "translateZ(50px)" }}
              className="absolute inset-0 z-30 flex flex-col justify-end p-3.5 sm:p-6 md:p-7"
            >
              <motion.div
                animate={reduce ? undefined : { y: [0, -6, 0] }}
                transition={{ duration: 4 + (index % 3), repeat: Infinity, ease: "easeInOut" }}
                style={{
                  boxShadow: `0 0 18px rgba(${cat.glow},0.7), 0 12px 24px -6px rgba(${cat.glow},0.55)`,
                  borderColor: `rgba(${cat.glow},0.7)`,
                }}
                className="w-9 h-9 sm:w-12 sm:h-12 md:w-14 md:h-14 mb-2 sm:mb-4 flex items-center justify-center rounded-xl sm:rounded-2xl bg-black/40 border backdrop-blur-md"
              >
                {cat.icon}
              </motion.div>

              <h2
                className="text-[15px] sm:text-xl md:text-2xl font-bold text-white leading-snug line-clamp-2"
                style={{
                  textShadow: `0 0 8px rgba(${cat.glow},0.9), 0 0 22px rgba(${cat.glow},0.55), 0 4px 12px rgba(0,0,0,0.8)`,
                }}
              >
                {cat.title}
              </h2>
              <p className="mt-1 text-[11px] sm:text-xs text-neutral-300/90 leading-relaxed line-clamp-2 sm:line-clamp-3 md:max-h-0 md:opacity-0 md:group-hover:max-h-24 md:group-hover:opacity-100 transition-all duration-500">
                {cat.description}
              </p>

              <span
                style={{ transform: "translateZ(20px)" }}
                className="mt-3 md:mt-4 inline-flex items-center justify-center gap-2 py-2 md:py-2.5 rounded-lg sm:rounded-xl bg-gradient-to-b from-amber-100 to-amber-300 text-neutral-900 font-bold text-[11px] sm:text-xs md:text-sm shadow-[0_8px_20px_-6px_rgba(251,191,36,0.6),inset_0_1px_0_rgba(255,255,255,0.8)] group-hover:shadow-[0_0_26px_rgba(251,191,36,0.9),inset_0_1px_0_rgba(255,255,255,0.8)] transition-shadow"
              >
                {isGame ? "খেলুন" : "এক্সপ্লোর"}
                <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden>
                  →
                </span>
              </span>
            </div>

            {/* ইনার বর্ডার */}
            <div className="absolute inset-[1px] z-40 rounded-[inherit] border border-white/[0.06] pointer-events-none" />
          </div>
        </motion.div>

        {/* মেঝের ছায়া – নিয়ন রঙে */}
        <div className="relative mt-3 h-6">
          {/* কালো কন্টাক্ট শ্যাডো */}
          <motion.div
            aria-hidden
            style={{ x: floorX }}
            className="absolute left-1/2 -translate-x-1/2 top-0 h-3 w-[75%] rounded-[50%] bg-black blur-md opacity-90 group-hover:w-[62%] group-hover:opacity-60 group-hover:translate-y-2 transition-all duration-500"
          />
          {/* নিয়ন রঙের ছড়ানো আলো */}
          <motion.div
            aria-hidden
            style={{ x: floorX, background: `rgba(${cat.glow},0.6)` }}
            className="absolute left-1/2 -translate-x-1/2 top-1 h-4 w-[65%] rounded-[50%] blur-xl opacity-50 group-hover:opacity-100 group-hover:w-[85%] transition-all duration-500"
          />
        </div>
      </Link>
    </motion.article>
  );
}

/* ───────── মূল কম্পোনেন্ট ───────── */
export default function AllCategorySection() {
  const reduce = useReducedMotion();
  const [isOpen, setIsOpen] = useState(false);
  const [coins, setCoins] = useState(1250); // G-Coin
  const [isCoinAnimating, setIsCoinAnimating] = useState(false);
  const [names, setNames] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [images, setImages] = useState<string>("");
  const [filter, setFilter] = useState<"all" | Kind>("all");

  const pulseCoin = () => {
    setIsCoinAnimating(true);
    setTimeout(() => setIsCoinAnimating(false), 800);
  };

  // ডেমো G-Coin আপডেট (আসল API থাকলে এটি মুছে দিন)
  useEffect(() => {
    const interval = setInterval(() => {
      setCoins((p) => Math.max(0, p + (Math.random() > 0.4 ? 50 : -20)));
      pulseCoin();
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  // নিরাপদভাবে ইউজার ডাটা পড়া
  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("userData") || "[]");
      if (userData[0]) {
        setNames(userData[0].name || "অতিথি");
        setEmail(userData[0].email || null);
        setImages(userData[0].img || "");
      }
    } catch {
      /* ignore */
    }
  }, []);

  const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "");
  const avatar =
    images && apiBase
      ? `${apiBase}/profile_users/${images}`
      : "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix";

  const visible = useMemo(
    () => (filter === "all" ? categories : categories.filter((c) => c.kind === filter)),
    [filter]
  );

  // SEO: Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "My Shopings",
        inLanguage: "bn-BD",
      },
      {
        "@type": "ItemList",
        name: "সব ক্যাটাগরি একসাথে - My Shopings",
        description: "গেমস, প্রিমিয়াম শপিং, গিফট কার্ড এবং ট্রেন্ডিং সব কালেকশন এক জায়গায়।",
        numberOfItems: categories.length,
        itemListElement: categories.map((c, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: c.title,
          description: c.description,
          url: `${SITE_URL}${c.link}`,
          image: resolveImg(c.img),
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "হোম", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "সব ক্যাটাগরি", item: `${SITE_URL}/categories` },
        ],
      },
    ],
  };

  return (
    <div
      className={`${bangla.className} relative min-h-screen flex flex-col items-center py-4 sm:py-6 md:py-12 px-3 sm:px-6 md:px-8 bg-[#050407] overflow-hidden text-white`}
    >
      <style>{`
        @property --ang { syntax: '<angle>'; initial-value: 0deg; inherits: false; }
        @keyframes ringSpin { to { --ang: 360deg; } }
        @keyframes goldShimmer { to { background-position: 200% center; } }
        @keyframes orbFloat { 0%,100% { transform: translate3d(0,0,0) scale(1);} 50% { transform: translate3d(40px,-30px,0) scale(1.12);} }
        @keyframes neonFlicker { 0%,19%,21%,60%,100% { opacity:1 } 20%,22%,62% { opacity:.55 } }
        @keyframes scan { to { background-position: 0 8px; } }

        .gold-text { background: linear-gradient(100deg,#fff7d6 0%,#f5c542 25%,#fff 50%,#e8b04a 75%,#fff7d6 100%); background-size: 200% auto; -webkit-background-clip: text; background-clip: text; color: transparent; animation: goldShimmer 6s linear infinite; }

        .neon-ring {
          background: conic-gradient(from var(--ang), rgba(var(--g),0.15) 0%, rgba(var(--g),1) 18%, #fff 24%, rgba(var(--g),0.15) 40%, rgba(var(--g),0.15) 60%, rgba(var(--g),1) 78%, rgba(var(--g),0.15) 100%);
          animation: ringSpin 5s linear infinite;
        }
        .neon-badge { animation: neonFlicker 4s linear infinite; }
        .scanlines { background: repeating-linear-gradient(to bottom, rgba(255,255,255,0.18) 0 1px, transparent 1px 4px); animation: scan 1.2s linear infinite; }
        .neon-title { text-shadow: 0 0 10px rgba(245,158,11,0.5), 0 0 30px rgba(245,158,11,0.25); }

        @media (prefers-reduced-motion: reduce) {
          .gold-text, .orb, .neon-ring, .neon-badge, .scanlines { animation: none !important; }
        }
      `}</style>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ব্যাকগ্রাউন্ড: ভাসমান আলো + গ্রিড */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="orb absolute -top-24 -left-24 w-[360px] h-[360px] md:w-[520px] md:h-[520px] rounded-full bg-purple-600/25 blur-[120px] [animation:orbFloat_14s_ease-in-out_infinite]" />
        <div className="orb absolute -bottom-32 -right-24 w-[380px] h-[380px] md:w-[560px] md:h-[560px] rounded-full bg-cyan-500/20 blur-[130px] [animation:orbFloat_18s_ease-in-out_infinite_reverse]" />
        <div className="orb absolute top-1/3 left-1/2 w-[220px] h-[220px] md:w-[300px] md:h-[300px] rounded-full bg-fuchsia-500/15 blur-[110px] [animation:orbFloat_22s_ease-in-out_infinite]" />
        <div className="absolute inset-0 opacity-30 bg-[linear-gradient(to_right,#1a1a1f_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1f_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_65%_55%_at_50%_40%,#000_80%,transparent_100%)]" />
      </div>

      {/* নেভিগেশন */}
      <motion.nav
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 18 }}
        aria-label="প্রধান নেভিগেশন"
        className="w-full max-w-7xl z-50 flex items-center justify-between p-2.5 sm:p-4 mb-8 sm:mb-12 rounded-2xl md:rounded-[26px] bg-neutral-950/60 border border-white/10 backdrop-blur-2xl shadow-[0_1px_0_rgba(255,255,255,0.08)_inset,0_25px_50px_-15px_rgba(0,0,0,0.9)]"
      >
        <Link href="/" aria-label="My Shopings হোম" className="flex items-center gap-2.5">
          <div className="w-9 h-9 md:w-11 md:h-11 rounded-xl bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 flex items-center justify-center font-black text-neutral-900 text-lg md:text-xl shadow-[0_0_20px_rgba(245,158,11,0.7),inset_0_1px_0_rgba(255,255,255,0.6)]">
            P
          </div>
          <span className="hidden sm:inline-block font-extrabold text-sm md:text-lg tracking-[0.2em] gold-text">
            PREMIUM
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* G-Coin কাউন্টার */}
          <motion.button
            type="button"
            onClick={() => {
              setCoins((p) => p + 10);
              pulseCoin();
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
            aria-label={`আপনার G-Coin ${coins}`}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-full bg-gradient-to-b from-amber-400/15 to-amber-600/10 border border-amber-400/40 shadow-[0_0_18px_rgba(245,158,11,0.45)] hover:shadow-[0_0_26px_rgba(245,158,11,0.8)] hover:border-amber-300/70 transition select-none"
          >
            <motion.span
              animate={isCoinAnimating ? { rotateY: 360, scale: [1, 1.35, 1] } : {}}
              transition={{ duration: 0.6 }}
              className="drop-shadow-[0_0_8px_rgba(245,158,11,0.9)]"
            >
              <GCoinIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </motion.span>
            <span className="flex flex-col items-start">
              <span className="text-[9px] text-amber-300/80 leading-none font-bold tracking-wide">G-Coin</span>
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={coins}
                  initial={{ y: 8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -8, opacity: 0 }}
                  className="text-xs sm:text-sm font-black text-amber-200"
                >
                  {coins.toLocaleString()}
                </motion.span>
              </AnimatePresence>
            </span>
            <PlusCircle className="w-3.5 h-3.5 text-amber-400/70 hidden xs:block sm:block" />
          </motion.button>

          {/* নোটিফিকেশন */}
          <button
            type="button"
            aria-label="নোটিফিকেশন"
            className="relative text-neutral-400 hover:text-white transition-colors p-1.5"
          >
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.9)]" />
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div className="w-px h-6 bg-white/10 hidden sm:block" />

          {/* ইউজার মেনু */}
          <div className="relative">
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={isOpen}
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 group focus-visible:outline-2 focus-visible:outline-amber-300 rounded-full"
            >
              <span className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden ring-2 ring-amber-300/60 shadow-[0_0_18px_rgba(251,191,36,0.5)] group-hover:ring-amber-200 transition">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={avatar} alt={names ? `${names} এর প্রোফাইল ছবি` : "প্রোফাইল ছবি"} className="w-full h-full object-cover" />
              </span>
              <span className="hidden md:flex flex-col items-start text-left">
                <span className="text-xs font-bold text-white">{names ?? "অতিথি"}</span>
                <span className="text-[10px] text-amber-300 font-semibold flex items-center gap-0.5">
                  PRO VIP <Sparkles className="w-2.5 h-2.5" />
                </span>
              </span>
              <motion.span animate={{ rotate: isOpen ? 180 : 0 }} className="text-neutral-400 group-hover:text-white">
                <ChevronDown className="w-4 h-4" />
              </motion.span>
            </button>

            <AnimatePresence>
              {isOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                  <motion.div
                    role="menu"
                    initial={{ opacity: 0, y: 14, scale: 0.94, rotateX: -12 }}
                    animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 24 }}
                    style={{ transformOrigin: "top right" }}
                    className="absolute right-0 mt-4 w-[min(16rem,calc(100vw-1.5rem))] rounded-2xl bg-neutral-950/95 border border-white/10 backdrop-blur-2xl shadow-[0_30px_60px_-10px_rgba(0,0,0,0.95)] z-50 p-2"
                  >
                    <div className="p-3 mb-2 rounded-xl bg-white/[0.04] border border-white/5">
                      <p className="text-[10px] text-neutral-400">অ্যাকাউন্ট ইমেইল</p>
                      <p className="text-xs sm:text-sm font-bold text-white truncate">{email ?? "লগইন করা নেই"}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-400/10 border border-amber-400/30 text-[10px] text-amber-200 font-bold">
                          <Sparkles className="w-3 h-3" /> VIP Gold
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-200">
                          <GCoinIcon className="w-4 h-4" /> {coins.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <Link href="/profile" role="menuitem" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-neutral-300 hover:text-white hover:bg-white/[0.06] transition">
                      <User className="w-4 h-4 text-purple-400" /> আমার প্রোফাইল
                    </Link>
                    <Link href="/settings" role="menuitem" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-neutral-300 hover:text-white hover:bg-white/[0.06] transition">
                      <Settings className="w-4 h-4 text-blue-400" /> সেটিংস
                    </Link>
                    <div className="h-px bg-white/10 my-1" />
                    <button type="button" role="menuitem" onClick={() => setIsOpen(false)} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition text-left">
                      <LogOut className="w-4 h-4" /> লগআউট করুন
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.nav>

      {/* হিরো */}
      <header className="text-center z-10 mb-6 md:mb-10 px-2">
        <motion.h1
          initial={{ opacity: 0, y: 30, filter: "blur(12px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight gold-text neon-title"
        >
          সব ক্যাটাগরি একসাথে
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-3 sm:mt-4 text-neutral-400 text-xs sm:text-sm md:text-base max-w-md mx-auto leading-relaxed"
        >
          পছন্দের ক্যাটাগরি বেছে নিন, গেম খেলে G-Coin জমান আর গিফট কার্ড রিডিম করুন।
        </motion.p>
      </header>

      {/* ফিল্টার ট্যাব */}
      <div
        role="tablist"
        aria-label="ক্যাটাগরি ফিল্টার"
        className="z-10 mb-6 sm:mb-10 flex items-center gap-1.5 p-1 rounded-full bg-neutral-950/70 border border-white/10 backdrop-blur-xl max-w-full overflow-x-auto"
      >
        {filters.map((f) => {
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(f.id)}
              className="relative px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-amber-300"
            >
              {active && (
                <motion.span
                  layoutId="filter-pill"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  className="absolute inset-0 rounded-full bg-gradient-to-b from-amber-200 to-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.7)]"
                />
              )}
              <span className={`relative ${active ? "text-neutral-900" : "text-neutral-300 hover:text-white"}`}>
                {f.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* ক্যাটাগরি গ্রিড */}
      <main className="w-full max-w-7xl z-10">
        <motion.div
          key={filter}
          variants={gridVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-7 md:gap-9 pb-28 md:pb-10"
        >
          {visible.map((cat, i) => (
            <TiltCard key={cat.id} cat={cat} index={i} />
          ))}
        </motion.div>
      </main>

      {/* প্রিমিয়াম অ্যাপ স্টাইল বটম নেভিগেশন (শুধু মোবাইলে) */}
      <motion.nav
        aria-label="অ্যাপ মেনু"
        initial={{ y: 90, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 140, damping: 18, delay: 0.5 }}
        className="md:hidden fixed bottom-3 inset-x-3 z-50 flex items-center justify-around px-2 py-2 rounded-[26px] bg-neutral-950/80 border border-amber-300/20 backdrop-blur-2xl shadow-[0_0_30px_rgba(245,158,11,0.25),0_20px_40px_-10px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.1)]"
        style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
      >
        {[
          { label: "হোম", href: "/", icon: Home, f: "all" as const },
          { label: "গেমস", href: "#", icon: Gamepad2, f: "game" as const },
          { label: "শপিং", href: "#", icon: ShoppingBag, f: "shop" as const },
          { label: "গিফট", href: "/gifts", icon: Gift, f: null },
          { label: "প্রোফাইল", href: "/profile", icon: User, f: null },
        ].map((t) => {
          const active = t.f !== null && filter === t.f;
          const Icon = t.icon;
          const inner = (
            <>
              <span
                className={`flex items-center justify-center w-10 h-8 rounded-2xl transition-all ${
                  active
                    ? "bg-gradient-to-b from-amber-200 to-amber-400 text-neutral-900 shadow-[0_0_18px_rgba(251,191,36,0.8)]"
                    : "text-neutral-400"
                }`}
              >
                <Icon className="w-5 h-5" />
              </span>
              <span className={`text-[10px] font-bold ${active ? "text-amber-200" : "text-neutral-500"}`}>{t.label}</span>
            </>
          );
          return t.f !== null && t.href === "#" ? (
            <button key={t.label} type="button" onClick={() => setFilter(t.f!)} className="flex flex-col items-center gap-0.5">
              {inner}
            </button>
          ) : t.f !== null ? (
            <button key={t.label} type="button" onClick={() => { setFilter(t.f!); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="flex flex-col items-center gap-0.5">
              {inner}
            </button>
          ) : (
            <Link key={t.label} href={t.href} className="flex flex-col items-center gap-0.5">
              {inner}
            </Link>
          );
        })}
      </motion.nav>
    </div>
  );
}


/*
────────────────────────────────────────────
  SEO – আপনার app/page.tsx (Server Component) এ যোগ করুন
────────────────────────────────────────────
import type { Metadata } from "next";
import AllCategorySection from "@/components/AllCategorySection";

export const metadata: Metadata = {
  title: "সব ক্যাটাগরি – গেমস, শপিং ও গিফট কার্ড | Premium Portal",
  description: "ফ্রি অনলাইন গেমস, প্রিমিয়াম শপিং, ট্রেন্ডিং আইটেম ও গিফট কার্ড রিডিম – সবকিছু এক জায়গায়।",
  keywords: ["অনলাইন গেমস", "প্রিমিয়াম শপিং", "গিফট কার্ড", "ট্রেন্ডিং"],
  alternates: { canonical: "https://my-shopings.com" },
  openGraph: { title: "Premium Portal", description: "গেমস, শপিং ও গিফট কার্ড", url: "https://my-shopings.com", siteName: "Premium Portal", locale: "bn_BD", type: "website" },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};
export default function Page() { return <AllCategorySection />; }

// next.config.js – ইমেজ ডোমেইন অনুমতি
images: { remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }] }
*/


// "use client";

// import { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { 
//   ShoppingBag, 
//   TrendingUp, 
//   Gamepad2, 
//   Gift, 
//   User, 
//   Settings, 
//   LogOut, 
//   Sparkles, 
//   ChevronDown, 
//   Coins, 
//   PlusCircle, 
//   Bell 
// } from "lucide-react";
// import Image from "next/image";
// import Link from "next/link";


// type Category = {
//   id: string;
//   title: string;
//   icon: React.ReactNode;
//   img: string;
//   color: string; // Tailwind gradient classes
//   glowColor: string; // Hex code for custom shadow glow
//   link: string;
//   description: string; // এসইও ফ্রেন্ডলি শর্ট ডেসক্রিপশন
// };

// export default function AllCategorySection() {
//   const [isOpen, setIsOpen] = useState(false);
//   const [coins, setCoins] = useState(1250); // লাইভ কয়েন স্টেট
//   const [isCoinAnimating, setIsCoinAnimating] = useState(false);
//  const [names, setNames] = useState<string | null>(null);
//   const [images, setImages] = useState<string>('');
//   // লাইভ কয়েন কাউন্টারের মোশন ডেমো (প্রতি ৭ সেকেন্ডে টেস্ট করার জন্য কয়েন আপডেট হবে)
//   useEffect(() => {
//     const interval = setInterval(() => {
//       const change = Math.random() > 0.4 ? 50 : -20;
//       setCoins((prev) => Math.max(0, prev + change));
//       setIsCoinAnimating(true);
//       setTimeout(() => setIsCoinAnimating(false), 800);
//     }, 7000);

//     return () => clearInterval(interval);
//   }, []);













//     useEffect(() => {
//       const userData = JSON.parse(localStorage.getItem('userData') || '[]');
//       if (userData[0]) {
//         setNames(userData[0].name || 'test-name');
//         setImages(userData[0].img || '');
//       }
//     }, []);




//   const categories: Category[] = [
//     {
//       id: "games-general",
//       title: "আলটিমেট গেমস",
//       icon: <Gamepad2 className="w-6 h-6 md:w-8 md:h-8 text-yellow-400" />,
//       img: "https://images.unsplash.com/photo-1606813902818-87952c3b42e0",
//       color: "from-amber-600/40 via-orange-600/30 to-black/95",
//       glowColor: "rgba(245, 158, 11, 0.25)",
//       link: "/games/game1",
//       description: "জনপ্রিয় অনলাইন ও অ্যাকশন গেমসের সেরা কালেকশন খেলুন কোনো ডাউনলোড ছাড়াই।",
//     },
//     {
//       id: "shopping",
//       title: "প্রিমিয়াম শপিং",
//       icon: <ShoppingBag className="w-6 h-6 md:w-8 md:h-8 text-pink-400" />,
//       img: "https://images.unsplash.com/photo-1483985988355-763728e1935b",
//       color: "from-rose-600/40 via-pink-600/30 to-black/95",
//       glowColor: "rgba(244, 63, 94, 0.25)",
//       link: "/shopping",
//       description: "সেরা ব্র্যান্ডের গিজমোস, প্রিমিয়াম অ্যাক্সেসরিজ ও ট্রেন্ডি কালেকশন।",
//     },





//  {
//       id: "shopping",
//       title: "Shoter",
//       icon: <ShoppingBag className="w-6 h-6 md:w-8 md:h-8 text-pink-400" />,
//       img: "https://images.unsplash.com/photo-1483985988355-763728e1935b",
//       color: "from-rose-600/40 via-pink-600/30 to-black/95",
//       glowColor: "rgba(244, 63, 94, 0.25)",
//       link: "/games/shoter",
//       description: "সেরা ব্র্যান্ডের গিজমোস, প্রিমিয়াম অ্যাক্সেসরিজ ও ট্রেন্ডি কালেকশন।",
//     },







//     {
//       id: "trending",
//       title: "ট্রেন্ডিং নাউ",
//       icon: <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-purple-400" />,
//       img: "https://images.unsplash.com/photo-1511512578047-dfb367046420",
//       color: "from-violet-600/40 via-purple-600/30 to-black/95",
//       glowColor: "rgba(139, 92, 246, 0.25)",
//       link: "/trending",
//       description: "এই সপ্তাহের সবচেয়ে হট এবং ভাইরাল আইটেমগুলো দেখে নিন এক নজরে।",
//     },
//     {
//       id: "games-snake",
//       title: "ক্লাসিক স্নেক",
//       icon: <Gamepad2 className="w-6 h-6 md:w-8 md:h-8 text-emerald-400" />,
//       img: "https://images.unsplash.com/photo-1627856013091-fed6e4e30025",
//       color: "from-emerald-600/40 via-teal-600/30 to-black/95",
//       glowColor: "rgba(16, 185, 129, 0.25)",
//       link: "/games/Snack",
//       description: "নস্টালজিক রেট্রো স্নেক গেম খেলুন মডার্ন গ্লিচ থিম ও হাই-স্কোর ট্র্যাকিং সহ।",
//     },
//     {
//       id: "games-jam",
//       title: "এরিনা জ্যাম",
//       icon: <Gamepad2 className="w-6 h-6 md:w-8 md:h-8 text-cyan-400" />,
//       img: "https://images.unsplash.com/photo-1542751371-adc38448a05e",
//       color: "from-cyan-600/40 via-blue-600/30 to-black/95",
//       glowColor: "rgba(6, 182, 212, 0.25)",
//       link: "/games/Jamgam",
//       description: "মাল্টিপ্লেয়ার গেমপ্লে এবং দৈনিক জ্যাম টুর্নামেন্টে অংশ নিয়ে পয়েন্ট জিতুন।",
//     },
//     {
//       id: "gifts",
//       title: "এক্সক্লুসিভ গিফট",
//       icon: <Gift className="w-6 h-6 md:w-8 md:h-8 text-red-400" />,
//       img: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48",
//       color: "from-red-600/40 via-rose-700/30 to-black/95",
//       glowColor: "rgba(239, 68, 68, 0.25)",
//       link: "/gifts",
//       description: "আপনার জমানো কয়েন দিয়ে রিডিম করুন গুগল প্লে, স্টিম এবং এক্সবক্স গিফট কার্ড।",
//     },


//      {
//       id: " babull ",
//       title: "বাবুল সুটার গেম",
//       icon: <Gift className="w-6 h-6 md:w-8 md:h-8 text-red-400" />,
//       img: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48",
//       color: "from-red-600/40 via-rose-700/30 to-black/95",
//       glowColor: "rgba(239, 68, 68, 0.25)",
//       link: "/games/babull",
//       description: "আপনার জমানো কয়েন দিয়ে রিডিম করুন গুগল প্লে, স্টিম এবং এক্সবক্স গিফট কার্ড।",
//     },


//   ];

//   // এসইও ক্রলারের জন্য JSON-LD Structured Data
//   const jsonLd = {
//     "@context": "https://schema.org",
//     "@type": "ItemList",
//     "name": "সব ক্যাটাগরি একসাথে - My Shopings",
//     "description": "গেমস, প্রিমিয়াম শপিং, গিফট কার্ড এবং ট্রেন্ডিং সব কালেকশন এক জায়গায়।",
//     "itemListElement": categories.map((cat, index) => ({
//       "@type": "ListItem",
//       "position": index + 1,
//       "name": cat.title,
//       "url": `https://my-shopings.com${cat.link}`,
//     })),
//   };

//   return (
//     <div className="relative min-h-screen flex flex-col items-center py-6 md:py-12 px-4 sm:px-6 md:px-8 bg-[#030303] overflow-hidden">
      
//       {/* Google SEO JSON-LD injection */}
//       <script
//         type="application/ld+json"
//         dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
//       />

//       {/* Background Glow Lights */}
//       <div className="absolute top-[-5%] left-[-10%] w-[60%] h-[50%] rounded-full bg-purple-950/10 blur-[100px] pointer-events-none" />
//       <div className="absolute bottom-[-5%] right-[-10%] w-[60%] h-[50%] rounded-full bg-cyan-950/10 blur-[100px] pointer-events-none" />
//       <div className="absolute inset-0 bg-[linear-gradient(to_right,#141414_1px,transparent_1px),linear-gradient(to_bottom,#141414_1px,transparent_1px)] bg-[size:3rem_3rem] md:bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_85%,transparent_100%)] opacity-35 pointer-events-none" />

//       {/* ১. প্রিমিয়াম গ্লাসমরফিক নেভিগেশন বার (প্রোফাইল ও কয়েন কাউন্টার সহ) */}
//       <nav className="w-full max-w-7xl z-50 flex items-center justify-between p-3 sm:p-4 mb-8 sm:mb-12 rounded-2xl md:rounded-[24px] bg-neutral-950/60 border border-white/5 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
//         {/* লোগো সেকশন */}
//         <Link href="/" className="flex items-center gap-2">
//           <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center font-black text-white text-base md:text-xl shadow-[0_0_15px_rgba(147,51,234,0.5)]">
//             P
//           </div>
//           <span className="hidden sm:inline-block font-extrabold text-sm md:text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-400">
//             PREMIUM
//           </span>
//         </Link>

//         {/* কয়েন ও প্রোফাইল কন্ট্রোলার */}
//         <div className="flex items-center gap-3 sm:gap-4">
          
//           {/* অ্যানিমেটেড কয়েন কাউন্টার */}
//           <motion.div 
//             onClick={() => {
//               setCoins(prev => prev + 10);
//               setIsCoinAnimating(true);
//               setTimeout(() => setIsCoinAnimating(false), 800);
//             }}
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 cursor-pointer group hover:border-amber-400/40 transition-colors duration-300 select-none"
//           >
//             <motion.div
//               animate={isCoinAnimating ? { rotateY: 360, scale: [1, 1.3, 1] } : {}}
//               transition={{ duration: 0.6, ease: "easeInOut" }}
//               className="text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]"
//             >
//               <Coins className="w-4 h-4 sm:w-5 sm:h-5" />
//             </motion.div>

//             <div className="flex flex-col">
//               <span className="text-[8px] sm:text-[9px] text-neutral-400 font-medium leading-none uppercase tracking-wider">Coins</span>
//               <motion.span 
//                 key={coins}
//                 initial={{ y: -5, opacity: 0 }}
//                 animate={{ y: 0, opacity: 1 }}
//                 className="text-xs sm:text-sm font-black text-amber-300 drop-shadow-[0_0_10px_rgba(252,211,77,0.3)]"
//               >
//                 {coins.toLocaleString()}
//               </motion.span>
//             </div>

//             <PlusCircle className="w-3.5 h-3.5 text-amber-500/60 group-hover:text-amber-400 transition-colors" />
//           </motion.div>

//           {/* নোটিফিকেশন বেল */}
//           <div className="relative cursor-pointer text-neutral-400 hover:text-white transition-colors p-1 sm:p-2">
//             <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
//             <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
//           </div>

//           <div className="w-[1px] h-6 bg-white/10" />

//           {/* ইউজার ড্রপডাউন মেনু */}
//           <div className="relative">
//             <button
//               onClick={() => setIsOpen(!isOpen)}
//               className="flex items-center gap-1.5 sm:gap-2 group focus:outline-none"
//             >
//               <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.4)] group-hover:border-purple-400 transition-all duration-300">
//                 <img
//                  src={
//     images 
//       ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/profile_users/${images}` 
//       : `https://api.dicebear.com/7.x/avataaars/svg?seed=Felix`
//   } 
//                    alt="avatar" 
//   className="w-full h-full object-cover" 
//                 />




//               </div>

//               <div className="hidden md:flex flex-col items-start text-left">
//                 <span className="text-xs font-bold text-white group-hover:text-neutral-200 transition-colors">
//                 {names}
//                 </span>
//                 <span className="text-[9px] text-purple-400 font-semibold uppercase tracking-wider flex items-center gap-0.5">
//                   PRO VIP <Sparkles className="w-2.5 h-2.5" />
//                 </span>
//               </div>

//               <motion.div
//                 animate={{ rotate: isOpen ? 180 : 0 }}
//                 transition={{ duration: 0.2 }}
//                 className="text-neutral-400 group-hover:text-white"
//               >
//                 <ChevronDown className="w-4 h-4" />
//               </motion.div>
//             </button>

//             {/* ড্রপডাউন আইটেমস */}
//             <AnimatePresence>
//               {isOpen && (
//                 <>
//                   <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
//                   <motion.div
//                     initial={{ opacity: 0, y: 15, scale: 0.95 }}
//                     animate={{ opacity: 1, y: 0, scale: 1 }}
//                     exit={{ opacity: 0, y: 10, scale: 0.95 }}
//                     transition={{ type: "spring", stiffness: 300, damping: 25 }}
//                     className="absolute right-0 mt-4 w-60 rounded-2xl bg-neutral-950/95 border border-white/10 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden z-50 p-2"
//                   >
//                     <div className="p-3 mb-2 rounded-xl bg-white/[0.03] border border-white/5 text-left">
//                       <p className="text-[10px] text-neutral-400">অ্যাকাউন্ট ইমেইল</p>
//                       <p className="text-xs sm:text-sm font-bold text-white truncate">tanvir@example.com</p>
//                       <div className="mt-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-[9px] text-purple-300 font-bold max-w-fit uppercase">
//                         <Sparkles className="w-3 h-3 text-purple-400" />
//                         VIP Gold
//                       </div>
//                     </div>

//                     <div className="space-y-0.5">
//                       <Link href="/profile" onClick={() => setIsOpen(false)}>
//                         <div className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm text-neutral-300 hover:text-white hover:bg-white/[0.05] transition-all group">
//                           <User className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
//                           <span>আমার প্রোফাইল</span>
//                         </div>
//                       </Link>
//                       <Link href="/settings" onClick={() => setIsOpen(false)}>
//                         <div className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm text-neutral-300 hover:text-white hover:bg-white/[0.05] transition-all group">
//                           <Settings className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
//                           <span>সেটিংস</span>
//                         </div>
//                       </Link>
//                       <div className="h-[1px] bg-white/10 my-1" />
//                       <button 
//                         onClick={() => setIsOpen(false)}
//                         className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all group text-left"
//                       >
//                         <LogOut className="w-4 h-4 text-rose-500 group-hover:translate-x-0.5 transition-transform" />
//                         <span>লগআউট করুন</span>
//                       </button>
//                     </div>
//                   </motion.div>
//                 </>
//               )}
//             </AnimatePresence>
//           </div>

//         </div>
//       </nav>

//       {/* ২. হেডার সেকশন (এসইও ফোকাসড H1) */}
//       <header className="text-center z-10 mb-8 md:mb-14 space-y-2 md:space-y-4 px-2">
//         <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-100 to-neutral-400">
//           সব ক্যাটাগরি একসাথে
//         </h1>
//         <p className="text-neutral-500 text-xs sm:text-sm md:text-base font-medium max-w-sm sm:max-w-md mx-auto">
//           আপনার প্রিয় প্রিমিয়াম ক্যাটাগরি বেছে নিন এবং সেরা গেম ও শপিং ডিলগুলো এক্সপ্লোর করুন।
//         </p>
//       </header>

//       {/* ৩. রেসপন্সিভ ক্যাটাগরি গ্রিড (মোবাইলে ২ কলাম, পিসিতে ৩ কলাম) */}
//       <main className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 md:gap-8 w-full max-w-7xl z-10">
//         {categories.map((cat) => (
//           <article key={cat.id} className="group">
//             <motion.div
//               whileHover={{ y: -6, scale: 1.01 }}
//               transition={{ type: "spring", stiffness: 350, damping: 25 }}
//               style={{
//                 ['--glow-hover-color' as any]: cat.glowColor,
//               }}
//               className="relative h-[220px] sm:h-[280px] md:h-[340px] rounded-2xl sm:rounded-[28px] md:rounded-[32px] overflow-hidden bg-neutral-900/40 border border-neutral-800/80 backdrop-blur-md cursor-pointer shadow-xl transition-all duration-300 hover:border-neutral-700 hover:shadow-[0_15px_35px_var(--glow-hover-color)]"
//             >
//               {/* ব্যাকগ্রাউন্ড ইমেজ (উইথ এসইও অপ্টিমাইজড Alt ট্যাগ) */}
//               <div className="absolute inset-0 z-0">
//                 <Image
//                   src={cat.img}
//                   alt={`${cat.title} - প্রিমিয়াম মেম্বারশিপ সার্ভিস`}
//                   fill
//                   sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
//                   className="object-cover opacity-35 group-hover:opacity-45 group-hover:scale-105 transition-all duration-750 ease-out"
//                   priority={false}
//                 />
//               </div>

//               {/* কালার ফিল্টার ও নিওন শাইন ওভারলে */}
//               <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} z-10 transition-all duration-500 mix-blend-multiply`} />
//               <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/95 z-10" />
//               <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-out z-20" />

//               {/* কার্ডের কনটেন্ট এরিয়া */}
//               <div className="absolute inset-0 flex flex-col justify-end p-3.5 sm:p-6 md:p-8 z-30">
                
//                 {/* আইকন বক্স */}
//                 <div className="w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 mb-2 sm:mb-4 flex items-center justify-center rounded-lg sm:rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md shadow-inner shadow-white/5 group-hover:bg-white/[0.08] group-hover:border-white/20 transition-all duration-300">
//                   {cat.icon}
//                 </div>

//                 {/* টাইটেল */}
//                 <h2 className="text-base sm:text-xl md:text-2xl font-bold text-white tracking-wide">
//                   {cat.title}
//                 </h2>

//                 {/* এসইও ফ্রেন্ডলি কাস্টম শর্ট ডেসক্রিপশন */}
//                 <p className="text-neutral-400 text-[10px] sm:text-xs mt-1 line-clamp-2 sm:line-clamp-none md:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//                   {cat.description}
//                 </p>

//                 {/* এক্সপ্লোর বাটন */}
//                 <div className="mt-2 sm:mt-4 md:mt-5 overflow-hidden">
//                   <Link href={cat.link} aria-label={`${cat.title} ক্যাটাগরি এক্সপ্লোর করুন`}>
//                     <motion.div
//                       whileHover={{ scale: 1.01 }}
//                       whileTap={{ scale: 0.98 }}
//                       className="w-full py-2 md:py-3 px-3 rounded-lg sm:rounded-xl bg-white text-black font-bold text-center text-[11px] sm:text-xs md:text-sm shadow-md hover:bg-neutral-100 transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2"
//                     >
//                       <span>Explore</span>
//                       <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
//                     </motion.div>
//                   </Link>
//                 </div>

//               </div>

//               {/* ইনার গ্লো বর্ডার */}
//               <div className="absolute inset-[1px] rounded-[15px] sm:rounded-[27px] md:rounded-[31px] border border-white/[0.05] pointer-events-none z-40" />
//             </motion.div>
//           </article>
//         ))}
//       </main>
//     </div>
//   );
// }



// "use client";

// import { motion } from "framer-motion";
// import { ShoppingBag, TrendingUp, Gamepad2, Gift } from "lucide-react";
// import Image from "next/image";
// import Link from "next/link";

// type Category = {
//   id: string;
//   title: string;
//   icon: React.ReactNode;
//   img: string;
//   color: string; // Tailwind gradient classes
//   glowColor: string; // Hex code for custom shadow glow
//   link: string;
// };

// export default function AllCategorySection() {
//   const categories: Category[] = [
//     {
//       id: "games-general",
//       title: "আলটিমেট গেমস",
//       icon: <Gamepad2 className="w-6 h-6 md:w-8 md:h-8 text-yellow-400" />,
//       img: "https://images.unsplash.com/photo-1606813902818-87952c3b42e0",
//       color: "from-amber-600/40 via-orange-600/30 to-black/95",
//       glowColor: "rgba(245, 158, 11, 0.25)",
//       link: "/games",
//     },
//     {
//       id: "shopping",
//       title: "প্রিমিয়াম শপিং",
//       icon: <ShoppingBag className="w-6 h-6 md:w-8 md:h-8 text-pink-400" />,
//       img: "https://images.unsplash.com/photo-1483985988355-763728e1935b",
//       color: "from-rose-600/40 via-pink-600/30 to-black/95",
//       glowColor: "rgba(244, 63, 94, 0.25)",
//       link: "/shopping",
//     },
//     {
//       id: "trending",
//       title: "ট্রেন্ডিং নাউ",
//       icon: <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-purple-400" />,
//       img: "https://images.unsplash.com/photo-1511512578047-dfb367046420",
//       color: "from-violet-600/40 via-purple-600/30 to-black/95",
//       glowColor: "rgba(139, 92, 246, 0.25)",
//       link: "/trending",
//     },
//     {
//       id: "games-snake",
//       title: "ক্লাসিক স্নেক",
//       icon: <Gamepad2 className="w-6 h-6 md:w-8 md:h-8 text-emerald-400" />,
//       img: "https://images.unsplash.com/photo-1627856013091-fed6e4e30025",
//       color: "from-emerald-600/40 via-teal-600/30 to-black/95",
//       glowColor: "rgba(16, 185, 129, 0.25)",
//       link: "/games/Snack",
//     },
//     {
//       id: "games-jam",
//       title: "এরিনা জ্যাম",
//       icon: <Gamepad2 className="w-6 h-6 md:w-8 md:h-8 text-cyan-400" />,
//       img: "https://images.unsplash.com/photo-1542751371-adc38448a05e",
//       color: "from-cyan-600/40 via-blue-600/30 to-black/95",
//       glowColor: "rgba(6, 182, 212, 0.25)",
//       link: "/games/Jamgam",
//     },
//     {
//       id: "gifts",
//       title: "এক্সক্লুসিভ গিফট",
//       icon: <Gift className="w-6 h-6 md:w-8 md:h-8 text-red-400" />,
//       img: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48",
//       color: "from-red-600/40 via-rose-700/30 to-black/95",
//       glowColor: "rgba(239, 68, 68, 0.25)",
//       link: "/gifts",
//     },
//   ];

//   return (
//     <div className="relative min-h-screen flex flex-col items-center justify-center py-12 md:py-20 px-4 sm:px-6 md:px-8 bg-[#030303] overflow-hidden">
      
//       {/* Background Radial Lights */}
//       <div className="absolute top-[-5%] left-[-10%] w-[60%] h-[50%] rounded-full bg-purple-950/10 blur-[100px] pointer-events-none" />
//       <div className="absolute bottom-[-5%] right-[-10%] w-[60%] h-[50%] rounded-full bg-cyan-950/10 blur-[100px] pointer-events-none" />

//       {/* Modern Grid Background */}
//       <div className="absolute inset-0 bg-[linear-gradient(to_right,#141414_1px,transparent_1px),linear-gradient(to_bottom,#141414_1px,transparent_1px)] bg-[size:3rem_3rem] md:bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_85%,transparent_100%)] opacity-30 pointer-events-none" />

//       {/* Header Section */}
//       <div className="text-center z-10 mb-10 md:mb-16 space-y-2 md:space-y-4 px-2">
//         <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-100 to-neutral-400">
//           সব ক্যাটাগরি একসাথে
//         </h2>
//         <p className="text-neutral-500 text-xs sm:text-sm md:text-base font-medium max-w-sm sm:max-w-md mx-auto">
//           আপনার পছন্দের ক্যাটাগরি বেছে নিন এবং একটি প্রিমিয়াম এক্সপেরিয়েন্স উপভোগ করুন।
//         </p>
//       </div>

//       {/* Highly Responsive Grid: 
//           - Mobile: 2 Columns (`grid-cols-2`) for easy navigation
//           - Tablet: 2/3 Columns (`sm:grid-cols-2 lg:grid-cols-3`)
//           - Desktop: 3 Columns with proper spacing 
//       */}
//       <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 md:gap-8 w-full max-w-7xl z-10">
//         {categories.map((cat) => (
//           <motion.div
//             key={cat.id}
//             whileHover={{ y: -6, scale: 1.01 }}
//             transition={{ type: "spring", stiffness: 350, damping: 25 }}
//             style={{
//               ['--glow-hover-color' as any]: cat.glowColor,
//             }}
//             // Mobile-friendly height (h-[240px] on mobile, h-[340px] on desktop)
//             className="relative h-[220px] sm:h-[280px] md:h-[340px] rounded-2xl sm:rounded-[28px] md:rounded-[32px] overflow-hidden bg-neutral-900/40 border border-neutral-800/80 backdrop-blur-md cursor-pointer group shadow-xl transition-all duration-300 hover:border-neutral-700 hover:shadow-[0_15px_35px_var(--glow-hover-color)]"
//           >
//             {/* Background Image */}
//             <div className="absolute inset-0 z-0">
//               <Image
//                 src={cat.img}
//                 alt={cat.title}
//                 fill
//                 sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
//                 className="object-cover opacity-35 group-hover:opacity-45 group-hover:scale-105 transition-all duration-750 ease-out"
//                 priority={false}
//               />
//             </div>

//             {/* Gradient Mask */}
//             <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} z-10 transition-all duration-500 mix-blend-multiply`} />
//             <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/95 z-10" />

//             {/* Light Stroke Sweep Effect (Runs on hover) */}
//             <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-out z-20" />

//             {/* Content Box */}
//             <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 md:p-8 z-30">
              
//               {/* Glassmorphic Icon Wrapper */}
//               <div className="w-9 h-9 sm:w-12 sm:h-12 md:w-14 md:h-14 mb-2 sm:mb-4 flex items-center justify-center rounded-xl sm:rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md shadow-inner shadow-white/5 group-hover:bg-white/[0.08] group-hover:border-white/20 transition-all duration-300">
//                 {cat.icon}
//               </div>

//               {/* Title */}
//               <h3 className="text-base sm:text-xl md:text-2xl font-bold text-white tracking-wide">
//                 {cat.title}
//               </h3>

//               {/* Description - Desktop only for clean mobile layouts */}
//               <p className="hidden md:block text-neutral-400 text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//                 এক্সপ্লোর করতে নিচের বাটনে ক্লিক করুন।
//               </p>

//               {/* Explore Button: Full-width and highly interactive */}
//               <div className="mt-3 sm:mt-4 md:mt-5 overflow-hidden">
//                 <Link href={cat.link} className="inline-block w-full">
//                   <motion.div
//                     whileHover={{ scale: 1.01 }}
//                     whileTap={{ scale: 0.98 }}
//                     className="w-full py-2 md:py-3 px-3 rounded-lg sm:rounded-xl bg-white text-black font-bold text-center text-[11px] sm:text-xs md:text-sm shadow-md hover:bg-neutral-100 transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2"
//                   >
//                     <span>Explore</span>
//                     <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
//                   </motion.div>
//                 </Link>
//               </div>

//             </div>

//             {/* Inner Glow Border for Premium Look */}
//             <div className="absolute inset-[1px] rounded-[15px] sm:rounded-[27px] md:rounded-[31px] border border-white/[0.05] pointer-events-none z-40" />
//           </motion.div>
//         ))}
//       </div>
//     </div>
//   );
// }




// "use client";

// import { motion } from "framer-motion";
// import { ShoppingBag, TrendingUp, Gamepad2, Gift } from "lucide-react";
// import Image from "next/image";
// import Link from "next/link";

// type Category = {
//   id: string;
//   title: string;
//   icon: React.ReactNode;
//   img: string;
//   color: string; // Tailwind gradient classes
//   glowColor: string; // Hex code for custom shadow glow
//   link: string;
// };

// export default function AllCategorySection() {
//   const categories: Category[] = [
//     {
//       id: "games-general",
//       title: "আলটিমেট গেমস",
//       icon: <Gamepad2 className="w-8 h-8 md:w-9 md:h-9 text-yellow-400" />,
//       img: "https://images.unsplash.com/photo-1606813902818-87952c3b42e0",
//       color: "from-amber-600/40 via-orange-600/30 to-black/80",
//       glowColor: "rgba(245, 158, 11, 0.35)",
//       link: "/games",
//     },
//     {
//       id: "shopping",
//       title: "প্রিমিয়াম শপিং",
//       icon: <ShoppingBag className="w-8 h-8 md:w-9 md:h-9 text-pink-400" />,
//       img: "https://images.unsplash.com/photo-1483985988355-763728e1935b",
//       color: "from-rose-600/40 via-pink-600/30 to-black/80",
//       glowColor: "rgba(244, 63, 94, 0.35)",
//       link: "/shopping",
//     },
//     {
//       id: "trending",
//       title: "ট্রেন্ডিং নাউ",
//       icon: <TrendingUp className="w-8 h-8 md:w-9 md:h-9 text-purple-400" />,
//       img: "https://images.unsplash.com/photo-1511512578047-dfb367046420",
//       color: "from-violet-600/40 via-purple-600/30 to-black/80",
//       glowColor: "rgba(139, 92, 246, 0.35)",
//       link: "/trending",
//     },
//     {
//       id: "games-snake",
//       title: "ক্লাসিক স্নেক",
//       icon: <Gamepad2 className="w-8 h-8 md:w-9 md:h-9 text-emerald-400" />,
//       img: "https://images.unsplash.com/photo-1627856013091-fed6e4e30025",
//       color: "from-emerald-600/40 via-teal-600/30 to-black/80",
//       glowColor: "rgba(16, 185, 129, 0.35)",
//       link: "/games/Snack",
//     },
//     {
//       id: "games-jam",
//       title: "এরিনা জ্যাম",
//       icon: <Gamepad2 className="w-8 h-8 md:w-9 md:h-9 text-cyan-400" />,
//       img: "https://images.unsplash.com/photo-1542751371-adc38448a05e",
//       color: "from-cyan-600/40 via-blue-600/30 to-black/80",
//       glowColor: "rgba(6, 182, 212, 0.35)",
//       link: "/games/Jamgam",
//     },
//     {
//       id: "gifts",
//       title: "এক্সক্লুসিভ গিফট",
//       icon: <Gift className="w-8 h-8 md:w-9 md:h-9 text-red-400" />,
//       img: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48",
//       color: "from-red-600/40 via-rose-700/30 to-black/80",
//       glowColor: "rgba(239, 68, 68, 0.35)",
//       link: "/gifts",
//     },
//   ];

//   return (
//     <div className="relative min-h-screen flex flex-col items-center justify-center py-20 px-4 md:px-8 bg-[#030303] overflow-hidden selection:bg-purple-500 selection:text-white">
      
//       {/* Dynamic Luxury Background Gradients */}
//       <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/10 blur-[120px] pointer-events-none" />
//       <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-900/10 blur-[120px] pointer-events-none" />

//       {/* Cyberpunk Grid Line Overlay */}
//       <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

//       {/* Title Section */}
//       <div className="text-center z-10 mb-16 space-y-3">
//         <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-neutral-500 tracking-tight">
//           সব ক্যাটাগরি একসাথে
//         </h2>
//         <p className="text-neutral-500 text-sm md:text-base font-medium max-w-md mx-auto">
//           আপনার পছন্দের ক্যাটাগরি বেছে নিন এবং একটি প্রিমিয়াম নেভিগেশন এক্সপেরিয়েন্স উপভোগ করুন।
//         </p>
//       </div>

//       {/* Grid Layout */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-7xl z-10">
//         {categories.map((cat) => (
//           <motion.div
//             key={cat.id}
//             whileHover={{ y: -6, scale: 1.02 }}
//             transition={{ type: "spring", stiffness: 300, damping: 20 }}
//             style={{
//               // Hover গ্লো ইফেক্ট যা CSS ভ্যারিয়েবল দিয়ে হ্যান্ডেল করা হয়েছে
//               ['--glow-hover-color' as any]: cat.glowColor,
//             }}
//             className="relative h-[340px] rounded-[32px] overflow-hidden bg-neutral-900/40 border border-neutral-800 backdrop-blur-md cursor-pointer group shadow-2xl transition-all duration-300 hover:border-neutral-700 hover:shadow-[0_20px_50px_var(--glow-hover-color)]"
//           >
//             {/* Background Cover Image with Zoom Effect */}
//             <div className="absolute inset-0 z-0">
//               <Image
//                 src={cat.img}
//                 alt={cat.title}
//                 fill
//                 sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
//                 className="object-cover opacity-40 group-hover:opacity-50 group-hover:scale-105 transition-all duration-750 ease-out grayscale-[20%] group-hover:grayscale-0"
//                 priority={false}
//               />
//             </div>

//             {/* Premium Multi-layer Gradient Overlay */}
//             <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} z-10 transition-all duration-500 mix-blend-multiply`} />
//             <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/95 z-10" />

//             {/* Premium Light-Streak Shine Effect on Hover */}
//             <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-out z-20" />

//             {/* Card Content */}
//             <div className="absolute inset-0 flex flex-col justify-end p-8 z-30">
              
//               {/* Glassmorphic Icon Wrapper */}
//               <div className="w-14 h-14 mb-4 flex items-center justify-center rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md shadow-inner shadow-white/5 group-hover:bg-white/[0.08] group-hover:border-white/20 group-hover:scale-110 transition-all duration-300">
//                 {cat.icon}
//               </div>

//               {/* Category Title */}
//               <h3 className="text-2xl font-bold text-white tracking-wide group-hover:text-neutral-200 transition-colors duration-300">
//                 {cat.title}
//               </h3>

//               {/* Sub-description (Premium Addition) */}
//               <p className="text-neutral-400 text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 line-clamp-1">
//                 এক্সপ্লোর করতে নিচের বাটনে ক্লিক করুন।
//               </p>

//               {/* Luxury Explore Button */}
//               <div className="mt-5 pt-2 overflow-hidden">
//                 <Link href={cat.link} className="inline-block w-full">
//                   <motion.div
//                     whileHover={{ scale: 1.01 }}
//                     whileTap={{ scale: 0.98 }}
//                     className="w-full py-3 px-4 rounded-xl bg-white text-black font-semibold text-center text-sm shadow-[0_4px_20px_rgba(255,255,255,0.15)] hover:bg-neutral-100 transition-all duration-300 flex items-center justify-center gap-2"
//                   >
//                     <span>Explore Now</span>
//                     <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
//                   </motion.div>
//                 </Link>
//               </div>

//             </div>

//             {/* Thin Aesthetic Border Inner Line */}
//             <div className="absolute inset-[1px] rounded-[31px] border border-white/[0.05] pointer-events-none z-40" />
//           </motion.div>
//         ))}
//       </div>
//     </div>
//   );
// }



// "use client";

// import { useEffect, useState, useMemo } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { ShoppingBag, TrendingUp, Gamepad2, Gift, Layers } from "lucide-react";
// import Image from "next/image";
// import Link from "next/link";

// // টাইপস
// type Particle = {
//   top: number;
//   left: number;
//   size: number;
//   duration: number;
//   delay: number;
//   colorIndex: number;
//   shapeIndex: number;
//   rotate: number;
//   opacity: number;
//   parallax: number;
//   id: number;
// };

// type Burst = {
//   x: number;
//   y: number;
//   size: number;
//   color: string;
//   id: number;
// };

// export default function AllCategorySection() {
//   const [scrollY, setScrollY] = useState(0);
//   const [pointerPos, setPointerPos] = useState({ x: 0, y: 0 });
//   const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
//   const [clickBursts, setClickBursts] = useState<Burst[]>([]);

//   // ক্যাটাগরি ডাটা
//   const categories = [

//     {
//       title: "গেমস",
//       icon: <Gamepad2 size={36} />,
//       img: "https://images.unsplash.com/photo-1606813902818-87952c3b42e0",
//       color: "from-yellow-500 to-orange-600",
//          link: "/games",
//     },


//     {
//       title: "গেমস",
//       icon: <Gamepad2 size={36} />,
//       img: "https://images.unsplash.com/photo-1606813902818-87952c3b42e0",
//       color: "from-yellow-500 to-orange-600",
//          link: "/games",
//     },


//     {
//       title: "গেমস",
//       icon: <Gamepad2 size={36} />,
//       img: "https://images.unsplash.com/photo-1606813902818-87952c3b42e0",
//       color: "from-yellow-500 to-orange-600",
//          link: "/games",
//     },



//     {
//       title: "গেমস",
//       icon: <Gamepad2 size={36} />,
//       img: "https://images.unsplash.com/photo-1606813902818-87952c3b42e0",
//       color: "from-yellow-500 to-orange-600",
//          link: "/games",
//     },



//     {
//       title: "গেমস (snacke )",
//       icon: <Gamepad2 size={36} />,
//       img: "https://images.unsplash.com/photo-1606813902818-87952c3b42e0",
//       color: "from-yellow-500 to-orange-600",
//          link: "/games/Snack",
//     },


//     {
//       title: "গেমস (jam) ",
//       icon: <Gamepad2 size={36} />,
//       img: "https://images.unsplash.com/photo-1606813902818-87952c3b42e0",
//       color: "from-yellow-500 to-orange-600",
//          link: "/games/Jamgam",
//     },


//     {
//       title: "গেমস",
//       icon: <Gamepad2 size={36} />,
//       img: "https://images.unsplash.com/photo-1606813902818-87952c3b42e0",
//       color: "from-yellow-500 to-orange-600",
//          link: "/games",
//     },

//   ];

//   const shapes = ["circle", "star", "triangle"];
//   const colors = [
//     "#FF3CFF",
//     "#00FFFF",
//     "#FFAA00",
//     "#FF0055",
//     "#00FFAA",
//     "#FF33AA",
//     "#33FFAA",
//   ];


//   return (
//     <div
//       className="relative min-h-screen flex flex-col items-center justify-center p-6 bg-black overflow-hidden"
//     >
//       {/* Background Effects */}
//       <div className="absolute inset-0 grid bg-transparent before:content-[''] before:absolute before:inset-0 before:bg-[repeating-linear-gradient(0deg,#0ff0_0_1px,#0000_1px_20px)] after:content-[''] after:absolute after:inset-0 after:bg-[repeating-linear-gradient(90deg,#0ff0_0_1px,#0000_1px_20px)] animate-[pulse_10s_linear_infinite] pointer-events-none"></div>
//       <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,255,255,0.05)_0_1px,transparent_1px_3px)] animate-[scroll_2s_linear_infinite] pointer-events-none"></div>

//       <h2 className="text-3xl md:text-4xl font-bold text-white mb-10 drop-shadow-lg z-10 relative">
//         সব ক্যাটাগরি একসাথে
//       </h2>

//       <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-7xl z-10 relative">
//         {categories.map((cat, index) => (
//           <motion.div
//             key={index}
//             whileHover={{ scale: 1.08, rotate: 2 }}
//             whileTap={{ scale: 0.95 }}
//             className="relative rounded-3xl shadow-2xl overflow-hidden cursor-pointer group"
//           >
//             <Image
//               src={cat.img}
//               alt={cat.title}
//               width={500}
//               height={300}
//               className="w-full h-60 object-cover group-hover:scale-110 transition-transform duration-500"
//             />
//             <div
//               className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-60 group-hover:opacity-80 transition-all duration-500`}
//             />

//             {/* Particles */}
      

//             {/* Burst effect */}
        

//             {/* Category Content */}
//             <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10 p-4 space-y-3">
//               <div className="drop-shadow-[0_0_20px_rgba(255,255,255,0.9)]">
//                 {cat.icon}
//               </div>
//               <h3 className="text-lg md:text-xl font-semibold">{cat.title}</h3>
//               <Link href={cat.link}>
//                 <motion.button
//                   whileHover={{
//                     scale: 1.1,
//                     textShadow: "0 0 15px #fff",
//                     boxShadow: "0 0 20px #fff",
//                   }}
//                   className="mt-2 px-5 py-2 rounded-xl bg-white/10 backdrop-blur-md text-white font-semibold border border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.6)] hover:bg-white/20 transition-all duration-300"
//                 >
//                   Explore Now →
//                 </motion.button>
//               </Link>
//             </div>
//             <div className="absolute inset-0 rounded-3xl border-2 border-white/20 blur-md animate-pulse"></div>
//           </motion.div>
//         ))}
//       </div>
//     </div>
//   );
// }

/* ===== SEO UPDATE BACKUP: নিচের মূল লাইনগুলো SEO আপডেটে বদলানো হয়েছে (ব্যাকআপ হিসেবে রাখা) =====
const SITE_URL = "https://yourwebsite.com"; // <-- আপনার আসল ডোমেইন দিন
  alternates: { canonical: "https://yourwebsite.com" },
  openGraph: { title: "Premium Portal", description: "গেমস, শপিং ও গিফট কার্ড", url: "https://yourwebsite.com", siteName: "Premium Portal", locale: "bn_BD", type: "website" },
//       "url": `https://yourwebsite.com${cat.link}`,
===== END BACKUP ===== */
