"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Coins, Gamepad2, Play, Trophy, Users, X, Maximize2, Sparkles, Terminal, Cpu, Zap, Sun, Moon, 
  User, Shield, ShieldCheck, LogOut, Award, Calendar, ChevronRight, Settings, Sliders
} from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import CountUp from "react-countup";

// প্রিমিয়াম গেম লিস্ট ডেটাবেজ
const initialGames = [
  { id: 1, name: "Cyber Arena 2026", genre: "Action RPG", players: "12.5K", cost: 250, image: "https://picsum.photos/600/400?random=10", neonColor: "#00ffff", borderGlow: "hover:border-[#00ffff]", bgDark: "from-cyan-950 to-black", bgLight: "from-cyan-50 to-white" },
  { id: 2, name: "Neon Racer X", genre: "Racing", players: "8.1K", cost: 120, image: "https://picsum.photos/600/400?random=11", neonColor: "#ff007f", borderGlow: "hover:border-[#ff007f]", bgDark: "from-pink-950 to-black", bgLight: "from-pink-50 to-white" },
  { id: 3, name: "Shadow Protocol", genre: "Strategy", players: "5.4K", cost: 400, image: "https://picsum.photos/600/400?random=12", neonColor: "#39ff14", borderGlow: "hover:border-[#39ff14]", bgDark: "from-emerald-950 to-black", bgLight: "from-emerald-50 to-white" },
  { id: 4, name: "Matrix Grid", genre: "Puzzle", players: "2.9K", cost: 50, image: "https://picsum.photos/600/400?random=13", neonColor: "#ff00ff", borderGlow: "hover:border-[#ff00ff]", bgDark: "from-purple-950 to-black", bgLight: "from-purple-50 to-white" },
  { id: 5, name: "Nexus Breach", genre: "Shooter", players: "18.2K", cost: 300, image: "https://picsum.photos/600/400?random=14", neonColor: "#00dbff", borderGlow: "hover:border-[#00dbff]", bgDark: "from-blue-950 to-black", bgLight: "from-blue-50 to-white" },
  { id: 6, name: "Glow Tactics", genre: "Card Game", players: "1.5K", cost: 80, image: "https://picsum.photos/600/400?random=15", neonColor: "#ffaa00", borderGlow: "hover:border-[#ffaa00]", bgDark: "from-amber-950 to-black", bgLight: "from-amber-50 to-white" },
];

// --- রেসপন্সিভ ৩D নিয়ন গেমカード কম্পোনেন্ট ---
function ProGameCard({ game, onRunGame, isDarkMode }: any) {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-0.5, 0.5], [15, -15]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-15, 15]);

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
      whileHover={{ translateZ: 30, scale: 1.03 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`w-full border-2 rounded-[2rem] overflow-hidden relative p-4 sm:p-5 transition-all duration-300 backdrop-blur-xl group cursor-pointer
        ${isDarkMode 
          ? "bg-[#04040c]/90 border-slate-900 shadow-[0_15px_35px_rgba(0,0,0,0.6)] " + game.borderGlow 
          : "bg-white/90 border-gray-100 shadow-[0_15px_35px_rgba(0,0,0,0.05)] hover:border-gray-300"
        }`}
    >
      {isDarkMode && (
        <div 
          className="absolute -top-10 -right-10 w-28 h-28 rounded-full opacity-10 blur-2xl pointer-events-none group-hover:opacity-30 transition-all duration-500"
          style={{ backgroundColor: game.neonColor }}
        />
      )}

      <div style={{ transform: "translateZ(30px)" }} className="h-40 sm:h-44 w-full relative rounded-2xl overflow-hidden shadow-inner bg-gray-200 dark:bg-gray-900">
        <img src={game.image} alt={game.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className={`absolute inset-0 bg-gradient-to-t via-transparent to-transparent ${isDarkMode ? 'from-[#04040c]' : 'from-white'}`} />
        
        <span 
          style={isDarkMode ? { borderColor: game.neonColor, color: game.neonColor, textShadow: `0 0 5px ${game.neonColor}` } : {}}
          className={`absolute top-3 left-3 text-[10px] px-2.5 py-0.5 rounded-md font-black tracking-widest uppercase border 
            ${isDarkMode ? 'bg-black/80' : 'bg-white text-gray-800 border-gray-200 shadow-sm'}`}
        >
          {game.genre}
        </span>
      </div>

      <div className="mt-4" style={{ transform: "translateZ(40px)" }}>
        <h3 className={`font-black text-base sm:text-lg tracking-wide truncate ${isDarkMode ? 'text-white group-hover:text-cyan-400' : 'text-gray-900'}`}>
          {game.name}
        </h3>
        
        <div className={`flex items-center justify-between text-xs my-3 p-2.5 rounded-xl border ${isDarkMode ? 'bg-black/40 border-white/5 text-slate-400' : 'bg-gray-50 border-gray-100 text-gray-600'}`}>
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-indigo-500" /> {game.players} Active
          </span>
          <span className={`flex items-center gap-0.5 font-bold ${isDarkMode ? 'text-yellow-400' : 'text-amber-600'}`}>
            <Coins className="w-3.5 h-3.5" /> {game.cost} R
          </span>
        </div>

        <button 
          onClick={() => onRunGame(game)}
          style={isDarkMode ? { background: `linear-gradient(135deg, ${game.neonColor} 0%, #0044ff 100%)`, boxShadow: `0 4px 15px ${game.neonColor}40` } : {}}
          className={`w-full py-2.5 font-black text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 uppercase tracking-widest transition-all active:scale-95 border-t
            ${isDarkMode 
              ? 'text-white border-white/20' 
              : 'bg-gray-900 hover:bg-black text-white border-transparent shadow-md'}`}
        >
          <Play className="w-3.5 h-3.5 fill-white" /> Launch Node
        </button>
      </div>
    </motion.div>
  );
}

