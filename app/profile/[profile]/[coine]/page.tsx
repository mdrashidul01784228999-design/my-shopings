"use client";
import React, { useState, useEffect, useRef } from "react";

interface ClickEffect {
  id: number;
  x: number;
  y: number;
}

export default function HamsterMinePremium() {
  const containerRef = useRef<HTMLDivElement>(null);

  // ১. লোকালস্টোরেজ থেকে কয়েন ও দৈনিক লিমিট লোড করা
  const [coins, setCoins] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("premium_mined_coins");
      return saved ? parseInt(saved) : 0;
    }
    return 0;
  });

  const [energy, setEnergy] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("premium_energy_limit");
      return saved ? parseInt(saved) : 1000; // ডিফল্ট ১০০০ কয়েন লিমিট
    }
    return 1000;
  });

  const [clicks, setClicks] = useState<ClickEffect[]>([]);
  const [tilt, setTilt] = useState({ x: 0, y: 0, scale: 1 });

  // ২. লোকালস্টোরেজে ডাটা অটো-সেভ
  useEffect(() => {
    localStorage.setItem("premium_mined_coins", coins.toString());
    localStorage.setItem("premium_energy_limit", energy.toString());
  }, [coins, energy]);

  // ৩. রিয়েল-টাইম এনার্জি রিফিল (প্রতি সেকেন্ডে ১ এনার্জি বাড়বে)
  useEffect(() => {
    const interval = setInterval(() => {
      setEnergy((prev) => {
        if (prev < 1000) return prev + 1;
        return prev;
      });
    }, 1500); // ১.৫ সেকেন্ড পর পর ১ করে এনার্জি রিফিল হবে
    return () => clearInterval(interval);
  }, []);

  // ৪. এডভান্সড 3D মোশন ও ট্যাপ হ্যান্ডলার
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (energy <= 0) return; // লিমিট শেষ হলে ক্লিক কাজ করবে না

    setCoins((prev) => prev + 1);
    setEnergy((prev) => prev - 1);

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // ৩ডি রোটেশন লজিক (মাউস/হাত যেখানে পড়বে বাটন ওদিকে কাত হবে)
    const midX = rect.width / 2;
    const midY = rect.height / 2;
    const tiltX = -(y - midY) / 5;
    const tiltY = (x - midX) / 5;

    setTilt({ x: tiltX, y: tiltY, scale: 0.92 });

    const newClick = { id: Date.now(), x, y };
    setClicks((prev) => [...prev, newClick]);

    setTimeout(() => {
      setClicks((prev) => prev.filter((click) => click.id !== newClick.id));
    }, 800);
  };

  const handlePointerUp = () => {
    setTilt({ x: 0, y: 0, scale: 1 });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#07080a] text-white p-6 font-sans select-none overflow-hidden relative">
      
      {/* ব্যাকগ্রাউন্ড নিয়ন গ্লো ইফেক্টস */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-cyan-500/10 blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-amber-500/10 blur-[120px] animate-pulse delay-700"></div>

      {/* প্রিমিয়াম টপ গ্লাস-কার্ড */}
      <div className="w-full max-w-sm bg-slate-900/40 border border-cyan-500/20 backdrop-blur-xl rounded-2xl p-4 mb-8 shadow-[0_0_30px_rgba(6,182,212,0.15)] flex justify-between items-center animate-fade-in">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee] animate-ping"></div>
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">Cyber CEO</span>
        </div>
        <div className="text-xs bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-extrabold px-3 py-1 rounded-md shadow-[0_0_15px_rgba(245,158,11,0.4)]">
          💎 MYTHIC
        </div>
      </div>

      {/* মেইন কয়েন ব্যালেন্স কাউন্টার */}
      <div className="flex flex-col items-center mb-8 text-center">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400/80 mb-2">
          CRYPTO BALANCE
        </span>
        <div className="flex items-center gap-3 drop-shadow-[0_0_35px_rgba(234,179,8,0.4)]">
          {/* লোগো মেকার শাইন */}
          <div className="w-14 h-14 rounded-full bg-gradient-to-b from-yellow-300 via-amber-500 to-orange-600 flex items-center justify-center shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),0_0_20px_rgba(245,158,11,0.6)] animate-spin-slow">
            <span className="text-3xl font-black text-slate-950">🪙</span>
          </div>
          <h1 className="text-6xl font-black tracking-tight bg-gradient-to-r from-yellow-200 via-amber-400 to-orange-400 bg-clip-text text-transparent drop-shadow-sm font-mono">
            {coins.toLocaleString()}
          </h1>
        </div>
      </div>

      {/* হ্যামস্টার স্টাইল ৩ডি নিয়ন ট্যাপার সার্কেল */}
      <div className="relative w-full max-w-[280px] aspect-square flex items-center justify-center mb-10">
        
        {/* বর্ডার রোটেটিং লাইট ইফেক্ট */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 via-amber-500 to-purple-500 opacity-40 blur-md animate-spin-slow"></div>

        {/* ৩ডি বাটন বডি */}
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          style={{
            transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${tilt.scale})`,
            transition: "transform 0.1s ease-out",
          }}
          className={`relative w-64 h-64 rounded-full bg-gradient-to-b from-[#181c26] to-[#0c0e14] border-2 ${energy <= 0 ? "border-red-500/40 shadow-[0_0_40px_rgba(239,68,68,0.2)]" : "border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.25)]"} cursor-pointer flex items-center justify-center active:duration-75 select-none touch-none overflow-hidden`}
        >
          {/* গ্লাসমরফিজম রিং */}
          <div className="absolute inset-3 rounded-full bg-gradient-to-tr from-cyan-500/5 via-transparent to-white/5 border border-white/5 pointer-events-none"></div>

          {/* কোরের সাইবার গ্লো */}
          <div className={`absolute w-44 h-44 rounded-full flex items-center justify-center transition-all duration-300 ${energy <= 0 ? "bg-red-500/10 shadow-[0_0_40px_rgba(239,68,68,0.2)]" : "bg-gradient-to-b from-cyan-900/40 to-slate-950 shadow-[0_0_35px_rgba(6,182,212,0.4)] border border-cyan-400/20 group-hover:scale-105"}`}>
            <span className={`text-8xl transition-transform duration-200 ${energy <= 0 ? "grayscale opacity-40" : "animate-bounce-slow"}`}>
              {energy <= 0 ? "🪫" : "🐹"}
            </span>
          </div>

          {/* নিয়ন প্লাস-১ ভাসমান টেক্সট ইফেক্ট */}
          {clicks.map((click) => (
            <span
              key={click.id}
              style={{ top: click.y, left: click.x }}
              className="absolute text-4xl font-black text-cyan-300 pointer-events-none select-none animate-premiumFloat z-50 drop-shadow-[0_0_12px_#06b6d4]"
            >
              +1
            </span>
          ))}
        </div>
      </div>

      {/* দৈনিক লিমিট এবং প্রিমিয়াম এনার্জি বার */}
      <div className="w-full max-w-sm px-4 bg-slate-900/30 border border-white/5 rounded-2xl p-4 backdrop-blur-md">
        <div className="flex justify-between text-xs uppercase tracking-wider font-bold mb-2">
          <div className="flex items-center gap-1.5 text-cyan-400">
            <span>⚡ ENERGY LIMIT (DAILY)</span>
          </div>
          <div className={`${energy < 200 ? "text-red-400 animate-pulse" : "text-white"}`}>
            {energy} / 1000
          </div>
        </div>
        
        {/* গ্লোয়িং প্রগ্রেস বার */}
        <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-white/5 p-[2px]">
          <div 
            style={{ width: `${(energy / 1000) * 100}%` }}
            className={`h-full rounded-full transition-all duration-150 ease-out shadow-[0_0_12px_rgba(6,182,212,0.6)] ${energy <= 0 ? "bg-red-500" : "bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500"}`}
          ></div>
        </div>

        {energy <= 0 && (
          <p className="text-center text-[10px] text-red-400/80 mt-2 font-semibold tracking-wide animate-pulse">
            ⚠️ 1000 Limit reached! Recharging automatically...
          </p>
        )}
      </div>

    </div>
  );
}



