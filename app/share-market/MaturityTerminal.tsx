"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  ShieldCheck, Wallet, ChevronDown, Layers, BookOpen, X, Clock, Calendar, Cpu, Info,
  Settings, History, LogOut, Eye, EyeOff, TrendingUp, DollarSign, Activity, Globe, Award, Shield, Lock,
} from "lucide-react";
import { Area, Bar, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Api from "../api/Api";

/* ───────────── ASSETS & TERMS ───────────── */
type AssetKey = "BTC" | "ETH" | "GOLD" | "OIL";
type TermKey = "1M" | "3M" | "6M" | "1Y";

const ASSETS: Record<AssetKey, { name: string; bn: string; base: number; vol: number; dec: number; color: string; sym: string }> = {
  BTC:  { name: "Bitcoin",  bn: "বিটকয়েন",   base: 64250, vol: 140, dec: 0, color: "#f7931a", sym: "₿" },
  ETH:  { name: "Ethereum", bn: "ইথেরিয়াম",  base: 3250,  vol: 18,  dec: 0, color: "#8b5cf6", sym: "Ξ" },
  GOLD: { name: "Gold",     bn: "স্বর্ণ",      base: 2350,  vol: 9,   dec: 0, color: "#facc15", sym: "Au" },
  OIL:  { name: "Crude Oil",bn: "অয়েল",      base: 78,    vol: 0.9, dec: 2, color: "#10b981", sym: "Oil" },
};
const KEYS = Object.keys(ASSETS) as AssetKey[];

// ডেমো সিমুলেশন: বাস্তব সময়ের বদলে সেকেন্ডে চলে
const TERMS: { key: TermKey; label: string; en: string; sim: number }[] = [
  { key: "1M", label: "১ মাস", en: "1 Month", sim: 15 },
  { key: "3M", label: "৩ মাস", en: "3 Months", sim: 45 },
  { key: "6M", label: "৬ মাস", en: "6 Months", sim: 90 },
  { key: "1Y", label: "১ বছর", en: "1 Year", sim: 180 },
];

interface DepositContract {
  id: string;
  asset: AssetKey;
  amount: number;
  buyPrice: number;
  duration: string;
  totalDuration: number;
  timeLeft: number;
  status: "ACTIVE" | "MATURED";
  sellPrice?: number;
  pnl?: number;
}
type Point = { time: string; value: number; volume: number };

const initialPrices = () => KEYS.reduce((a, k) => ({ ...a, [k]: ASSETS[k].base }), {} as Record<AssetKey, number>);
const genHistory = (k: AssetKey): Point[] =>
  Array.from({ length: 30 }, (_, i) => {
    const b = ASSETS[k].base;
    return {
      time: `${i + 1}`,
      value: Number((b + Math.sin(i * 0.4) * b * 0.02 + Math.random() * b * 0.015).toFixed(ASSETS[k].dec)),
      volume: Math.floor(Math.random() * 600) + 200,
    };
  });
const fmt = (n: number, d = 0) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

/* ───────────── 3D PIECES ───────────── */
function Tilt({ children, className = "", max = 9 }: { children: React.ReactNode; className?: string; max?: number }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rx = useSpring(useTransform(y, [-0.5, 0.5], [max, -max]), { stiffness: 160, damping: 16 });
  const ry = useSpring(useTransform(x, [-0.5, 0.5], [-max, max]), { stiffness: 160, damping: 16 });
  return (
    <motion.div
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900, transformStyle: "preserve-3d" }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - r.left) / r.width - 0.5);
        y.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Coin3D({ symbol, color, size = 96, speed = 7 }: { symbol: string; color: string; size?: number; speed?: number }) {
  const face = (z: number, flip: boolean, showSym: boolean): React.CSSProperties => ({
    position: "absolute", inset: 0, borderRadius: "50%",
    transform: `translateZ(${z}px)${flip ? " rotateY(180deg)" : ""}`,
    background: `radial-gradient(circle at 30% 28%, #ffffffcc 0%, ${color} 38%, #000000aa 130%)`,
    border: `${Math.max(3, size / 28)}px solid ${color}`,
    boxShadow: `inset 0 0 ${size / 5}px #00000066`,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 900, fontSize: size * (symbol.length > 1 ? 0.32 : 0.46), color: "#0a0a1acc",
    backfaceVisibility: showSym ? "hidden" : "visible",
  });
  return (
    <div style={{ width: size, height: size, perspective: 700 }} aria-hidden="true">
      <motion.div
        animate={{ rotateY: 360 }}
        transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
        style={{ width: "100%", height: "100%", position: "relative", transformStyle: "preserve-3d", filter: `drop-shadow(0 12px 22px ${color}66)` }}
      >
        {[-4, -2, 0, 2].map((z) => <div key={z} style={face(z, false, false)} />)}
        <div style={face(5, false, true)}>{symbol}</div>
        <div style={face(-5, true, true)}>{symbol}</div>
      </motion.div>
    </div>
  );
}