// --- মেইন প্রো গেম ইঞ্জিন এবং হাব ---
export default function CyberEnginePro() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [userCoins, setUserCoins] = useState(5000);
  const [selectedGame, setSelectedGame] = useState<any>(null);
  const [gameStatus, setGameStatus] = useState<"idle" | "booting" | "running">("idle");
  const [liveScore, setLiveScore] = useState(0);
  const [isProfileOpen, setIsProfileOpen] = useState(false); // মোডাল স্টেট

  // ডামি ইউজার প্রোফাইল ডেটা
  const userProfile = {
    username: "Rashidul Neon",
    tag: "@neon_looper",
    avatar: "https://i.pravatar.cc/150?u=me_neon",
    level: 42,
    xp: 8450,
    nextLevelXp: 10000,
    joined: "January 2026",
    status: "Verified Developer"
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleRunGame = (game: any) => {
    if (userCoins < game.cost) {
      alert("❌ Insufficient funds on core account!");
      return;
    }
    setUserCoins(prev => prev - game.cost);
    setSelectedGame(game);
    setGameStatus("booting");

    setTimeout(() => {
      setGameStatus("running");
      const interval = setInterval(() => {
        setLiveScore(prev => prev + Math.floor(Math.random() * 20) + 5);
      }, 1000);
      (window as any).proScoreInterval = interval;
    }, 2500);
  };

  const handleCloseGame = () => {
    clearInterval((window as any).proScoreInterval);
    setGameStatus("idle");
    setSelectedGame(null);
    setLiveScore(0);
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-500 overflow-x-hidden antialiased [perspective:1200px]
      ${isDarkMode ? "bg-[#020206] text-white" : "bg-gray-50 text-gray-900"}`}
    >
      
      {/* ==================== ENTERPRISE TOP HEADER ==================== */}
      <header className={`w-full border-b backdrop-blur-md px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-40 transition-colors duration-500
        ${isDarkMode ? 'bg-black/60 border-white/5 shadow-xl' : 'bg-white/80 border-gray-200/80 shadow-sm'}`}
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-md">
            <Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <h1 className="text-base sm:text-lg font-black tracking-widest bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            NEXUS_CORE v2.0
          </h1>
        </div>

        {/* রাইট সাইড কন্ট্রোল প্যানেল */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          
          {/* কয়েন কাউন্টার */}
          <motion.div 
            key={userCoins}
            initial={{ scale: 0.85 }}
            animate={{ scale: 1 }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono font-bold text-xs sm:text-sm shadow-sm
              ${isDarkMode ? 'bg-yellow-500/5 border-yellow-500/30 text-yellow-400' : 'bg-amber-50 border-amber-200 text-amber-700'}`}
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span><CountUp end={userCoins} duration={0.4} /> R</span>
          </motion.div>

          {/* থিম চেঞ্জার বাটন */}
          <button 
            onClick={toggleTheme}
            className={`p-2 rounded-xl border transition-all active:scale-90 shadow-sm
              ${isDarkMode ? 'bg-neutral-900 border-neutral-800 text-yellow-400 hover:bg-neutral-800' : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'}`}
          >
            {isDarkMode ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>

          {/* ইন্টারেক্টিভ প্রোফাইল অবতার বাটন */}
          <button 
            onClick={() => setIsProfileOpen(true)}
            className={`flex items-center gap-2 p-1 pr-3 rounded-full border transition-all active:scale-95 shadow-sm
              ${isDarkMode ? 'bg-neutral-900 border-neutral-800 hover:bg-neutral-800' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border-2 border-indigo-500">
              <img src={userProfile.avatar} alt="User Avatar" className="w-full h-full object-cover" />
            </div>
            <span className="hidden sm:inline text-xs font-bold truncate max-w-[90px]">
              {userProfile.username.split(" ")[0]}
            </span>
          </button>

        </div>
      </header>

      {/* ==================== CORE RESPONSIVE GRID ==================== */}
      <main className="max-w-6xl w-full mx-auto px-4 py-8 sm:py-12 flex-1 flex flex-col justify-center items-center z-10">
        
        <AnimatePresence mode="wait">
          {/* 1. IDLE HUB STATE */}
          {gameStatus === "idle" && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full"
            >
              <div className="text-center md:text-left mb-8 border-l-4 border-indigo-600 pl-4">
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider flex items-center justify-center md:justify-start gap-2">
                  System Cluster Grid <Sparkles className="w-4 h-4 text-indigo-500" />
                </h2>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  ডাইনামিক ৩D এনভায়রনমেন্ট লোড করতে যেকোনো নোড সিস্টেম লঞ্চ করুন।
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 w-full">
                {initialGames.map((game) => (
                  <ProGameCard 
                    key={game.id} 
                    game={game} 
                    onRunGame={handleRunGame} 
                    isDarkMode={isDarkMode}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* 2. BOOTING STATE */}
          {gameStatus === "booting" && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className={`w-full max-w-xl border-2 rounded-3xl p-6 sm:p-8 font-mono text-xs shadow-xl
                ${isDarkMode ? 'bg-[#030309] border-cyan-500 text-cyan-400' : 'bg-white border-gray-900 text-gray-900'}`}
            >
              <div className="flex items-center justify-between border-b pb-3 mb-4 border-gray-800 dark:border-gray-200/10">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 animate-pulse" />
                  <span className="font-bold uppercase">Grid Node Launcher v2.0</span>
                </div>
                <span className="text-[10px] opacity-60">SECURED_LINK</span>
              </div>
              
              <div className="space-y-2.5">
                <p className="opacity-50">&gt; Allocating hardware cluster channels...</p>
                <p className="text-indigo-500">&gt; Spawning structural components for: {selectedGame?.name}</p>
                <p className="text-amber-500">&gt; Settlement processed via token gateway (-{selectedGame?.cost} R)</p>
                <p className="text-emerald-500 font-bold animate-pulse">&gt; Environment ready. Compiling output stream...</p>
                
                <div className="w-full h-1.5 bg-gray-200 dark:bg-neutral-900 rounded-full overflow-hidden mt-6">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2.3, ease: "linear" }}
                    className="h-full bg-indigo-600"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* 3. EMULATED RUNNING STATE */}
          {gameStatus === "running" && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={isDarkMode ? { boxShadow: `0 25px 65px ${selectedGame?.neonColor}20`, borderColor: selectedGame?.neonColor } : {}}
              className={`w-full max-w-2xl border-2 rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-300
                ${isDarkMode ? `bg-gradient-to-b ${selectedGame?.bgDark} border-slate-900` : `bg-gradient-to-b ${selectedGame?.bgLight} border-gray-300`}`}
            >
              <div className={`px-4 sm:px-5 py-3.5 border-b flex items-center justify-between
                ${isDarkMode ? 'bg-black/70 border-white/5' : 'bg-white/90 border-gray-200'}`}>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                  <span className={`text-[11px] font-mono font-black uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Active Node // {selectedGame?.name}
                  </span>
                </div>
                
                <button 
                  onClick={handleCloseGame}
                  className="p-1.5 rounded-xl transition-all active:scale-90 bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 sm:p-10 flex flex-col items-center justify-center text-center min-h-[340px]">
                <motion.div 
                  animate={{ scale: [1, 1.04, 1], rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                  style={isDarkMode ? { borderColor: selectedGame?.neonColor, boxShadow: `0 0 25px ${selectedGame?.neonColor}30` } : {}}
                  className={`w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center mb-6 p-2
                    ${isDarkMode ? 'bg-black/30' : 'bg-white border-indigo-500 shadow-sm'}`}
                >
                  <Cpu className="w-8 h-8 text-indigo-500" />
                </motion.div>

                <h2 className={`text-2xl font-black uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {selectedGame?.name}
                </h2>
                <p className={`text-xs mt-1 font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  স্যান্ডবক্স ক্লাস্টার সাকসেসফুলি কানেক্টেড এবং রানিং অবস্থায় আছে।
                </p>

                <div className={`mt-8 grid grid-cols-2 gap-4 sm:gap-6 w-full max-w-xs p-4 rounded-2xl border shadow-md
                  ${isDarkMode ? 'bg-black/60 border-white/5' : 'bg-white border-gray-100'}`}>
                  <div className="text-center border-r border-gray-200/10 dark:border-white/5">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 flex items-center justify-center gap-1">
                      <Trophy className="w-3 h-3 text-amber-500" /> Score
                    </p>
                    <p className={`text-xl font-mono font-black mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      <CountUp end={liveScore} preserveValue={true} />
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">FPS Performance</p>
                    <p className="text-xl font-mono font-black text-emerald-500 mt-1">60.0</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ==================== PREMIUM PROFILE MODAL POPUP ==================== */}
      <AnimatePresence>
        {isProfileOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* ব্যাকড্রপ ব্লার বডি */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProfileOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md"
            />

            {/* মেইন মোডাল পপআপ বক্স */}
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              className={`w-full max-w-md border rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10 transition-colors duration-300
                ${isDarkMode ? 'bg-[#050510] border-neutral-800 text-white' : 'bg-white border-gray-100 text-gray-900'}`}
            >
              {/* ক্লোজ বাটন */}
              <button 
                onClick={() => setIsProfileOpen(false)}
                className={`absolute top-4 right-4 p-2 rounded-full border transition-all active:scale-90
                  ${isDarkMode ? 'bg-neutral-900 border-neutral-800 text-gray-400 hover:text-white' : 'bg-gray-100 border-gray-200 text-gray-600'}`}
              >
                <X className="w-4 h-4" />
              </button>

              {/* প্রোফাইল হেডার */}
              <div className={`p-6 pb-4 flex flex-col items-center border-b ${isDarkMode ? 'border-white/5' : 'border-gray-100'}`}>
                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-indigo-500 shadow-md relative group">
                  <img src={userProfile.avatar} alt="Profile" className="w-full h-full object-cover" />
                </div>
                
                <h3 className="text-lg font-black mt-3 flex items-center gap-1.5 uppercase tracking-wide">
                  {userProfile.username} 
                  <ShieldCheck className="w-4 h-4 text-cyan-400 fill-cyan-400/20" />
                </h3>
                <p className="text-xs text-gray-400 font-mono">{userProfile.tag}</p>

                <span className={`text-[10px] font-black tracking-widest px-3 py-0.5 rounded-full border uppercase mt-2
                  ${isDarkMode ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-cyan-50 border-cyan-200 text-cyan-700'}`}>
                  {userProfile.status}
                </span>
              </div>

              {/* লেভেল এবং এক্সপিরিয়েন্স বার */}
              <div className="px-6 py-4">
                <div className="flex justify-between items-center text-xs font-bold mb-1">
                  <span className="flex items-center gap-1 text-indigo-500"><Award className="w-4 h-4" /> Level {userProfile.level}</span>
                  <span className="text-gray-400">{userProfile.xp} / {userProfile.nextLevelXp} XP</span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-neutral-900' : 'bg-gray-100'}`}>
                  <div 
                    style={{ width: `${(userProfile.xp / userProfile.nextLevelXp) * 100}%` }}
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                  />
                </div>
              </div>

              {/* কুইক সেটিংস / ইনফো অপশন লিস্ট */}
              <div className="px-4 pb-6 space-y-1.5">
                <div className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer hover:translate-x-1
                  ${isDarkMode ? 'bg-black/40 border-white/5 hover:bg-neutral-900/40' : 'bg-gray-50 border-gray-100 hover:bg-gray-100/60'}`}>
                  <div className="flex items-center gap-2.5 text-xs font-bold">
                    <Sliders className="w-4 h-4 text-purple-500" /> Account Dashboard
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>

                <div className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer hover:translate-x-1
                  ${isDarkMode ? 'bg-black/40 border-white/5 hover:bg-neutral-900/40' : 'bg-gray-50 border-gray-100 hover:bg-gray-100/60'}`}>
                  <div className="flex items-center gap-2.5 text-xs font-bold">
                    <Calendar className="w-4 h-4 text-cyan-500" /> Joined {userProfile.joined}
                  </div>
                </div>

                <button 
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full mt-4 py-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  <LogOut className="w-3.5 h-3.5" /> Close Node Matrix
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ফুটার ফ্রেম */}
      <footer className={`w-full py-4 border-t text-center text-[10px] font-mono tracking-widest uppercase mt-auto
        ${isDarkMode ? 'bg-black/20 border-white/5 text-slate-600' : 'bg-gray-100 border-gray-200 text-gray-500'}`}>
        System Compilation Validated // Global Node Engine 2026
      </footer>

    </div>
  );
}


// "use client";

// import { useState, useRef, useEffect } from "react";
// import { 
//   Coins, Gamepad2, Play, Trophy, Users, X, Maximize2, Sparkles, Terminal, Cpu, Zap, Sun, Moon, Monitor, Laptop
// } from "lucide-react";
// import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
// import CountUp from "react-countup";

// // প্রিমিয়াম গেম লিস্ট ডেটাবেজ
// const initialGames = [
//   { id: 1, name: "Cyber Arena 2026", genre: "Action RPG", players: "12.5K", cost: 250, image: "https://picsum.photos/600/400?random=10", neonColor: "#00ffff", borderGlow: "hover:border-[#00ffff]", bgDark: "from-cyan-950 to-black", bgLight: "from-cyan-50 to-white" },
//   { id: 2, name: "Neon Racer X", genre: "Racing", players: "8.1K", cost: 120, image: "https://picsum.photos/600/400?random=11", neonColor: "#ff007f", borderGlow: "hover:border-[#ff007f]", bgDark: "from-pink-950 to-black", bgLight: "from-pink-50 to-white" },
//   { id: 3, name: "Shadow Protocol", genre: "Strategy", players: "5.4K", cost: 400, image: "https://picsum.photos/600/400?random=12", neonColor: "#39ff14", borderGlow: "hover:border-[#39ff14]", bgDark: "from-emerald-950 to-black", bgLight: "from-emerald-50 to-white" },
//   { id: 4, name: "Matrix Grid", genre: "Puzzle", players: "2.9K", cost: 50, image: "https://picsum.photos/600/400?random=13", neonColor: "#ff00ff", borderGlow: "hover:border-[#ff00ff]", bgDark: "from-purple-950 to-black", bgLight: "from-purple-50 to-white" },
//   { id: 5, name: "Nexus Breach", genre: "Shooter", players: "18.2K", cost: 300, image: "https://picsum.photos/600/400?random=14", neonColor: "#00dbff", borderGlow: "hover:border-[#00dbff]", bgDark: "from-blue-950 to-black", bgLight: "from-blue-50 to-white" },
//   { id: 6, name: "Glow Tactics", genre: "Card Game", players: "1.5K", cost: 80, image: "https://picsum.photos/600/400?random=15", neonColor: "#ffaa00", borderGlow: "hover:border-[#ffaa00]", bgDark: "from-amber-950 to-black", bgLight: "from-amber-50 to-white" },
// ];

// // --- রেসপন্সিভ ৩D নিয়ন গেম কার্ড কম্পোনেন্ট ---
// function ProGameCard({ game, onRunGame, isDarkMode }: any) {
//   const cardRef = useRef<HTMLDivElement>(null);
//   const x = useMotionValue(0);
//   const y = useMotionValue(0);

//   // স্মুথ ৩D রোটেট এফেক্ট
//   const rotateX = useTransform(y, [-0.5, 0.5], [15, -15]);
//   const rotateY = useTransform(x, [-0.5, 0.5], [-15, 15]);

//   const handleMouseMove = (e: React.MouseEvent) => {
//     if (!cardRef.current) return;
//     const rect = cardRef.current.getBoundingClientRect();
//     x.set((e.clientX - rect.left - rect.width / 2) / rect.width);
//     y.set((e.clientY - rect.top - rect.height / 2) / rect.height);
//   };

//   return (
//     <motion.div
//       ref={cardRef}
//       onMouseMove={handleMouseMove}
//       onMouseLeave={() => { x.set(0); y.set(0); }}
//       style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
//       whileHover={{ translateZ: 30, scale: 1.03 }}
//       transition={{ type: "spring", stiffness: 300, damping: 20 }}
//       className={`w-full border-2 rounded-[2rem] overflow-hidden relative p-4 sm:p-5 transition-all duration-300 backdrop-blur-xl group cursor-pointer
//         ${isDarkMode 
//           ? "bg-[#04040c]/90 border-slate-900 shadow-[0_15px_35px_rgba(0,0,0,0.6)] " + game.borderGlow 
//           : "bg-white/90 border-gray-100 shadow-[0_15px_35px_rgba(0,0,0,0.05)] hover:border-gray-300"
//         }`}
//     >
//       {/* অ্যাম্বিয়েন্ট শ্যাডো ওভারলে (ডার্ক মোডের জন্য) */}
//       {isDarkMode && (
//         <div 
//           className="absolute -top-10 -right-10 w-28 h-28 rounded-full opacity-10 blur-2xl pointer-events-none group-hover:opacity-30 transition-all duration-500"
//           style={{ backgroundColor: game.neonColor }}
//         />
//       )}

//       {/* গেম ব্যানার রেসপন্সিভ লেয়ার */}
//       <div style={{ transform: "translateZ(30px)" }} className="h-40 sm:h-44 w-full relative rounded-2xl overflow-hidden shadow-inner bg-gray-200 dark:bg-gray-900">
//         <img src={game.image} alt={game.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
//         <div className={`absolute inset-0 bg-gradient-to-t via-transparent to-transparent ${isDarkMode ? 'from-[#04040c]' : 'from-white'}`} />
        
//         {/* জেনুইন নিয়ন বা মিনিমাল ট্যাগ */}
//         <span 
//           style={isDarkMode ? { borderColor: game.neonColor, color: game.neonColor, textShadow: `0 0 5px ${game.neonColor}` } : {}}
//           className={`absolute top-3 left-3 text-[10px] px-2.5 py-0.5 rounded-md font-black tracking-widest uppercase border 
//             ${isDarkMode ? 'bg-black/80' : 'bg-white text-gray-800 border-gray-200 shadow-sm'}`}
//         >
//           {game.genre}
//         </span>
//       </div>

//       {/* মেটাডাটা সেকশন */}
//       <div className="mt-4" style={{ transform: "translateZ(40px)" }}>
//         <h3 className={`font-black text-base sm:text-lg tracking-wide truncate ${isDarkMode ? 'text-white group-hover:text-cyan-400' : 'text-gray-900'}`}>
//           {game.name}
//         </h3>
        
//         <div className={`flex items-center justify-between text-xs my-3 p-2.5 rounded-xl border ${isDarkMode ? 'bg-black/40 border-white/5 text-slate-400' : 'bg-gray-50 border-gray-100 text-gray-600'}`}>
//           <span className="flex items-center gap-1">
//             <Users className="w-3.5 h-3.5 text-indigo-500" /> {game.players} Active
//           </span>
//           <span className={`flex items-center gap-0.5 font-bold ${isDarkMode ? 'text-yellow-400' : 'text-amber-600'}`}>
//             <Coins className="w-3.5 h-3.5" /> {game.cost} R
//           </span>
//         </div>

//         {/* অ্যাকশন বাটন */}
//         <button 
//           onClick={() => onRunGame(game)}
//           style={isDarkMode ? { background: `linear-gradient(135deg, ${game.neonColor} 0%, #0044ff 100%)`, boxShadow: `0 4px 15px ${game.neonColor}40` } : {}}
//           className={`w-full py-2.5 font-black text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 uppercase tracking-widest transition-all active:scale-95 border-t
//             ${isDarkMode 
//               ? 'text-white border-white/20' 
//               : 'bg-gray-900 hover:bg-black text-white border-transparent shadow-md'}`}
//         >
//           <Play className="w-3.5 h-3.5 fill-white" /> Launch Node
//         </button>
//       </div>
//     </motion.div>
//   );
// }

// // --- মেইন প্রো ইঞ্জিন এপ্লিকেশন ---
// export default function CyberEnginePro() {
//   const [isDarkMode, setIsDarkMode] = useState(true);
//   const [userCoins, setUserCoins] = useState(5000);
//   const [selectedGame, setSelectedGame] = useState<any>(null);
//   const [gameStatus, setGameStatus] = useState<"idle" | "booting" | "running">("idle");
//   const [liveScore, setLiveScore] = useState(0);

//   // সিস্টেম মোড হ্যান্ডলিং
//   const toggleTheme = () => setIsDarkMode(!isDarkMode);

//   const handleRunGame = (game: any) => {
//     if (userCoins < game.cost) {
//       alert("❌ Insufficient funds on core account!");
//       return;
//     }
//     setUserCoins(prev => prev - game.cost);
//     setSelectedGame(game);
//     setGameStatus("booting");

//     setTimeout(() => {
//       setGameStatus("running");
//       const interval = setInterval(() => {
//         setLiveScore(prev => prev + Math.floor(Math.random() * 20) + 5);
//       }, 1000);
//       (window as any).proScoreInterval = interval;
//     }, 2500);
//   };

//   const handleCloseGame = () => {
//     clearInterval((window as any).proScoreInterval);
//     setGameStatus("idle");
//     setSelectedGame(null);
//     setLiveScore(0);
//   };

//   return (
//     <div className={`min-h-screen flex flex-col font-sans transition-colors duration-500 overflow-x-hidden antialiased [perspective:1200px]
//       ${isDarkMode ? "bg-[#020206] text-white" : "bg-gray-50 text-gray-900"}`}
//     >
      
//       {/* ==================== ENTERPRISE TOP HEADER ==================== */}
//       <header className={`w-full border-b backdrop-blur-md px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-40 transition-colors duration-500
//         ${isDarkMode ? 'bg-black/60 border-white/5 shadow-xl' : 'bg-white/80 border-gray-200/80 shadow-sm'}`}
//       >
//         <div className="flex items-center gap-2">
//           <div className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-md">
//             <Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6" />
//           </div>
//           <h1 className="text-base sm:text-lg font-black tracking-widest bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
//             NEXUS_CORE v2.0
//           </h1>
//         </div>

//         {/* কন্ট্রোল এরিয়া: কয়েন ট্র্যাকার এবং লাইট/ডার্ক সুইচার */}
//         <div className="flex items-center gap-3 sm:gap-4">
          
//           {/* কয়েন ডিসপ্লে */}
//           <motion.div 
//             key={userCoins}
//             initial={{ scale: 0.85 }}
//             animate={{ scale: 1 }}
//             className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono font-bold text-xs sm:text-sm shadow-sm
//               ${isDarkMode ? 'bg-yellow-500/5 border-yellow-500/30 text-yellow-400' : 'bg-amber-50 border-amber-200 text-amber-700'}`}
//           >
//             <Zap className="w-3.5 h-3.5 fill-current" />
//             <span><CountUp end={userCoins} duration={0.4} /> R</span>
//           </motion.div>

//           {/* থিম টগলার সুইচ বাটন */}
//           <button 
//             onClick={toggleTheme}
//             className={`p-2 rounded-xl border transition-all active:scale-90 shadow-sm
//               ${isDarkMode ? 'bg-neutral-900 border-neutral-800 text-yellow-400 hover:bg-neutral-800' : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'}`}
//           >
//             {isDarkMode ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
//           </button>

//         </div>
//       </header>

//       {/* ==================== CORE RESPONSIVE GRID ==================== */}
//       <main className="max-w-6xl w-full mx-auto px-4 py-8 sm:py-12 flex-1 flex flex-col justify-center items-center z-10">
        
//         <AnimatePresence mode="wait">
//           {/* 1. IDLE HUB STATE */}
//           {gameStatus === "idle" && (
//             <motion.div 
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -20 }}
//               className="w-full"
//             >
//               <div className="text-center md:text-left mb-8 border-l-4 border-indigo-600 pl-4">
//                 <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider flex items-center justify-center md:justify-start gap-2">
//                   System Cluster Grid <Sparkles className="w-4 h-4 text-indigo-500" />
//                 </h2>
//                 <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
//                   ডাইনামিক ৩D এনভায়রনমেন্ট লোড করতে যেকোনো নোড সিস্টেম লঞ্চ করুন।
//                 </p>
//               </div>

//               {/* রেসপন্সিভ গ্রিড আর্কিটেকচার (মোবাইলে ১ কলাম, ট্যাবলেটে ২, পিসিতে ৩) */}
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 w-full">
//                 {initialGames.map((game) => (
//                   <ProGameCard 
//                     key={game.id} 
//                     game={game} 
//                     onRunGame={handleRunGame} 
//                     isDarkMode={isDarkMode}
//                   />
//                 ))}
//               </div>
//             </motion.div>
//           )}

//           {/* 2. PRO COMPILER LOADING STATE */}
//           {gameStatus === "booting" && (
//             <motion.div 
//               initial={{ opacity: 0, scale: 0.95 }}
//               animate={{ opacity: 1, scale: 1 }}
//               exit={{ opacity: 0 }}
//               className={`w-full max-w-xl border-2 rounded-3xl p-6 sm:p-8 font-mono text-xs shadow-xl
//                 ${isDarkMode ? 'bg-[#030309] border-cyan-500 text-cyan-400' : 'bg-white border-gray-900 text-gray-900'}`}
//             >
//               <div className="flex items-center justify-between border-b pb-3 mb-4 border-gray-800 dark:border-gray-200/10">
//                 <div className="flex items-center gap-2">
//                   <Terminal className="w-4 h-4 animate-pulse" />
//                   <span className="font-bold uppercase">Grid Node Launcher v2.0</span>
//                 </div>
//                 <span className="text-[10px] opacity-60">SECURED_LINK</span>
//               </div>
              
//               <div className="space-y-2.5">
//                 <p className="opacity-50">&gt; Allocating hardware cluster channels...</p>
//                 <p className="text-indigo-500">&gt; Spawning structural components for: {selectedGame?.name}</p>
//                 <p className="text-amber-500">&gt; Settlement processed via token gateway (-{selectedGame?.cost} R)</p>
//                 <p className="text-emerald-500 font-bold animate-pulse">&gt; Environment ready. Compiling output stream...</p>
                
//                 {/* প্রো প্রগ্রেস ইন্ডিকেটর */}
//                 <div className="w-full h-1.5 bg-gray-200 dark:bg-neutral-900 rounded-full overflow-hidden mt-6">
//                   <motion.div 
//                     initial={{ width: 0 }}
//                     animate={{ width: "100%" }}
//                     transition={{ duration: 2.3, ease: "linear" }}
//                     className="h-full bg-indigo-600"
//                   />
//                 </div>
//               </div>
//             </motion.div>
//           )}

//           {/* 3. EMULATED RUNNING STATE */}
//           {gameStatus === "running" && (
//             <motion.div 
//               initial={{ opacity: 0, y: 30 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, scale: 0.95 }}
//               style={isDarkMode ? { boxShadow: `0 25px 65px ${selectedGame?.neonColor}20`, borderColor: selectedGame?.neonColor } : {}}
//               className={`w-full max-w-2xl border-2 rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-300
//                 ${isDarkMode ? `bg-gradient-to-b ${selectedGame?.bgDark} border-slate-900` : `bg-gradient-to-b ${selectedGame?.bgLight} border-gray-300`}`}
//             >
//               {/* সিমুলেটর উইন্ডো কন্ট্রোল ফ্রেম */}
//               <div className={`px-4 sm:px-5 py-3.5 border-b flex items-center justify-between
//                 ${isDarkMode ? 'bg-black/70 border-white/5' : 'bg-white/90 border-gray-200'}`}>
//                 <div className="flex items-center gap-2">
//                   <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
//                   <span className={`text-[11px] font-mono font-black uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
//                     Active Node // {selectedGame?.name}
//                   </span>
//                 </div>
                
//                 <button 
//                   onClick={handleCloseGame}
//                   className="p-1.5 rounded-xl transition-all active:scale-90 bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white"
//                 >
//                   <X className="w-4 h-4" />
//                 </button>
//               </div>

//               {/* লাইভ এমুলেটর কন্ট্রোল এরিয়া */}
//               <div className="p-6 sm:p-10 flex flex-col items-center justify-center text-center min-h-[340px]">
                
//                 <motion.div 
//                   animate={{ scale: [1, 1.04, 1], rotate: 360 }}
//                   transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
//                   style={isDarkMode ? { borderColor: selectedGame?.neonColor, boxShadow: `0 0 25px ${selectedGame?.neonColor}30` } : {}}
//                   className={`w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center mb-6 p-2
//                     ${isDarkMode ? 'bg-black/30' : 'bg-white border-indigo-500 shadow-sm'}`}
//                 >
//                   <Cpu className="w-8 h-8 text-indigo-500" />
//                 </motion.div>

//                 <h2 className={`text-2xl font-black uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                   {selectedGame?.name}
//                 </h2>
//                 <p className={`text-xs mt-1 font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
//                   স্যান্ডবক্স ক্লাস্টার সাকসেসফুলি কানেক্টেড এবং রানিং অবস্থায় আছে।
//                 </p>

//                 {/* ড্যাশবোর্ড ডেটা মনিটর ফ্রেম */}
//                 <div className={`mt-8 grid grid-cols-2 gap-4 sm:gap-6 w-full max-w-xs p-4 rounded-2xl border shadow-md
//                   ${isDarkMode ? 'bg-black/60 border-white/5' : 'bg-white border-gray-100'}`}>
//                   <div className="text-center border-r border-gray-200/10 dark:border-white/5">
//                     <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 flex items-center justify-center gap-1">
//                       <Trophy className="w-3 h-3 text-amber-500" /> Score
//                     </p>
//                     <p className={`text-xl font-mono font-black mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                       <CountUp end={liveScore} preserveValue={true} />
//                     </p>
//                   </div>
//                   <div className="text-center">
//                     <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">FPS Performance</p>
//                     <p className="text-xl font-mono font-black text-emerald-500 mt-1">60.0</p>
//                   </div>
//                 </div>

//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>

//       </main>

//       {/* ফুটার ফ্রেম */}
//       <footer className={`w-full py-4 border-t text-center text-[10px] font-mono tracking-widest uppercase mt-auto
//         ${isDarkMode ? 'bg-black/20 border-white/5 text-slate-600' : 'bg-gray-100 border-gray-200 text-gray-500'}`}>
//         System Compilation Validated // Global Node Engine 2026
//       </footer>

//     </div>
//   );
// }



// "use client";

// import { useState, useRef } from "react";
// import { 
//   Coins, Gamepad2, Play, Trophy, Users, X, Maximize2, Sparkles, Terminal, Cpu, Zap
// } from "lucide-react";
// import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
// import CountUp from "react-countup";

// // প্রিমিয়াম হাইপার-নিয়ন গেম লিস্ট ডেটা
// const initialGames = [
//   { id: 1, name: "Cyber Arena 2026", genre: "Action RPG", players: "12.5K", cost: 250, image: "https://picsum.photos/600/400?random=10", neonColor: "#00ffff", glowShadow: "shadow-[0_0_25px_rgba(0,255,255,0.4)]", borderGlow: "hover:border-[#00ffff]" },
//   { id: 2, name: "Neon Racer X", genre: "Racing", players: "8.1K", cost: 120, image: "https://picsum.photos/600/400?random=11", neonColor: "#ff007f", glowShadow: "shadow-[0_0_25px_rgba(255,0,127,0.4)]", borderGlow: "hover:border-[#ff007f]" },
//   { id: 3, name: "Shadow Protocol", genre: "Strategy", players: "5.4K", cost: 400, image: "https://picsum.photos/600/400?random=12", neonColor: "#39ff14", glowShadow: "shadow-[0_0_25px_rgba(57,255,20,0.4)]", borderGlow: "hover:border-[#39ff14]" },
//   { id: 4, name: "Matrix Grid", genre: "Puzzle", players: "2.9K", cost: 50, image: "https://picsum.photos/600/400?random=13", neonColor: "#ff00ff", glowShadow: "shadow-[0_0_25px_rgba(255,0,255,0.4)]", borderGlow: "hover:border-[#ff00ff]" },
//   { id: 5, name: "Nexus Breach", genre: "Shooter", players: "18.2K", cost: 300, image: "https://picsum.photos/600/400?random=14", neonColor: "#00dbff", glowShadow: "shadow-[0_0_25px_rgba(0,219,255,0.4)]", borderGlow: "hover:border-[#00dbff]" },
//   { id: 6, name: "Glow Tactics", genre: "Card Game", players: "1.5K", cost: 80, image: "https://picsum.photos/600/400?random=15", neonColor: "#ffaa00", glowShadow: "shadow-[0_0_25px_rgba(255,170,0,0.4)]", borderGlow: "hover:border-[#ffaa00]" },
// ];

// // --- আল্ট্রা ৩D নিয়ন গেম কার্ড কম্পোনেন্ট ---
// function UltraNeonGameCard({ game, onRunGame }: any) {
//   const cardRef = useRef<HTMLDivElement>(null);
//   const x = useMotionValue(0);
//   const y = useMotionValue(0);

//   // ৩D হাইপার এঙ্গেল ট্র্যান্সফর্মেশন
//   const rotateX = useTransform(y, [-0.5, 0.5], [20, -20]);
//   const rotateY = useTransform(x, [-0.5, 0.5], [-20, 20]);

//   const handleMouseMove = (e: React.MouseEvent) => {
//     if (!cardRef.current) return;
//     const rect = cardRef.current.getBoundingClientRect();
//     x.set((e.clientX - rect.left - rect.width / 2) / rect.width);
//     y.set((e.clientY - rect.top - rect.height / 2) / rect.height);
//   };

//   return (
//     <motion.div
//       ref={cardRef}
//       onMouseMove={handleMouseMove}
//       onMouseLeave={() => { x.set(0); y.set(0); }}
//       style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
//       whileHover={{ translateZ: 35, scale: 1.04 }}
//       transition={{ type: "spring", stiffness: 350, damping: 18 }}
//       className={`bg-[#03030c]/95 border-2 border-slate-900 rounded-[2.5rem] overflow-hidden relative p-5 transition-all duration-300 backdrop-blur-xl group ${game.borderGlow} ${game.glowShadow}`}
//     >
//       {/* ব্যাকগ্রাউন্ড নিয়ন গ্লো অরবিট */}
//       <div 
//         className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-20 blur-3xl pointer-events-none transition-all duration-500 group-hover:opacity-40"
//         style={{ backgroundColor: game.neonColor }}
//       />

//       {/* গেম ইমেজ ফ্রেম এলিমেন্ট */}
//       <div style={{ transform: "translateZ(40px)", transformStyle: "preserve-3d" }} className="h-48 w-full relative rounded-2xl overflow-hidden border border-white/5 shadow-inner">
//         <img src={game.image} alt={game.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-115" />
//         <div className="absolute inset-0 bg-gradient-to-t from-[#03030c] via-transparent to-transparent opacity-90" />
        
//         {/* নিয়ন গ্লোয়িং ব্যাজ */}
//         <span 
//           style={{ borderColor: game.neonColor, color: game.neonColor, textShadow: `0 0 6px ${game.neonColor}`, boxShadow: `0 0 10px ${game.neonColor}40` }}
//           className="absolute top-4 left-4 bg-black/90 border text-[10px] px-3 py-1 rounded-full font-black tracking-widest uppercase"
//         >
//           {game.genre}
//         </span>
//       </div>

//       {/* টেক্সট এবং কন্টেক্সট লেয়ার */}
//       <div className="mt-5" style={{ transform: "translateZ(50px)" }}>
//         <h3 className="font-black text-lg text-white tracking-wide truncate transition-colors duration-300" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
//           {game.name}
//         </h3>
        
//         <div className="flex items-center justify-between text-xs my-4 bg-black/60 p-3 rounded-2xl border border-white/5 backdrop-blur-md">
//           <span className="flex items-center gap-1.5 text-slate-400 font-medium">
//             <Users className="w-4 h-4 text-purple-400" /> {game.players} Loopers
//           </span>
//           <span className="flex items-center gap-1 font-black text-yellow-400" style={{ textShadow: "0 0 8px rgba(250,204,21,0.3)" }}>
//             <Coins className="w-4 h-4" /> {game.cost} CORE
//           </span>
//         </div>

//         {/* সাইবার নিয়ন রান বাটন */}
//         <button 
//           onClick={() => onRunGame(game)}
//           style={{ 
//             background: `linear-gradient(135deg, ${game.neonColor} 0%, #0022ff 100%)`,
//             boxShadow: `0 6px 20px ${game.neonColor}50` 
//           }}
//           className="w-full py-3 text-white font-black text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 uppercase tracking-widest transition-all duration-300 active:scale-95 border-t border-white/30"
//         >
//           <Play className="w-4 h-4 fill-white animate-pulse" /> Boot Node
//         </button>
//       </div>
//     </motion.div>
//   );
// }

// // --- মেইন হাইপার-নিয়ন গেম হাব ইঞ্জিন ---
// export default function GameListOnly() {
//   const [userCoins, setUserCoins] = useState(4500);
//   const [selectedGame, setSelectedGame] = useState<any>(null);
//   const [gameStatus, setGameStatus] = useState<"idle" | "booting" | "running">("idle");
//   const [liveScore, setLiveScore] = useState(0);

//   const handleRunGame = (game: any) => {
//     if (userCoins < game.cost) {
//       alert("❌ Insufficient Core Coins! Please clear more sub-layers.");
//       return;
//     }
    
//     setUserCoins(prev => prev - game.cost);
//     setSelectedGame(game);
//     setGameStatus("booting");

//     setTimeout(() => {
//       setGameStatus("running");
//       const interval = setInterval(() => {
//         setLiveScore(prev => prev + Math.floor(Math.random() * 25) + 10);
//       }, 1000);
//       (window as any).gameScoreInterval = interval;
//     }, 3000);
//   };

//   const handleCloseGame = () => {
//     clearInterval((window as any).gameScoreInterval);
//     setGameStatus("idle");
//     setSelectedGame(null);
//     setLiveScore(0);
//   };

//   return (
//     <div className="min-h-screen bg-[#020206] text-white flex flex-col font-sans overflow-x-hidden antialiased [perspective:1200px] relative">
      
//       {/* গ্লোবাল অ্যাম্বিয়েন্ট ব্যাকগ্রাউন্ড নিয়ন গ্লো মেকানিক্স */}
//       <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[150px] pointer-events-none" />
//       <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[150px] pointer-events-none" />

//       {/* ==================== HIGH-GLOW TOP BAR ==================== */}
//       <header className="w-full bg-black/40 backdrop-blur-2xl border-b-2 border-white/5 px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
//         <div className="flex items-center gap-2.5">
//           <div className="relative">
//             <div className="absolute inset-0 bg-cyan-500 rounded-lg blur-md opacity-70 animate-pulse" />
//             <Gamepad2 className="w-8 h-8 text-cyan-400 relative z-10" />
//           </div>
//           <h1 className="text-lg sm:text-xl font-black tracking-widest bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
//             CYBER_CORE MATRIX
//           </h1>
//         </div>

//         {/* GLOWING COIN GRID */}
//         <motion.div 
//           key={userCoins}
//           initial={{ scale: 0.8 }}
//           animate={{ scale: [1.2, 1] }}
//           className="flex items-center gap-2 px-4 py-2 rounded-2xl border border-yellow-400/40 bg-yellow-500/5 backdrop-blur-md shadow-[0_0_20px_rgba(234,179,8,0.2)]"
//         >
//           <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400 animate-bounce" />
//           <span className="font-mono font-black text-sm tracking-widest text-yellow-400">
//             <CountUp end={userCoins} duration={0.6} /> <span className="text-[10px] text-slate-500">R</span>
//           </span>
//         </motion.div>
//       </header>

//       {/* MAIN LAYOUT */}
//       <main className="max-w-6xl w-full mx-auto px-4 py-12 flex-1 flex flex-col justify-center items-center z-10">
        
//         <AnimatePresence mode="wait">
//           {/* 1. IDLE ENGINE INSTRUCTIONS */}
//           {gameStatus === "idle" && (
//             <motion.div 
//               initial={{ opacity: 0, y: 30 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -30 }}
//               className="w-full"
//             >
//               <div className="text-center md:text-left mb-10 border-l-4 border-cyan-400 pl-4">
//                 <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-widest flex items-center gap-2 justify-center md:justify-start" style={{ textShadow: "0 0 15px rgba(0,255,255,0.3)" }}>
//                   Virtual Game Clusters <Sparkles className="w-5 h-5 text-yellow-400" />
//                 </h2>
//                 <p className="text-xs text-slate-400 mt-1 uppercase tracking-wide">Select any sector node to project the 3D grid simulation.</p>
//               </div>

//               {/* Ultra 3D Neon Grid Systems Layout */}
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
//                 {initialGames.map((game) => (
//                   <UltraNeonGameCard 
//                     key={game.id} 
//                     game={game} 
//                     onRunGame={handleRunGame} 
//                   />
//                 ))}
//               </div>
//             </motion.div>
//           )}

//           {/* 2. BOOTING RADAR SYSTEM (Neon Matrix Loading) */}
//           {gameStatus === "booting" && (
//             <motion.div 
//               initial={{ opacity: 0, scale: 0.9, rotateX: -10 }}
//               animate={{ opacity: 1, scale: 1, rotateX: 0 }}
//               exit={{ opacity: 0, scale: 0.95 }}
//               style={{ boxShadow: `0 0 50px ${selectedGame?.neonColor}30`, borderColor: selectedGame?.neonColor }}
//               className="w-full max-w-xl bg-[#020208]/95 border-2 rounded-[2rem] p-8 font-mono text-xs text-slate-300 relative overflow-hidden"
//             >
//               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent animate-pulse" />
              
//               <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5">
//                 <div className="flex items-center gap-2">
//                   <Terminal className="w-4 h-4 animate-spin" style={{ color: selectedGame?.neonColor }} />
//                   <span className="font-bold tracking-wider uppercase text-white">Grid Compiler Terminal</span>
//                 </div>
//                 <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-slate-500">SECURE LINK</span>
//               </div>
              
//               <div className="space-y-3">
//                 <p className="text-slate-500">&gt; Initializing hypervisor sub-routines...</p>
//                 <p style={{ color: selectedGame?.neonColor }}>&gt; Allocating memory addresses for {selectedGame?.name}...</p>
//                 <p className="text-yellow-400">&gt; Transaction complete. Decrypting asset assets (-{selectedGame?.cost} CORE)</p>
//                 <p className="text-green-400 animate-pulse">&gt; Mounting full screen graphics framework successfully.</p>
                
//                 {/* Neon Sync Loading Engine */}
//                 <div className="w-full h-2 bg-black rounded-full overflow-hidden mt-8 border border-white/5 relative">
//                   <motion.div 
//                     initial={{ width: 0 }}
//                     animate={{ width: "100%" }}
//                     transition={{ duration: 2.7, ease: "linear" }}
//                     style={{ backgroundColor: selectedGame?.neonColor, boxShadow: `0 0 15px ${selectedGame?.neonColor}` }}
//                     className="h-full"
//                   />
//                 </div>
                
//                 <p className="text-center text-[10px] text-slate-600 mt-4 animate-pulse uppercase tracking-widest">Spawning secure mainframe... please stand by</p>
//               </div>
//             </motion.div>
//           )}

//           {/* 3. RUNNING PROCESS (Live Neon Full Simulation) */}
//           {gameStatus === "running" && (
//             <motion.div 
//               initial={{ opacity: 0, scale: 0.85, y: 50 }}
//               animate={{ opacity: 1, scale: 1, y: 0 }}
//               exit={{ opacity: 0, scale: 0.9 }}
//               style={{ boxShadow: `0 30px 70px ${selectedGame?.neonColor}25`, borderColor: selectedGame?.neonColor }}
//               className="w-full max-w-3xl bg-[#010105] border-2 rounded-[2.5rem] overflow-hidden relative"
//             >
//               {/* মেইন অ্যাম্বিয়েন্ট গ্লো স্ক্রিন */}
//               <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-60 z-0" />

//               {/* টপ এমুলেটর বার */}
//               <div className="bg-black/80 px-5 py-4 border-b border-white/5 flex items-center justify-between relative z-10">
//                 <div className="flex items-center gap-2.5">
//                   <span className="w-2.5 h-2.5 rounded-full animate-ping" style={{ backgroundColor: selectedGame?.neonColor }} />
//                   <span className="text-xs font-mono font-black uppercase tracking-widest text-white">
//                     LIVE STREAM NODE // {selectedGame?.name}
//                   </span>
//                 </div>
                
//                 <button 
//                   onClick={handleCloseGame}
//                   className="p-1.5 rounded-xl bg-red-500/10 border border-red-500/40 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-200 active:scale-90"
//                 >
//                   <X className="w-4 h-4" />
//                 </button>
//               </div>

//               {/* লাইভ এমুলেটর ডিসপ্লে ফিল্ড */}
//               <div className="p-10 flex flex-col items-center justify-center text-center min-h-[380px] relative z-10">
                
//                 {/* ৩D রোটেটিং গ্লোয়িং ডিস্ক অবজেক্ট */}
//                 <motion.div 
//                   animate={{ scale: [1, 1.05, 1], rotate: 360 }}
//                   transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
//                   style={{ borderColor: selectedGame?.neonColor, boxShadow: `0 0 40px ${selectedGame?.neonColor}50` }}
//                   className="w-32 h-32 rounded-full border-4 border-double flex items-center justify-center p-3 mb-8 bg-black/40 backdrop-blur-md"
//                 >
//                   <Cpu className="w-10 h-10 animate-pulse" style={{ color: selectedGame?.neonColor }} />
//                 </motion.div>

//                 <h2 className="text-3xl font-black text-white uppercase tracking-widest" style={{ textShadow: `0 0 15px ${selectedGame?.neonColor}` }}>
//                   {selectedGame?.name}
//                 </h2>
//                 <p className="text-xs text-slate-400 tracking-wide mt-2 uppercase font-medium">Session Connected // Core Pipeline Active.</p>

//                 {/* নিয়ন রিয়েল-টাইম ড্যাশবোর্ড ডাটা মনিটর */}
//                 <div 
//                   style={{ borderColor: `${selectedGame?.neonColor}50` }}
//                   className="mt-8 grid grid-cols-2 gap-6 w-full max-w-sm bg-black/80 backdrop-blur-xl p-5 rounded-[1.8rem] border shadow-2xl"
//                 >
//                   <div className="text-center border-r border-white/5">
//                     <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 flex items-center justify-center gap-1">
//                       <Trophy className="w-3 h-3 text-yellow-400" /> Score Multiplier
//                     </p>
//                     <p className="text-2xl font-mono font-black text-white mt-1">
//                       <CountUp end={liveScore} preserveValue={true} />
//                     </p>
//                   </div>
//                   <div className="text-center">
//                     <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">Latency</p>
//                     <p className="text-2xl font-mono font-black text-emerald-400 mt-1">2.4 <span className="text-[10px] text-slate-600">MS</span></p>
//                   </div>
//                 </div>

//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>

//       </main>

//       {/* সাইবার ফুটার লেয়ার */}
//       <footer className="w-full py-4 border-t border-white/5 bg-black/40 text-center text-[10px] font-mono text-slate-600 tracking-widest uppercase">
//         Matrix Core Layer Compiled Matrix // Node Engine Grid Final v4.26
//       </footer>

//     </div>
//   );
// }



// "use client";

// import { useState, useRef } from "react";
// import { 
//   Coins, Gamepad2, Play, Trophy, Users, X, Maximize2, Sparkles, Terminal, Cpu
// } from "lucide-react";
// import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
// import CountUp from "react-countup";

// // গেম লিস্ট ডেটাবেজ
// const initialGames = [
//   { id: 1, name: "Cyber Arena 2026", genre: "Action RPG", players: "12.5K", cost: 250, image: "https://picsum.photos/600/400?random=10", bg: "from-purple-900 to-black" },
//   { id: 2, name: "Neon Racer X", genre: "Racing", players: "8.1K", cost: 120, image: "https://picsum.photos/600/400?random=11", bg: "from-cyan-900 to-black" },
//   { id: 3, name: "Shadow Protocol", genre: "Strategy", players: "5.4K", cost: 400, image: "https://picsum.photos/600/400?random=12", bg: "from-emerald-900 to-black" },
//   { id: 4, name: "Matrix Grid", genre: "Puzzle", players: "2.9K", cost: 50, image: "https://picsum.photos/600/400?random=13", bg: "from-pink-900 to-black" },
//   { id: 5, name: "Nexus Breach", genre: "Shooter", players: "18.2K", cost: 300, image: "https://picsum.photos/600/400?random=14", bg: "from-blue-900 to-black" },
//   { id: 6, name: "Glow Tactics", genre: "Card Game", players: "1.5K", cost: 80, image: "https://picsum.photos/600/400?random=15", bg: "from-amber-900 to-black" },
// ];

// // --- ৩D টিল্ট গেম কার্ড কম্পোনেন্ট ---
// function ThreeDGameCard({ game, onRunGame }: any) {
//   const cardRef = useRef<HTMLDivElement>(null);
//   const x = useMotionValue(0);
//   const y = useMotionValue(0);

//   // ৩D এঙ্গেল ক্যালকুলেশন
//   const rotateX = useTransform(y, [-0.5, 0.5], [15, -15]);
//   const rotateY = useTransform(x, [-0.5, 0.5], [-15, 15]);

//   const handleMouseMove = (e: React.MouseEvent) => {
//     if (!cardRef.current) return;
//     const rect = cardRef.current.getBoundingClientRect();
//     x.set((e.clientX - rect.left - rect.width / 2) / rect.width);
//     y.set((e.clientY - rect.top - rect.height / 2) / rect.height);
//   };

//   return (
//     <motion.div
//       ref={cardRef}
//       onMouseMove={handleMouseMove}
//       onMouseLeave={() => { x.set(0); y.set(0); }}
//       style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
//       whileHover={{ translateZ: 25, scale: 1.03 }}
//       transition={{ type: "spring", stiffness: 300, damping: 20 }}
//       className="bg-[#050512]/90 border-2 border-cyan-500/50 rounded-3xl overflow-hidden relative p-4 group
//       shadow-[0_15px_35px_rgba(0,255,255,0.1),inset_0_2px_10px_rgba(0,255,255,0.1)] hover:border-cyan-400"
//     >
//       {/* Game Image Layer */}
//       <div style={{ transform: "translateZ(30px)" }} className="h-44 w-full relative rounded-2xl overflow-hidden border border-cyan-500/30">
//         <img src={game.image} alt={game.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
//         <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
//         <span className="absolute top-3 left-3 bg-black/80 border border-pink-500 text-pink-400 text-[10px] px-2.5 py-0.5 rounded-md font-black tracking-wider uppercase shadow-[0_0_8px_#f0f]">
//           {game.genre}
//         </span>
//       </div>

//       {/* Content Details Layer */}
//       <div className="mt-4" style={{ transform: "translateZ(40px)" }}>
//         <h3 className="font-black text-base sm:text-lg text-white tracking-wide truncate group-hover:text-cyan-300 transition-colors">{game.name}</h3>
        
//         <div className="flex items-center justify-between text-xs text-gray-400 my-3 font-medium bg-black/40 p-2 rounded-xl border border-gray-900">
//           <span className="flex items-center gap-1"><Users className="w-4 h-4 text-purple-400" /> {game.players} Active</span>
//           <span className="flex items-center gap-1 font-bold text-yellow-400"><Coins className="w-4 h-4 text-yellow-400" /> {game.cost} R</span>
//         </div>

//         {/* Run Button */}
//         <button 
//           onClick={() => onRunGame(game)}
//           className="w-full py-2.5 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white font-black text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 border border-cyan-400 uppercase tracking-widest transition-all active:scale-95 shadow-[0_4px_15px_rgba(0,191,255,0.3)] hover:shadow-[0_0_20px_#0ff]"
//         >
//           <Play className="w-4 h-4 fill-white" /> Run Cyber Game
//         </button>
//       </div>
//     </motion.div>
//   );
// }

// // --- মেইন গেম মডিউল অ্যাপ ---
// export default function GameListOnly() {
//   const [userCoins, setUserCoins] = useState(3000);
//   const [selectedGame, setSelectedGame] = useState<any>(null);
//   const [gameStatus, setGameStatus] = useState<"idle" | "booting" | "running">("idle");
//   const [liveScore, setLiveScore] = useState(0);

//   // গেম বুটআপ এবং রান করার মেকানিজম
//   const handleRunGame = (game: any) => {
//     if (userCoins < game.cost) {
//       alert("❌ পর্যাপ্ত কয়েন নেই! গেম রান করতে আরো কয়েন প্রয়োজন।");
//       return;
//     }
    
//     setUserCoins(prev => prev - game.cost);
//     setSelectedGame(game);
//     setGameStatus("booting");

//     // ২ সেকেন্ডের সাইবার বুটআপ রেন্ডারিং প্রসেস
//     setTimeout(() => {
//       setGameStatus("running");
//       // ভার্চুয়াল লাইভ স্কোর ইনক্রিমেন্ট শুরু
//       const interval = setInterval(() => {
//         setLiveScore(prev => prev + Math.floor(Math.random() * 15) + 5);
//       }, 1000);
//       (window as any).gameScoreInterval = interval;
//     }, 2500);
//   };

//   // গেম ক্লোজ করার হ্যান্ডলার
//   const handleCloseGame = () => {
//     clearInterval((window as any).gameScoreInterval);
//     setGameStatus("idle");
//     setSelectedGame(null);
//     setLiveScore(0);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-[#020208] via-[#050515] to-[#010105] text-white flex flex-col font-sans overflow-x-hidden antialiased [perspective:1000px]">
      
//       {/* TOP HEADER */}
//       <header className="w-full bg-black/60 backdrop-blur-xl border-b border-cyan-500/30 px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-[0_5px_25px_rgba(0,255,255,0.05)]">
//         <div className="flex items-center gap-2">
//           <Gamepad2 className="w-7 h-7 text-cyan-400 animate-pulse [filter:drop-shadow(0_0_8px_#0ff)]" />
//           <h1 className="text-xl font-black tracking-widest bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
//             CYBER_CORE ENGINE
//           </h1>
//         </div>

//         {/* TOP COIN CORE */}
//         <motion.div 
//           key={userCoins}
//           initial={{ scale: 0.8 }}
//           animate={{ scale: [1.15, 1] }}
//           className="flex items-center gap-2 px-4 py-1.5 rounded-xl border-2 border-yellow-400 bg-black shadow-[0_0_15px_rgba(255,255,0,0.3)]"
//         >
//           <Coins className="w-4 h-4 text-yellow-400 animate-spin-[slow]" />
//           <span className="font-mono font-black text-sm tracking-wide text-yellow-300">
//             <CountUp end={userCoins} duration={0.5} /> <span className="text-[10px] text-gray-500">R</span>
//           </span>
//         </motion.div>
//       </header>

//       {/* MAIN CONTAINER */}
//       <main className="max-w-6xl w-full mx-auto px-4 py-8 flex-1 flex flex-col justify-center items-center">
        
//         <AnimatePresence mode="wait">
//           {/* 1. IDLE STATUS: GAME ENGINE MAIN LIST GRID */}
//           {gameStatus === "idle" && (
//             <motion.div 
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -20 }}
//               className="w-full"
//             >
//               <div className="text-center md:text-left mb-8 border-l-4 border-cyan-500 pl-4">
//                 <h2 className="text-2xl font-black uppercase tracking-wider flex items-center gap-2 justify-center md:justify-start">
//                   Available Systems <Sparkles className="w-5 h-5 text-yellow-400" />
//                 </h2>
//                 <p className="text-xs text-gray-400 mt-1">গেম সিলেক্ট করে ভার্চুয়াল নোড এনভায়রনমেন্টে রান করুন।</p>
//               </div>

