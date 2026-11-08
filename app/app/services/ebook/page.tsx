'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingBag, BookOpen, Star, ChevronRight, Home, Layout, Heart, User } from 'lucide-react';

// Sample Data
const BOOKS = [
  { id: 1, title: "Cyber Odyssey", author: "Md Rashidul", price: 1200, rating: 5, img: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1974&auto=format&fit=crop" },
  { id: 2, title: "Neon Future", author: "Rashidul official", price: 850, rating: 4, img: "https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=1974&auto=format&fit=crop" },
  { id: 3, title: "Digital Soul", author: "Rashidul official", price: 1500, rating: 5, img: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1974&auto=format&fit=crop" },
];

export default function ThreeDShop() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-cyan-500 overflow-x-hidden">
      
      {/* --- TOP NAVBAR --- */}
      <nav className="fixed top-0 left-0 right-0 z-[100] backdrop-blur-xl bg-black/60 border-b border-cyan-500/20 h-16 flex items-center justify-between px-6">
        <div className="text-xl font-black bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent italic">
          MY-SHOPINGS<span className="text-white">.</span>COM
        </div>
        <div className="relative p-2 bg-slate-900 rounded-xl border border-white/10 text-cyan-400">
          <ShoppingBag size={20} />
          <span className="absolute -top-1 -right-1 bg-pink-600 text-[10px] w-4 h-4 rounded-full flex items-center justify-center text-white">3</span>
        </div>
      </nav>

      <main className="pt-24 pb-20 max-w-7xl mx-auto px-4">
        
        {/* --- HERO BANNER --- */}
        <section className="relative h-48 md:h-72 rounded-[2.5rem] overflow-hidden mb-12 border border-white/10 shadow-[0_0_50px_rgba(6,182,212,0.15)] group">
          <img src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2180" className="w-full h-full object-cover transition duration-1000 group-hover:scale-105" alt="Hero" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent flex flex-col justify-center p-8 md:p-12">
            <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-3xl md:text-6xl font-black italic tracking-tighter">
              READ THE <span className="text-cyan-400">FUTURE</span>
            </motion.h1>
            <p className="text-slate-400 text-xs md:text-base mt-2">Md Rashidul official - Digital Library 2026</p>
          </div>
        </section>

        {/* --- BOOK SHELF (3D ROW DESIGN) --- */}
        <div className="flex flex-col gap-6">
          <h2 className="text-sm font-black text-cyan-500 tracking-[0.3em] uppercase flex items-center gap-2">
            <ChevronRight size={18} /> New Arrivals
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
            {BOOKS.map((book) => (
              <motion.div 
                key={book.id}
                whileHover={{ rotateY: -10, rotateX: 5, y: -10 }}
                className="perspective-1000 group relative bg-slate-900/40 rounded-[2rem] border border-white/5 p-4 transition-all duration-500 hover:border-cyan-500/40 shadow-2xl"
              >
                {/* Book Image with 3D Effect */}
                <div className="relative aspect-[3/4] rounded-[1.5rem] overflow-hidden shadow-[20px_20px_60px_rgba(0,0,0,0.5)] transform-style-3d">
                  <img src={book.img} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" alt={book.title} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  {/* Floating Action Badge */}
                  <div className="absolute top-4 right-4 bg-cyan-500 text-black p-2 rounded-xl scale-0 group-hover:scale-100 transition-transform">
                    <Heart size={16} fill="black" />
                  </div>
                </div>

                {/* Details */}
                <div className="mt-6 space-y-2">
                  <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition">{book.title}</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{book.author}</p>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-white/5">
                    <span className="text-2xl font-black text-white">৳{book.price}</span>
                    <button className="bg-cyan-500 text-black px-6 py-2 rounded-xl font-black text-xs hover:bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.4)] transition">
                      BUY NOW
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      {/* --- MOBILE NAVIGATION BAR --- */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-2xl border-t border-cyan-500/20 md:hidden flex items-center justify-around z-[100] px-6">
        {[
          { id: 'home', icon: Home },
          { id: 'grid', icon: Layout },
          { id: 'fav', icon: Heart },
          { id: 'user', icon: User }
        ].map((tab) => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id)}
            className={`p-3 rounded-2xl transition-all duration-300 ${activeTab === tab.id ? 'bg-cyan-500 text-black scale-110 shadow-[0_0_20px_rgba(6,182,212,0.4)]' : 'text-slate-500 hover:text-cyan-400'}`}
          >
            <tab.icon size={20} />
          </button>
        ))}
      </div>

      <style jsx global>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
      `}</style>
    </div>
  );
}