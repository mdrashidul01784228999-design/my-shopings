"use client";

import { useState, useRef } from "react";
import { 
  Coins, Gamepad2, Play, Trophy, Users, X, Terminal, Cpu, Zap, 
  LogOut, ShieldCheck, Flame, Network, History, Layers, Activity, Target, Sparkles, ChevronLeft, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import CountUp from "react-countup";

// Gemini কসমিক নিয়ন প্যালেট ডাটাবেজ
const spineCategories = [
  {
    id: "quantum",
    title: "Quantum Core Cluster",
    short: "G-01",
    icon: <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />,
    glowColor: "#00f0ff",
    shadowGlow: "shadow-[0_0_40px_rgba(0,240,255,0.15)]",
    games: [
      { id: 1, name: "Gemini Nexus 2026", genre: "AI Sandbox", players: "45.8K", cost: 300, image: "https://picsum.photos/600/400?random=40", neonColor: "#00f0ff" },
      { id: 2, name: "Neural Racer X", genre: "Hyper Race", players: "19.2K", cost: 150, image: "https://picsum.photos/600/400?random=41", neonColor: "#ab47bc" },
      { id: 3, name: "Cosmo Tactics", genre: "Turn-Based", players: "8.4K", cost: 200, image: "https://picsum.photos/600/400?random=42", neonColor: "#39ff14" },
    ]
  },
  {
    id: "singularity",
    title: "Singularity Mesh Grid",
    short: "G-02",
    icon: <Network className="w-4 h-4 text-purple-400" />,
    glowColor: "#ff007f",
    shadowGlow: "shadow-[0_0_40px_rgba(255,0,127,0.15)]",
    games: [
      { id: 4, name: "Void Protocol", genre: "Stealth", players: "12.5K", cost: 500, image: "https://picsum.photos/600/400?random=43", neonColor: "#ff007f" },
      { id: 5, name: "Matrix Grid v4", genre: "Puzzle", players: "5.1K", cost: 80, image: "https://picsum.photos/600/400?random=44", neonColor: "#ffaa00" },
      { id: 6, name: "Glitch Infiltrator", genre: "Cyber Action", players: "33.2K", cost: 350, image: "https://picsum.photos/600/400?random=45", neonColor: "#00e676" },
    ]
  }
];

// --- ৩D টিল্ট কসমিক নিয়ন গেমカード ---
function GeminiGameCard({ game, onRunGame }: any) {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) / rect.width);
    y.set((e.clientY - rect.top - rect.height / 2) / rect.height);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      whileHover={{ y: -6, scale: 1.01 }}
      className="min-w-[280px] sm:min-w-[320px] lg:w-full rounded-[2.2rem] border p-4 transition-all duration-300 relative overflow-hidden group backdrop-blur-xl flex-shrink-0 bg-[#090915]/90 border-white/[0.04] shadow-[0_20px_40px_rgba(0,0,0,0.7)]"
    >
      {/* ইন্টেলিজেন্ট গ্লো প্যানেল */}
      <div 
        className="absolute top-0 left-0 w-full h-[2px] opacity-40 group-hover:opacity-100 transition-opacity duration-300"
        style={{ backgroundColor: game.neonColor, boxShadow: `0 0 15px ${game.neonColor}, 0 0 30px ${game.neonColor}` }}
      />
      
      {/* ইমেজ ফ্রেম */}
      <div className="relative h-40 sm:h-44 w-full rounded-[1.6rem] overflow-hidden bg-neutral-950">
        <img src={game.image} alt={game.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090915] via-[#090915]/20 to-transparent" />
        
        <span 
          style={{ borderColor: `${game.neonColor}60`, color: game.neonColor, textShadow: `0 0 8px ${game.neonColor}` }}
          className="absolute top-3 left-3 text-[9px] font-mono font-black tracking-widest uppercase bg-black/90 px-2.5 py-0.5 rounded-lg border backdrop-blur-md"
        >
          {game.genre}
        </span>
      </div>

      {/* গেম ডিটেইলস */}
      <div className="mt-4 space-y-3.5" style={{ transform: "translateZ(30px)" }}>
        <div>
          {/* হাইলাইট টেক্সট নিয়ন গ্লো */}
          <h3 
            style={{ textShadow: `0 0 10px ${game.neonColor}80` }}
            className="text-base font-black tracking-wide truncate text-white group-hover:text-white transition-colors"
          >
            {game.name}
          </h3>
          <p className="text-[10px] text-neutral-500 font-mono mt-0.5">MATRIX_ID // 0xGM_{game.id}</p>
        </div>

        {/* মেটা ইনফো গ্রিড */}
        <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl text-xs font-mono border bg-black/40 border-white/[0.03] text-neutral-400">
          <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-indigo-400" /> {game.players}</span>
          <span className="flex items-center gap-1 justify-end font-black text-amber-500" style={{ textShadow: "0 0 8px rgba(245,158,11,0.4)" }}><Coins className="w-3.5 h-3.5" /> {game.cost} R</span>
        </div>

        {/* লঞ্চার বাটন */}
        <button
          onClick={() => onRunGame(game)}
          style={{ 
            background: `linear-gradient(135deg, ${game.neonColor}15 0%, transparent 100%)`,
            borderColor: `${game.neonColor}40`,
            color: game.neonColor,
            textShadow: `0 0 8px ${game.neonColor}`
          }}
          className="w-full py-2.5 font-mono font-black text-xs rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border uppercase tracking-widest active:scale-[0.97] shadow-inner"
        >
          <Activity className="w-3.5 h-3.5" /> Initialize Matrix
        </button>
      </div>
    </motion.div>
  );
}