//               {/* Responsive 3D Cards Grid Layout */}
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
//                 {initialGames.map((game) => (
//                   <ThreeDGameCard 
//                     key={game.id} 
//                     game={game} 
//                     onRunGame={handleRunGame} 
//                   />
//                 ))}
//               </div>
//             </motion.div>
//           )}

//           {/* 2. BOOTING STATUS: CYBER PUNK BOOTLOADER ANIMATION */}
//           {gameStatus === "booting" && (
//             <motion.div 
//               initial={{ opacity: 0, scale: 0.95 }}
//               animate={{ opacity: 1, scale: 1 }}
//               exit={{ opacity: 0 }}
//               className="w-full max-w-xl bg-black border-2 border-cyan-500 rounded-3xl p-6 font-mono text-cyan-400 shadow-[0_0_50px_rgba(0,255,255,0.2)]"
//             >
//               <div className="flex items-center gap-2 border-b border-gray-800 pb-3 mb-4">
//                 <Terminal className="w-5 h-5 animate-pulse text-cyan-400" />
//                 <span className="text-sm font-bold tracking-wider">SYSTEM INTERFACES BOOTLOADER v4.0</span>
//               </div>
              
//               <div className="space-y-2 text-xs">
//                 <p className="text-gray-500">[SYSTEM] Initialization Core Node...</p>
//                 <p className="text-purple-400">[CONNECT] Fetching data packets from virtual server...</p>
//                 <p className="text-yellow-400">[COIN] Transaction verified (-{selectedGame?.cost} R Node Coins)</p>
//                 <p className="text-green-400 animate-pulse">[LOAD] Mounting matrix for: {selectedGame?.name}</p>
                