/* ───────────── MAIN ───────────── */
export default function MaturityTerminal() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [now, setNow] = useState<Date | null>(null);

  const [mainBalance, setMainBalance] = useState(500000);
  const [totalDeposited, setTotalDeposited] = useState(0);
  const [netRevenue, setNetRevenue] = useState(0);
  const [showBalance, setShowBalance] = useState(true);

  const [activeTab, setActiveTab] = useState<AssetKey>("BTC");
  const [prices, setPrices] = useState<Record<AssetKey, number>>(initialPrices);
  const [dirs, setDirs] = useState<Record<AssetKey, "up" | "down" | "neutral">>({ BTC: "neutral", ETH: "neutral", GOLD: "neutral", OIL: "neutral" });
  const [history, setHistory] = useState<Record<AssetKey, Point[]>>({ BTC: [], ETH: [], GOLD: [], OIL: [] });
  const [depositAmount, setDepositAmount] = useState("10000");
  const [term, setTerm] = useState<TermKey>("1M");
  const [deposits, setDeposits] = useState<DepositContract[]>([]);

  const [username, setUsername] = useState("md rashi");
  const [userImg, setUserImg] = useState("");

  const pricesRef = useRef(prices);
  const settled = useRef<Set<string>>(new Set());

  /* clock */
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  /* user from localStorage */
  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("userData") || "[]");
      if (u[0]) { setUsername(u[0].name || "guest"); setUserImg(u[0].img || ""); }
    } catch { /* ignore bad JSON */ }
  }, []);

  /* initial chart history (client only → no hydration mismatch) */
  useEffect(() => {
    setHistory({ BTC: genHistory("BTC"), ETH: genHistory("ETH"), GOLD: genHistory("GOLD"), OIL: genHistory("OIL") });
  }, []);

  /* live price feed for ALL assets */
  useEffect(() => {
    const t = setInterval(() => {
      const cur = pricesRef.current;
      const next = { ...cur };
      const d = {} as Record<AssetKey, "up" | "down">;
      KEYS.forEach((k) => {
        const a = ASSETS[k];
        const up = Math.random() > 0.48;
        const change = Math.random() * a.vol * (up ? 1 : -1);
        next[k] = Number(Math.max(a.base * 0.5, cur[k] + change).toFixed(a.dec));
        d[k] = up ? "up" : "down";
      });
      pricesRef.current = next;
      setPrices(next);
      setDirs(d);
      setHistory((h) => {
        const out = { ...h };
        KEYS.forEach((k) => {
          out[k] = [...h[k].slice(-39), { time: `${Date.now()}`, value: next[k], volume: Math.floor(Math.random() * 600) + 200 }];
        });
        return out;
      });
    }, 1500);
    return () => clearInterval(t);
  }, []);

  /* countdown */
  useEffect(() => {
    const t = setInterval(
      () => setDeposits((p) => p.map((c) => (c.status === "ACTIVE" ? { ...c, timeLeft: Math.max(0, c.timeLeft - 1) } : c))),
      1000
    );
    return () => clearInterval(t);
  }, []);

  /* settlement on maturity day — uses each contract's OWN asset price */
  useEffect(() => {
    const due = deposits.filter((c) => c.status === "ACTIVE" && c.timeLeft <= 0 && !settled.current.has(c.id));
    if (!due.length) return;
    const results = new Map<string, { sell: number; pnl: number }>();
    due.forEach((c) => {
      settled.current.add(c.id);
      const sell = pricesRef.current[c.asset];
      const payout = Math.max(0, Math.floor((c.amount * sell) / c.buyPrice));
      const pnl = payout - c.amount;
      results.set(c.id, { sell, pnl });
      setMainBalance((b) => b + payout);
      setTotalDeposited((d) => Math.max(0, d - c.amount));
      setNetRevenue((r) => r + pnl);
      if (pnl >= 0) toast.success(`🎉 ${c.asset} মেয়াদ পূর্ণ: +৳${fmt(pnl)} লাভ`, { position: "top-center", autoClose: 5000, theme: "dark" });
      else toast.error(`📉 ${c.asset} মেয়াদ পূর্ণ: ৳${fmt(Math.abs(pnl))} লোকসান`, { position: "top-center", autoClose: 5000, theme: "dark" });
    });
    setDeposits((p) => p.map((c) => (results.has(c.id) ? { ...c, status: "MATURED", sellPrice: results.get(c.id)!.sell, pnl: results.get(c.id)!.pnl } : c)));
  }, [deposits]);

  const handleLock = async () => {
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) return void toast.warn("❌ সঠিক পরিমাণ লিখুন!", { theme: "dark" });
    if (amt > mainBalance) return void toast.error("❌ ওয়ালেটে পর্যাপ্ত ফান্ড নেই!", { theme: "dark" });

    const t = TERMS.find((x) => x.key === term)!;
    const contract: DepositContract = {
      id: Math.random().toString(36).substring(2, 9),
      asset: activeTab,
      amount: amt,
      buyPrice: pricesRef.current[activeTab],
      duration: t.en,
      totalDuration: t.sim,
      timeLeft: t.sim,
      status: "ACTIVE",
    };
    setMainBalance((b) => b - amt);
    setTotalDeposited((d) => d + amt);
    setDeposits((p) => [contract, ...p]);
    toast.success(`🔒 ৳${fmt(amt)} ${activeTab}-এ ${t.label}-এর জন্য লক হয়েছে`, { theme: "dark" });

    try {
      await Api.post("sharemarketindex", contract);
    } catch (err) {
      console.error("sharemarketindex save failed", err);
      toast.warn("⚠️ সার্ভারে সেভ হয়নি, আবার চেষ্টা করুন", { theme: "dark" });
    }
  };

  const A = ASSETS[activeTab];
  const price = prices[activeTab];
  const chart = history[activeTab];
  const amtNum = parseFloat(depositAmount) || 0;
  const hide = (s: string) => (showBalance ? s : "•••••••");

  return (
    <div className="min-h-screen bg-[#05060f] text-slate-100 antialiased overflow-x-hidden relative selection:bg-fuchsia-500/40">
      <ToastContainer toastStyle={{ backgroundColor: "#0a0c1c", border: "1px solid #1e1b4b", borderRadius: "16px" }} />

      {/* colorful ambient glows */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-32 w-[560px] h-[560px] rounded-full bg-cyan-500/15 blur-[160px]" />
        <div className="absolute top-1/3 -right-40 w-[560px] h-[560px] rounded-full bg-fuchsia-500/15 blur-[160px]" />
        <div className="absolute -bottom-40 left-1/4 w-[560px] h-[560px] rounded-full bg-amber-400/10 blur-[160px]" />
      </div>

      <style jsx global>{`
        @keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }
        .marquee { display: flex; width: max-content; animation: marquee 30s linear infinite; }
        .glass { background: linear-gradient(135deg, rgba(20,22,50,.55), rgba(8,10,28,.7)); backdrop-filter: blur(18px); border: 1px solid rgba(255,255,255,.06); }
        .rainbow { background: linear-gradient(90deg,#22d3ee,#818cf8,#e879f9,#fbbf24); }
        ::-webkit-scrollbar { width: 5px } ::-webkit-scrollbar-track { background: #05060f } ::-webkit-scrollbar-thumb { background: #272a55; border-radius: 99px }
        @media (prefers-reduced-motion: reduce) { .marquee { animation: none } }
      `}</style>

      {/* NAV */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#05060f]/70 backdrop-blur-2xl">
        <nav aria-label="প্রধান নেভিগেশন" className="max-w-[1600px] mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl rainbow flex items-center justify-center shadow-lg shadow-fuchsia-500/20">
              <Cpu size={20} className="text-slate-950" />
            </div>
            <span className="text-xl md:text-2xl font-black tracking-tight font-mono">
              MATURITY<span className="text-fuchsia-400">.</span>X6
            </span>
          </div>

          {now && (
            <div className="hidden lg:flex items-center gap-4 glass rounded-xl px-4 py-2 font-mono text-xs text-slate-300">
              <span className="flex items-center gap-2"><Calendar size={13} className="text-cyan-400" />{now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</span>
              <span className="flex items-center gap-2"><Clock size={13} className="text-fuchsia-400" />{now.toLocaleTimeString()}</span>
            </div>
          )}

          <div className="flex items-center gap-2 md:gap-3">
            <button onClick={() => setIsInfoOpen(true)} className="glass flex items-center gap-2 px-3 md:px-4 py-2.5 rounded-xl text-xs font-bold hover:border-cyan-400/40 transition">
              <Info size={14} className="text-cyan-400" /><span className="hidden sm:inline">নীতিমালা</span>
            </button>

            <div className="relative">
              <button
                onClick={() => setIsProfileOpen((v) => !v)}
                aria-expanded={isProfileOpen}
                className="glass flex items-center gap-2 rounded-xl p-1.5 md:pr-3 hover:border-fuchsia-400/50 transition active:scale-95"
              >
                <span className="relative w-9 h-9 rounded-lg p-[2px] rainbow shrink-0">
                  <img
                    src={userImg ? `${process.env.NEXT_PUBLIC_IMAGE_URL}/profile_users/${userImg}` : "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"}
                    alt={`${username} এর প্রোফাইল`}
                    className="w-full h-full rounded-[6px] object-cover bg-slate-950"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-slate-950 rounded-full animate-pulse" />
                </span>
                <span className="hidden md:inline text-xs font-mono font-bold text-cyan-300 max-w-[110px] truncate">{username}</span>
                <ChevronDown size={14} className={`text-fuchsia-400 transition-transform ${isProfileOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.96 }}
                    className="absolute right-0 mt-3 w-64 glass rounded-2xl p-3 z-50 shadow-[0_20px_60px_rgba(168,85,247,.25)]"
                  >
                    <div className="p-3 rounded-xl bg-slate-950/70 border border-cyan-400/20 mb-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] text-slate-400">ভেরিফাইড</span>
                        <span className="text-[10px] rainbow text-black px-1.5 py-0.5 rounded font-black">TIER 1</span>
                      </div>
                      <p className="text-sm font-mono font-black text-cyan-300 truncate">{username}</p>
                    </div>
                    {[
                      { i: Settings, t: "সেটিংস", c: "hover:text-cyan-300" },
                      { i: History, t: "লেজার হিস্টোরি", c: "hover:text-fuchsia-300" },
                      { i: Award, t: "ডেইলি রিওয়ার্ড", c: "hover:text-amber-300" },
                      { i: Shield, t: "ব্যাজ  ৩/১২", c: "hover:text-indigo-300" },
                    ].map(({ i: I, t, c }) => (
                      <button key={t} className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-slate-300 rounded-xl hover:bg-white/5 transition ${c}`}>
                        <I size={14} />{t}
                      </button>
                    ))}
                    <button className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-500/10 text-rose-300 border border-rose-500/20 text-xs font-black hover:bg-rose-500 hover:text-white transition">
                      <LogOut size={13} />লগআউট
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </nav>
      </header>

      {/* TICKER */}
      <div className="relative z-10 border-b border-white/5 py-2.5 overflow-hidden" aria-label="লাইভ মূল্য">
        <div className="marquee gap-16 text-[11px] font-mono font-bold">
          {[0, 1].map((n) => (
            <div key={n} className="flex gap-16 pr-16">
              {KEYS.map((k) => (
                <span key={k} style={{ color: ASSETS[k].color }}>● {k}/BDT <span className="text-white">৳{fmt(prices[k], ASSETS[k].dec)}</span></span>
              ))}
              <span className="text-slate-500">এনক্রিপ্টেড প্রোটোকল: সক্রিয়</span>
            </div>
          ))}
        </div>
      </div>

      <main className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-8 py-6 md:py-8 space-y-6">
        {/* HERO */}
        <section aria-labelledby="hero-title" className="glass rounded-[2rem] p-6 md:p-10 flex flex-col md:flex-row items-center gap-6 md:gap-10 overflow-hidden relative">
          <Coin3D symbol={A.sym} color={A.color} size={130} />
          <div className="text-center md:text-left">
            <h1 id="hero-title" className="text-2xl sm:text-3xl md:text-5xl font-black leading-tight tracking-tight">
              আপনার কয়েন লক করুন,{" "}
              <span className="bg-gradient-to-r from-cyan-300 via-fuchsia-400 to-amber-300 bg-clip-text text-transparent">মেয়াদ শেষে দামের লাভ নিন</span>
            </h1>
            <p className="mt-3 text-sm md:text-base text-slate-400 max-w-2xl">
              বিটকয়েন, ইথেরিয়াম, গোল্ড বা অয়েলে ১ মাস, ৩ মাস, ৬ মাস কিংবা ১ বছরের জন্য ফান্ড রাখুন। মাঝের ওঠানামা গণনা হয় না — শুধু মেয়াদপূর্তির দিনের দামে সেটেলমেন্ট।
            </p>
          </div>
        </section>

        {/* ASSET SELECTOR (3D tilt cards) */}
        <section aria-label="অ্যাসেট নির্বাচন" className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {KEYS.map((k) => {
            const a = ASSETS[k];
            const active = k === activeTab;
            const up = dirs[k] === "up";
            return (
              <Tilt key={k}>
                <button
                  onClick={() => setActiveTab(k)}
                  aria-pressed={active}
                  className="w-full text-left glass rounded-2xl p-4 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400"
                  style={{ borderColor: active ? a.color : undefined, boxShadow: active ? `0 0 34px ${a.color}44` : undefined, transform: "translateZ(20px)" }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400">{a.bn}</span>
                    <span className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black text-slate-950" style={{ background: a.color }}>{a.sym.slice(0, 2)}</span>
                  </div>
                  <p className="mt-2 text-lg md:text-xl font-black font-mono">৳{fmt(prices[k], a.dec)}</p>
                  <p className={`text-[11px] font-mono font-bold ${dirs[k] === "neutral" ? "text-slate-500" : up ? "text-emerald-400" : "text-rose-400"}`}>
                    {dirs[k] === "neutral" ? "—" : up ? "▲ বাড়ছে" : "▼ কমছে"}
                  </p>
                </button>
              </Tilt>
            );
          })}
        </section>

        <div className="grid grid-cols-12 gap-6">
          {/* LEFT */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <section aria-label="ওয়ালেট সারাংশ" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="glass rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 flex items-center gap-2"><Wallet size={14} className="text-cyan-400" />ওয়ালেট</p>
                  <p className="text-xl md:text-2xl font-black font-mono mt-1.5">{hide(`৳${fmt(mainBalance)}`)}</p>
                </div>
                <button onClick={() => setShowBalance((v) => !v)} aria-label="ব্যালেন্স দেখান বা লুকান" className="p-2 rounded-xl bg-slate-950 border border-white/10 text-slate-400 hover:text-cyan-300 transition">
                  {showBalance ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <div className="glass rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 flex items-center gap-2"><Lock size={14} className="text-fuchsia-400" />লকড ডিপোজিট</p>
                  <p className="text-xl md:text-2xl font-black font-mono text-fuchsia-300 mt-1.5">{hide(`৳${fmt(totalDeposited)}`)}</p>
                </div>
                <TrendingUp size={18} className="text-fuchsia-400" />
              </div>
              <div className="glass rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 flex items-center gap-2"><DollarSign size={14} className={netRevenue >= 0 ? "text-emerald-400" : "text-rose-400"} />নেট রেভিনিউ</p>
                  <p className={`text-xl md:text-2xl font-black font-mono mt-1.5 ${netRevenue >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                    {hide(`${netRevenue >= 0 ? "+" : "-"}৳${fmt(Math.abs(netRevenue))}`)}
                  </p>
                </div>
                <Activity size={18} className={netRevenue >= 0 ? "text-emerald-400" : "text-rose-400"} />
              </div>
            </section>

            {/* CHART */}
            <section aria-label={`${A.name} মূল্য চার্ট`} className="glass rounded-[2rem] p-5 md:p-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm md:text-base font-black">{A.name} <span className="text-slate-500 font-mono text-xs">/ BDT</span></h2>
                <span className="px-3 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-2 border" style={{ color: A.color, borderColor: `${A.color}44`, background: `${A.color}12` }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: A.color }} />লাইভ
                </span>
              </div>
              <div className="h-[260px] md:h-[360px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chart} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="fillA" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={A.color} stopOpacity={0.45} />
                        <stop offset="95%" stopColor={A.color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a1d3d" vertical={false} />
                    <XAxis dataKey="time" hide />
                    <YAxis hide domain={["auto", "auto"]} />
                    <Tooltip contentStyle={{ backgroundColor: "#0a0c1c", borderColor: "#272a55", borderRadius: 14, fontSize: 11, fontFamily: "monospace" }} labelFormatter={() => ""} />
                    <Area type="monotone" dataKey="value" stroke={A.color} strokeWidth={3} fill="url(#fillA)" isAnimationActive={false} />
                    <Bar dataKey="volume" barSize={5} fill="#3b3f8f" opacity={0.35} isAnimationActive={false} yAxisId="v" />
                    <YAxis yAxisId="v" hide domain={[0, 3000]} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* LEDGER */}
            <section aria-label="সক্রিয় ডিপোজিট" className="glass rounded-[2rem] p-5 md:p-6">
              <h2 className="text-sm font-black text-slate-300 mb-4 flex items-center gap-2"><Layers size={15} className="text-fuchsia-400" />আমার ডিপোজিট</h2>
              {deposits.length === 0 ? (
                <p className="text-sm text-slate-500 py-8 text-center">এখনো কোনো ডিপোজিট নেই। ডান পাশ থেকে অ্যাসেট ও মেয়াদ বেছে ফান্ড লক করুন।</p>
              ) : (
                <ul className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {deposits.map((c) => {
                    const a = ASSETS[c.asset];
                    const pct = ((c.totalDuration - c.timeLeft) / c.totalDuration) * 100;
                    const live = c.status === "ACTIVE" ? Math.floor((c.amount * prices[c.asset]) / c.buyPrice - c.amount) : c.pnl ?? 0;
                    const term = TERMS.find((x) => x.en === c.duration);
                    return (
                      <motion.li key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-slate-950/60 border border-white/5 p-4 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-black text-slate-950 shrink-0" style={{ background: a.color }}>{a.sym.slice(0, 2)}</span>
                            <div>
                              <p className="text-sm font-black">{a.bn} · {term?.label}
                                <span className={`ml-2 text-[10px] px-2 py-0.5 rounded-md ${c.status === "ACTIVE" ? "bg-cyan-500/15 text-cyan-300" : "bg-slate-800 text-slate-400"}`}>{c.status === "ACTIVE" ? "চলমান" : "সম্পন্ন"}</span>
                              </p>
                              <p className="text-[11px] text-slate-400 font-mono mt-0.5">লক ৳{fmt(c.amount)} @ ৳{fmt(c.buyPrice, a.dec)}</p>
                            </div>
                          </div>
                          <div className="sm:text-right font-mono">
                            <p className={`text-sm font-black ${live >= 0 ? "text-emerald-300" : "text-rose-300"}`}>{live >= 0 ? "+" : "-"}৳{fmt(Math.abs(live))}</p>
                            <p className="text-[11px] text-slate-500">{c.status === "ACTIVE" ? `বাকি ${c.timeLeft} সেকেন্ড` : `সেটেল @ ৳${fmt(c.sellPrice ?? 0, a.dec)}`}</p>
                          </div>
                        </div>
                        {c.status === "ACTIVE" && (
                          <div className="h-1.5 rounded-full bg-slate-900 overflow-hidden" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
                            <div className="h-full rainbow transition-[width] duration-1000 ease-linear" style={{ width: `${pct}%` }} />
                          </div>
                        )}
                      </motion.li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>

          {/* RIGHT */}
          <aside className="col-span-12 lg:col-span-4 space-y-6" aria-label="ডিপোজিট প্যানেল">
            <Tilt max={4}>
              <section className="glass rounded-[2rem] p-6 md:p-8 shadow-[0_20px_70px_rgba(168,85,247,.18)]">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-sm font-black text-slate-300">ফান্ড লক করুন</h2>
                  <Coin3D symbol={A.sym} color={A.color} size={46} speed={4} />
                </div>
                <p className="text-3xl md:text-4xl font-black font-mono tracking-tight">৳{fmt(price, A.dec)}</p>
                <p className="text-[11px] text-slate-500 mb-5">{A.bn} — এখনকার দাম</p>

                <label htmlFor="amt" className="text-xs font-bold text-slate-400 block mb-2">ডিপোজিট পরিমাণ (BDT)</label>
                <input
                  id="amt" type="number" inputMode="decimal" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3.5 text-sm font-mono focus:outline-none focus:border-fuchsia-400/60 transition"
                  placeholder="0.00"
                />
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {[10000, 50000, 100000].map((v) => (
                    <button key={v} onClick={() => setDepositAmount(String(v))} className="py-2 text-[11px] font-bold rounded-lg bg-white/5 hover:bg-white/10 transition">{v / 1000}k</button>
                  ))}
                  <button onClick={() => setDepositAmount(String(mainBalance))} className="py-2 text-[11px] font-bold rounded-lg bg-white/5 hover:bg-white/10 text-amber-300 transition">সব</button>
                </div>

                <p className="text-xs font-bold text-slate-400 mt-5 mb-2">মেয়াদ</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-2" role="radiogroup" aria-label="মেয়াদ">
                  {TERMS.map((t) => (
                    <button
                      key={t.key} role="radio" aria-checked={term === t.key} onClick={() => setTerm(t.key)}
                      className={`py-3 text-xs font-black rounded-xl border transition ${term === t.key ? "rainbow text-slate-950 border-transparent shadow-lg shadow-fuchsia-500/20" : "bg-slate-950 border-white/10 text-slate-300 hover:border-cyan-400/40"}`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 mt-2">ডেমো সিমুলেশন: ১ মাস = ১৫ সেকেন্ড, ৩ মাস = ৪৫, ৬ মাস = ৯০, ১ বছর = ১৮০ সেকেন্ড।</p>

                <div className="mt-5 p-3 rounded-xl bg-slate-950/70 border border-white/5 text-[11px] font-mono space-y-1">
                  <div className="flex justify-between"><span className="text-slate-500">লক হবে</span><span>৳{fmt(amtNum)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">বেস প্রাইস</span><span>৳{fmt(price, A.dec)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">ওয়ালেটে বাকি</span><span className={amtNum > mainBalance ? "text-rose-400" : ""}>৳{fmt(Math.max(0, mainBalance - amtNum))}</span></div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleLock}
                  className="w-full mt-5 py-4 rainbow text-slate-950 font-black text-sm rounded-xl shadow-xl shadow-fuchsia-500/20 flex items-center justify-center gap-2"
                >
                  <Lock size={16} />{A.bn}-এ ফান্ড লক করুন
                </motion.button>
              </section>
            </Tilt>

            <section className="glass rounded-[2rem] p-5">
              <h2 className="text-[11px] font-black text-slate-400 mb-3 flex items-center gap-2"><Globe size={13} className="text-cyan-400" />সিস্টেম স্ট্যাটাস</h2>
              <div className="space-y-2 text-[11px] font-mono">
                <div className="flex justify-between p-2 rounded-lg bg-slate-950/50"><span className="text-slate-500">SPREAD</span><span className="text-cyan-300 font-bold">0.025% FIXED</span></div>
                <div className="flex justify-between p-2 rounded-lg bg-slate-950/50"><span className="text-slate-500">LATENCY</span><span className="text-emerald-300 font-bold">12ms</span></div>
              </div>
            </section>

            <section className="glass rounded-[2rem] p-5 flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-slate-950 text-fuchsia-400"><ShieldCheck size={20} /></div>
              <div>
                <h2 className="text-xs font-black">মেয়াদের নিরাপত্তা নিয়ম</h2>
                <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">মেয়াদের মাঝের অস্থায়ী দামের পরিবর্তন গণনা হয় না। শুধু মেয়াদপূর্তির দিনের দামের ওপর চূড়ান্ত লাভ বা লোকসান নির্ধারিত হয়।</p>
              </div>
            </section>
          </aside>
        </div>
      </main>

      {/* INFO MODAL */}
      <AnimatePresence>
        {isInfoOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="নীতিমালা">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsInfoOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="glass w-full max-w-xl rounded-[2rem] p-6 md:p-8 relative z-10 max-h-[85vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-5">
                <div className="flex items-center gap-2.5 text-emerald-300"><BookOpen size={20} /><h2 className="text-base font-black">কীভাবে কাজ করে</h2></div>
                <button onClick={() => setIsInfoOpen(false)} aria-label="বন্ধ করুন" className="text-slate-400 hover:text-white"><X size={18} /></button>
              </div>
              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <p className="bg-slate-950/70 border border-white/5 p-4 rounded-xl">📍 <b>মাঝের ওঠানামা অগ্রাহ্য:</b> ১ মাস, ৩ মাস, ৬ মাস বা ১ বছরের জন্য ফান্ড লক করলে মাঝের দিনগুলোতে দাম ওঠানামা করলেও লাভ বা লোকসান লক হয় না।</p>
                <p className="bg-slate-950/70 border border-white/5 p-4 rounded-xl">📍 <b>মেয়াদপূর্তির দিনে সেটেলমেন্ট:</b> যেদিন মেয়াদ শেষ হবে, সেদিনের ক্লোজিং প্রাইস অনুযায়ী লাভ বা লোকসান হিসাব হয়ে ওয়ালেটে ফিরে আসবে।</p>
                <p className="bg-slate-950/70 border border-white/5 p-4 rounded-xl">📍 <b>একাধিক অ্যাসেট:</b> আপনার কয়েন থেকে বিটকয়েন, ইথেরিয়াম, গোল্ড বা অয়েলে আলাদা আলাদা ডিপোজিট রাখতে পারবেন।</p>
              </div>
              <button onClick={() => setIsInfoOpen(false)} className="w-full mt-6 py-3.5 rainbow text-slate-950 font-black text-sm rounded-xl">বুঝেছি</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
