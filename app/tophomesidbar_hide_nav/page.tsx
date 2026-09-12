"use client";

import React, { useState } from 'react';
import { Home, Settings, Layers, FolderOpen, Phone, User, Sparkles } from 'lucide-react';

export default function LuxuryNeonDotSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeItem, setActiveItem] = useState('Home');

  const menuItems = [
    { name: 'Home', icon: <Home size={16} /> },
    { name: 'Services', icon: <Layers size={16} /> },
    { name: 'Projects', icon: <FolderOpen size={16} /> },
    { name: 'Settings', icon: <Settings size={16} /> },
    { name: 'Contact', icon: <Phone size={16} /> },
    { name: 'Profile', icon: <User size={16} /> },
  ];

  const handleItemClick = (name) => {
    setActiveItem(name);
    alert(`🎯 Premium Action: ${name} Selected`);
  };

  return (
    <>
      {/* ব্যাকড্রপ ওভারলে - হালকা সিনেমাটিক ব্লার */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs transition-all duration-500"
        />
      )}

      {/* ম্যাজিকাল নিয়ন টগল ডট (যখন বন্ধ থাকবে) */}
      <button
        onClick={() => setIsOpen(true)}
        onMouseEnter={() => setIsOpen(true)} // মাউস নিলেই ড্রয়ার খুলে যাবে
        className={`fixed top-1/2 left-3 -translate-y-1/2 z-50 flex items-center justify-center cursor-pointer transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)
          ${isOpen ? 'opacity-0 scale-0 pointer-events-none' : 'opacity-100 scale-100'}
        `}
      >
        {/* রানিং গ্লো রিং */}
        <span className="absolute w-6 h-6 rounded-full bg-indigo-500/30 animate-ping" />
        {/* মেইন নিয়ন ডট */}
        <span className="relative w-3 h-3 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-[0_0_20px_#8b5cf6,0_0_10px_#ec4899]" />
      </button>

      {/* মূল সাইডবার - ডট থেকে ওপেন হওয়া লিকুইড ড্রয়ার */}
      <aside 
        onMouseLeave={() => setIsOpen(false)} // মাউস সরালে নিজে নিজেই লক/হাইড হয়ে যাবে
        className={`fixed top-1/2 -translate-y-1/2 z-50 h-[380px] w-14 bg-slate-950/60 backdrop-blur-3xl border border-slate-800/40 rounded-2xl py-5 flex flex-col items-center justify-between transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)
          ${isOpen 
            ? 'left-3 shadow-[0_0_40px_rgba(139,92,246,0.2)] border-purple-500/30' 
            : 'left-[-80px] opacity-0 scale-95 pointer-events-none'
          }
        `}
      >
        {/* টপ গ্লোয়িং ডট লোগো */}
        <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900/40 border border-slate-800 text-indigo-400">
          <Sparkles size={14} className="text-purple-400 drop-shadow-[0_0_5px_rgba(168,85,247,0.6)] animate-pulse" />
        </div>

        {/* নেভিগেশন আইকনসমূহ */}
        <nav className="flex flex-col gap-3 w-full items-center justify-center px-1.5">
          {menuItems.map((item, index) => {
            const isActive = activeItem === item.name;
            return (
              <button
                key={index}
                onClick={() => handleItemClick(item.name)}
                className="relative flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300 group/item active:scale-90 cursor-pointer"
              >
                {/* অ্যাক্টিভ ব্যাকগ্রাউন্ড গ্লো */}
                <div className={`absolute inset-0 rounded-lg transition-all duration-500
                  ${isActive 
                    ? 'bg-gradient-to-tr from-indigo-600/10 via-purple-600/10 to-transparent border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.35)] scale-105' 
                    : 'border border-transparent group-hover/item:bg-slate-900/50 group-hover/item:border-slate-800 group-hover/item:shadow-[0_0_10px_rgba(99,102,241,0.1)]'
                  }
                `} />

                {/* আইকন কালার ও নিয়ন ইফেক্ট */}
                <span className={`relative z-10 transition-all duration-300 group-hover/item:scale-110 group-hover/item:-translate-y-0.5
                  ${isActive 
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.7)]' 
                    : 'text-slate-400 group-hover/item:text-indigo-400'
                  }
                `}>
                  {item.icon}
                </span>

                {/* সাইবারপাংক টুলটিপ */}
                <div className="absolute left-14 opacity-0 scale-75 translate-x-[-15px] group-hover/item:opacity-100 group-hover/item:scale-100 group-hover/item:translate-x-0 transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1) pointer-events-none bg-slate-950/95 text-[11px] font-bold px-2.5 py-1.5 rounded-lg border border-purple-500/20 whitespace-nowrap shadow-[0_0_15px_rgba(168,85,247,0.25)] flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-purple-500 animate-pulse" />
                  <span className="bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text text-transparent">{item.name}</span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* ফুটার প্রিমিয়াম ডট ইন্ডিকেটর */}
        <div className="w-6 h-6 rounded-full bg-slate-900/50 border border-slate-800/80 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-gradient-to-tr from-indigo-400 to-pink-500 shadow-[0_0_6px_rgba(236,72,153,0.5)]" />
        </div>
      </aside>
    </>
  );
}