//                 {/* Simulated Progress Loading Bar */}
//                 <div className="w-full h-2 bg-gray-950 rounded-full overflow-hidden mt-6 border border-cyan-500/20">
//                   <motion.div 
//                     initial={{ width: 0 }}
//                     animate={{ width: "100%" }}
//                     transition={{ duration: 2.2, ease: "easeInOut" }}
//                     className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 [box-shadow:0_0_10px_#0ff]"
//                   />
//                 </div>
                
//                 <div className="flex items-center justify-center gap-2 pt-6 text-[10px] text-gray-500">
//                   <Cpu className="w-3.5 h-3.5 animate-spin" /> Processing environment parameters...
//                 </div>
//               </div>
//             </motion.div>
//           )}

//           {/* 3. RUNNING STATUS: EMULATED LIVE GAME AREA */}
//           {gameStatus === "running" && (
//             <motion.div 
//               initial={{ opacity: 0, y: 30, rotateX: 5 }}
//               animate={{ opacity: 1, y: 0, rotateX: 0 }}
//               exit={{ opacity: 0, scale: 0.9 }}
//               className={`w-full max-w-3xl bg-gradient-to-b ${selectedGame?.bg} border-2 border-pink-500 rounded-3xl overflow-hidden shadow-[0_25px_60px_rgba(255,0,255,0.25)]`}
//             >
//               {/* Virtual Monitor Top Frame */}
//               <div className="bg-black/80 px-4 py-3 border-b border-pink-500/40 flex items-center justify-between">
//                 <div className="flex items-center gap-2">
//                   <span className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
//                   <span className="text-xs font-mono font-bold uppercase tracking-widest text-pink-400">
//                     🔴 EMULATOR LIVE: {selectedGame?.name}
//                   </span>
//                 </div>
                
