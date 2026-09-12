"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, Wallet, User, ChevronDown, Layers, BookOpen, X, Clock, Calendar, Cpu, Info, Settings, History, LogOut, Eye, EyeOff, TrendingUp, DollarSign, Activity, ArrowUpRight, ArrowDownRight, Globe, Radio,
  Award,
  Shield
} from "lucide-react";
import { AreaChart, Area, Bar, ComposedChart, ResponsiveContainer, Tooltip, XAxis, CartesianGrid } from 'recharts';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Api from "../api/Api";

// --- GENERATE CORE INTENSE MARKET DATA ---
const generateChartData = (basePrice: number) => {
  return Array.from({ length: 30 }, (_, i) => {
    const value = basePrice + Math.sin(i * 0.4) * (basePrice * 0.025) + Math.random() * (basePrice * 0.02);
    return {
      time: `${i + 1}d`,
      value: Math.floor(value),
      volume: Math.floor(Math.random() * 600) + 200
    };
  });
};

interface DepositContract {
  id: string;
  asset: string;
  amount: number;
  buyPrice: number;
  duration: string;
  totalDuration: number;
  timeLeft: number;
  status: "ACTIVE" | "MATURED";
}

export default function FullyLoadedTerminal() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isInfoModelOpen, setIsInfoModelOpen] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState<Date | null>(null);

  // --- IDENTITY & BALANCES ---
  const [mainBalance, setMainBalance] = useState<number>(500000); 
  const [totalDeposited, setTotalDeposited] = useState<number>(0); 
  const [netRevenue, setNetRevenue] = useState<number>(0); 
  const [showBalance, setShowBalance] = useState<boolean>(true); 

  // Market & Deposit States
  const [activeTab, setActiveTab] = useState<'BTC' | 'GOLD' | 'OIL'>('BTC');
  const [livePrice, setLivePrice] = useState(64250);
  const [priceChangeDirection, setPriceChangeDirection] = useState<'up' | 'down' | 'neutral'>('neutral');
  const [chartData, setChartData] = useState<any[]>([]);
  const [depositAmount, setDepositAmount] = useState<string>("10000");
  const [selectedDuration, setSelectedDuration] = useState<"1 Month" | "2 Months" | "6 Months">("1 Month");
  const [activeDeposits, setActiveDeposits] = useState<DepositContract[]>([]);

  // 1. DYNAMIC SYSTEM TICKER
  useEffect(() => {
    setCurrentDateTime(new Date());
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);



 const [username, setUsername] = useState("md rashi");
    const [userimglocalstoreage, setuserImgs] = useState("");
    const [userid, setUserid] = useState("0");


  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = JSON.parse(localStorage.getItem('userData') || '[]');
      if (userData[0]) {
        setUsername(userData[0].name || 'set-img');
        setuserImgs(userData[0].img || '');
        setUserid(userData[0].id || '55');
      }
    }
  }, []);








  // 2. QUANTUM MARKET VOLATILITY FEED
  useEffect(() => {
    const interval = setInterval(() => {
      setLivePrice((prev) => {
        const variance = activeTab === 'BTC' ? 140 : activeTab === 'GOLD' ? 9 : 0.9;
        const isUp = Math.random() > 0.48;
        const change = (Math.random() * variance) * (isUp ? 1 : -1);
        setPriceChangeDirection(isUp ? 'up' : 'down');
        return Number((prev + change).toFixed(activeTab === 'OIL' ? 2 : 0));
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [activeTab]);

  // 3. SYNCHRONIZED MATRIX FEED
  useEffect(() => {
    setChartData(generateChartData(livePrice));
  }, [livePrice]);

  // 4. CHRONO BLOCKCHAIN CONTRACT SETTLEMENT
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveDeposits((prevDeposits) => 
        prevDeposits.map((contract) => {
          if (contract.status !== "ACTIVE") return contract;
          
          if (contract.timeLeft > 1) {
            return { ...contract, timeLeft: contract.timeLeft - 1 };
          } else {
            const currentPrice = livePrice;
            const priceDifference = currentPrice - contract.buyPrice;
            const profitPercentage = (priceDifference / contract.buyPrice);
            const netProfit = contract.amount * profitPercentage;
            const totalPayout = contract.amount + netProfit;

            setMainBalance((prev) => prev + Math.floor(totalPayout));
            setTotalDeposited((prev) => Math.max(0, prev - contract.amount));
            setNetRevenue((prev) => prev + Math.floor(netProfit));

            if (priceDifference >= 0) {
              toast.success(`🎉 CONTRACT SETTLED: +৳${Math.floor(netProfit).toLocaleString()} Ledger Safe!`, {
                position: "top-center",
                autoClose: 5000,
                theme: "dark"
              });
            } else {
              toast.error(`📉 CONTRACT SETTLED: ৳${Math.abs(Math.floor(netProfit)).toLocaleString()} Settlement Deficit.`, {
                position: "top-center",
                autoClose: 5000,
                theme: "dark"
              });
            }
            return { ...contract, timeLeft: 0, status: "MATURED" };
          }
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [livePrice]);

  const handleAssetChange = (tab: 'BTC' | 'GOLD' | 'OIL') => {
    setActiveTab(tab);
    const base = tab === 'BTC' ? 64250 : tab === 'GOLD' ? 2350 : 78;
    setLivePrice(base);
    setPriceChangeDirection('neutral');
  };

  const handleLockDeposit = () => {
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.warn("❌ ইনপুট ডেটা যাচাই করুন!", { theme: "dark" });
      return;
    }
    if (amt > mainBalance) {
      toast.error("❌ ওয়ালেটে পর্যাপ্ত ফান্ড অনুপস্থিত!", { theme: "dark" });
      return;
    }

    setMainBalance((prev) => prev - amt);
    setTotalDeposited((prev) => prev + amt);

    const simSeconds = selectedDuration === "1 Month" ? 15 : selectedDuration === "2 Months" ? 30 : 60;
    const newContract: DepositContract = {
      id: Math.random().toString(36).substring(2, 9),
      asset: activeTab,
      amount: amt,
      buyPrice: livePrice,
      duration: selectedDuration,
      totalDuration: simSeconds,
      timeLeft: simSeconds,
      status: "ACTIVE"
    };
    
    setActiveDeposits([newContract, ...activeDeposits]);


    
const apis= Api.post('sharemarketindex', newContract);

console.log('this a depozid post data');
console.log(apis);
console.log(apis);
console.log(apis);




    toast.success(apis+`⚡ ৳${amt.toLocaleString()} সিকিউরড নোডে এনক্রিপ্ট করা হয়েছে!`, { theme: "dark" });
  };

  return (
    <div className="min-h-screen bg-[#010308] text-slate-100 font-sans selection:bg-cyan-500/40 overflow-x-hidden antialiased relative">
      <ToastContainer toastStyle={{ backgroundColor: "#040712", border: "1px solid #111827", borderRadius: "16px" }} />

      {/* HOLOGRAPHIC BACKGROUND GLOWS */}
      <div className="absolute top-[-25%] left-[-15%] w-[800px] h-[800px] bg-gradient-to-br from-cyan-500/8 to-transparent rounded-full blur-[220px] pointer-events-none z-0" />
      <div className="absolute bottom-[-25%] right-[-15%] w-[800px] h-[800px] bg-gradient-to-tr from-fuchsia-500/8 to-transparent rounded-full blur-[220px] pointer-events-none z-0" />

      <style jsx global>{`
        @keyframes marquee { 0% { transform: translateX(0%); } 100% { transform: translateX(-50%); } }
        .animate-marquee-premium { display: flex; width: max-content; animation: marquee 25s linear infinite; }
        .cyber-glass-card { background: linear-gradient(135deg, rgba(6, 11, 25, 0.4) 0%, rgba(3, 7, 18, 0.6) 100%); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.02); }
        .neon-border-cyan:hover { border-color: rgba(6, 182, 212, 0.3); box-shadow: 0 0 30px rgba(6, 182, 212, 0.12); }
        .neon-border-fuchsia:hover { border-color: rgba(217, 70, 239, 0.3); box-shadow: 0 0 30px rgba(217, 70, 239, 0.12); }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #010308; }
        ::-webkit-scrollbar-thumb { background: #111827; border-radius: 99px; }
      `}</style>

      {/* NAVIGATION CONTROLLER */}
      <nav className="border-b border-slate-900 bg-[#010308]/60 backdrop-blur-2xl px-4 md:px-8 py-4.5 sticky top-0 z-50">
        <div className="flex items-center justify-between gap-4 max-w-[1700px] mx-auto relative z-10">
          <div className="flex items-center gap-6">
            <motion.div whileHover={{ scale: 1.01 }} className="flex items-center gap-3 cursor-pointer">
              <div className="w-11 h-11 bg-gradient-to-tr from-cyan-400 via-blue-600 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-md shadow-cyan-500/10">
                <Cpu size={22} className="text-slate-950 stroke-[2.5]" />
              </div>
              <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent uppercase font-mono">
                MATURITY<span className="text-cyan-400 font-light px-0.5">.</span>X6
              </span>
            </motion.div>
          </div>

          {currentDateTime && (
            <div className="hidden lg:flex items-center gap-5 bg-slate-950 border border-slate-900 px-5 py-2.5 rounded-xl font-mono text-xs text-slate-400 shadow-inner">
              <div className="flex items-center gap-2 border-r border-slate-900 pr-4">
                <Calendar size={14} className="text-cyan-400" />
                <span>{currentDateTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-fuchsia-400 animate-pulse" />
                <span className="text-slate-200 font-bold tracking-widest">{currentDateTime.toLocaleTimeString()}</span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button onClick={() => setIsInfoModelOpen(true)} className="flex items-center gap-2 bg-slate-900/40 border border-slate-800 text-slate-300 px-4 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase hover:bg-slate-800 transition-all">
              <Info size={14}/> POLICY_GUIDE
            </button>

            <div className="relative">
           <button 
  onClick={() => setIsProfileOpen(!isProfileOpen)} 
  className={`
    flex items-center gap-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 active:scale-95 p-1.5 md:py-2 md:pr-4 bg-slate-950/95 backdrop-blur-md border 
    ${isProfileOpen 
      ? 'border-fuchsia-500 shadow-[0_0_25px_rgba(240,70,250,0.5),inset_0_0_10px_rgba(240,70,250,0.2)] text-fuchsia-300' 
      : 'border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.35),inset_0_0_8px_rgba(6,182,212,0.1)] hover:border-yellow-400 hover:shadow-[0_0_30px_rgba(234,179,8,0.6)] text-cyan-400 hover:text-yellow-300'
    }
  `}
>
  {/* Cyberpunk RGB Glowing Profile Frame */}
  <div className="relative w-8 h-8 md:w-9 md:h-9 rounded-xl p-[2px] bg-gradient-to-tr from-cyan-400 via-fuchsia-500 to-yellow-400 shadow-[0_0_15px_rgba(6,182,212,0.5)] shrink-0">
    
    {/* Inner Frame Container */}
    <div className="w-full h-full rounded-[10px] overflow-hidden bg-slate-950 relative flex items-center justify-center">
      <img 
        src={
          userimglocalstoreage
            ? `${process.env.NEXT_PUBLIC_IMAGE_URL}/profile_users/${userimglocalstoreage}` 
            : `https://api.dicebear.com/7.x/avataaars/svg?seed=Felix`
        } 
        className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-300" 
        alt="profile" 
      />
      
      {/* Laser Neon Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/20 to-transparent pointer-events-none"></div>
    </div>

    {/* Glowing Online Pulse Status */}
    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-slate-950 rounded-full shadow-[0_0_14px_#34d399,0_0_4px_#34d399] animate-pulse"></span>
  </div>

  {/* Responsive Gamer Tag Text */}
  <span className={`hidden md:inline font-mono tracking-widest transition-all duration-300 ${
    isProfileOpen 
      ? 'drop-shadow-[0_0_10px_rgba(240,70,250,0.8)]' 
      : 'drop-shadow-[0_0_10px_rgba(6,182,212,0.7)] group-hover:drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]'
  }`}>
 {username}
  </span>

  {/* Neon Arrow */}
  <ChevronDown 
    size={14} 
    className={`mr-1 md:mr-0 transition-all duration-300 ${
      isProfileOpen 
        ? 'rotate-180 text-fuchsia-400 drop-shadow-[0_0_8px_#f046fa]' 
        : 'text-cyan-400 drop-shadow-[0_0_8px_#06b6d4]'
    }`} 
  />
</button>

              <AnimatePresence>
                {isProfileOpen && (
                 <motion.div 
  initial={{ opacity: 0, y: 15, scale: 0.95 }} 
  animate={{ opacity: 1, y: 0, scale: 1 }} 
  exit={{ opacity: 0, y: 15, scale: 0.95 }} 
  className="absolute right-0 mt-3 w-72 bg-[#040712]/95 border border-cyan-500/30 rounded-2xl p-3 z-50 backdrop-blur-2xl shadow-[0_15px_50px_rgba(6,182,212,0.3),inset_0_0_20px_rgba(6,182,212,0.15)]"
>
  {/* TOP HEADER: Verified Node Header Status with Neon Glow */}
  <div className="p-3 bg-slate-950/90 border border-cyan-500/20 text-center rounded-xl mb-2.5 relative overflow-hidden shadow-[inset_0_0_15px_rgba(6,182,212,0.1)]">
    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-fuchsia-500/5 to-transparent pointer-events-none"></div>
    
    <div className="flex justify-between items-center mb-1">
      <span className="text-[8px] text-slate-500 font-black tracking-widest uppercase">NODE VERIFIED</span>
      <span className="text-[8px] bg-gradient-to-r from-amber-500 to-yellow-400 text-black px-1.5 py-0.5 rounded font-black tracking-wider uppercase animate-pulse">
        TIER 1 PILOT
      </span>
    </div>
    <p className="text-xs font-mono font-black text-cyan-400 text-left mt-1 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]">
  {username}
    </p>
  </div>

  {/* NEW: GAME CORE STATS SECTION */}
  <div className="grid grid-cols-2 gap-1.5 mb-2.5 px-1">
    <div className="bg-slate-950/60 border border-slate-900 rounded-lg p-2 text-center">
      <span className="block text-[8px] text-slate-500 font-bold uppercase">Coin Booster</span>
      <span className="text-[10px] font-mono font-black text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.4)]">1.5X ACTIVE</span>
    </div>
    <div className="bg-slate-950/60 border border-slate-900 rounded-lg p-2 text-center">
      <span className="block text-[8px] text-slate-500 font-bold uppercase">Server Ping</span>
      <span className="text-[10px] font-mono font-black text-cyan-400 drop-shadow-[0_0_5px_rgba(6,182,212,0.4)]">18 ms</span>
    </div>
  </div>

  {/* BUTTON 1: System Settings */}
  <button className="group/item w-full flex items-center justify-between px-3.5 py-2.5 text-[11px] font-bold text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-xl transition-all duration-300 border border-transparent hover:border-cyan-500/20">
    <span className="group-hover/item:translate-x-1 transition-transform duration-300 flex items-center gap-2">
      <Settings size={13} className="text-slate-500 group-hover/item:text-cyan-400 group-hover/item:rotate-45 transition-all duration-300" />
      System Settings
    </span>
    <span className="text-[8px] font-mono text-slate-600 group-hover/item:text-cyan-500/60">SYS_V2</span>
  </button>

  {/* BUTTON 2: Ledger History */}
  <button className="group/item w-full flex items-center justify-between px-3.5 py-2.5 text-[11px] font-bold text-slate-400 hover:text-fuchsia-400 hover:bg-fuchsia-500/10 rounded-xl transition-all duration-300 border border-transparent hover:border-fuchsia-500/20 mt-0.5">
    <span className="group-hover/item:translate-x-1 transition-transform duration-300 flex items-center gap-2">
      <History size={13} className="text-slate-500 group-hover/item:text-fuchsia-400 transition-all duration-300" />
      Ledger History
    </span>
    <span className="text-[8px] font-mono text-slate-600 group-hover/item:text-fuchsia-500/60">LOGS</span>
  </button>

  {/* NEW UPGRADE BUTTON 3: Claim Daily Rewards */}
  <button className="group/item w-full flex items-center justify-between px-3.5 py-2.5 text-[11px] font-bold text-slate-400 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-xl transition-all duration-300 border border-transparent hover:border-yellow-500/20 mt-0.5">
    <span className="group-hover/item:translate-x-1 transition-transform duration-300 flex items-center gap-2">
      <Award size={13} className="text-slate-500 group-hover/item:text-yellow-400 transition-all duration-300 animate-bounce" />
      Daily Rewards
      
    </span>
    <span className="text-[8px] bg-yellow-500/20 text-yellow-400 px-1 rounded font-black uppercase animate-pulse">READY</span>
  </button>

  {/* NEW UPGRADE BUTTON 4: Achievements & Badges */}
  <button className="group/item w-full flex items-center justify-between px-3.5 py-2.5 text-[11px] font-bold text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-all duration-300 border border-transparent hover:border-indigo-500/20 mt-0.5">
    <span className="group-hover/item:translate-x-1 transition-transform duration-300 flex items-center gap-2">
      <Shield size={13} className="text-slate-500 group-hover/item:text-indigo-400 transition-all duration-300" />
      Fleet Badges
    </span>
    <span className="text-[8px] font-mono text-indigo-400/80">3 / 12</span>
  </button>

  {/* BOTTOM SECTION: Disconnect / Logout */}
  <div className="border-t border-slate-900/80 mt-2.5 pt-2.5">
    <button className="w-full flex items-center gap-2.5 justify-center py-2.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-rose-500 hover:text-white hover:shadow-[0_0_20px_rgba(244,63,94,0.45)] transition-all duration-300 active:scale-95">
      <LogOut size={12} className="animate-pulse" /> 
      Disconnect Node
    </button>
  </div>
</motion.div>

                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </nav>

      {/* RUNNING TICKER STREAM */}
      <div className="bg-slate-950/20 border-b border-slate-900/70 py-3 overflow-hidden w-full relative z-10">
        <div className="animate-marquee-premium flex gap-20 items-center">
          {Array.from({ length: 4 }).map((_, outerIdx) => (
            <div key={outerIdx} className="flex gap-20 text-[10px] font-black tracking-widest font-mono">
              <span className="text-cyan-400 flex items-center gap-2">● BTC/BDT: <span className="text-white">৳{activeTab === 'BTC' ? livePrice.toLocaleString() : '64,250'}</span></span>
              <span className="text-fuchsia-400 flex items-center gap-2">● GOLD/BDT: <span className="text-white">৳{activeTab === 'GOLD' ? livePrice.toLocaleString() : '2,350'}</span></span>
              <span className="text-emerald-400 flex items-center gap-2">● OIL/BDT: <span className="text-white">৳{activeTab === 'OIL' ? livePrice.toLocaleString() : '78.20'}</span></span>
              <span className="text-slate-600">ENCRYPTION PROTOCOL SHIELD: ACTIVE</span>
            </div>
          ))}
        </div>
      </div>

      {/* CORE FRAME LAYOUT */}
      <main className="p-4 md:p-8 max-w-[1700px] mx-auto grid grid-cols-12 gap-6 relative z-10">
        
        {/* LEFT COMPONENT LAYER */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          
          {/* HOLOGRAPHIC METRICS HEADER GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* CARD 1 */}
            <div className="cyber-glass-card rounded-2xl p-5 flex items-center justify-between shadow-xl border border-slate-900/60 neon-border-cyan transition-all duration-300">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <Wallet size={13} className="text-cyan-400" /> ওয়ালেট স্টোরেজ
                </p>
                <h2 className="text-2xl font-black text-white font-mono mt-1.5 tracking-tight">
                  {showBalance ? `৳${mainBalance.toLocaleString()}` : "•••••••••"}
                </h2>
              </div>
              <button onClick={() => setShowBalance(!showBalance)} className="p-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl text-slate-500 hover:text-cyan-400 transition-all shadow-inner">
                {showBalance ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {/* CARD 2 */}
            <div className="cyber-glass-card rounded-2xl p-5 flex items-center justify-between shadow-xl border border-slate-900/60 neon-border-fuchsia transition-all duration-300">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <Layers size={13} className="text-fuchsia-400" /> লকড ডিপোজিট
                </p>
                <h2 className="text-2xl font-black text-fuchsia-400 font-mono mt-1.5 tracking-tight">
                  {showBalance ? `৳${totalDeposited.toLocaleString()}` : "•••••••••"}
                </h2>
              </div>
              <div className="p-2 bg-fuchsia-500/5 border border-fuchsia-500/10 rounded-xl text-fuchsia-400 shadow-inner">
                <TrendingUp size={15} />
              </div>
            </div>

            {/* CARD 3 */}
            <div className="cyber-glass-card rounded-2xl p-5 flex items-center justify-between shadow-xl border border-slate-900/60 hover:border-emerald-500/20 transition-all duration-300">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <DollarSign size={13} className={netRevenue >= 0 ? "text-emerald-400" : "text-rose-400"} /> নেট রেভিনিউ অর্জিত
                </p>
                <h2 className={`text-2xl font-black font-mono mt-1.5 tracking-tight ${netRevenue >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {showBalance ? `${netRevenue >= 0 ? "+" : ""}৳${netRevenue.toLocaleString()}` : "•••••••••"}
                </h2>
              </div>
              <div className={`p-2 rounded-xl border ${netRevenue >= 0 ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-400" : "bg-rose-500/5 border-rose-500/10 text-rose-400"}`}>
                <Activity size={15} />
              </div>
            </div>
          </div>

          {/* MAIN GRAPH CHANNELS BOX */}
          <div className="cyber-glass-card border border-slate-900/80 rounded-[2.5rem] p-6 md:p-8 overflow-hidden relative shadow-2xl transition-all duration-500 neon-border-cyan">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div className="flex bg-slate-950 border border-slate-900 p-1 rounded-xl gap-1.5">
                {(['BTC', 'GOLD', 'OIL'] as const).map((tab) => (
                  <button key={tab} onClick={() => handleAssetChange(tab)} className={`px-5 py-2 text-[10px] font-black rounded-lg transition-all tracking-widest ${activeTab === tab ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/10' : 'text-slate-500 hover:text-slate-400'}`}>
                    {tab} FEED
                  </button>
                ))}
              </div>
              <span className="px-3 py-1.5 bg-cyan-500/5 border border-cyan-500/10 text-cyan-400 rounded-xl text-[9px] font-black tracking-widest flex items-center gap-2 shadow-inner">
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"/> DISTRIBUTED FEED MATRIX
              </span>
            </div>

            {/* HIGH TECH FUSION CHART */}
            <div className="h-[310px] md:h-[370px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="glowCyan" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#070b14" vertical={false} />
                  <XAxis dataKey="time" hide />
                  <Tooltip contentStyle={{ backgroundColor: '#030611', borderColor: '#111827', borderRadius: '14px', fontSize: '11px', color: '#fff', fontFamily: 'monospace' }} />
                  <Area type="monotone" dataKey="value" strokeWidth={3} stroke="#06b6d4" fillOpacity={1} fill="url(#glowCyan)" />
                  <Bar dataKey="volume" barSize={5} fill="#111827" radius={[2, 2, 0, 0]} opacity={0.6} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ACTIVE LEDGERS MONITOR */}
          <div className="cyber-glass-card border border-slate-900/80 p-6 rounded-[2.5rem] shadow-xl">
            <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-5 flex items-center gap-2 font-mono">
              <Layers size={14} className="text-fuchsia-400"/> // CRYPTO_LEDGER_MONITOR_CHANNELS
            </h4>
            
            {activeDeposits.length === 0 ? (
              <p className="text-xs text-slate-600 font-mono italic py-8 text-center tracking-wider">NO LIVE MATURITY NODE ATTACHED TO THIS FRAME.</p>
            ) : (
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                {activeDeposits.map((item) => {
                  const completionPercentage = ((item.totalDuration - item.timeLeft) / item.totalDuration) * 100;

                  return (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={item.id} className="bg-slate-950/60 border border-slate-900 rounded-2xl p-5 flex flex-col gap-3.5 hover:border-slate-800 transition-all shadow-sm">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <div className="flex items-center gap-2.5">
                            <span className="text-xs font-black tracking-widest text-slate-200 font-mono">{item.asset}_LEDGER_NODE</span>
                            <span className={`text-[9px] px-2 py-0.5 rounded-md font-black tracking-widest ${item.status === "ACTIVE" ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/10' : 'bg-slate-900 text-slate-500'}`}>{item.status}</span>
                          </div>
                          <div className="flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-slate-400 font-medium mt-2 font-mono">
                            <p>লক ক্যাপিটাল: <span className="text-cyan-400 font-bold">৳{item.amount.toLocaleString()}</span></p>
                            <p>লক বেস প্রাইস: <span className="text-slate-300">৳{item.buyPrice.toLocaleString()}</span></p>
                            <p>টার্ম ম্যাচিউরিটি: <span className="text-fuchsia-400 font-black">{item.duration}</span></p>
                          </div>
                        </div>

                        <div className="text-right w-full md:w-auto border-t md:border-t-0 border-slate-900 pt-2 md:pt-0 font-mono">
                          {item.status === "ACTIVE" ? (
                            <div>
                              <p className="text-[9px] text-slate-600 uppercase tracking-widest">কাউন্টডাউন মেচুরিটি</p>
                              <p className="text-xs font-black text-fuchsia-400 animate-pulse tracking-wide">{item.timeLeft}S REMAINING</p>
                            </div>
                          ) : (
                            <div>
                              <p className="text-[9px] text-slate-600 uppercase tracking-widest">সেটেলমেন্ট নোটিফিকেশন</p>
                              <p className={`text-xs font-black tracking-wider ${livePrice >= item.buyPrice ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {livePrice >= item.buyPrice ? "✓ NODE_SETTLED_PROFIT" : "✗ NODE_SETTLED_LOSS"}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* ULTRA DYNAMIC PROGRESS STATUS BAR */}
                      {item.status === "ACTIVE" && (
                        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden p-[1px]">
                          <motion.div 
                            className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500" 
                            style={{ width: `${completionPercentage}%` }}
                            transition={{ ease: "linear" }}
                          />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL COMPOSER */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          
          {/* CONTROL CORE PANEL */}
          <div className="cyber-glass-card border border-slate-900 rounded-[2.5rem] p-6 md:p-8 shadow-2xl transition-all duration-500 neon-border-fuchsia">
            <h3 className="text-xs font-black uppercase text-slate-500 tracking-widest mb-6 font-mono">// OPERATION_LEDGER_PANEL</h3>
            <div className="flex items-end gap-2.5 mb-6">
              <span className="text-4xl font-black text-white tracking-tighter font-mono">৳{livePrice.toLocaleString()}</span>
              <span className="text-fuchsia-400 text-[10px] font-black bg-fuchsia-500/5 border border-fuchsia-500/10 px-2.5 py-1 rounded-md mb-1.5 font-mono tracking-widest">LIVE_FEED</span>
            </div>

            <div className="mb-4">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2 font-mono">ডিপোজিট পরিমাণ (BDT)</label>
              <input type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-3.5 text-sm text-white font-mono focus:outline-none focus:border-fuchsia-500/30 transition-colors shadow-inner" placeholder="0.00 BDT" />
            </div>

            <div className="mb-6">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2 font-mono">সেটেলমেন্ট মেয়াদ নির্ধারণ করুন</label>
              <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1 border border-slate-900 rounded-xl">
                {(["1 Month", "2 Months", "6 Months"] as const).map((dur) => (
                  <button key={dur} onClick={() => setSelectedDuration(dur)} className={`py-2.5 text-[10px] font-black uppercase rounded-lg transition-all tracking-wider ${selectedDuration === dur ? 'bg-slate-900 text-cyan-400 border border-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-400'}`}>
                    {dur === "1 Month" ? "১ মাস" : dur === "2 Months" ? "২ মাস" : "৬ মাস"}
                  </button>
                ))}
              </div>
            </div>
            
            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={handleLockDeposit} className="w-full py-4 bg-gradient-to-r from-cyan-500 via-blue-600 to-fuchsia-600 text-white font-black text-[11px] uppercase tracking-widest rounded-xl transition-all shadow-xl flex items-center justify-center gap-2 shadow-fuchsia-600/5">
              <Wallet size={16}/> ফান্ড লক ও ডিপোজিট করুন
            </motion.button>
          </div>

          {/* DYNAMIC TREND INTELLIGENCE CARDS */}
          <div className="cyber-glass-card border border-slate-900/60 p-5 rounded-[2rem] shadow-xl">
            <h5 className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-3.5 font-mono flex items-center gap-2">
              <Globe size={12} className="text-cyan-400" /> SYSTEM_STREAM_FEED_STATUS
            </h5>
            <div className="space-y-2 text-[11px] font-mono">
              <div className="flex justify-between p-2 bg-slate-950/50 border border-slate-900 rounded-lg">
                <span className="text-slate-500">SPREAD_RATIO</span>
                <span className="text-cyan-400 font-bold">0.025% FIXED</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-950/50 border border-slate-900 rounded-lg">
                <span className="text-slate-500">NODE_LATENCY</span>
                <span className="text-emerald-400 font-bold">12ms STABLE</span>
              </div>
            </div>
          </div>

          {/* SECURITY CARD NOTE */}
          <div className="cyber-glass-card border border-slate-900 p-6 rounded-[2rem] shadow-xl">
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-slate-950 border border-slate-900 rounded-xl text-fuchsia-400 shadow-inner"><ShieldCheck size={20} /></div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-200 tracking-widest font-mono">PROTOCOL_SAFETY_MECHANISM</p>
                <p className="text-[11px] text-slate-500 font-medium mt-1.5 leading-relaxed">মেয়াদের মাঝের দিনগুলোতে পণ্যমূল্যের যেকোনো অস্থায়ী পরিবর্তন সম্পূর্ণ অগ্রাহ্য করা হবে। শুধুমাত্র আপনার নির্বাচিত মেয়াদ পূর্তির নির্দিষ্ট দিনে যে দাম থাকবে তার ওপর চূড়ান্ত প্রফিট ডিস্ট্রিবিউট হবে।</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* COMPONENT INFORMATION DIALOG */}
      <AnimatePresence>
        {isInfoModelOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsInfoModelOpen(false)} className="absolute inset-0 bg-black/85 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-[#040712] border border-slate-900 w-full max-w-xl rounded-[2.5rem] p-8 relative z-10 shadow-2xl max-h-[85vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-slate-900 pb-4 mb-6">
                <div className="flex items-center gap-2.5 text-emerald-400">
                  <BookOpen size={22}/>
                  <h3 className="text-lg font-black tracking-tight uppercase font-mono">CRITICAL MATRIX OPERATIONS</h3>
                </div>
                <button onClick={() => setIsInfoModelOpen(false)} className="text-slate-500 hover:text-white transition-colors"><X size={18}/></button>
              </div>
              <div className="space-y-4 text-xs text-slate-400 leading-relaxed font-sans">
                <p className="bg-slate-950 border border-slate-900 p-4 rounded-xl">📍 **মধ্যবর্তী ওঠানামা অগ্রাহ্যকরণ:** আপনি ১ মাস, ২ মাস বা ৬ মাসের জন্য পণ্যমূল্যে যে ফান্ডটি জমা রাখছেন, মাঝখানের দিনগুলোতে দাম অনেক নিচে নেমে গেলেও আপনার লস হবে না, আবার অনেক বাড়লেও লাভ বা লোকসান লক হবে না।</p>
                <p className="bg-slate-950 border border-slate-900 p-4 rounded-xl">📍 **Maturity Day Execution:** ঠিক যেই দিন আপনার চুক্তির মেয়াদ পূর্ণ হবে, সেই নির্দিষ্ট দিনের লাইভক্লোজিং প্রাইসের ওপর চুক্তি সেটেল হবে।</p>
              </div>
              <button onClick={() => setIsInfoModelOpen(false)} className="w-full mt-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-cyan-500/10">টার্মিনাল মোড চালু করুন</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

