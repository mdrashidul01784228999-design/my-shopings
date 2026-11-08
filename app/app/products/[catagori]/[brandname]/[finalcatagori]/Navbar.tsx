'use client';
import { useState, useEffect } from 'react';
import { ShoppingBag, Search, Menu, X, User, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className="fixed w-full z-50 transition-all duration-300">
      {/* 1. TOP NAVBAR (Disappears on scroll) */}
      {!isScrolled && (
        <div className="bg-[#1a1a1a] text-[#d4af37] py-2 px-6 text-center text-xs font-bold tracking-[0.2em] uppercase border-b border-white/5">
          Free Express Shipping on Orders Over ৳15,000
        </div>
      )}

      {/* 2. MAIN FIXED NAVBAR */}
      <div className={`w-full transition-all duration-300 ${isScrolled ? 'bg-black/80 backdrop-blur-lg py-3 shadow-2xl' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          
          {/* Mobile Menu Toggle */}
          <button className="lg:hidden text-white" onClick={() => setMobileMenu(true)}>
            <Menu size={28} />
          </button>

          {/* Logo */}
          <div className="text-2xl font-black tracking-tighter text-white italic">
            VOGUE<span className="text-[#d4af37]">ELITE</span>
          </div>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-10 text-[11px] uppercase tracking-[0.3em] font-bold text-gray-300">
            {['New Arrivals', 'Collections', 'Menswear', 'Womenswear', 'Editorial'].map((item) => (
              <a key={item} href="#" className="hover:text-[#d4af37] transition-colors">{item}</a>
            ))}
          </div>

          {/* Icons */}
          <div className="flex items-center gap-6 text-white">
            <Search size={20} className="hidden sm:block cursor-pointer hover:text-[#d4af37]" />
            <User size={20} className="hidden sm:block cursor-pointer hover:text-[#d4af37]" />
            <div className="relative cursor-pointer group">
              <ShoppingBag size={22} className="group-hover:text-[#d4af37]" />
              <span className="absolute -top-2 -right-2 bg-[#d4af37] text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenu && (
          <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} className="fixed inset-0 bg-black z-[60] p-10">
            <button className="absolute top-6 right-6 text-[#d4af37]" onClick={() => setMobileMenu(false)}><X size={32}/></button>
            <div className="flex flex-col gap-8 mt-20 text-3xl font-bold uppercase tracking-tighter italic">
              <a href="#">New Arrivals</a>
              <a href="#">Collections</a>
              <a href="#">Bestsellers</a>
              <a href="#">Account</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