//                 <div className="flex items-center gap-3">
//                   <Maximize2 className="w-4 h-4 text-gray-400 cursor-not-allowed" />
//                   <button 
//                     onClick={handleCloseGame}
//                     className="p-1 rounded-lg bg-red-500/10 border border-red-500 text-red-400 hover:bg-red-500 hover:text-white transition-all active:scale-90 shadow-[0_0_8px_rgba(255,0,0,0.3)]"
//                   >
//                     <X className="w-4 h-4" />
//                   </button>
//                 </div>
//               </div>

//               {/* Simulated Screen Interface */}
//               <div className="p-8 flex flex-col items-center justify-center text-center min-h-[350px] relative">
                
//                 {/* Glowing Core Avatar Object */}
//                 <motion.div 
//                   animate={{ 
//                     scale: [1, 1.08, 1],
//                     rotate: [0, 180, 360]
//                   }}
//                   transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
//                   className="w-28 h-28 rounded-full border-4 border-dashed border-pink-400 flex items-center justify-center p-2 mb-6 shadow-[0_0_30px_#f0f]"
//                 >
//                   <div className="w-full h-full bg-black/60 rounded-full border border-cyan-400 flex items-center justify-center font-mono font-black text-cyan-300">
//                     EXE
//                   </div>
//                 </motion.div>