// --- মেইন Gemini কোয়ান্টাম ডার্ক ইঞ্জিন ---
export default function GeminiStyleEngine() {
  const [userCoins, setUserCoins] = useState(7500);
  const [selectedGame, setSelectedGame] = useState<any>(null);
  const [gameStatus, setGameStatus] = useState<"idle" | "booting" | "running">("idle");
  const [liveScore, setLiveScore] = useState(0);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const scrollRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const userProfile = {
    username: "Gemini Voyager",
    tag: "@gemini_node",
    avatar: "https://i.pravatar.cc/150?u=gemini_engine",
    level: 85,
    xp: 94200,
    nextLevelXp: 100000,
    joined: "June 2026",
    status: "AI Super User"
  };

  const handleScroll = (id: string, direction: "left" | "right") => {
    const el = scrollRefs.current[id];
    if (el) {
      const scrollAmount = 340;
      el.scrollBy({ left: direction === "left" ? -scrollAmount : scrollAmount, behavior: "smooth" });
    }
  };

  const handleRunGame = (game: any) => {
    if (userCoins < game.cost) {
      alert("❌ Core link allocation error: Insufficient Credits!");
      return;
    }
    setUserCoins(prev => prev - game.cost);
    setSelectedGame(game);
    setGameStatus("booting");

    setTimeout(() => {
      setGameStatus("running");
      const interval = setInterval(() => {
        setLiveScore(prev => prev + Math.floor(Math.random() * 45) + 15);
      }, 1000);
      (window as any).geminiInterval = interval;
    }, 2400);
  };

  const handleCloseGame = () => {
    clearInterval((window as any).geminiInterval);
    setGameStatus("idle");
    setSelectedGame(null);
    setLiveScore(0);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans overflow-x-hidden antialiased [perspective:1200px] bg-[#04040a] text-neutral-200">
      
      {/* ==================== GEMINI COSMIC HEADER ==================== */}
      <header className="w-full border-b backdrop-blur-xl px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-40 bg-[#04040a]/80 border-white/[0.03] shadow-2xl">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-400 to-purple-600 animate-spin [animation-duration:6s] flex items-center justify-center">
            <div className="w-3 h-3 bg-[#04040a] rounded-md" />
          </div>
          {/* হেডার লোগো নিয়ন গ্লো */}
          <h1 
            className="text-sm font-mono font-black tracking-[0.2em] uppercase bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent"
            style={{ filter: "drop-shadow(0 0 10px rgba(6,182,212,0.5))" }}
          >
            GEMINI_OS // v5.1
          </h1>
        </div>

        {/* কোয়ান্টাম কন্ট্রোল প্যানেল */}
        <div className="flex items-center gap-3">
          <motion.div 
            key={userCoins} initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono text-xs font-black bg-black border-white/[0.05] text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)]"
          >
            <Zap className="w-3.5 h-3.5 fill-current animate-pulse" />
            <span style={{ textShadow: "0 0 8px #00f0ff" }}><CountUp end={userCoins} duration={0.3} /> R</span>
          </motion.div>

          <button onClick={() => setIsProfileOpen(true)} className="w-8 h-8 rounded-full overflow-hidden border-2 border-cyan-400 p-[1px] hover:scale-95 transition-all shadow-[0_0_10px_rgba(6,182,212,0.4)]">
            <img src={userProfile.avatar} alt="Avatar" className="w-full h-full object-cover rounded-full" />
          </button>
        </div>
      </header>

      {/* ==================== CORE INTERACTION VIEW ==================== */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12 flex-1 flex flex-col justify-center items-center z-10">
        <AnimatePresence mode="wait">
          
          {/* 1. IDLE STATE: PC GRID + MOBILE CAROUSEL HYBRID */}
          {gameStatus === "idle" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full space-y-12">
              
              {spineCategories.map((spine) => (
                <div key={spine.id} className="relative w-full group/spine">
                  
                  {/* স্পাইনাল লাইভ নিয়ন গ্লো ব্যাকগ্রাউন্ড */}
                  <div 
                    className="absolute -inset-x-4 -inset-y-3 rounded-3xl opacity-0 group-hover/spine:opacity-100 transition-all duration-500 pointer-events-none blur-2xl"
                    style={{ backgroundColor: `${spine.glowColor}08` }}
                  />

                  {/* স্পাইন হেডার এবং কাস্টম নেভিগেশন */}
                  <div className={`flex items-center justify-between mb-6 pb-2.5 border-b border-white/[0.03] ${spine.shadowGlow}`}>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-neutral-900/40 border border-white/[0.05]">
                        {spine.icon}
                      </div>
                      <div>
                        {/* ক্যাটাগরি টেক্সট নিয়ন গ্লো */}
                        <h2 
                          style={{ textShadow: `0 0 12px ${spine.glowColor}` }}
                          className="text-sm sm:text-base font-black uppercase tracking-widest text-white"
                        >
                          {spine.title}
                        </h2>
                        <p className="text-[10px] font-mono text-neutral-500">MAPPED_SECTOR // {spine.short}</p>
                      </div>
                    </div>

                    {/* পিসি স্লাইডার বাটন */}
                    <div className="hidden sm:flex items-center gap-2">
                      <button onClick={() => handleScroll(spine.id, "left")} className="p-1.5 rounded-lg border border-white/[0.04] bg-black/40 text-neutral-400 hover:text-white"><ChevronLeft className="w-4 h-4" /></button>
                      <button onClick={() => handleScroll(spine.id, "right")} className="p-1.5 rounded-lg border border-white/[0.04] bg-black/40 text-neutral-400 hover:text-white"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                  </div>

                  {/* রেসপন্সিভ ট্র্যাক: মোবাইলে টাচ ক্যারাউজেল, পিসিতে গ্রিড */}
                  <div 
                    ref={(el) => { scrollRefs.current[spine.id] = el; }}
                    className="flex sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6 overflow-x-auto sm:overflow-x-visible pb-4 sm:pb-0 scrollbar-none snap-x snap-mandatory"
                  >
                    {spine.games.map((game) => (
                      <div key={game.id} className="snap-center">
                        <GeminiGameCard 
                          game={game} 
                          onRunGame={handleRunGame} 
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}

            </motion.div>
          )}

          {/* 2. BOOTING STREAM */}
          {gameStatus === "booting" && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="w-full max-w-md border rounded-[2.5rem] p-6 font-mono text-xs shadow-2xl bg-[#060610] border-white/[0.05] text-cyan-400"
            >
              <div className="flex items-center gap-2 border-b border-white/[0.05] pb-3 mb-4">
                <Cpu className="w-4 h-4 animate-spin text-purple-500" />
                <span className="font-black uppercase tracking-wider" style={{ textShadow: "0 0 8px #00f0ff" }}>Syncing Quantum Link</span>
              </div>
              <div className="space-y-2 text-[11px] text-neutral-400">
                <p>&gt; Injecting neural code layers...</p>
                <p style={{ color: selectedGame?.neonColor, textShadow: `0 0 8px ${selectedGame?.neonColor}` }} className="font-bold">&gt; Active Matrix Container: {selectedGame?.name}</p>
                <div className="w-full h-[3px] bg-neutral-900 rounded-full overflow-hidden mt-4">
                  <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 2, ease: "linear" }} className="h-full bg-gradient-to-r from-cyan-400 to-purple-500" />
                </div>
              </div>
            </motion.div>
          )}

          {/* 3. SIMULATOR ACTIVE RUNNING VIEW */}
          {gameStatus === "running" && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ borderColor: `${selectedGame?.neonColor}30`, boxShadow: `0 0 50px ${selectedGame?.neonColor}15` }}
              className="w-full max-w-2xl border rounded-[3rem] overflow-hidden shadow-2xl bg-[#04040a]"
            >
              <div className="px-5 py-4 border-b border-white/[0.04] flex items-center justify-between bg-black/20">
                <span className="text-[10px] font-mono font-black uppercase text-neutral-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: selectedGame?.neonColor }} />
                  <span style={{ textShadow: `0 0 8px ${selectedGame?.neonColor}` }}>Gemini Active Stream // {selectedGame?.name}</span>
                </span>
                <button onClick={handleCloseGame} className="p-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all"><X className="w-4 h-4" /></button>
              </div>
              
              <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center">
                <h2 
                  style={{ textShadow: `0 0 15px ${selectedGame?.neonColor}` }}
                  className="text-2xl font-black uppercase tracking-widest text-white"
                >
                  {selectedGame?.name}
                </h2>
                <p className="text-[11px] font-mono text-neutral-500 mt-1">STREAM_LATENCY // CORE_STABLE</p>
                
                <div className="mt-8 p-5 rounded-[2rem] border border-white/[0.03] bg-black/40 w-full max-w-sm grid grid-cols-2 gap-4 font-mono shadow-inner">
                  <div className="text-center border-r border-white/[0.05]">
                    <p className="text-[10px] text-neutral-500 uppercase tracking-wider">Live Yield</p>
                    <p className="text-xl font-black text-white mt-1" style={{ textShadow: "0 0 8px rgba(255,255,255,0.4)" }}><CountUp end={liveScore} preserveValue={true} /></p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-neutral-500 uppercase tracking-wider">FPS Status</p>
                    <p className="text-xl font-black text-cyan-400 mt-1" style={{ textShadow: "0 0 8px #00f0ff" }}>90.0 Hz</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* ==================== PREMIUM PROFILE MODAL ==================== */}
      <AnimatePresence>
        {isProfileOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsProfileOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 15 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="w-full max-w-xs border rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10 p-6 font-mono bg-[#080812] border-white/[0.05] text-neutral-300"
            >
              <button onClick={() => setIsProfileOpen(false)} className="absolute top-4 right-4 text-neutral-500 hover:text-white"><X className="w-4 h-4" /></button>
              
              <div className="flex flex-col items-center text-center pb-4 border-b border-white/[0.05]">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-cyan-400 p-[2px] shadow-[0_0_15px_rgba(0,240,255,0.2)]"><img src={userProfile.avatar} alt="Avatar" className="w-full h-full object-cover rounded-full" /></div>
                <h3 className="text-sm font-black uppercase tracking-wider mt-3 flex items-center gap-1 text-white" style={{ textShadow: "0 0 8px #00f0ff" }}>{userProfile.username} <ShieldCheck className="w-4 h-4 text-cyan-400" /></h3>
                <p className="text-[10px] text-neutral-500">{userProfile.tag}</p>
              </div>

              <div className="py-5 space-y-4 text-[11px]">
                <div>
                  <div className="flex justify-between font-black text-[10px] mb-1.5 text-cyan-400" style={{ textShadow: "0 0 5px #00f0ff" }}>
                    <span>LEVEL CORE {userProfile.level}</span>
                    <span className="text-neutral-500">{userProfile.xp} XP</span>
                  </div>
                  <div className="w-full h-[4px] bg-neutral-900 rounded-full overflow-hidden"><div style={{ width: "94%" }} className="h-full bg-gradient-to-r from-cyan-400 to-purple-500" /></div>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/[0.03] flex items-center justify-between text-[10px]">
                  <span className="text-neutral-500">Node Clearance</span>
                  <span className="text-purple-400 font-bold uppercase tracking-widest" style={{ textShadow: "0 0 5px rgba(168,85,247,0.5)" }}>{userProfile.status}</span>
                </div>
              </div>

              <button onClick={() => setIsProfileOpen(false)} className="w-full py-2.5 bg-gradient-to-r from-red-500/10 to-rose-500/10 hover:from-red-500 hover:to-rose-500 text-rose-400 hover:text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 border border-rose-500/20 transition-all"><LogOut className="w-3.5 h-3.5" /> Kill Session</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FOOTER */}
      <footer className="w-full py-4 border-t text-center text-[9px] font-mono tracking-[0.2em] uppercase mt-auto bg-black/20 border-white/[0.03] text-neutral-600">
        Validated Frame Cluster // Gemini System Engine 2026
      </footer>
    </div>
  );
}

