"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useRouter } from "next/navigation";
import Homepages from './Home';
import Footers from './footers/page';
import PremiumSlider from "./Slider_img/page";


import {
  ShoppingBag, Sun, Moon, Search, 
  LogIn, LogOut, User, Coins, 
  AlertTriangle, Smartphone, X
} from "lucide-react";

import {
  AreaChart, Area, Tooltip, ResponsiveContainer,
} from "recharts";
import Image from "next/image";
import CountUp from "react-countup";
import { FaFacebook } from "react-icons/fa";

// টাইপ ডেফিনিশন সমূহ
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

// fadeUp ফাংশনের জন্য প্রপার টাইপস্ক্রিপ্ট রিটার্ন
const fadeUp = (delay: number = 0): Variants => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, delay } },
});

// cn ফাংশনটি টাইপ সেফ করা হলো (যা আপনার মেইন বিল্ড এরর ফিক্স করবে)
function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export default function HomeShowcasePage() {
  const router = useRouter(); 
  const [coins, setCoins] = useState<number>(0);
  const [dark, setDark] = useState<boolean>(true);
  const [q, setQ] = useState<string>("");
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);
  const [names, setNames] = useState<string | null>(null);
  const [images, setImages] = useState<string>('');
  
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [searchedValue, setSearchedValue] = useState<string>(" ");

  // লোকাল স্টোরেজ থেকে ডার্ক মোডের প্রিফারেন্স ডিটেক্ট এবং সিনক্রোনাইজেশন
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
    const userData = JSON.parse(localStorage.getItem('userData') || '[]');
    if (userData[0]) {
      setNames(userData[0].name || 'test-name');
      setImages(userData[0].img || '');
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
    if (id === 'Login') router.push('/Login');
    else if (id === 'profile') router.push('/profile');
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
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-slate-100 transition-colors duration-500">
      
      {/* --- PREMIUM TOPBAR --- */}
      <nav className="sticky top-0 z-50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <motion.div 
              whileHover={{ rotate: 12, scale: 1.1 }}
              className="relative p-1 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-400 shadow-lg shadow-blue-500/20"
            >
              <Image src="/favicon.png" alt="logo" width={38} height={38} className="rounded-lg bg-white p-0.5" />
            </motion.div>
            <div className="flex flex-col">
              <span className="font-black text-xl tracking-tighter bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent uppercase">
                MyShops
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:block">Official</span>
            </div>
          </div>

          {/* Centered Search */}
          <form onSubmit={triggerSearch} className="hidden lg:flex flex-1 max-w-md mx-12 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              className="w-full bg-slate-100 dark:bg-slate-800/50 border-none rounded-2xl py-2.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-blue-500/50 transition-all outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 dark:text-white text-slate-900"
              placeholder="পণ্য বা অ্যাপ খুঁজুন..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Real-time Coins */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 shadow-sm cursor-help"
            >
              <Coins className="w-4 h-4 text-amber-500 animate-bounce" />
              <span className="font-black text-amber-600 dark:text-amber-400 text-sm">
                <CountUp end={coins} duration={1} separator="," /> R
              </span>
            </motion.div>

            {/* Utility Icons */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-2xl p-1 gap-1">
              <button onClick={() => router.push('/test')} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all text-blue-600">
                <FaFacebook size={18} />
              </button>
              <button onClick={() => setDark(!dark)} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all text-slate-500 flex items-center justify-center">
                {dark ? <Sun size={18} className="text-yellow-500" /> : <Moon size={18} className="text-slate-400" />}
              </button>
            </div>

            {/* Profile Circle */}
            <div className="relative group ml-1">
              <motion.div 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-700 shadow-md cursor-pointer overflow-hidden relative"
              >
            <img 
  src={
    images 
      ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/profile_users/${images}` 
      : `https://api.dicebear.com/7.x/avataaars/svg?seed=Felix`
  } 
  alt="avatar" 
  className="w-full h-full object-cover" 
/>
              </motion.div>
              
              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-900 rounded-[24px] shadow-2xl border border-slate-100 dark:border-slate-800 p-2 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b dark:border-slate-800">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Account</p>
                       <p className="font-bold truncate text-sm text-slate-900 dark:text-white">{names || 'Welcome, Guest'}</p>
                    </div>
                    <div className="p-1 space-y-1">
                      <button onClick={()=>hander_redires('profile')} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
                        <User size={16} /> প্রোফাইল
                      </button>
                      {names ? (
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors">
                          <LogOut size={16} /> লগ আউট
                        </button>
                      ) : (
                        <button onClick={()=>hander_redires('Login')} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
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
      </nav>

      {/* --- HERO & MARKET DASHBOARD --- */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Text / Slider */}
          <div className="lg:col-span-7 space-y-8">
            <motion.div initial="initial" animate="animate" variants={fadeUp(0)}>
              <PremiumSlider />
            </motion.div>

            {/* CTA / Search Box */}
            <motion.div initial="initial" animate="animate" variants={fadeUp(0.2)} className="flex flex-col sm:flex-row gap-4">
              <form onSubmit={triggerSearch} className="relative flex-1 group">
                 <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                 <div className="relative bg-white dark:bg-slate-800 rounded-2xl flex items-center px-4 py-3 shadow-xl border border-slate-100 dark:border-slate-700">
                   <Smartphone className="text-slate-400 mr-3" size={20} />
                   <input 
                    className="bg-transparent border-none outline-none w-full text-sm font-medium dark:text-white text-slate-900 placeholder:text-slate-400 dark:placeholder:text-slate-500" 
                    placeholder="আইডি বা মোবাইল নাম্বার দিন..."
                    value={q}
                    onChange={(e)=>setQ(e.target.value)}
                   />
                   <button type="submit" className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 cursor-pointer">
                     <Search size={18} />
                   </button>
                 </div>
              </form>
            </motion.div>
          </div>

          {/* Right Dashboard Card */}
          <motion.div initial="initial" animate="animate" variants={fadeUp(0.3)} className="lg:col-span-5">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-[34px] blur opacity-10 group-hover:opacity-20 transition-opacity"></div>
              <div className="relative bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800">
                
                {/* Notice Alert */}
                <div className="bg-rose-500/10 dark:bg-rose-500/20 px-6 py-4 flex items-center gap-4">
                   <div className="p-2 bg-rose-500 rounded-lg text-white animate-pulse">
                     <AlertTriangle size={20} />
                   </div>
                   <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400 leading-tight">
                     বিজ্ঞপ্তি: এই কয়েন কেবলমাত্র নিবন্ধিত মালিককে পাঠাবেন। অন্যথায় একাউন্ট বাতিল হতে পারে।
                   </p>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-black text-sm uppercase tracking-widest text-slate-400 flex items-center gap-2">
                       Market Charts
                    </h3>
                    <div className="flex gap-1">
                      {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700"></div>)}
                    </div>
                  </div>

                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={marketData}>
                        <defs>
                          <linearGradient id="colorPr" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={3} fill="url(#colorPr)" />
                        <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-6">
                    {tickers.map((t) => (
                      <motion.div
                        key={t.symbol}
                        whileHover={{ y: -5 }}
                        className={cn(
                          "rounded-2xl p-3 border transition-all duration-300",
                          t.change >= 0 
                            ? "bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-950/30 text-slate-900 dark:text-emerald-400" 
                            : "bg-rose-50/50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-950/30 text-slate-900 dark:text-rose-400"
                        )}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-black text-xs text-slate-500 dark:text-slate-400">{t.symbol}</span>
                          <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-md", t.change >= 0 ? "bg-emerald-500 text-white" : "bg-rose-500 text-white")}>
                            {t.change}%
                          </span>
                        </div>
                        <div className="font-black text-slate-800 dark:text-slate-100">৳{t.price.toFixed(2)}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- PRODUCT CONTENT --- */}
      <div className="bg-white/50 dark:bg-slate-900/30 py-10">
        <Homepages />
      </div>

      <Footers />

      {/* --- PRODUCT SEARCH MODAL --- */}
      <AnimatePresence>
        {isSearchModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSearchModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-md overflow-hidden rounded-[32px] bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-100 dark:border-slate-800"
            >
              <button
                onClick={() => setIsSearchModalOpen(false)}
                className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="mt-2 flex flex-col items-center text-center">
                <div className="mb-4 rounded-2xl bg-blue-50 p-3 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                  <ShoppingBag size={28} />
                </div>
                
                <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  প্রোডাক্ট অনুসন্ধানের ফলাফল
                </h3>
                <p className="mt-1 text-xs text-slate-400 font-medium uppercase tracking-wider">
                  Searched Criteria / Product Value
                </p>

                <div className="mt-4 w-full rounded-2xl bg-slate-50 border border-slate-100 p-4 dark:bg-slate-800/50 dark:border-slate-800 break-all">
                  <span className="text-xl font-extrabold text-blue-600 dark:text-blue-400">
                    "{searchedValue}"
                  </span>
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
                  <button
                    onClick={() => setIsSearchModalOpen(false)}
                    className="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    বিস্তারিত দেখুন
                  </button>
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