//                 <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wider [text-shadow:0_4px_10px_rgba(0,0,0,0.5)]">
//                   {selectedGame?.name} Is Running
//                 </h2>
//                 <p className="text-xs text-gray-400 tracking-wide max-w-sm mt-1">ভার্চুয়াল স্যান্ডবক্স এনভায়রনমেন্টে গেম সেশন সাকসেসফুলি কানেক্টেড আছে।</p>

//                 {/* Score Dashboard Display */}
//                 <div className="mt-8 grid grid-cols-2 gap-4 w-full max-w-xs bg-black/70 backdrop-blur-md p-4 rounded-2xl border-2 border-cyan-400/80 [box-shadow:0_4px_15px_rgba(0,255,255,0.15)]">
//                   <div className="text-center border-r border-gray-800">
//                     <p className="text-[10px] uppercase font-bold tracking-widest text-cyan-400 flex items-center justify-center gap-1"><Trophy className="w-3 h-3" /> Live Score</p>
//                     <p className="text-xl font-mono font-black text-white mt-1">
//                       <CountUp end={liveScore} preserveValue={true} />
//                     </p>
//                   </div>
//                   <div className="text-center">
//                     <p className="text-[10px] uppercase font-bold tracking-widest text-purple-400">FPS Rate</p>
//                     <p className="text-xl font-mono font-black text-green-400 mt-1">60.0 <span className="text-[10px] text-gray-500">HZ</span></p>
//                   </div>
//                 </div>

//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>

//       </main>

//       {/* ENGINE CONTAINER BOTTOM FRAME */}
//       <footer className="w-full py-4 border-t border-gray-900 bg-black/40 text-center text-[10px] font-mono text-gray-600 tracking-wider">
//         CORE LAYER ENGINE COMPILING SUCCESSFUL // 2026 MATRIX GRID SYSTEMS INC.
//       </footer>

//     </div>
//   );
// }
