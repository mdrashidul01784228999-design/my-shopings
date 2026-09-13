"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { 
  Clock, Menu, User, 
  Moon, Sun, Bell, Zap, ChevronRight, X, 
  Settings, LogOut, Bookmark, Facebook, Youtube, Share2,
  Globe, PlayCircle, Eye, Flame, Newspaper, Radio, ArrowUpRight,
  MapPin, Calendar, Camera, Trophy
} from "lucide-react";
import Api from "../../api/Api";

const CATEGORIES = ["জাতীয়", "আন্তর্জাতিক", "খেলা", "প্রযুক্তি", "অর্থনীতি", "স্বাস্থ্য", "বিজ্ঞান"];

// ================= TYPESCRIPT INTERFACES =================
// Vercel Build Error এড়ানোর জন্য এই টাইপগুলো যুক্ত করা হয়েছে
interface NewsItem {
  id?: string | number;
  name?: string;
  title?: string;
  view?: string | number;
  [key: string]: any; // API থেকে আসা অন্যান্য ডাটার জন্য
}
// =========================================================

export default function RashidulMegaPortal() {
  const [mounted, setMounted] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  
  // Sidebar & Profile States
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  const [lodings, setLoading] = useState<boolean>(true);
  const [alldatanews, setData] = useState<NewsItem[]>([]);

  const [username, setUsername] = useState<string>("set-img");
  const [userimglocalstoreage, setuserImgs] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Api.get('/peparindex');
        const responseData = response.data?.data;
        
        // Array কিনা চেক করে ডাটা সেট করা হচ্ছে (Type Safety)
        setData(Array.isArray(responseData) ? responseData : (responseData ? [responseData] : [])); 
        console.log('Data set successfully:', responseData);
      } catch (err) {
        console.error('API Error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();

    // প্রতি ৩০ সেকেন্ড পরপর ডাটা রিফ্রেশ
    const interval = setInterval(() => {
      fetchData();
    }, 30000); 

    // কম্পোনেন্ট আনমাউন্ট হলে টাইমার পরিষ্কার করুন
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = JSON.parse(localStorage.getItem('userData') || '[]');
      if (userData[0]) {
        setUsername(userData[0].name || 'set-img');
        setuserImgs(userData[0].img || '');
      }
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const handleScroll = () => {
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setScrollProgress((window.scrollY / height) * 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      clearInterval(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  if (!mounted) return null;

  const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = currentTime.toLocaleDateString('bn-BD', options);
  const formattedTime = currentTime.toLocaleTimeString('bn-BD');

  return (
    <div className={`min-h-screen transition-all duration-700 ${darkMode ? "bg-[#03060d] text-slate-100" : "bg-gray-50 text-slate-900"}`}>
      
      {/* 🟢 SIDEBAR OVERLAY */}
      <div className={`fixed inset-0 z-[100] transition-all duration-500 ${isSidebarOpen ? "visible opacity-100" : "invisible opacity-0"}`}>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsSidebarOpen(false)} />
        <div className={`absolute top-0 left-0 h-full w-80 shadow-2xl transition-transform duration-500 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} ${darkMode ? "bg-[#0a0f1a] border-r border-white/10" : "bg-white border-r border-slate-200"}`}>
          <div className="p-8 flex justify-between items-center border-b border-white/10">
            <h2 className="font-black text-2xl italic text-red-600">NAVIGATION</h2>
            <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-red-500/10 rounded-full text-red-500 transition-colors"><X size={28}/></button>
          </div>
          <nav className="p-8 space-y-6">
            {CATEGORIES.map((cat, idx) => (
              <a key={idx} href="#" className="flex items-center justify-between group py-2 text-xl font-black hover:text-red-500 transition-all transform hover:translate-x-2">
                {cat} <ChevronRight size={20} className="opacity-0 group-hover:opacity-100 transition-all text-red-500"/>
              </a>
            ))}
            <div className="pt-8 border-t border-white/10 space-y-4">
               <button className="flex items-center gap-4 w-full p-4 rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 text-white font-black shadow-lg shadow-red-600/20"><Radio size={20}/> LIVE TV STREAM</button>
               <button className="flex items-center gap-4 w-full p-4 rounded-2xl border border-white/10 font-bold hover:bg-white/5 transition-colors"><Bell size={20}/> NOTIFICATIONS</button>
            </div>
          </nav>
        </div>
      </div>

      {/* 🚀 1. TOP DYNAMIC INFO BAR */}
      <div className={`py-2 px-6 border-b text-[10px] font-bold uppercase tracking-widest ${darkMode ? "bg-black/40 border-white/5 text-slate-400" : "bg-white border-slate-200 text-slate-600"}`}>
        <div className="max-w-screen-2xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2 text-red-500"><MapPin size={12}/> সিরাজগঞ্জ, বাংলাদেশ</span>
            <span className="hidden md:flex items-center gap-2"><Calendar size={12}/> {formattedDate}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 bg-red-600/10 text-red-500 px-3 py-1 rounded-full"><Clock size={12}/> {formattedTime}</span>
            <span className="hidden lg:block text-green-500 animate-pulse">● LIVE UPDATE</span>
          </div>
        </div>
      </div>

      {/* 🔴 2. PREMIUM MULTI-LAYER TOP MARQUEE */}
      <div className="relative bg-black border-b border-red-500/30 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 via-transparent to-red-600/20" />
        
        {lodings ? (
          <div className="py-3 text-center text-white text-xs font-bold tracking-widest">LOADING UPDATES...</div>
        ) : (
          <div className="py-3 flex animate-marquee-fast whitespace-nowrap gap-12 items-center text-[11px] font-black uppercase text-white tracking-[0.2em]">
            {[1, 2, 3].map((loop) => (
              <div key={loop} className="flex gap-16 items-center">
                {alldatanews.map((item, idx) => (
                  <div key={item.id || idx} className="flex items-center gap-4">
                    <span className="flex items-center gap-2 bg-red-600 px-4 py-1 rounded-full animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.6)]">
                      <Zap size={14} className="fill-white"/> 
                      ব্রেকিং নিউজ
                    </span>
                    <span className="hover:text-red-500 transition-colors cursor-pointer">
                      {item.name || item.title || "নতুন আপডেট"}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🟢 3. MAIN STICKY HEADER */}
      <header className={`sticky top-0 z-50 backdrop-blur-3xl border-b transition-all duration-500 ${darkMode ? "bg-black/60 border-white/10" : "bg-white/80 border-slate-200"}`}>
        <div className="max-w-screen-2xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <button onClick={() => setIsSidebarOpen(true)} className="p-3 bg-gradient-to-tr from-red-600 to-orange-500 rounded-2xl shadow-lg shadow-red-600/30 text-white hover:scale-110 active:scale-90 transition-all">
              <Menu size={24} />
            </button>
            <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter cursor-pointer group">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 group-hover:from-blue-500 group-hover:to-cyan-400 transition-all duration-1000">RASHIDUL</span>
              <span className={darkMode ? "text-white" : "text-black"}> News</span>
            </h1>
          </div>

          <nav className="hidden xl:flex items-center gap-8 font-black text-xs uppercase opacity-80">
            {CATEGORIES.map(c => <a key={c} href="#" className="hover:text-red-500 hover:scale-110 transition-all">{c}</a>)}
          </nav>

          <div className="flex items-center gap-4">
            <button onClick={() => setDarkMode(!darkMode)} className={`p-3 rounded-2xl transition-all ${darkMode ? "bg-slate-800 text-yellow-400" : "bg-slate-100 text-slate-800"} hover:rotate-12`}>
              {darkMode ? <Sun size={22} /> : <Moon size={22} />}
            </button>
            
            {/* PROFILE DROP DOWN */}
            <div className="relative">
              <div onClick={() => setIsProfileOpen(!isProfileOpen)} className="p-1 rounded-2xl bg-gradient-to-br from-red-600 via-orange-500 to-purple-600 cursor-pointer hover:scale-105 active:scale-90 transition-all">
                 <div className="w-10 h-10 rounded-xl overflow-hidden relative border-2 border-black/20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={
                        userimglocalstoreage
                          ? `${process.env.NEXT_PUBLIC_IMAGE_URL}/profile_users/${userimglocalstoreage}` 
                          : `https://api.dicebear.com/7.x/avataaars/svg?seed=Felix`
                      } 
                      className="w-full h-full rounded-full object-cover border-2 border-emerald-500/30" 
                      alt="profile" 
                    />
                 </div>
              </div>
              
              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
                  <div className={`absolute right-0 mt-4 w-72 rounded-[2rem] p-6 shadow-2xl border z-20 animate-in fade-in zoom-in duration-200 ${darkMode ? "bg-[#0a0f1a] border-white/10" : "bg-white border-slate-200"}`}>
                    <div className="flex items-center gap-4 mb-6 border-b border-white/10 pb-4">
                       <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-orange-500 flex items-center justify-center font-black text-white text-xl">R</div>
                       <div>
                         <p className="font-black text-lg leading-none">{username}</p>
                         <p className="text-xs text-red-500 font-bold mt-1">Premium Member</p>
                       </div>
                    </div>
                    <div className="space-y-2">
                      <button className="flex items-center gap-3 w-full p-3 hover:bg-red-500/10 rounded-xl transition-all font-bold text-sm"><User size={18}/> My Profile</button>
                      <button className="flex items-center gap-3 w-full p-3 hover:bg-red-500/10 rounded-xl transition-all font-bold text-sm"><Bookmark size={18}/> Bookmarks</button>
                      <button className="flex items-center gap-3 w-full p-3 hover:bg-red-500/10 rounded-xl transition-all font-bold text-sm"><Settings size={18}/> Settings</button>
                      <button className="flex items-center gap-3 w-full p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all font-bold text-sm mt-4 border-t border-white/5 pt-4"><LogOut size={18}/> Sign Out</button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="h-1 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 transition-all duration-300" style={{ width: `${scrollProgress}%` }} />
      </header>

      {/* 📰 5. MAIN CONTENT LAYOUT */}
      <main className="max-w-[1600px] mx-auto px-6 py-8">
        
        {/* 🔥 MAIN BENTO HERO SECTION */}
        <div className="grid lg:grid-cols-4 lg:grid-rows-2 gap-6 h-auto lg:h-[700px]">
          
          {/* Main Big News */}
          {alldatanews.map((item, index) => (
            <div key={item.id || index} className="lg:col-span-2 lg:row-span-2 relative group rounded-[2.5rem] overflow-hidden cursor-pointer shadow-2xl min-h-[400px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={
                    userimglocalstoreage
                      ? `${process.env.NEXT_PUBLIC_IMAGE_URL}/profile_users/${userimglocalstoreage}` 
                      : `https://images.unsplash.com/photo-1516245834210-c4c142787335`
                  } 
                  alt="Hero"  
                  className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110" 
                />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="absolute bottom-0 p-8 md:p-12">
                 <span className="px-4 py-1.5 bg-red-600 text-[10px] font-black rounded-full mb-4 inline-block text-white">{item.name || "ব্রেকিং নিউজ"}</span>
                 <h2 className="text-3xl md:text-5xl font-black leading-tight text-white group-hover:text-red-500 transition-colors">{item.title || "শিরোনাম পাওয়া যায়নি"}</h2>
                 <div className="flex items-center gap-6 mt-6 text-xs font-bold text-white/60">
                   <span className="flex items-center gap-2"><Clock size={14}/> ২ ঘণ্টা আগে</span>
                   <span className="flex items-center gap-2"><Eye size={14}/> {item.view || '0'} ভিউ</span>
                 </div>
              </div>
            </div>
          ))}

          {/* Side Card 1 */}
          <div className="lg:col-span-2 relative group rounded-[2.5rem] overflow-hidden cursor-pointer h-[300px] lg:h-full">
            <Image src="https://images.unsplash.com/photo-1526628953301-3e589a6a8b74" alt="Economy" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            <div className="absolute bottom-0 p-8">
               <h3 className="text-2xl font-black text-white leading-tight">বিটকয়েন ও ক্রিপ্টো মার্কেটে নতুন অস্থিরতা</h3>
            </div>
          </div>

          {/* Small Bento 1 */}
          <div className="relative group rounded-[2.5rem] overflow-hidden cursor-pointer h-[300px] lg:h-full">
            <Image src="https://images.unsplash.com/photo-1511512578047-dfb367046420" alt="Tech" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-0 p-6">
               <h4 className="font-bold text-white">গে미용 인더스트리에 오느 바 코의 하</h4>
            </div>
          </div>

          {/* Small Bento 2 */}
          <div className="relative group rounded-[2.5rem] overflow-hidden cursor-pointer h-[300px] lg:h-full bg-red-600 flex flex-col justify-center p-8">
             <Trophy size={48} className="text-white mb-4 animate-bounce" />
             <h4 className="text-2xl font-black text-white">ক্রীড়া জগত</h4>
             <p className="text-white/80 font-bold mt-2">সব খেলার সব আপডেট এক ক্লিকে পান এখানে।</p>
             <button className="mt-6 bg-white text-red-600 px-6 py-2 rounded-full font-black text-xs self-start hover:scale-105 transition-transform">সব দেখুন</button>
          </div>
        </div>

        {/* 📢 DYNAMIC FEED & TRENDING */}
        <div className="grid lg:grid-cols-12 gap-10 mt-20">
          
          {/* Latest News List */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex justify-between items-center border-b border-red-600/20 pb-4">
              <h3 className="text-3xl font-black italic">সর্বশেষ <span className="text-red-600">সংবাদ</span></h3>
              <button className="flex items-center gap-2 text-sm font-black opacity-50 hover:opacity-100 transition-opacity">আরও দেখুন <ArrowUpRight size={18}/></button>
            </div>

            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col md:flex-row gap-6 p-6 rounded-[2rem] hover:bg-red-600/5 transition-all group cursor-pointer border border-transparent hover:border-red-600/10">
                <div className="w-full md:w-64 h-44 relative rounded-[1.5rem] overflow-hidden">
                  <Image src={`https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=${i}`} alt="News" fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="flex-1 space-y-4">
                   <span className="text-red-600 font-black text-[10px] uppercase tracking-widest">আন্তর্জাতিক</span>
                   <h3 className="text-2xl font-black group-hover:text-red-500 transition-colors">মহাকাশ গবেষণায় নতুন ইতিহাস গড়ল নাসা, প্রাণের সন্ধানে বড় তথ্য</h3>
                   <p className="opacity-60 font-medium line-clamp-2">বিজ্ঞানীরা সম্প্রতি মঙ্গলের তলদেশে পানির বিশাল এক আধারের সন্ধান পেয়েছেন যা ভবিষ্যতে প্রাণের স্পন্দন বয়ে আনতে পারে...</p>
                   <div className="flex items-center gap-4 text-[10px] font-black opacity-40 uppercase">
                      <span>৫ ঘণ্টা আগে</span>
                      <span>২ মিনিট পড়ার সময়</span>
                   </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Sidebar: Trending & Newsletter */}
          <div className="lg:col-span-4 space-y-10">
            
            {/* Trending Cards */}
            <div className={`p-10 rounded-[2.5rem] border ${darkMode ? "bg-slate-900/40 border-white/5" : "bg-white border-slate-200 shadow-xl"}`}>
               <h3 className="text-2xl font-black mb-8 flex items-center gap-4">
                  <Flame size={28} className="text-orange-500" /> আলোচিত খবর
               </h3>
               <div className="space-y-8">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <div key={n} className="flex gap-4 group cursor-pointer border-b border-white/5 pb-4 last:border-0">
                       <span className="text-4xl font-black text-slate-500/10 group-hover:text-red-600 transition-all">{n}</span>
                       <h4 className="font-bold text-sm leading-tight group-hover:underline">বিশ্বরাজনীতিতে বাংলাদেশের শক্তিশালী অবস্থান, মোড় ঘুরছে কূটনীতির...</h4>
                    </div>
                  ))}
               </div>
            </div>

            {/* Newsletter */}
            <div className="relative p-10 rounded-[2.5rem] bg-gradient-to-br from-red-600 to-orange-500 text-white overflow-hidden group shadow-[0_20px_50px_rgba(220,38,38,0.3)]">
               <Newspaper className="absolute -bottom-10 -right-10 text-white/10 rotate-12" size={200} />
               <h4 className="text-3xl font-black mb-4 relative z-10 leading-none">সবার আগে খবর চান?</h4>
               <p className="text-white/80 text-sm mb-8 font-medium relative z-10">আপনার ইমেইল দিয়ে সাবস্ক্রাইব করে রাখুন।</p>
               <input type="email" placeholder="আপনার ইমেইল" className="w-full bg-white/20 border border-white/30 rounded-2xl px-6 py-4 text-white placeholder:text-white/60 outline-none focus:bg-white/30 transition-all mb-4 relative z-10" />
               <button className="w-full bg-white text-red-600 font-black py-4 rounded-2xl hover:bg-black hover:text-white transition-all uppercase text-xs tracking-widest relative z-10">যুক্ত হোন</button>
            </div>

          </div>
        </div>
      </main>

      {/* 📽️ 4. VIDEO LIVE STUDIO */}
      <section className="max-w-screen-2xl mx-auto px-6 pt-10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black flex items-center gap-3 italic">
             <Camera className="text-red-600 animate-pulse" /> Rashidul Studio <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-lg not-italic shadow-lg shadow-red-600/30">LIVE</span>
          </h3>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
           {[1, 2, 3, 4, 5].map(i => (
             <div key={i} className="min-w-[320px] group relative rounded-[2.5rem] overflow-hidden aspect-video bg-slate-900 border border-white/5 cursor-pointer shadow-2xl hover:scale-[1.02] transition-transform">
                <Image src={`https://images.unsplash.com/photo-1485846234645-a62644f84728?q=${i}`} alt="vid" fill className="object-cover opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="p-4 bg-white/20 backdrop-blur-xl rounded-full border border-white/30 group-hover:scale-125 transition-transform shadow-2xl">
                      <PlayCircle className="text-white fill-white/20" size={36} />
                   </div>
                </div>
                <div className="absolute bottom-6 left-6 right-6">
                   <p className="text-sm font-black text-white leading-tight drop-shadow-lg">সিরাজগঞ্জে নতুন মেগা প্রজেক্টের কাজ শুরু...</p>
                </div>
             </div>
           ))}
        </div>
      </section>

      {/* 🏁 MODERN FOOTER */}
      <footer className={`mt-32 pt-24 pb-12 border-t ${darkMode ? "bg-black border-white/5" : "bg-slate-100 border-slate-200"}`}>
         <div className="max-w-[1600px] mx-auto px-6 grid md:grid-cols-4 gap-20">
            <div className="col-span-2 space-y-10">
               <h2 className="text-6xl font-black italic tracking-tighter">
                 <span className="text-red-600">RASHIDUL</span> PORTAL
               </h2>
               <div className="flex gap-6">
                  {[Facebook, Youtube, Share2, Globe].map((Icon, i) => (
                    <button key={i} className="w-14 h-14 rounded-2xl bg-red-600/10 flex items-center justify-center text-red-600 hover:bg-red-600 hover:text-white transition-all transform hover:-translate-y-3">
                      <Icon size={24} />
                    </button>
                  ))}
               </div>
               <p className="text-slate-500 font-bold max-w-sm">সত্যের সন্ধানে এবং নিরপেক্ষ সাংবাদিকতায় আমরা সর্বদা অগ্রগামী। আমাদের সাথে যুক্ত থাকুন।</p>
            </div>
            <div className="space-y-8">
               <h5 className="font-black text-xs uppercase tracking-widest text-red-600">কুইক লিঙ্কস</h5>
               <ul className="space-y-4 font-bold opacity-60">
                  <li className="hover:text-red-600 cursor-pointer">জাতীয় খবর</li>
                  <li className="hover:text-red-600 cursor-pointer">টেক নিউজ</li>
                  <li className="hover:text-red-600 cursor-pointer">লাইভ টিভি</li>
               </ul>
            </div>
            <div className="space-y-8">
               <h5 className="font-black text-xs uppercase tracking-widest text-red-600">যোগাযোগ</h5>
               <ul className="space-y-4 font-bold opacity-60 text-sm">
                  <li>সিরাজগঞ্জ সদর, বাংলাদেশ</li>
                  <li>Email: contact@rashidul.com</li>
                  <li>Phone: +৮৮০ ১২৩৪ ৫৬৭৮৯০</li>
               </ul>
            </div>
         </div>
         <div className="text-center mt-32 text-[10px] font-black uppercase tracking-[1em] opacity-20">
           © 2026 RASHIDUL PORTAL | All Rights Reserved
         </div>
      </footer>

      {/* ✨ CSS ANIMATIONS */}
      <style>{`
        @keyframes marquee-fast {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee-fast {
          animation: marquee-fast 30s linear infinite;
        }
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-thumb {
          background: #ef4444;
          border-radius: 10px;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}


// "use client";

// import React, { useState, useEffect } from "react";
// import Image from "next/image";
// import { 
//   Clock, TrendingUp, Search, Menu, User, 
//   Moon, Sun, Bell, Zap, ChevronRight, X, 
//   Settings, LogOut, Bookmark, Facebook, Youtube, Share2,
//   Globe, PlayCircle, Eye, Flame, Newspaper, Radio, ArrowUpRight,
//   MapPin, Calendar, Camera,Trophy
// } from "lucide-react";

// const CATEGORIES = ["জাতীয়", "আন্তর্জাতিক", "খেলা", "প্রযুক্তি", "অর্থনীতি", "স্বাস্থ্য", "বিজ্ঞান"];

// export default function RashidulMegaPortal() {
//   const [mounted, setMounted] = useState(false);
//   const [darkMode, setDarkMode] = useState(true);
//   const [currentTime, setCurrentTime] = useState(new Date());
//   const [scrollProgress, setScrollProgress] = useState(0);
  
//   // Sidebar & Profile States
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const [isProfileOpen, setIsProfileOpen] = useState(false);

//   useEffect(() => {
//     setMounted(true);
//     const timer = setInterval(() => setCurrentTime(new Date()), 1000);
//     const handleScroll = () => {
//       const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
//       setScrollProgress((window.scrollY / height) * 100);
//     };
//     window.addEventListener("scroll", handleScroll);
//     return () => {
//       clearInterval(timer);
//       window.removeEventListener("scroll", handleScroll);
//     };
//   }, []);

//   if (!mounted) return null;

//   const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
//   const formattedDate = currentTime.toLocaleDateString('bn-BD', options);
//   const formattedTime = currentTime.toLocaleTimeString('bn-BD');

//   return (
//     <div className={`min-h-screen transition-all duration-700 ${darkMode ? "bg-[#03060d] text-slate-100" : "bg-gray-50 text-slate-900"}`}>
      
//       {/* 🟢 SIDEBAR OVERLAY */}
//       <div className={`fixed inset-0 z-[100] transition-all duration-500 ${isSidebarOpen ? "visible opacity-100" : "invisible opacity-0"}`}>
//         <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsSidebarOpen(false)} />
//         <div className={`absolute top-0 left-0 h-full w-80 shadow-2xl transition-transform duration-500 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} ${darkMode ? "bg-[#0a0f1a] border-r border-white/10" : "bg-white border-r border-slate-200"}`}>
//           <div className="p-8 flex justify-between items-center border-b border-white/10">
//             <h2 className="font-black text-2xl italic text-red-600">NAVIGATION</h2>
//             <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-red-500/10 rounded-full text-red-500 transition-colors"><X size={28}/></button>
//           </div>
//           <nav className="p-8 space-y-6">
//             {CATEGORIES.map(cat => (
//               <a key={cat} href="#" className="flex items-center justify-between group py-2 text-xl font-black hover:text-red-500 transition-all transform hover:translate-x-2">
//                 {cat} <ChevronRight size={20} className="opacity-0 group-hover:opacity-100 transition-all text-red-500"/>
//               </a>
//             ))}
//             <div className="pt-8 border-t border-white/10 space-y-4">
//                <button className="flex items-center gap-4 w-full p-4 rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 text-white font-black shadow-lg shadow-red-600/20"><Radio size={20}/> LIVE TV STREAM</button>
//                <button className="flex items-center gap-4 w-full p-4 rounded-2xl border border-white/10 font-bold hover:bg-white/5 transition-colors"><Bell size={20}/> NOTIFICATIONS</button>
//             </div>
//           </nav>
//         </div>
//       </div>

//       {/* 🚀 1. TOP DYNAMIC INFO BAR */}
//       <div className={`py-2 px-6 border-b text-[10px] font-bold uppercase tracking-widest ${darkMode ? "bg-black/40 border-white/5 text-slate-400" : "bg-white border-slate-200 text-slate-600"}`}>
//         <div className="max-w-screen-2xl mx-auto flex justify-between items-center">
//           <div className="flex items-center gap-6">
//             <span className="flex items-center gap-2 text-red-500"><MapPin size={12}/> সিরাজগঞ্জ, বাংলাদেশ</span>
//             <span className="hidden md:flex items-center gap-2"><Calendar size={12}/> {formattedDate}</span>
//           </div>
//           <div className="flex items-center gap-4">
//             <span className="flex items-center gap-2 bg-red-600/10 text-red-500 px-3 py-1 rounded-full"><Clock size={12}/> {formattedTime}</span>
//             <span className="hidden lg:block text-green-500 animate-pulse">● LIVE UPDATE</span>
//           </div>
//         </div>
//       </div>

//       {/* 🔴 2. PREMIUM MULTI-LAYER TOP MARQUEE */}
//       <div className="relative bg-black border-b border-red-500/30 overflow-hidden">
//         <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 via-transparent to-red-600/20" />
//         <div className="py-3 flex animate-marquee-fast whitespace-nowrap gap-12 items-center text-[11px] font-black uppercase text-white tracking-[0.2em]">
//           {[1, 2, 3].map(i => (
//             <div key={i} className="flex gap-16 items-center">
//               <span className="flex items-center gap-2 bg-red-600 px-4 py-1 rounded-full animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.6)]"><Zap size={14} className="fill-white"/> ব্রেকিং নিউজ</span>
//               <span className="hover:text-red-500 transition-colors cursor-pointer">২০২৬ বিশ্বকাপে সরাসরি খেলবে বাংলাদেশ</span>
//               <span className="text-blue-400 flex items-center gap-2"><Globe size={14}/> প্রযুক্তিতে নতুন বিপ্লব আনছে রশিদুল পোর্টাল</span>
//               <span className="text-green-400 flex items-center gap-2"><ArrowUpRight size={14}/> ইউএস ডলার আজ ১১৮.৪০ ৳</span>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* 🟢 3. MAIN STICKY HEADER */}
//       <header className={`sticky top-0 z-50 backdrop-blur-3xl border-b transition-all duration-500 ${darkMode ? "bg-black/60 border-white/10" : "bg-white/80 border-slate-200"}`}>
//         <div className="max-w-screen-2xl mx-auto px-6 h-20 flex justify-between items-center">
//           <div className="flex items-center gap-8">
//             <button onClick={() => setIsSidebarOpen(true)} className="p-3 bg-gradient-to-tr from-red-600 to-orange-500 rounded-2xl shadow-lg shadow-red-600/30 text-white hover:scale-110 active:scale-90 transition-all">
//               <Menu size={24} />
//             </button>
//             <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter cursor-pointer group">
//               <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 group-hover:from-blue-500 group-hover:to-cyan-400 transition-all duration-1000">RASHIDUL</span>
//               <span className={darkMode ? "text-white" : "text-black"}> News</span>
//             </h1>
//           </div>

//           <nav className="hidden xl:flex items-center gap-8 font-black text-xs uppercase opacity-80">
//             {CATEGORIES.map(c => <a key={c} href="#" className="hover:text-red-500 hover:scale-110 transition-all">{c}</a>)}
//           </nav>

//           <div className="flex items-center gap-4">
//             <button onClick={() => setDarkMode(!darkMode)} className={`p-3 rounded-2xl transition-all ${darkMode ? "bg-slate-800 text-yellow-400" : "bg-slate-100 text-slate-800"} hover:rotate-12`}>
//               {darkMode ? <Sun size={22} /> : <Moon size={22} />}
//             </button>
            
//             {/* PROFILE DROP DOWN */}
//             <div className="relative">
//               <div onClick={() => setIsProfileOpen(!isProfileOpen)} className="p-1 rounded-2xl bg-gradient-to-br from-red-600 via-orange-500 to-purple-600 cursor-pointer hover:scale-105 active:scale-90 transition-all">
//                  <div className="w-10 h-10 rounded-xl overflow-hidden relative border-2 border-black/20">
//                     <Image src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde" alt="Avatar" fill className="object-cover" />
//                  </div>
//               </div>
              
//               {isProfileOpen && (
//                 <>
//                   <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
//                   <div className={`absolute right-0 mt-4 w-72 rounded-[2rem] p-6 shadow-2xl border z-20 animate-in fade-in zoom-in duration-200 ${darkMode ? "bg-[#0a0f1a] border-white/10" : "bg-white border-slate-200"}`}>
//                     <div className="flex items-center gap-4 mb-6 border-b border-white/10 pb-4">
//                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-orange-500 flex items-center justify-center font-black text-white text-xl">R</div>
//                        <div>
//                          <p className="font-black text-lg leading-none">Rashidul Islam</p>
//                          <p className="text-xs text-red-500 font-bold mt-1">Premium Member</p>
//                        </div>
//                     </div>
//                     <div className="space-y-2">
//                       <button className="flex items-center gap-3 w-full p-3 hover:bg-red-500/10 rounded-xl transition-all font-bold text-sm"><User size={18}/> My Profile</button>
//                       <button className="flex items-center gap-3 w-full p-3 hover:bg-red-500/10 rounded-xl transition-all font-bold text-sm"><Bookmark size={18}/> Bookmarks</button>
//                       <button className="flex items-center gap-3 w-full p-3 hover:bg-red-500/10 rounded-xl transition-all font-bold text-sm"><Settings size={18}/> Settings</button>
//                       <button className="flex items-center gap-3 w-full p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all font-bold text-sm mt-4 border-t border-white/5 pt-4"><LogOut size={18}/> Sign Out</button>
//                     </div>
//                   </div>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//         <div className="h-1 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 transition-all duration-300" style={{ width: `${scrollProgress}%` }} />
//       </header>

   

//       {/* 📰 5. MAIN CONTENT LAYOUT (Big News with Neon Glow) */}
   
//       <main className="max-w-[1600px] mx-auto px-6 py-8">
        
//         {/* 🔥 MAIN BENTO HERO SECTION */}
//         <div className="grid lg:grid-cols-4 lg:grid-rows-2 gap-6 h-auto lg:h-[700px]">
          
//           {/* Main Big News */}
//           <div className="lg:col-span-2 lg:row-span-2 relative group rounded-[2.5rem] overflow-hidden cursor-pointer shadow-2xl">
//             <Image src="https://images.unsplash.com/photo-1516245834210-c4c142787335" alt="Hero" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
//             <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
//             <div className="absolute bottom-0 p-8 md:p-12">
//                <span className="px-4 py-1.5 bg-red-600 text-[10px] font-black rounded-full mb-4 inline-block">এক্সক্লুসিভ</span>
//                <h2 className="text-3xl md:text-5xl font-black leading-tight text-white group-hover:text-red-500 transition-colors">ডিজিটাল কারেন্সি নিয়ে বড় সিদ্ধান্ত নিচ্ছে সরকার</h2>
//                <div className="flex items-center gap-6 mt-6 text-xs font-bold text-white/60">
//                   <span className="flex items-center gap-2"><Clock size={14}/> ২ ঘণ্টা আগে</span>
//                   <span className="flex items-center gap-2"><Eye size={14}/> ১২.৫ হাজার ভিউ</span>
//                </div>
//             </div>
//           </div>

//           {/* Side Card 1 */}
//           <div className="lg:col-span-2 relative group rounded-[2.5rem] overflow-hidden cursor-pointer h-[300px] lg:h-full">
//             <Image src="https://images.unsplash.com/photo-1526628953301-3e589a6a8b74" alt="Economy" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
//             <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
//             <div className="absolute bottom-0 p-8">
//                <h3 className="text-2xl font-black text-white leading-tight">বিটকয়েন ও ক্রিপ্টো মার্কেটে নতুন অস্থিরতা</h3>
//             </div>
//           </div>

//           {/* Small Bento 1 */}
//           <div className="relative group rounded-[2.5rem] overflow-hidden cursor-pointer h-[300px] lg:h-full">
//             <Image src="https://images.unsplash.com/photo-1511512578047-dfb367046420" alt="Tech" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
//             <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
//             <div className="absolute bottom-0 p-6">
//                <h4 className="font-bold text-white">গেমিং ইন্ডাস্ট্রিতে আসছে বড় পরিবর্তন</h4>
//             </div>
//           </div>

//           {/* Small Bento 2 */}
//           <div className="relative group rounded-[2.5rem] overflow-hidden cursor-pointer h-[300px] lg:h-full bg-red-600 flex flex-col justify-center p-8">
//              <Trophy size={48} className="text-white mb-4 animate-bounce" />
//              <h4 className="text-2xl font-black text-white">ক্রীড়া জগত</h4>
//              <p className="text-white/80 font-bold mt-2">সব খেলার সব আপডেট এক ক্লিকে পান এখানে।</p>
//              <button className="mt-6 bg-white text-red-600 px-6 py-2 rounded-full font-black text-xs self-start hover:scale-105 transition-transform">সব দেখুন</button>
//           </div>

//         </div>

//         {/* 📢 DYNAMIC FEED & TRENDING */}
//         <div className="grid lg:grid-cols-12 gap-10 mt-20">
          
//           {/* Latest News List */}
//           <div className="lg:col-span-8 space-y-8">
//             <div className="flex justify-between items-center border-b border-red-600/20 pb-4">
//               <h3 className="text-3xl font-black italic">সর্বশেষ <span className="text-red-600">সংবাদ</span></h3>
//               <button className="flex items-center gap-2 text-sm font-black opacity-50 hover:opacity-100 transition-opacity">আরও দেখুন <ArrowUpRight size={18}/></button>
//             </div>

//             {[1, 2, 3, 4].map((i) => (
//               <div key={i} className="flex flex-col md:flex-row gap-6 p-6 rounded-[2rem] hover:bg-red-600/5 transition-all group cursor-pointer border border-transparent hover:border-red-600/10">
//                 <div className="w-full md:w-64 h-44 relative rounded-[1.5rem] overflow-hidden">
//                   <Image src={`https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=${i}`} alt="News" fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
//                 </div>
//                 <div className="flex-1 space-y-4">
//                    <span className="text-red-600 font-black text-[10px] uppercase tracking-widest">আন্তর্জাতিক</span>
//                    <h3 className="text-2xl font-black group-hover:text-red-500 transition-colors">মহাকাশ গবেষণায় নতুন ইতিহাস গড়ল নাসা, প্রাণের সন্ধানে বড় তথ্য</h3>
//                    <p className="opacity-60 font-medium line-clamp-2">বিজ্ঞানীরা সম্প্রতি মঙ্গলের তলদেশে পানির বিশাল এক আধারের সন্ধান পেয়েছেন যা ভবিষ্যতে প্রাণের স্পন্দন বয়ে আনতে পারে...</p>
//                    <div className="flex items-center gap-4 text-[10px] font-black opacity-40 uppercase">
//                       <span>৫ ঘণ্টা আগে</span>
//                       <span>২ মিনিট পড়ার সময়</span>
//                    </div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Right Sidebar: Trending & Newsletter */}
//           <div className="lg:col-span-4 space-y-10">
            
//             {/* Trending Cards */}
//             <div className={`p-10 rounded-[2.5rem] border ${darkMode ? "bg-slate-900/40 border-white/5" : "bg-white border-slate-200 shadow-xl"}`}>
//                <h3 className="text-2xl font-black mb-8 flex items-center gap-4">
//                   <Flame size={28} className="text-orange-500" /> আলোচিত খবর
//                </h3>
//                <div className="space-y-8">
//                   {[1, 2, 3, 4, 5].map((n) => (
//                     <div key={n} className="flex gap-4 group cursor-pointer border-b border-white/5 pb-4 last:border-0">
//                        <span className="text-4xl font-black text-slate-500/10 group-hover:text-red-600 transition-all">{n}</span>
//                        <h4 className="font-bold text-sm leading-tight group-hover:underline">বিশ্বরাজনীতিতে বাংলাদেশের শক্তিশালী অবস্থান, মোড় ঘুরছে কূটনীতির...</h4>
//                     </div>
//                   ))}
//                </div>
//             </div>

//             {/* Newsletter */}
//             <div className="relative p-10 rounded-[2.5rem] bg-gradient-to-br from-red-600 to-orange-500 text-white overflow-hidden group shadow-[0_20px_50px_rgba(220,38,38,0.3)]">
//                <Newspaper className="absolute -bottom-10 -right-10 text-white/10 rotate-12" size={200} />
//                <h4 className="text-3xl font-black mb-4 relative z-10 leading-none">সবার আগে খবর চান?</h4>
//                <p className="text-white/80 text-sm mb-8 font-medium relative z-10">আপনার ইমেইল দিয়ে সাবস্ক্রাইব করে রাখুন।</p>
//                <input type="email" placeholder="আপনার ইমেইল" className="w-full bg-white/20 border border-white/30 rounded-2xl px-6 py-4 text-white placeholder:text-white/60 outline-none focus:bg-white/30 transition-all mb-4 relative z-10" />
//                <button className="w-full bg-white text-red-600 font-black py-4 rounded-2xl hover:bg-black hover:text-white transition-all uppercase text-xs tracking-widest relative z-10">যুক্ত হোন</button>
//             </div>

//           </div>
//         </div>
//       </main>





//          {/* 📽️ 4. VIDEO LIVE STUDIO */}
//       <section className="max-w-screen-2xl mx-auto px-6 pt-10">
//         <div className="flex justify-between items-center mb-6">
//           <h3 className="text-xl font-black flex items-center gap-3 italic">
//              <Camera className="text-red-600 animate-pulse" /> Rashidul Studio <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-lg not-italic shadow-lg shadow-red-600/30">LIVE</span>
//           </h3>
//         </div>
//         <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
//            {[1, 2, 3, 4, 5].map(i => (
//              <div key={i} className="min-w-[320px] group relative rounded-[2.5rem] overflow-hidden aspect-video bg-slate-900 border border-white/5 cursor-pointer shadow-2xl hover:scale-[1.02] transition-transform">
//                 <Image src={`https://images.unsplash.com/photo-1485846234645-a62644f84728?q=${i}`} alt="vid" fill className="object-cover opacity-50 group-hover:opacity-100 transition-opacity" />
//                 <div className="absolute inset-0 flex items-center justify-center">
//                    <div className="p-4 bg-white/20 backdrop-blur-xl rounded-full border border-white/30 group-hover:scale-125 transition-transform shadow-2xl">
//                       <PlayCircle className="text-white fill-white/20" size={36} />
//                    </div>
//                 </div>
//                 <div className="absolute bottom-6 left-6 right-6">
//                    <p className="text-sm font-black text-white leading-tight drop-shadow-lg">সিরাজগঞ্জে নতুন মেগা প্রজেক্টের কাজ শুরু...</p>
//                 </div>
//              </div>
//            ))}
//         </div>
//       </section>




//       {/* 🏁 MODERN FOOTER */}
//       <footer className={`mt-32 pt-24 pb-12 border-t ${darkMode ? "bg-black border-white/5" : "bg-slate-100 border-slate-200"}`}>
//          <div className="max-w-[1600px] mx-auto px-6 grid md:grid-cols-4 gap-20">
//             <div className="col-span-2 space-y-10">
//                <h2 className="text-6xl font-black italic tracking-tighter italic">
//                  <span className="text-red-600">RASHIDUL</span> PORTAL
//                </h2>
//                <div className="flex gap-6">
//                   {[Facebook, Youtube, Share2, Globe].map((Icon, i) => (
//                     <button key={i} className="w-14 h-14 rounded-2xl bg-red-600/10 flex items-center justify-center text-red-600 hover:bg-red-600 hover:text-white transition-all transform hover:-translate-y-3">
//                       <Icon size={24} />
//                     </button>
//                   ))}
//                </div>
//                <p className="text-slate-500 font-bold max-w-sm">সত্যের সন্ধানে এবং নিরপেক্ষ সাংবাদিকতায় আমরা সর্বদা অগ্রগামী। আমাদের সাথে যুক্ত থাকুন।</p>
//             </div>
//             <div className="space-y-8">
//                <h5 className="font-black text-xs uppercase tracking-widest text-red-600">কুইক লিঙ্কস</h5>
//                <ul className="space-y-4 font-bold opacity-60">
//                   <li className="hover:text-red-600 cursor-pointer">জাতীয় খবর</li>
//                   <li className="hover:text-red-600 cursor-pointer">টেক নিউজ</li>
//                   <li className="hover:text-red-600 cursor-pointer">লাইভ টিভি</li>
//                </ul>
//             </div>
//             <div className="space-y-8">
//                <h5 className="font-black text-xs uppercase tracking-widest text-red-600">যোগাযোগ</h5>
//                <ul className="space-y-4 font-bold opacity-60 text-sm">
//                   <li>সিরাজগঞ্জ সদর, বাংলাদেশ</li>
//                   <li>Email: contact@rashidul.com</li>
//                   <li>Phone: +৮৮০ ১২৩৪ ৫৬৭৮৯০</li>
//                </ul>
//             </div>
//          </div>
//          <div className="text-center mt-32 text-[10px] font-black uppercase tracking-[1em] opacity-20">
//             © 2026 RASHIDUL PORTAL | All Rights Reserved
//          </div>
//       </footer>

//       {/* ✨ CSS ANIMATIONS */}
//       <style jsx global>{`
//         @keyframes marquee-fast {
//           0% { transform: translateX(100%); }
//           100% { transform: translateX(-100%); }
//         }
//         .animate-marquee-fast {
//           animation: marquee-fast 30s linear infinite;
//         }
//         ::-webkit-scrollbar {
//           width: 6px;
//         }
//         ::-webkit-scrollbar-thumb {
//           background: #ef4444;
//           border-radius: 10px;
//         }
//         .scrollbar-hide::-webkit-scrollbar {
//           display: none;
//         }
//       `}</style>


//     </div>
//   );
// }




// // নিচের কোড উপরের মত ডিজাইন করা 


// // "use client";

// // import React, { useState, useEffect } from "react";
// // import Image from "next/image";
// // import { 
// //   Clock, TrendingUp, Search, Menu, User, 
// //   Moon, Sun, Bell, Zap, ChevronRight, X, 
// //   Settings, LogOut, Bookmark, Facebook, Youtube, Share2,
// //   Globe, PlayCircle, Eye, Flame, Newspaper, Radio, ArrowUpRight,
// //   MapPin, Calendar, Camera,Trophy
// // } from "lucide-react";

// // const CATEGORIES = ["জাতীয়", "আন্তর্জাতিক", "খেলা", "প্রযুক্তি", "অর্থনীতি", "স্বাস্থ্য", "বিজ্ঞান"];

// // export default function RashidulMegaPortal() {
// //   const [mounted, setMounted] = useState(false);
// //   const [darkMode, setDarkMode] = useState(true);
// //   const [currentTime, setCurrentTime] = useState(new Date());
// //   const [scrollProgress, setScrollProgress] = useState(0);
  
// //   // Sidebar & Profile States
// //   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
// //   const [isProfileOpen, setIsProfileOpen] = useState(false);

// //   useEffect(() => {
// //     setMounted(true);
// //     const timer = setInterval(() => setCurrentTime(new Date()), 1000);
// //     const handleScroll = () => {
// //       const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
// //       setScrollProgress((window.scrollY / height) * 100);
// //     };
// //     window.addEventListener("scroll", handleScroll);
// //     return () => {
// //       clearInterval(timer);
// //       window.removeEventListener("scroll", handleScroll);
// //     };
// //   }, []);

// //   if (!mounted) return null;

// //   const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
// //   const formattedDate = currentTime.toLocaleDateString('bn-BD', options);
// //   const formattedTime = currentTime.toLocaleTimeString('bn-BD');

// //   return (
// //     <div className={`min-h-screen transition-all duration-700 ${darkMode ? "bg-[#03060d] text-slate-100" : "bg-gray-50 text-slate-900"}`}>
      
// //       {/* 🟢 SIDEBAR OVERLAY */}
// //       <div className={`fixed inset-0 z-[100] transition-all duration-500 ${isSidebarOpen ? "visible opacity-100" : "invisible opacity-0"}`}>
// //         <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsSidebarOpen(false)} />
// //         <div className={`absolute top-0 left-0 h-full w-80 shadow-2xl transition-transform duration-500 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} ${darkMode ? "bg-[#0a0f1a] border-r border-white/10" : "bg-white border-r border-slate-200"}`}>
// //           <div className="p-8 flex justify-between items-center border-b border-white/10">
// //             <h2 className="font-black text-2xl italic text-red-600">NAVIGATION</h2>
// //             <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-red-500/10 rounded-full text-red-500 transition-colors"><X size={28}/></button>
// //           </div>
// //           <nav className="p-8 space-y-6">
// //             {CATEGORIES.map(cat => (
// //               <a key={cat} href="#" className="flex items-center justify-between group py-2 text-xl font-black hover:text-red-500 transition-all transform hover:translate-x-2">
// //                 {cat} <ChevronRight size={20} className="opacity-0 group-hover:opacity-100 transition-all text-red-500"/>
// //               </a>
// //             ))}
// //             <div className="pt-8 border-t border-white/10 space-y-4">
// //                <button className="flex items-center gap-4 w-full p-4 rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 text-white font-black shadow-lg shadow-red-600/20"><Radio size={20}/> LIVE TV STREAM</button>
// //                <button className="flex items-center gap-4 w-full p-4 rounded-2xl border border-white/10 font-bold hover:bg-white/5 transition-colors"><Bell size={20}/> NOTIFICATIONS</button>
// //             </div>
// //           </nav>
// //         </div>
// //       </div>

// //       {/* 🚀 1. TOP DYNAMIC INFO BAR */}
// //       <div className={`py-2 px-6 border-b text-[10px] font-bold uppercase tracking-widest ${darkMode ? "bg-black/40 border-white/5 text-slate-400" : "bg-white border-slate-200 text-slate-600"}`}>
// //         <div className="max-w-screen-2xl mx-auto flex justify-between items-center">
// //           <div className="flex items-center gap-6">
// //             <span className="flex items-center gap-2 text-red-500"><MapPin size={12}/> সিরাজগঞ্জ, বাংলাদেশ</span>
// //             <span className="hidden md:flex items-center gap-2"><Calendar size={12}/> {formattedDate}</span>
// //           </div>
// //           <div className="flex items-center gap-4">
// //             <span className="flex items-center gap-2 bg-red-600/10 text-red-500 px-3 py-1 rounded-full"><Clock size={12}/> {formattedTime}</span>
// //             <span className="hidden lg:block text-green-500 animate-pulse">● LIVE UPDATE</span>
// //           </div>
// //         </div>
// //       </div>

// //       {/* 🔴 2. PREMIUM MULTI-LAYER TOP MARQUEE */}
// //       <div className="relative bg-black border-b border-red-500/30 overflow-hidden">
// //         <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 via-transparent to-red-600/20" />
// //         <div className="py-3 flex animate-marquee-fast whitespace-nowrap gap-12 items-center text-[11px] font-black uppercase text-white tracking-[0.2em]">
// //           {[1, 2, 3].map(i => (
// //             <div key={i} className="flex gap-16 items-center">
// //               <span className="flex items-center gap-2 bg-red-600 px-4 py-1 rounded-full animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.6)]"><Zap size={14} className="fill-white"/> ব্রেকিং নিউজ</span>
// //               <span className="hover:text-red-500 transition-colors cursor-pointer">২০২৬ বিশ্বকাপে সরাসরি খেলবে বাংলাদেশ</span>
// //               <span className="text-blue-400 flex items-center gap-2"><Globe size={14}/> প্রযুক্তিতে নতুন বিপ্লব আনছে রশিদুল পোর্টাল</span>
// //               <span className="text-green-400 flex items-center gap-2"><ArrowUpRight size={14}/> ইউএস ডলার আজ ১১৮.৪০ ৳</span>
// //             </div>
// //           ))}
// //         </div>
// //       </div>

// //       {/* 🟢 3. MAIN STICKY HEADER */}
// //       <header className={`sticky top-0 z-50 backdrop-blur-3xl border-b transition-all duration-500 ${darkMode ? "bg-black/60 border-white/10" : "bg-white/80 border-slate-200"}`}>
// //         <div className="max-w-screen-2xl mx-auto px-6 h-20 flex justify-between items-center">
// //           <div className="flex items-center gap-8">
// //             <button onClick={() => setIsSidebarOpen(true)} className="p-3 bg-gradient-to-tr from-red-600 to-orange-500 rounded-2xl shadow-lg shadow-red-600/30 text-white hover:scale-110 active:scale-90 transition-all">
// //               <Menu size={24} />
// //             </button>
// //             <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter cursor-pointer group">
// //               <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 group-hover:from-blue-500 group-hover:to-cyan-400 transition-all duration-1000">RASHIDUL</span>
// //               <span className={darkMode ? "text-white" : "text-black"}> News</span>
// //             </h1>
// //           </div>

// //           <nav className="hidden xl:flex items-center gap-8 font-black text-xs uppercase opacity-80">
// //             {CATEGORIES.map(c => <a key={c} href="#" className="hover:text-red-500 hover:scale-110 transition-all">{c}</a>)}
// //           </nav>

// //           <div className="flex items-center gap-4">
// //             <button onClick={() => setDarkMode(!darkMode)} className={`p-3 rounded-2xl transition-all ${darkMode ? "bg-slate-800 text-yellow-400" : "bg-slate-100 text-slate-800"} hover:rotate-12`}>
// //               {darkMode ? <Sun size={22} /> : <Moon size={22} />}
// //             </button>
            
// //             {/* PROFILE DROP DOWN */}
// //             <div className="relative">
// //               <div onClick={() => setIsProfileOpen(!isProfileOpen)} className="p-1 rounded-2xl bg-gradient-to-br from-red-600 via-orange-500 to-purple-600 cursor-pointer hover:scale-105 active:scale-90 transition-all">
// //                  <div className="w-10 h-10 rounded-xl overflow-hidden relative border-2 border-black/20">
// //                     <Image src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde" alt="Avatar" fill className="object-cover" />
// //                  </div>
// //               </div>
              
// //               {isProfileOpen && (
// //                 <>
// //                   <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
// //                   <div className={`absolute right-0 mt-4 w-72 rounded-[2rem] p-6 shadow-2xl border z-20 animate-in fade-in zoom-in duration-200 ${darkMode ? "bg-[#0a0f1a] border-white/10" : "bg-white border-slate-200"}`}>
// //                     <div className="flex items-center gap-4 mb-6 border-b border-white/10 pb-4">
// //                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-orange-500 flex items-center justify-center font-black text-white text-xl">R</div>
// //                        <div>
// //                          <p className="font-black text-lg leading-none">Rashidul Islam</p>
// //                          <p className="text-xs text-red-500 font-bold mt-1">Premium Member</p>
// //                        </div>
// //                     </div>
// //                     <div className="space-y-2">
// //                       <button className="flex items-center gap-3 w-full p-3 hover:bg-red-500/10 rounded-xl transition-all font-bold text-sm"><User size={18}/> My Profile</button>
// //                       <button className="flex items-center gap-3 w-full p-3 hover:bg-red-500/10 rounded-xl transition-all font-bold text-sm"><Bookmark size={18}/> Bookmarks</button>
// //                       <button className="flex items-center gap-3 w-full p-3 hover:bg-red-500/10 rounded-xl transition-all font-bold text-sm"><Settings size={18}/> Settings</button>
// //                       <button className="flex items-center gap-3 w-full p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all font-bold text-sm mt-4 border-t border-white/5 pt-4"><LogOut size={18}/> Sign Out</button>
// //                     </div>
// //                   </div>
// //                 </>
// //               )}
// //             </div>
// //           </div>
// //         </div>
// //         <div className="h-1 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 transition-all duration-300" style={{ width: `${scrollProgress}%` }} />
// //       </header>

   

// //       {/* 📰 5. MAIN CONTENT LAYOUT (Big News with Neon Glow) */}
   
// //       <main className="max-w-[1600px] mx-auto px-6 py-8">
        
// //         {/* 🔥 MAIN BENTO HERO SECTION */}
// //         <div className="grid lg:grid-cols-4 lg:grid-rows-2 gap-6 h-auto lg:h-[700px]">
          
// //           {/* Main Big News */}
// //           <div className="lg:col-span-2 lg:row-span-2 relative group rounded-[2.5rem] overflow-hidden cursor-pointer shadow-2xl">
// //             <Image src="https://images.unsplash.com/photo-1516245834210-c4c142787335" alt="Hero" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
// //             <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
// //             <div className="absolute bottom-0 p-8 md:p-12">
// //                <span className="px-4 py-1.5 bg-red-600 text-[10px] font-black rounded-full mb-4 inline-block">এক্সক্লুসিভ</span>
// //                <h2 className="text-3xl md:text-5xl font-black leading-tight text-white group-hover:text-red-500 transition-colors">ডিজিটাল কারেন্সি নিয়ে বড় সিদ্ধান্ত নিচ্ছে সরকার</h2>
// //                <div className="flex items-center gap-6 mt-6 text-xs font-bold text-white/60">
// //                   <span className="flex items-center gap-2"><Clock size={14}/> ২ ঘণ্টা আগে</span>
// //                   <span className="flex items-center gap-2"><Eye size={14}/> ১২.৫ হাজার ভিউ</span>
// //                </div>
// //             </div>
// //           </div>

// //           {/* Side Card 1 */}
// //           <div className="lg:col-span-2 relative group rounded-[2.5rem] overflow-hidden cursor-pointer h-[300px] lg:h-full">
// //             <Image src="https://images.unsplash.com/photo-1526628953301-3e589a6a8b74" alt="Economy" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
// //             <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
// //             <div className="absolute bottom-0 p-8">
// //                <h3 className="text-2xl font-black text-white leading-tight">বিটকয়েন ও ক্রিপ্টো মার্কেটে নতুন অস্থিরতা</h3>
// //             </div>
// //           </div>

// //           {/* Small Bento 1 */}
// //           <div className="relative group rounded-[2.5rem] overflow-hidden cursor-pointer h-[300px] lg:h-full">
// //             <Image src="https://images.unsplash.com/photo-1511512578047-dfb367046420" alt="Tech" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
// //             <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
// //             <div className="absolute bottom-0 p-6">
// //                <h4 className="font-bold text-white">গেমিং ইন্ডাস্ট্রিতে আসছে বড় পরিবর্তন</h4>
// //             </div>
// //           </div>

// //           {/* Small Bento 2 */}
// //           <div className="relative group rounded-[2.5rem] overflow-hidden cursor-pointer h-[300px] lg:h-full bg-red-600 flex flex-col justify-center p-8">
// //              <Trophy size={48} className="text-white mb-4 animate-bounce" />
// //              <h4 className="text-2xl font-black text-white">ক্রীড়া জগত</h4>
// //              <p className="text-white/80 font-bold mt-2">সব খেলার সব আপডেট এক ক্লিকে পান এখানে।</p>
// //              <button className="mt-6 bg-white text-red-600 px-6 py-2 rounded-full font-black text-xs self-start hover:scale-105 transition-transform">সব দেখুন</button>
// //           </div>

// //         </div>

// //         {/* 📢 DYNAMIC FEED & TRENDING */}
// //         <div className="grid lg:grid-cols-12 gap-10 mt-20">
          
// //           {/* Latest News List */}
// //           <div className="lg:col-span-8 space-y-8">
// //             <div className="flex justify-between items-center border-b border-red-600/20 pb-4">
// //               <h3 className="text-3xl font-black italic">সর্বশেষ <span className="text-red-600">সংবাদ</span></h3>
// //               <button className="flex items-center gap-2 text-sm font-black opacity-50 hover:opacity-100 transition-opacity">আরও দেখুন <ArrowUpRight size={18}/></button>
// //             </div>

// //             {[1, 2, 3, 4].map((i) => (
// //               <div key={i} className="flex flex-col md:flex-row gap-6 p-6 rounded-[2rem] hover:bg-red-600/5 transition-all group cursor-pointer border border-transparent hover:border-red-600/10">
// //                 <div className="w-full md:w-64 h-44 relative rounded-[1.5rem] overflow-hidden">
// //                   <Image src={`https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=${i}`} alt="News" fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
// //                 </div>
// //                 <div className="flex-1 space-y-4">
// //                    <span className="text-red-600 font-black text-[10px] uppercase tracking-widest">আন্তর্জাতিক</span>
// //                    <h3 className="text-2xl font-black group-hover:text-red-500 transition-colors">মহাকাশ গবেষণায় নতুন ইতিহাস গড়ল নাসা, প্রাণের সন্ধানে বড় তথ্য</h3>
// //                    <p className="opacity-60 font-medium line-clamp-2">বিজ্ঞানীরা সম্প্রতি মঙ্গলের তলদেশে পানির বিশাল এক আধারের সন্ধান পেয়েছেন যা ভবিষ্যতে প্রাণের স্পন্দন বয়ে আনতে পারে...</p>
// //                    <div className="flex items-center gap-4 text-[10px] font-black opacity-40 uppercase">
// //                       <span>৫ ঘণ্টা আগে</span>
// //                       <span>২ মিনিট পড়ার সময়</span>
// //                    </div>
// //                 </div>
// //               </div>
// //             ))}
// //           </div>

// //           {/* Right Sidebar: Trending & Newsletter */}
// //           <div className="lg:col-span-4 space-y-10">
            
// //             {/* Trending Cards */}
// //             <div className={`p-10 rounded-[2.5rem] border ${darkMode ? "bg-slate-900/40 border-white/5" : "bg-white border-slate-200 shadow-xl"}`}>
// //                <h3 className="text-2xl font-black mb-8 flex items-center gap-4">
// //                   <Flame size={28} className="text-orange-500" /> আলোচিত খবর
// //                </h3>
// //                <div className="space-y-8">
// //                   {[1, 2, 3, 4, 5].map((n) => (
// //                     <div key={n} className="flex gap-4 group cursor-pointer border-b border-white/5 pb-4 last:border-0">
// //                        <span className="text-4xl font-black text-slate-500/10 group-hover:text-red-600 transition-all">{n}</span>
// //                        <h4 className="font-bold text-sm leading-tight group-hover:underline">বিশ্বরাজনীতিতে বাংলাদেশের শক্তিশালী অবস্থান, মোড় ঘুরছে কূটনীতির...</h4>
// //                     </div>
// //                   ))}
// //                </div>
// //             </div>

// //             {/* Newsletter */}
// //             <div className="relative p-10 rounded-[2.5rem] bg-gradient-to-br from-red-600 to-orange-500 text-white overflow-hidden group shadow-[0_20px_50px_rgba(220,38,38,0.3)]">
// //                <Newspaper className="absolute -bottom-10 -right-10 text-white/10 rotate-12" size={200} />
// //                <h4 className="text-3xl font-black mb-4 relative z-10 leading-none">সবার আগে খবর চান?</h4>
// //                <p className="text-white/80 text-sm mb-8 font-medium relative z-10">আপনার ইমেইল দিয়ে সাবস্ক্রাইব করে রাখুন।</p>
// //                <input type="email" placeholder="আপনার ইমেইল" className="w-full bg-white/20 border border-white/30 rounded-2xl px-6 py-4 text-white placeholder:text-white/60 outline-none focus:bg-white/30 transition-all mb-4 relative z-10" />
// //                <button className="w-full bg-white text-red-600 font-black py-4 rounded-2xl hover:bg-black hover:text-white transition-all uppercase text-xs tracking-widest relative z-10">যুক্ত হোন</button>
// //             </div>

// //           </div>
// //         </div>
// //       </main>





// //          {/* 📽️ 4. VIDEO LIVE STUDIO */}
// //       <section className="max-w-screen-2xl mx-auto px-6 pt-10">
// //         <div className="flex justify-between items-center mb-6">
// //           <h3 className="text-xl font-black flex items-center gap-3 italic">
// //              <Camera className="text-red-600 animate-pulse" /> Rashidul Studio <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-lg not-italic shadow-lg shadow-red-600/30">LIVE</span>
// //           </h3>
// //         </div>
// //         <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
// //            {[1, 2, 3, 4, 5].map(i => (
// //              <div key={i} className="min-w-[320px] group relative rounded-[2.5rem] overflow-hidden aspect-video bg-slate-900 border border-white/5 cursor-pointer shadow-2xl hover:scale-[1.02] transition-transform">
// //                 <Image src={`https://images.unsplash.com/photo-1485846234645-a62644f84728?q=${i}`} alt="vid" fill className="object-cover opacity-50 group-hover:opacity-100 transition-opacity" />
// //                 <div className="absolute inset-0 flex items-center justify-center">
// //                    <div className="p-4 bg-white/20 backdrop-blur-xl rounded-full border border-white/30 group-hover:scale-125 transition-transform shadow-2xl">
// //                       <PlayCircle className="text-white fill-white/20" size={36} />
// //                    </div>
// //                 </div>
// //                 <div className="absolute bottom-6 left-6 right-6">
// //                    <p className="text-sm font-black text-white leading-tight drop-shadow-lg">সিরাজগঞ্জে নতুন মেগা প্রজেক্টের কাজ শুরু...</p>
// //                 </div>
// //              </div>
// //            ))}
// //         </div>
// //       </section>




// //       {/* 🏁 MODERN FOOTER */}
// //       <footer className={`mt-32 pt-24 pb-12 border-t ${darkMode ? "bg-black border-white/5" : "bg-slate-100 border-slate-200"}`}>
// //          <div className="max-w-[1600px] mx-auto px-6 grid md:grid-cols-4 gap-20">
// //             <div className="col-span-2 space-y-10">
// //                <h2 className="text-6xl font-black italic tracking-tighter italic">
// //                  <span className="text-red-600">RASHIDUL</span> PORTAL
// //                </h2>
// //                <div className="flex gap-6">
// //                   {[Facebook, Youtube, Share2, Globe].map((Icon, i) => (
// //                     <button key={i} className="w-14 h-14 rounded-2xl bg-red-600/10 flex items-center justify-center text-red-600 hover:bg-red-600 hover:text-white transition-all transform hover:-translate-y-3">
// //                       <Icon size={24} />
// //                     </button>
// //                   ))}
// //                </div>
// //                <p className="text-slate-500 font-bold max-w-sm">সত্যের সন্ধানে এবং নিরপেক্ষ সাংবাদিকতায় আমরা সর্বদা অগ্রগামী। আমাদের সাথে যুক্ত থাকুন।</p>
// //             </div>
// //             <div className="space-y-8">
// //                <h5 className="font-black text-xs uppercase tracking-widest text-red-600">কুইক লিঙ্কস</h5>
// //                <ul className="space-y-4 font-bold opacity-60">
// //                   <li className="hover:text-red-600 cursor-pointer">জাতীয় খবর</li>
// //                   <li className="hover:text-red-600 cursor-pointer">টেক নিউজ</li>
// //                   <li className="hover:text-red-600 cursor-pointer">লাইভ টিভি</li>
// //                </ul>
// //             </div>
// //             <div className="space-y-8">
// //                <h5 className="font-black text-xs uppercase tracking-widest text-red-600">যোগাযোগ</h5>
// //                <ul className="space-y-4 font-bold opacity-60 text-sm">
// //                   <li>সিরাজগঞ্জ সদর, বাংলাদেশ</li>
// //                   <li>Email: contact@rashidul.com</li>
// //                   <li>Phone: +৮৮০ ১২৩৪ ৫৬৭৮৯০</li>
// //                </ul>
// //             </div>
// //          </div>
// //          <div className="text-center mt-32 text-[10px] font-black uppercase tracking-[1em] opacity-20">
// //             © 2026 RASHIDUL PORTAL | All Rights Reserved
// //          </div>
// //       </footer>

// //       {/* ✨ CSS ANIMATIONS */}
// //       <style jsx global>{`
// //         @keyframes marquee-fast {
// //           0% { transform: translateX(100%); }
// //           100% { transform: translateX(-100%); }
// //         }
// //         .animate-marquee-fast {
// //           animation: marquee-fast 30s linear infinite;
// //         }
// //         ::-webkit-scrollbar {
// //           width: 6px;
// //         }
// //         ::-webkit-scrollbar-thumb {
// //           background: #ef4444;
// //           border-radius: 10px;
// //         }
// //         .scrollbar-hide::-webkit-scrollbar {
// //           display: none;
// //         }
// //       `}</style>


// //     </div>
// //   );
// // }










// // "use client";

// // import React, { useState, useEffect } from "react";
// // import Image from "next/image";
// // import { 
// //   Clock, TrendingUp, Search, Menu, User, 
// //   Moon, Sun, Bell, Zap, ChevronRight, X, 
// //   Settings, LogOut, Bookmark, Facebook, Youtube, Share2,
// //   Globe, PlayCircle, Eye, Flame, Newspaper, Radio, ArrowUpRight,
// //   MapPin, Calendar, Camera, Trophy, ChevronLeft
// // } from "lucide-react";

// // const CATEGORIES = ["জাতীয়", "আন্তর্জাতিক", "খেলা", "প্রযুক্তি", "বিনোদন", "জীবনযাত্রা", "বিজ্ঞান"];

// // export default function RashidulPremiumNews() {
// //   const [mounted, setMounted] = useState(false);
// //   const [darkMode, setDarkMode] = useState(true);
// //   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
// //   const [isProfileOpen, setIsProfileOpen] = useState(false);
// //   const [scrollProgress, setScrollProgress] = useState(0);

// //   useEffect(() => {
// //     setMounted(true);
// //     const handleScroll = () => {
// //       const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
// //       setScrollProgress((window.scrollY / height) * 100);
// //     };
// //     window.addEventListener("scroll", handleScroll);
// //     return () => window.removeEventListener("scroll", handleScroll);
// //   }, []);

// //   if (!mounted) return null;

// //   return (
// //     <div className={`min-h-screen transition-all duration-700 ${darkMode ? "bg-[#05070a] text-slate-100" : "bg-gray-50 text-slate-900"}`}>
      
// //       {/* 🚀 SIDEBAR NAVIGATION */}
// //       <div className={`fixed inset-0 z-[100] transition-all duration-500 ${isSidebarOpen ? "visible opacity-100" : "invisible opacity-0"}`}>
// //         <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setIsSidebarOpen(false)} />
// //         <div className={`absolute top-0 left-0 h-full w-80 shadow-2xl transition-transform duration-500 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} ${darkMode ? "bg-[#0a0f1a]" : "bg-white"}`}>
// //           <div className="p-8 flex justify-between items-center border-b border-white/5">
// //             <h2 className="font-black text-2xl tracking-tighter text-red-600">বিভাগসমূহ</h2>
// //             <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:rotate-90 transition-transform"><X size={28}/></button>
// //           </div>
// //           <div className="p-8 space-y-4">
// //             {CATEGORIES.map((cat) => (
// //               <a key={cat} href="#" className="flex items-center justify-between text-lg font-bold hover:text-red-500 hover:translate-x-2 transition-all">
// //                 {cat} <ChevronRight size={18}/>
// //               </a>
// //             ))}
// //           </div>
// //         </div>
// //       </div>

// //       {/* 🟢 TOP GLASS NAVBAR */}
// //       <header className={`sticky top-0 z-50 backdrop-blur-md border-b transition-all duration-500 ${darkMode ? "bg-black/60 border-white/5" : "bg-white/80 border-slate-200"}`}>
// //         <div className="max-w-[1600px] mx-auto px-6 h-20 flex justify-between items-center">
          
// //           <div className="flex items-center gap-6">
// //             <button onClick={() => setIsSidebarOpen(true)} className="p-3 rounded-2xl bg-red-600/10 text-red-600 hover:bg-red-600 hover:text-white transition-all">
// //               <Menu size={24} />
// //             </button>
// //             <div className="hidden lg:flex items-center gap-4 text-[10px] font-black tracking-widest uppercase opacity-50">
// //                <span className="flex items-center gap-2"><MapPin size={12}/> সিরাজগঞ্জ</span>
// //                <span className="w-1 h-1 bg-red-600 rounded-full"></span>
// //                <span>{new Date().toLocaleDateString('bn-BD', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
// //             </div>
// //           </div>

// //           <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter">
// //             <span className="text-red-600">RASHIDUL</span>
// //             <span className={darkMode ? "text-white" : "text-black"}> PORTAL</span>
// //           </h1>

// //           <div className="flex items-center gap-4">
// //             <button onClick={() => setDarkMode(!darkMode)} className={`p-3 rounded-2xl ${darkMode ? "bg-slate-800 text-yellow-400" : "bg-slate-100 text-slate-800"} hover:scale-110 transition-all`}>
// //               {darkMode ? <Sun size={22} /> : <Moon size={22} />}
// //             </button>
            
// //             <div className="relative">
// //                <div onClick={() => setIsProfileOpen(!isProfileOpen)} className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-red-600 to-orange-500 p-[2px] cursor-pointer">
// //                   <div className="w-full h-full rounded-[14px] bg-black overflow-hidden relative">
// //                     <Image src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde" alt="User" fill className="object-cover" />
// //                   </div>
// //                </div>
// //                {isProfileOpen && (
// //                  <div className={`absolute right-0 mt-4 w-64 rounded-3xl p-6 border shadow-2xl z-[60] animate-in fade-in slide-in-from-top-4 ${darkMode ? "bg-[#0a0f1a] border-white/10" : "bg-white border-slate-200"}`}>
// //                     <p className="font-black mb-4">রশিদুল ইসলাম</p>
// //                     <div className="space-y-3">
// //                       <button className="flex items-center gap-3 w-full text-sm font-bold opacity-70 hover:opacity-100 transition-opacity"><User size={16}/> প্রোফাইল</button>
// //                       <button className="flex items-center gap-3 w-full text-sm font-bold opacity-70 hover:opacity-100 transition-opacity"><Bookmark size={16}/> সেভ করা খবর</button>
// //                       <button className="flex items-center gap-3 w-full text-sm font-bold text-red-500 border-t border-white/5 pt-3 mt-3"><LogOut size={16}/> লগ আউট</button>
// //                     </div>
// //                  </div>
// //                )}
// //             </div>
// //           </div>
// //         </div>
// //         {/* Progress bar */}
// //         <div className="h-[2px] bg-red-600 transition-all duration-300" style={{ width: `${scrollProgress}%` }} />
// //       </header>

// //       {/* 🔴 BREAKING NEWS TICKER */}
// //       <div className="bg-red-600 text-white py-2 overflow-hidden flex items-center">
// //         <div className="px-6 font-black uppercase text-xs italic bg-red-700 h-full py-2 z-10 flex items-center gap-2">
// //           <Zap size={14} className="animate-bounce" /> ব্রেকিং:
// //         </div>
// //         <div className="flex animate-marquee-fast whitespace-nowrap gap-12 text-sm font-bold">
// //            <span>বাংলাদেশ ফুটবল দলের নতুন জয়, সাফ চ্যাম্পিয়নশিপে ইতিহাস!</span>
// //            <span>প্রযুক্তিতে নতুন মাইলফলক, সিরাজগঞ্জে চালু হচ্ছে রোবটিক ল্যাব।</span>
// //            <span>শেয়ার বাজারে বড় ধরনের উত্থান, বিনিয়োগকারীদের মুখে হাসি।</span>
// //         </div>
// //       </div>

// //       <main className="max-w-[1600px] mx-auto px-6 py-8">
        
// //         {/* 🔥 MAIN BENTO HERO SECTION */}
// //         <div className="grid lg:grid-cols-4 lg:grid-rows-2 gap-6 h-auto lg:h-[700px]">
          
// //           {/* Main Big News */}
// //           <div className="lg:col-span-2 lg:row-span-2 relative group rounded-[2.5rem] overflow-hidden cursor-pointer shadow-2xl">
// //             <Image src="https://images.unsplash.com/photo-1516245834210-c4c142787335" alt="Hero" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
// //             <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
// //             <div className="absolute bottom-0 p-8 md:p-12">
// //                <span className="px-4 py-1.5 bg-red-600 text-[10px] font-black rounded-full mb-4 inline-block">এক্সক্লুসিভ</span>
// //                <h2 className="text-3xl md:text-5xl font-black leading-tight text-white group-hover:text-red-500 transition-colors">ডিজিটাল কারেন্সি নিয়ে বড় সিদ্ধান্ত নিচ্ছে সরকার</h2>
// //                <div className="flex items-center gap-6 mt-6 text-xs font-bold text-white/60">
// //                   <span className="flex items-center gap-2"><Clock size={14}/> ২ ঘণ্টা আগে</span>
// //                   <span className="flex items-center gap-2"><Eye size={14}/> ১২.৫ হাজার ভিউ</span>
// //                </div>
// //             </div>
// //           </div>

// //           {/* Side Card 1 */}
// //           <div className="lg:col-span-2 relative group rounded-[2.5rem] overflow-hidden cursor-pointer h-[300px] lg:h-full">
// //             <Image src="https://images.unsplash.com/photo-1526628953301-3e589a6a8b74" alt="Economy" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
// //             <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
// //             <div className="absolute bottom-0 p-8">
// //                <h3 className="text-2xl font-black text-white leading-tight">বিটকয়েন ও ক্রিপ্টো মার্কেটে নতুন অস্থিরতা</h3>
// //             </div>
// //           </div>

// //           {/* Small Bento 1 */}
// //           <div className="relative group rounded-[2.5rem] overflow-hidden cursor-pointer h-[300px] lg:h-full">
// //             <Image src="https://images.unsplash.com/photo-1511512578047-dfb367046420" alt="Tech" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
// //             <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
// //             <div className="absolute bottom-0 p-6">
// //                <h4 className="font-bold text-white">গেমিং ইন্ডাস্ট্রিতে আসছে বড় পরিবর্তন</h4>
// //             </div>
// //           </div>

// //           {/* Small Bento 2 */}
// //           <div className="relative group rounded-[2.5rem] overflow-hidden cursor-pointer h-[300px] lg:h-full bg-red-600 flex flex-col justify-center p-8">
// //              <Trophy size={48} className="text-white mb-4 animate-bounce" />
// //              <h4 className="text-2xl font-black text-white">ক্রীড়া জগত</h4>
// //              <p className="text-white/80 font-bold mt-2">সব খেলার সব আপডেট এক ক্লিকে পান এখানে।</p>
// //              <button className="mt-6 bg-white text-red-600 px-6 py-2 rounded-full font-black text-xs self-start hover:scale-105 transition-transform">সব দেখুন</button>
// //           </div>

// //         </div>

// //         {/* 📢 DYNAMIC FEED & TRENDING */}
// //         <div className="grid lg:grid-cols-12 gap-10 mt-20">
          
// //           {/* Latest News List */}
// //           <div className="lg:col-span-8 space-y-8">
// //             <div className="flex justify-between items-center border-b border-red-600/20 pb-4">
// //               <h3 className="text-3xl font-black italic">সর্বশেষ <span className="text-red-600">সংবাদ</span></h3>
// //               <button className="flex items-center gap-2 text-sm font-black opacity-50 hover:opacity-100 transition-opacity">আরও দেখুন <ArrowUpRight size={18}/></button>
// //             </div>

// //             {[1, 2, 3, 4].map((i) => (
// //               <div key={i} className="flex flex-col md:flex-row gap-6 p-6 rounded-[2rem] hover:bg-red-600/5 transition-all group cursor-pointer border border-transparent hover:border-red-600/10">
// //                 <div className="w-full md:w-64 h-44 relative rounded-[1.5rem] overflow-hidden">
// //                   <Image src={`https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=${i}`} alt="News" fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
// //                 </div>
// //                 <div className="flex-1 space-y-4">
// //                    <span className="text-red-600 font-black text-[10px] uppercase tracking-widest">আন্তর্জাতিক</span>
// //                    <h3 className="text-2xl font-black group-hover:text-red-500 transition-colors">মহাকাশ গবেষণায় নতুন ইতিহাস গড়ল নাসা, প্রাণের সন্ধানে বড় তথ্য</h3>
// //                    <p className="opacity-60 font-medium line-clamp-2">বিজ্ঞানীরা সম্প্রতি মঙ্গলের তলদেশে পানির বিশাল এক আধারের সন্ধান পেয়েছেন যা ভবিষ্যতে প্রাণের স্পন্দন বয়ে আনতে পারে...</p>
// //                    <div className="flex items-center gap-4 text-[10px] font-black opacity-40 uppercase">
// //                       <span>৫ ঘণ্টা আগে</span>
// //                       <span>২ মিনিট পড়ার সময়</span>
// //                    </div>
// //                 </div>
// //               </div>
// //             ))}
// //           </div>

// //           {/* Right Sidebar: Trending & Newsletter */}
// //           <div className="lg:col-span-4 space-y-10">
            
// //             {/* Trending Cards */}
// //             <div className={`p-10 rounded-[2.5rem] border ${darkMode ? "bg-slate-900/40 border-white/5" : "bg-white border-slate-200 shadow-xl"}`}>
// //                <h3 className="text-2xl font-black mb-8 flex items-center gap-4">
// //                   <Flame size={28} className="text-orange-500" /> আলোচিত খবর
// //                </h3>
// //                <div className="space-y-8">
// //                   {[1, 2, 3, 4, 5].map((n) => (
// //                     <div key={n} className="flex gap-4 group cursor-pointer border-b border-white/5 pb-4 last:border-0">
// //                        <span className="text-4xl font-black text-slate-500/10 group-hover:text-red-600 transition-all">{n}</span>
// //                        <h4 className="font-bold text-sm leading-tight group-hover:underline">বিশ্বরাজনীতিতে বাংলাদেশের শক্তিশালী অবস্থান, মোড় ঘুরছে কূটনীতির...</h4>
// //                     </div>
// //                   ))}
// //                </div>
// //             </div>

// //             {/* Newsletter */}
// //             <div className="relative p-10 rounded-[2.5rem] bg-gradient-to-br from-red-600 to-orange-500 text-white overflow-hidden group shadow-[0_20px_50px_rgba(220,38,38,0.3)]">
// //                <Newspaper className="absolute -bottom-10 -right-10 text-white/10 rotate-12" size={200} />
// //                <h4 className="text-3xl font-black mb-4 relative z-10 leading-none">সবার আগে খবর চান?</h4>
// //                <p className="text-white/80 text-sm mb-8 font-medium relative z-10">আপনার ইমেইল দিয়ে সাবস্ক্রাইব করে রাখুন।</p>
// //                <input type="email" placeholder="আপনার ইমেইল" className="w-full bg-white/20 border border-white/30 rounded-2xl px-6 py-4 text-white placeholder:text-white/60 outline-none focus:bg-white/30 transition-all mb-4 relative z-10" />
// //                <button className="w-full bg-white text-red-600 font-black py-4 rounded-2xl hover:bg-black hover:text-white transition-all uppercase text-xs tracking-widest relative z-10">যুক্ত হোন</button>
// //             </div>

// //           </div>
// //         </div>
// //       </main>

// //       {/* 🏁 MODERN FOOTER */}
// //       <footer className={`mt-32 pt-24 pb-12 border-t ${darkMode ? "bg-black border-white/5" : "bg-slate-100 border-slate-200"}`}>
// //          <div className="max-w-[1600px] mx-auto px-6 grid md:grid-cols-4 gap-20">
// //             <div className="col-span-2 space-y-10">
// //                <h2 className="text-6xl font-black italic tracking-tighter italic">
// //                  <span className="text-red-600">RASHIDUL</span> PORTAL
// //                </h2>
// //                <div className="flex gap-6">
// //                   {[Facebook, Youtube, Share2, Globe].map((Icon, i) => (
// //                     <button key={i} className="w-14 h-14 rounded-2xl bg-red-600/10 flex items-center justify-center text-red-600 hover:bg-red-600 hover:text-white transition-all transform hover:-translate-y-3">
// //                       <Icon size={24} />
// //                     </button>
// //                   ))}
// //                </div>
// //                <p className="text-slate-500 font-bold max-w-sm">সত্যের সন্ধানে এবং নিরপেক্ষ সাংবাদিকতায় আমরা সর্বদা অগ্রগামী। আমাদের সাথে যুক্ত থাকুন।</p>
// //             </div>
// //             <div className="space-y-8">
// //                <h5 className="font-black text-xs uppercase tracking-widest text-red-600">কুইক লিঙ্কস</h5>
// //                <ul className="space-y-4 font-bold opacity-60">
// //                   <li className="hover:text-red-600 cursor-pointer">জাতীয় খবর</li>
// //                   <li className="hover:text-red-600 cursor-pointer">টেক নিউজ</li>
// //                   <li className="hover:text-red-600 cursor-pointer">লাইভ টিভি</li>
// //                </ul>
// //             </div>
// //             <div className="space-y-8">
// //                <h5 className="font-black text-xs uppercase tracking-widest text-red-600">যোগাযোগ</h5>
// //                <ul className="space-y-4 font-bold opacity-60 text-sm">
// //                   <li>সিরাজগঞ্জ সদর, বাংলাদেশ</li>
// //                   <li>Email: contact@rashidul.com</li>
// //                   <li>Phone: +৮৮০ ১২৩৪ ৫৬৭৮৯০</li>
// //                </ul>
// //             </div>
// //          </div>
// //          <div className="text-center mt-32 text-[10px] font-black uppercase tracking-[1em] opacity-20">
// //             © 2026 RASHIDUL PORTAL | All Rights Reserved
// //          </div>
// //       </footer>

// //       {/* ✨ CSS ANIMATIONS */}
// //       <style jsx global>{`
// //         @keyframes marquee-fast {
// //           0% { transform: translateX(100%); }
// //           100% { transform: translateX(-100%); }
// //         }
// //         .animate-marquee-fast {
// //           animation: marquee-fast 30s linear infinite;
// //         }
// //         ::-webkit-scrollbar {
// //           width: 6px;
// //         }
// //         ::-webkit-scrollbar-thumb {
// //           background: #ef4444;
// //           border-radius: 10px;
// //         }
// //         .scrollbar-hide::-webkit-scrollbar {
// //           display: none;
// //         }
// //       `}</style>
// //     </div>
// //   );
// // }










// // "use client";

// // import React, { useState, useEffect } from "react";
// // import Image from "next/image";
// // import { 
// //   Clock, TrendingUp, Search, Menu, User, 
// //   Moon, Sun, Bell, Zap, ChevronRight, X, 
// //   Settings, LogOut, Bookmark, Facebook, Youtube, Share2,
// //   Globe, PlayCircle, Eye, Flame, Newspaper, Radio, ArrowUpRight,
// //   MapPin, Calendar, Camera
// // } from "lucide-react";

// // const CATEGORIES = ["জাতীয়", "আন্তর্জাতিক", "খেলা", "প্রযুক্তি", "অর্থনীতি", "স্বাস্থ্য", "বিজ্ঞান"];

// // export default function RashidulMegaPortal() {
// //   const [mounted, setMounted] = useState(false);
// //   const [darkMode, setDarkMode] = useState(true);
// //   const [currentTime, setCurrentTime] = useState(new Date());
// //   const [scrollProgress, setScrollProgress] = useState(0);
  
// //   // New States for Sidebar and Profile
// //   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
// //   const [isProfileOpen, setIsProfileOpen] = useState(false);

// //   useEffect(() => {
// //     setMounted(true);
// //     const timer = setInterval(() => setCurrentTime(new Date()), 1000);
// //     const handleScroll = () => {
// //       const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
// //       setScrollProgress((window.scrollY / height) * 100);
// //     };
// //     window.addEventListener("scroll", handleScroll);
// //     return () => {
// //       clearInterval(timer);
// //       window.removeEventListener("scroll", handleScroll);
// //     };
// //   }, []);

// //   if (!mounted) return null;

// //   const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
// //   const formattedDate = currentTime.toLocaleDateString('bn-BD', options);
// //   const formattedTime = currentTime.toLocaleTimeString('bn-BD');

// //   return (
// //     <div className={`min-h-screen transition-all duration-700 ${darkMode ? "bg-[#03060d] text-slate-100" : "bg-gray-50 text-slate-900"}`}>
      
// //       {/* 🟢 SIDEBAR OVERLAY */}
// //       <div className={`fixed inset-0 z-[100] transition-all duration-500 ${isSidebarOpen ? "visible opacity-100" : "invisible opacity-0"}`}>
// //         <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
// //         <div className={`absolute top-0 left-0 h-full w-80 shadow-2xl transition-transform duration-500 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} ${darkMode ? "bg-[#0a0f1a]" : "bg-white"}`}>
// //           <div className="p-6 flex justify-between items-center border-b border-white/10">
// //             <h2 className="font-black text-xl text-red-600">MENU</h2>
// //             <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-red-500/10 rounded-full text-red-500"><X size={24}/></button>
// //           </div>
// //           <nav className="p-6 space-y-4">
// //             {CATEGORIES.map(cat => (
// //               <a key={cat} href="#" className="flex items-center justify-between group py-2 font-bold hover:text-red-500 transition-colors">
// //                 {cat} <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-all"/>
// //               </a>
// //             ))}
// //             <div className="pt-6 border-t border-white/10">
// //                <button className="flex items-center gap-3 w-full p-3 rounded-xl bg-red-600 text-white font-bold"><Radio size={18}/> Live TV</button>
// //             </div>
// //           </nav>
// //         </div>
// //       </div>

// //       {/* 🚀 1. TOP DYNAMIC INFO BAR */}
// //       <div className={`py-2 px-6 border-b text-[10px] font-bold uppercase tracking-widest ${darkMode ? "bg-black/40 border-white/5 text-slate-400" : "bg-white border-slate-200 text-slate-600"}`}>
// //         <div className="max-w-screen-2xl mx-auto flex justify-between items-center">
// //           <div className="flex items-center gap-6">
// //             <span className="flex items-center gap-2 text-red-500"><MapPin size={12}/> সিরাজগঞ্জ, বাংলাদেশ</span>
// //             <span className="hidden md:flex items-center gap-2"><Calendar size={12}/> {formattedDate}</span>
// //           </div>
// //           <div className="flex items-center gap-4">
// //             <span className="flex items-center gap-2 bg-red-600/10 text-red-500 px-3 py-1 rounded-full"><Clock size={12}/> {formattedTime}</span>
// //           </div>
// //         </div>
// //       </div>

// //       {/* 🔴 2. BREAKING NEWS MARQUEE */}
// //       <div className="bg-red-600 py-2 overflow-hidden border-b border-red-500">
// //         <div className="flex animate-marquee-fast whitespace-nowrap gap-12 items-center text-[11px] font-black uppercase text-white">
// //           {[1, 2].map(i => (
// //             <div key={i} className="flex gap-16">
// //               <span className="flex items-center gap-2"><Zap size={14} className="fill-yellow-300"/> ব্রেকিং: ২০২৬ বিশ্বকাপে সরাসরি খেলবে বাংলাদেশ</span>
// //               <span className="flex items-center gap-2 underline">Rashidul Official: সত্যের সন্ধানে সর্বদা</span>
// //             </div>
// //           ))}
// //         </div>
// //       </div>

// //       {/* 🟢 3. MAIN STICKY HEADER */}
// //       <header className={`sticky top-0 z-50 backdrop-blur-3xl border-b transition-all duration-500 ${darkMode ? "bg-black/60 border-white/10" : "bg-white/80 border-slate-200"}`}>
// //         <div className="max-w-screen-2xl mx-auto px-6 h-20 flex justify-between items-center">
// //           <div className="flex items-center gap-8">
// //             <button 
// //               onClick={() => setIsSidebarOpen(true)}
// //               className="p-3 bg-gradient-to-tr from-red-600 to-orange-500 rounded-2xl shadow-lg text-white hover:scale-110 active:scale-95 transition-all">
// //               <Menu size={24} />
// //             </button>
// //             <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter cursor-pointer">
// //               <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500">RASHIDUL</span>
// //               <span className={darkMode ? "text-white" : "text-black"}> News</span>
// //             </h1>
// //           </div>

// //           <nav className="hidden xl:flex items-center gap-8 font-black text-xs uppercase opacity-80">
// //             {CATEGORIES.map(c => <a key={c} href="#" className="hover:text-red-500 transition-all">{c}</a>)}
// //           </nav>

// //           <div className="flex items-center gap-4">
// //             <button onClick={() => setDarkMode(!darkMode)} className={`p-3 rounded-2xl transition-all ${darkMode ? "bg-slate-800 text-yellow-400" : "bg-slate-100 text-slate-800"}`}>
// //               {darkMode ? <Sun size={22} /> : <Moon size={22} />}
// //             </button>
            
// //             {/* PROFILE SECTION */}
// //             <div className="relative">
// //               <div 
// //                 onClick={() => setIsProfileOpen(!isProfileOpen)}
// //                 className="relative p-1 rounded-2xl bg-gradient-to-br from-red-600 to-orange-500 cursor-pointer group active:scale-90 transition-transform">
// //                 <div className="w-10 h-10 rounded-xl overflow-hidden relative">
// //                   <Image src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde" alt="Avatar" fill className="object-cover" />
// //                 </div>
// //               </div>

// //               {/* PROFILE DROPDOWN MENU */}
// //               {isProfileOpen && (
// //                 <>
// //                   <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)}></div>
// //                   <div className={`absolute right-0 mt-4 w-64 rounded-3xl p-4 shadow-2xl border z-20 ${darkMode ? "bg-[#0a0f1a] border-white/10" : "bg-white border-slate-200"}`}>
// //                     <div className="flex items-center gap-3 p-2 border-b border-white/10 mb-2">
// //                        <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center font-bold">R</div>
// //                        <div>
// //                          <p className="text-sm font-black">Rashidul Islam</p>
// //                          <p className="text-[10px] opacity-50">Admin Account</p>
// //                        </div>
// //                     </div>
// //                     <button className="flex items-center gap-3 w-full p-3 hover:bg-red-500/10 rounded-xl transition-colors text-sm font-bold"><Settings size={18}/> Settings</button>
// //                     <button className="flex items-center gap-3 w-full p-3 hover:bg-red-500/10 rounded-xl transition-colors text-sm font-bold"><Bookmark size={18}/> Saved News</button>
// //                     <button className="flex items-center gap-3 w-full p-3 hover:bg-red-500/10 rounded-xl transition-colors text-sm font-bold text-red-500 mt-2 border-t border-white/10"><LogOut size={18}/> Logout</button>
// //                   </div>
// //                 </>
// //               )}
// //             </div>
// //           </div>
// //         </div>
// //         <div className="h-1 bg-gradient-to-r from-red-600 via-yellow-500 to-blue-600 transition-all" style={{ width: `${scrollProgress}%` }} />
// //       </header>

// //       {/* Rest of your Main Content and Footer remains the same... */}
// //       <main className="max-w-screen-2xl mx-auto px-6 py-10">
// //          <h2 className="text-center opacity-50 italic">Scroll down to see content...</h2>
// //          {/* Your existing sections go here */}
// //       </main>

// //       <style jsx global>{`
// //         @keyframes marquee-fast {
// //           0% { transform: translateX(0); }
// //           100% { transform: translateX(-50%); }
// //         }
// //         .animate-marquee-fast {
// //           animation: marquee-fast 30s linear infinite;
// //         }
// //       `}</style>
// //     </div>
// //   );
// // }






// // "use client";

// // import React, { useState, useEffect } from "react";
// // import Image from "next/image";
// // import { 
// //   Clock, TrendingUp, Search, Menu, User, 
// //   Moon, Sun, Bell, Zap, ChevronRight, X, 
// //   Settings, LogOut, Bookmark, Facebook, Youtube, Share2,
// //   Globe, PlayCircle, Eye, Flame, Newspaper, Radio, ArrowUpRight,
// //   MapPin, Calendar, Camera
// // } from "lucide-react";

// // const CATEGORIES = ["জাতীয়", "আন্তর্জাতিক", "খেলা", "প্রযুক্তি", "অর্থনীতি", "স্বাস্থ্য", "বিজ্ঞান"];

// // export default function RashidulMegaPortal() {
// //   const [mounted, setMounted] = useState(false);
// //   const [darkMode, setDarkMode] = useState(true);
// //   const [currentTime, setCurrentTime] = useState(new Date());
// //   const [scrollProgress, setScrollProgress] = useState(0);

// //   // Time and Date Update
// //   useEffect(() => {
// //     setMounted(true);
// //     const timer = setInterval(() => setCurrentTime(new Date()), 1000);
// //     const handleScroll = () => {
// //       const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
// //       setScrollProgress((window.scrollY / height) * 100);
// //     };
// //     window.addEventListener("scroll", handleScroll);
// //     return () => {
// //       clearInterval(timer);
// //       window.removeEventListener("scroll", handleScroll);
// //     };
// //   }, []);

// //   if (!mounted) return null;

// //   // Bengali Date Formatting Logic
// //   const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
// //   const formattedDate = currentTime.toLocaleDateString('bn-BD', options);
// //   const formattedTime = currentTime.toLocaleTimeString('bn-BD');

// //   return (
// //     <div className={`min-h-screen transition-all duration-700 ${darkMode ? "bg-[#03060d] text-slate-100" : "bg-gray-50 text-slate-900"}`}>
      
// //       {/* 🚀 1. TOP DYNAMIC INFO BAR (Location & Date) */}
// //       <div className={`py-2 px-6 border-b text-[10px] font-bold uppercase tracking-widest ${darkMode ? "bg-black/40 border-white/5 text-slate-400" : "bg-white border-slate-200 text-slate-600"}`}>
// //         <div className="max-w-screen-2xl mx-auto flex justify-between items-center">
// //           <div className="flex items-center gap-6">
// //             <span className="flex items-center gap-2 text-red-500"><MapPin size={12}/> সিরাজগঞ্জ, বাংলাদেশ</span>
// //             <span className="hidden md:flex items-center gap-2"><Calendar size={12}/> {formattedDate}</span>
// //           </div>
// //           <div className="flex items-center gap-4">
// //             <span className="flex items-center gap-2 bg-red-600/10 text-red-500 px-3 py-1 rounded-full"><Clock size={12}/> {formattedTime}</span>
// //             <span className="hidden lg:block text-green-500 animate-pulse">● LIVE UPDATE</span>
// //           </div>
// //         </div>
// //       </div>

// //       {/* 🔴 2. MULTI-LAYER TOP MARQUEE */}
// //       <div className="bg-red-600 py-2 overflow-hidden border-b border-red-500 shadow-xl">
// //         <div className="flex animate-marquee-fast whitespace-nowrap gap-12 items-center text-[11px] font-black uppercase text-white tracking-[0.2em]">
// //           {[1, 2, 3].map(i => (
// //             <div key={i} className="flex gap-16">
// //               <span className="flex items-center gap-2"><Zap size={14} className="fill-yellow-300"/> ব্রেকিং: ২০২৬ বিশ্বকাপে সরাসরি খেলবে বাংলাদেশ</span>
// //               <span className="flex items-center gap-2 underline">নির্ভীক সাংবাদিকতা - সত্যের সন্ধানে সর্বদা আমরা</span>
// //               <span className="flex items-center gap-2"><ArrowUpRight size={14} className="text-green-300"/> ইউএস ডলার আজ ১১৮.৪০ ৳</span>
// //               <span className="flex items-center gap-2 bg-black/20 px-4 py-1 rounded-full uppercase">Exclusive by Rashidul Official</span>
// //             </div>
// //           ))}
// //         </div>
// //       </div>

// //       {/* 🟢 3. MAIN STICKY HEADER */}
// //       <header className={`sticky top-0 z-50 backdrop-blur-3xl border-b transition-all duration-500 ${darkMode ? "bg-black/60 border-white/10" : "bg-white/80 border-slate-200"}`}>
// //         <div className="max-w-screen-2xl mx-auto px-6 h-20 flex justify-between items-center">
// //           <div className="flex items-center gap-8">
// //             <button className="p-3 bg-gradient-to-tr from-red-600 to-orange-500 rounded-2xl shadow-lg shadow-red-600/30 text-white hover:rotate-90 transition-all duration-500">
// //               <Menu size={24} />
// //             </button>
// //             <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter cursor-pointer">
// //               <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 animate-gradient-x">RASHIDUL</span>
// //               <span className={darkMode ? "text-white" : "text-black"}> News</span>
// //             </h1>
// //           </div>

// //           <nav className="hidden xl:flex items-center gap-8 font-black text-xs uppercase opacity-80">
// //             {CATEGORIES.map(c => (
// //               <a key={c} href="#" className="hover:text-red-500 hover:scale-110 transition-all">{c}</a>
// //             ))}
// //           </nav>

// //           <div className="flex items-center gap-4">
// //             <button onClick={() => setDarkMode(!darkMode)} className={`p-3 rounded-2xl transition-all ${darkMode ? "bg-slate-800 text-yellow-400" : "bg-slate-100 text-slate-800"}`}>
// //               {darkMode ? <Sun size={22} /> : <Moon size={22} />}
// //             </button>
// //             <div className="relative p-1 rounded-2xl bg-gradient-to-br from-red-600 to-orange-500 cursor-pointer group">
// //                <div className="w-10 h-10 rounded-xl overflow-hidden relative">
// //                   <Image src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde" alt="Avatar" fill className="object-cover group-hover:scale-110 transition-transform" />
// //                </div>
// //             </div>
// //           </div>
// //         </div>
// //         {/* Reading Progress Bar */}
// //         <div className="h-1 bg-gradient-to-r from-red-600 via-yellow-500 to-blue-600 transition-all" style={{ width: `${scrollProgress}%` }} />
// //       </header>

// //       {/* 📽️ 4. VIDEO LIVE STUDIO SECTION */}
// //       <section className="max-w-screen-2xl mx-auto px-6 pt-10">
// //         <div className="flex justify-between items-center mb-6">
// //           <h3 className="text-xl font-black flex items-center gap-3">
// //              <Camera className="text-red-600 animate-pulse" /> Rashidul Studio <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded italic">LIVE</span>
// //           </h3>
// //           <div className="flex gap-2">
// //              <div className="w-3 h-3 bg-red-600 rounded-full animate-ping" />
// //           </div>
// //         </div>
// //         <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
// //            {[1, 2, 3, 4, 5].map(i => (
// //              <div key={i} className="min-w-[300px] group relative rounded-[2rem] overflow-hidden aspect-video bg-slate-900 border border-white/5 cursor-pointer shadow-2xl">
// //                 <Image src={`https://images.unsplash.com/photo-1485846234645-a62644f84728?q=${i}`} alt="vid" fill className="object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
// //                 <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all flex items-center justify-center">
// //                    <div className="p-4 bg-white/20 backdrop-blur-lg rounded-full border border-white/30 group-hover:scale-125 transition-transform">
// //                       <PlayCircle className="text-white fill-white/20" size={32} />
// //                    </div>
// //                 </div>
// //                 <div className="absolute bottom-4 left-4 right-4">
// //                    <p className="text-xs font-bold text-white leading-tight line-clamp-2">সিরাজগঞ্জে নতুন মেগা প্রজেক্টের কাজ শুরু, বিস্তারিত দেখুন ভিডিওতে...</p>
// //                 </div>
// //              </div>
// //            ))}
// //         </div>
// //       </section>

// //       {/* 📰 5. MAIN CONTENT LAYOUT */}
// //       <main className="max-w-screen-2xl mx-auto px-6 py-10">
// //         <div className="grid lg:grid-cols-12 gap-10">
          
// //           {/* Main Huge Card */}
// //           <div className="lg:col-span-8 space-y-12">
// //             <div className="relative group rounded-[3.5rem] overflow-hidden bg-black aspect-video md:h-[600px] cursor-pointer shadow-[0_0_50px_rgba(255,0,0,0.1)] hover:shadow-[0_0_80px_rgba(255,0,0,0.2)] transition-shadow">
// //               <Image src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b" alt="Hero" fill className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-transform duration-[1.5s]" priority />
// //               <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              
// //               <div className="absolute bottom-0 p-8 md:p-16">
// //                 <div className="flex items-center gap-3 mb-6">
// //                    <span className="px-4 py-1.5 bg-red-600 text-white text-[10px] font-black rounded-full animate-bounce">BREAKING</span>
// //                    <span className="flex items-center gap-2 text-white/70 text-xs font-bold"><Eye size={14}/> ৪.২ লাখ ভিউ</span>
// //                 </div>
// //                 <h2 className="text-4xl md:text-7xl font-black text-white leading-[1.1] mb-8 group-hover:text-red-500 transition-colors">
// //                   বাংলাদেশে <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">প্রথম কৃত্রিম বুদ্ধিমত্তা</span> হাব তৈরি হচ্ছে
// //                 </h2>
// //                 <div className="flex gap-6 items-center text-xs text-white/50 font-black uppercase tracking-[0.2em]">
// //                    <span>৫ মিনিট আগে</span>
// //                    <span>প্রযুক্তি ডেস্ক</span>
// //                    <Share2 size={16} className="hover:text-red-500 transition-colors" />
// //                 </div>
// //               </div>
// //             </div>
// //           </div>

// //           {/* Right Column: Dynamic Feed */}
// //           <div className="lg:col-span-4 space-y-10">
// //             <div className={`p-8 rounded-[3rem] border ${darkMode ? "bg-slate-900/40 border-white/5" : "bg-white border-slate-200 shadow-xl"}`}>
// //                <h3 className="text-xl font-black mb-8 flex items-center gap-3">
// //                  <TrendingUp size={24} className="text-green-500" /> আজকের আলোচিত
// //                </h3>
// //                <div className="space-y-8">
// //                   {[1, 2, 3, 4].map(n => (
// //                     <div key={n} className="flex gap-4 group cursor-pointer border-b border-white/5 pb-4 last:border-0">
// //                        <span className="text-3xl font-black text-slate-500/20 group-hover:text-red-600 transition-all">{n}</span>
// //                        <h4 className="font-black text-sm leading-snug group-hover:underline">বিশ্বরাজনীতিতে বাংলাদেশের শক্তিশালী অবস্থান, মোড় ঘুরছে কূটনীতির...</h4>
// //                     </div>
// //                   ))}
// //                </div>
// //             </div>

// //             {/* Newsletter: Cyber Design */}
// //             <div className="relative p-10 rounded-[3rem] bg-slate-900 text-white overflow-hidden group shadow-2xl">
// //                <div className="absolute top-0 right-0 w-40 h-40 bg-red-600/20 rounded-full blur-3xl animate-pulse" />
// //                <Newspaper className="absolute -bottom-10 -right-10 text-white/5" size={180} />
// //                <h4 className="text-3xl font-black mb-4 relative z-10">সরাসরি আপডেট!</h4>
// //                <p className="text-white/60 text-xs mb-8 font-medium relative z-10">সবার আগে সঠিক খবরটি ইমেইলে পেতে সাবস্ক্রাইব করুন।</p>
// //                <input type="email" placeholder="ইমেইল এড্রেস" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-red-600 transition-all mb-4" />
// //                <button className="w-full bg-red-600 text-white font-black py-4 rounded-2xl hover:bg-red-700 transition-all uppercase text-xs tracking-widest shadow-xl">সাবস্ক্রাইব করুন</button>
// //             </div>
// //           </div>
// //         </div>
// //       </main>

// //       {/* 🏁 6. FOOTER */}
// //       <footer className={`mt-20 pt-24 pb-12 border-t ${darkMode ? "bg-black border-white/5" : "bg-slate-100 border-slate-200"}`}>
// //         <div className="max-w-screen-2xl mx-auto px-6 grid md:grid-cols-4 gap-16">
// //           <div className="col-span-2 space-y-8">
// //             <h2 className="text-5xl font-black italic tracking-tighter italic">
// //               <span className="text-red-600">RASHIDUL</span> NEWS
// //             </h2>
// //             <div className="flex gap-6">
// //                {[Facebook, Youtube, Share2].map((Icon, i) => (
// //                  <button key={i} className="w-14 h-14 rounded-2xl bg-red-600/10 flex items-center justify-center text-red-600 hover:bg-red-600 hover:text-white transition-all transform hover:-translate-y-2 shadow-xl">
// //                    <Icon size={24} />
// //                  </button>
// //                ))}
// //             </div>
// //           </div>
// //           <div className="space-y-6">
// //             <h5 className="font-black text-xs uppercase tracking-[0.3em] text-slate-500">Quick Links</h5>
// //             <ul className="space-y-4 text-sm font-bold opacity-60">
// //               {CATEGORIES.slice(0, 4).map(c => <li key={c} className="hover:text-red-600 cursor-pointer">{c}</li>)}
// //             </ul>
// //           </div>
// //           <div className="space-y-6">
// //             <h5 className="font-black text-xs uppercase tracking-[0.3em] text-slate-500">Legal</h5>
// //             <ul className="space-y-4 text-sm font-bold opacity-60">
// //               <li className="hover:text-red-600 cursor-pointer">আমাদের সম্পর্কে</li>
// //               <li className="hover:text-red-600 cursor-pointer">যোগাযোগ</li>
// //               <li className="hover:text-red-600 cursor-pointer">প্রাইভেসি পলিসি</li>
// //             </ul>
// //           </div>
// //         </div>
// //         <div className="text-center mt-24 text-[10px] font-black uppercase tracking-[1em] opacity-30">
// //           © 2026 Rashidul Official | All Rights Reserved
// //         </div>
// //       </footer>

// //       {/* 🔮 CUSTOM ANIMATIONS ENGINE */}
// //       <style jsx global>{`
// //         @keyframes marquee-fast {
// //           0% { transform: translateX(0); }
// //           100% { transform: translateX(-50%); }
// //         }
// //         .animate-marquee-fast {
// //           animation: marquee-fast 30s linear infinite;
// //         }
// //         @keyframes gradient-x {
// //           0% { background-position: 0% 50%; }
// //           50% { background-position: 100% 50%; }
// //           100% { background-position: 0% 50%; }
// //         }
// //         .animate-gradient-x {
// //           background-size: 200% 200%;
// //           animation: gradient-x 6s ease infinite;
// //         }
// //         ::-webkit-scrollbar {
// //           width: 8px;
// //           height: 8px;
// //         }
// //         ::-webkit-scrollbar-thumb {
// //           background: #ef4444;
// //           border-radius: 10px;
// //         }
// //         .scrollbar-hide::-webkit-scrollbar {
// //           display: none;
// //         }
// //       `}</style>
// //     </div>
// //   );
// // }


// // "use client";

// // import React, { useState, useEffect } from "react";
// // import Image from "next/image";
// // import { 
// //   Clock, TrendingUp, Search, Menu, User, 
// //   Moon, Sun, Bell, Zap, ChevronRight, X, 
// //   Settings, LogOut, Bookmark, Facebook, Youtube, Share2,
// //   Globe, PlayCircle, Eye, Flame, Newspaper, Radio, ArrowUpRight
// // } from "lucide-react";

// // const CATEGORIES = ["জাতীয়", "আন্তর্জাতিক", "খেলা", "প্রযুক্তি", "অর্থনীতি", "স্বাস্থ্য", "বিজ্ঞান"];

// // export default function RashidulMegaPortal() {
// //   const [mounted, setMounted] = useState(false);
// //   const [darkMode, setDarkMode] = useState(true);
// //   const [scrollProgress, setScrollProgress] = useState(0);
// //   const [isSidebarOpen, setSidebarOpen] = useState(false);

// //   useEffect(() => {
// //     setMounted(true);
// //     const handleScroll = () => {
// //       const totalScroll = document.documentElement.scrollTop;
// //       const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
// //       setScrollProgress((totalScroll / windowHeight) * 100);
// //     };
// //     window.addEventListener("scroll", handleScroll);
// //     return () => window.removeEventListener("scroll", handleScroll);
// //   }, []);

// //   if (!mounted) return null;

// //   return (
// //     <div className={`min-h-screen transition-all duration-500 ${darkMode ? "bg-[#030712] text-slate-100" : "bg-white text-slate-900"}`}>
      
// //       {/* 🚀 1. READING PROGRESS BAR */}
// //       <div className="fixed top-0 left-0 h-1 z-[100] bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 transition-all duration-150" style={{ width: `${scrollProgress}%` }} />

// //       {/* 🔴 2. MULTI-LAYER TOP MARQUEE (Ultra Animation) */}
// //       <div className="bg-black text-white py-1.5 border-b border-white/10 overflow-hidden relative">
// //         <div className="flex animate-marquee-fast whitespace-nowrap gap-12 items-center text-[10px] font-black uppercase tracking-[0.2em]">
// //           {[1, 2, 3, 4].map(i => (
// //             <div key={i} className="flex gap-12">
// //               <span className="flex items-center gap-2 text-red-500"><Radio size={12} className="animate-pulse"/> LIVE: Dhaka 32°C</span>
// //               <span className="flex items-center gap-2"><ArrowUpRight size={12} className="text-green-500"/> USD/BDT: 110.50</span>
// //               <span className="flex items-center gap-2"><ArrowUpRight size={12} className="text-green-500"/> Gold: 1,12,000 BDT</span>
// //               <span className="flex items-center gap-2 text-blue-400"><Globe size={12}/> World Cup 2026: Bangladesh Qualified!</span>
// //             </div>
// //           ))}
// //         </div>
// //       </div>

// //       {/* 🟢 3. PREMIUM HEADER */}
// //       <header className={`sticky top-0 z-50 backdrop-blur-2xl border-b ${darkMode ? "bg-black/60 border-white/5" : "bg-white/70 border-slate-200"}`}>
// //         <div className="max-w-screen-2xl mx-auto px-6 h-20 flex justify-between items-center">
          
// //           <div className="flex items-center gap-8">
// //             <button onClick={() => setSidebarOpen(true)} className="p-3 bg-red-600/10 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all duration-500">
// //               <Menu size={24} />
// //             </button>
// //             <h1 className="text-4xl font-black italic tracking-tighter group cursor-pointer">
// //               <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 animate-gradient-x">RASHIDUL</span>
// //               <span className={darkMode ? "text-white" : "text-black"}> PRO</span>
// //             </h1>
// //           </div>

// //           <nav className="hidden xl:flex items-center gap-10 font-black text-xs uppercase">
// //             {CATEGORIES.map(c => (
// //               <a key={c} href="#" className="hover:text-red-500 transition-all flex items-center gap-1">
// //                 {c} <ChevronRight size={10} className="opacity-0 group-hover:opacity-100" />
// //               </a>
// //             ))}
// //           </nav>

// //           <div className="flex items-center gap-4">
// //             <div className="hidden md:flex flex-col items-end mr-4 opacity-60">
// //                <span className="text-[10px] font-black uppercase tracking-widest">শুক্রবার, এপ্রিল ২০২৬</span>
// //                <span className="text-[10px] font-bold">সিরাজগঞ্জ, বাংলাদেশ</span>
// //             </div>
// //             <button onClick={() => setDarkMode(!darkMode)} className={`p-3 rounded-2xl transition-all ${darkMode ? "bg-slate-800 text-yellow-400" : "bg-slate-100 text-slate-800"}`}>
// //               {darkMode ? <Sun size={20} /> : <Moon size={20} />}
// //             </button>
// //             <button className="relative p-3 bg-red-600 text-white rounded-2xl hover:scale-110 active:scale-95 transition-all shadow-lg shadow-red-600/20">
// //               <Search size={20} />
// //             </button>
// //           </div>
// //         </div>
// //       </header>

// //       {/* 📰 4. MAIN LAYOUT (Interactive Grid) */}
// //       <main className="max-w-screen-2xl mx-auto px-6 py-12">
// //         <div className="grid lg:grid-cols-12 gap-10">
          
// //           {/* Left Column: Big Feature News with Glow */}
// //           <div className="lg:col-span-8 space-y-12">
// //             <div className="relative group rounded-[3rem] overflow-hidden bg-black aspect-[16/10] md:aspect-video cursor-pointer">
// //               <Image 
// //                 src="https://images.unsplash.com/photo-1451187580459-43490279c0fa" 
// //                 alt="Main" fill 
// //                 className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000" 
// //               />
// //               <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
              
// //               {/* Neon Glow Hover Effect */}
// //               <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-orange-600 rounded-[3.1rem] blur opacity-0 group-hover:opacity-20 transition-opacity" />

// //               <div className="absolute bottom-0 p-8 md:p-16">
// //                 <div className="flex items-center gap-3 mb-6">
// //                   <span className="px-5 py-2 bg-red-600 text-white text-[10px] font-black rounded-full animate-bounce">TOP NEWS</span>
// //                   <span className="flex items-center gap-1 text-white/70 text-xs font-bold"><Eye size={14}/> 4.5k Views</span>
// //                 </div>
// //                 <h2 className="text-4xl md:text-7xl font-black text-white leading-[1] mb-8 group-hover:tracking-tight transition-all">
// //                   মহাকাশ গবেষণায় <br/> <span className="text-red-600 underline">নতুন ইতিহাস</span> গড়ল বাংলাদেশ
// //                 </h2>
// //                 <button className="flex items-center gap-3 text-white font-black uppercase text-xs tracking-widest hover:gap-5 transition-all">
// //                   পুরো খবরটি পড়ুন <ChevronRight className="text-red-600" />
// //                 </button>
// //               </div>
// //             </div>

// //             {/* Sub-grid with Video Style News */}
// //             <div className="grid md:grid-cols-2 gap-10">
// //                {[1, 2].map(i => (
// //                  <div key={i} className="group relative">
// //                    <div className="relative h-72 rounded-[2.5rem] overflow-hidden mb-6 shadow-2xl">
// //                       <Image src={`https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=${i}`} alt="News" fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
// //                       <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
// //                         <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-125 transition-all border border-white/30">
// //                            <PlayCircle size={32} className="text-white fill-white/20" />
// //                         </div>
// //                       </div>
// //                    </div>
// //                    <h3 className="text-2xl font-black leading-tight group-hover:text-red-600 transition-colors">ডিজিটাল কারেন্সি চালুর ঘোষণা দিল বাংলাদেশ ব্যাংক</h3>
// //                    <p className="mt-4 text-slate-500 text-sm font-medium leading-relaxed">আগামী অর্থবছর থেকেই দেশের লেনদেন ব্যবস্থায় আসছে বড় পরিবর্তন, সাধারণ মানুষের মাঝে বাড়ছে কৌতূহল।</p>
// //                  </div>
// //                ))}
// //             </div>
// //           </div>

// //           {/* Right Column: Dynamic Widgets */}
// //           <div className="lg:col-span-4 space-y-10">
            
// //             {/* 📈 Live Stock Widget */}
// //             <div className={`p-8 rounded-[2.5rem] border shadow-2xl ${darkMode ? "bg-slate-900/50 border-white/5" : "bg-gray-50 border-slate-200"}`}>
// //                <h4 className="text-xl font-black mb-6 flex items-center gap-2">
// //                  <TrendingUp className="text-green-500" /> লাইভ বাজার দর
// //                </h4>
// //                <div className="space-y-6">
// //                   {[ {name: "Apple Inc.", price: "$182.40", up: true}, {name: "Bitcoin", price: "$64,200", up: true}, {name: "Gold (22K)", price: "1.1L", up: false} ].map((item, i) => (
// //                     <div key={i} className="flex justify-between items-center p-4 rounded-2xl bg-black/5 hover:bg-red-600/5 transition-all">
// //                        <span className="font-bold text-sm">{item.name}</span>
// //                        <span className={`font-black text-sm ${item.up ? "text-green-500" : "text-red-500"}`}>{item.price}</span>
// //                     </div>
// //                   ))}
// //                </div>
// //             </div>

// //             {/* 🔥 Popular Now Section */}
// //             <div className="space-y-6">
// //               <h4 className="text-xl font-black border-l-4 border-red-600 pl-4">জনপ্রিয় খবর</h4>
// //               {[1, 2, 3].map(i => (
// //                 <div key={i} className="flex gap-4 group cursor-pointer items-start">
// //                    <div className="w-20 h-20 shrink-0 rounded-2xl overflow-hidden relative">
// //                       <Image src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d" alt="t" fill className="object-cover group-hover:rotate-6 transition-transform" />
// //                    </div>
// //                    <div>
// //                       <h5 className="font-black text-sm leading-snug group-hover:text-red-600 transition-all">ফ্রিল্যান্সিংয়ে নতুন রেকর্ড গড়ল বাংলাদেশের তরুণরা...</h5>
// //                       <span className="text-[10px] text-slate-500 font-bold uppercase mt-2 block">প্রযুক্তি • ২ ঘণ্টা আগে</span>
// //                    </div>
// //                 </div>
// //               ))}
// //             </div>

// //             {/* Newsletter: Premium Dark Mode Look */}
// //             <div className="relative p-10 rounded-[3rem] bg-slate-900 overflow-hidden group shadow-2xl">
// //                <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/20 rounded-full blur-3xl group-hover:scale-150 transition-all duration-700" />
// //                <Newspaper className="text-white/10 absolute -bottom-4 -right-4" size={120} />
// //                <h4 className="text-2xl font-black text-white mb-4 relative z-10">সরাসরি ইনবক্সে!</h4>
// //                <p className="text-white/60 text-xs mb-8 font-medium relative z-10">প্রতিদিনের প্রধান সংবাদগুলো ইমেইলে পেতে সাবস্ক্রাইব করুন।</p>
// //                <div className="relative z-10 space-y-4">
// //                   <input type="email" placeholder="ইমেইল এড্রেস" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-red-600 transition-all" />
// //                   <button className="w-full bg-red-600 text-white font-black py-4 rounded-2xl hover:bg-red-700 transition-all">যোগ দিন</button>
// //                </div>
// //             </div>
// //           </div>
// //         </div>
// //       </main>

// //       {/* 🏁 5. DYNAMIC FOOTER */}
// //       <footer className={`mt-32 pt-24 pb-12 border-t ${darkMode ? "bg-black border-white/5" : "bg-slate-50 border-slate-200"}`}>
// //         <div className="max-w-screen-2xl mx-auto px-6 grid md:grid-cols-4 gap-16">
// //           <div className="col-span-2 space-y-8">
// //             <h2 className="text-6xl font-black italic tracking-tighter">
// //               <span className="text-red-600">RASHIDUL</span> NEWS
// //             </h2>
// //             <div className="flex gap-6">
// //                {[Facebook, Youtube, Share2].map((Icon, i) => (
// //                  <button key={i} className="w-14 h-14 rounded-2xl bg-red-600/10 flex items-center justify-center text-red-600 hover:bg-red-600 hover:text-white transition-all transform hover:-translate-y-2">
// //                    <Icon size={24} />
// //                  </button>
// //                ))}
// //             </div>
// //           </div>
// //           <div className="space-y-6">
// //             <h5 className="font-black text-xs uppercase tracking-[0.3em] text-slate-500">Categories</h5>
// //             <ul className="grid grid-cols-2 gap-4 text-sm font-bold opacity-70">
// //               {CATEGORIES.map(c => <li key={c} className="hover:text-red-600 cursor-pointer">{c}</li>)}
// //             </ul>
// //           </div>
// //           <div className="space-y-6">
// //             <h5 className="font-black text-xs uppercase tracking-[0.3em] text-slate-500">Legal</h5>
// //             <ul className="space-y-4 text-sm font-bold opacity-70">
// //               <li className="hover:text-red-600 cursor-pointer">Privacy Policy</li>
// //               <li className="hover:text-red-600 cursor-pointer">Terms of Service</li>
// //               <li className="hover:text-red-600 cursor-pointer">Cookie Policy</li>
// //             </ul>
// //           </div>
// //         </div>
// //         <div className="text-center mt-24 text-[10px] font-black uppercase tracking-[1em] opacity-30">
// //           © 2026 Rashidul Media Group | Next-Gen Journalist
// //         </div>
// //       </footer>

// //       {/* 🔮 CUSTOM ANIMATIONS */}
// //       <style jsx global>{`
// //         @keyframes marquee-fast {
// //           0% { transform: translateX(0); }
// //           100% { transform: translateX(-50%); }
// //         }
// //         .animate-marquee-fast {
// //           animation: marquee-fast 20s linear infinite;
// //         }
// //         @keyframes gradient-x {
// //           0% { background-position: 0% 50%; }
// //           50% { background-position: 100% 50%; }
// //           100% { background-position: 0% 50%; }
// //         }
// //         .animate-gradient-x {
// //           background-size: 200% 200%;
// //           animation: gradient-x 5s ease infinite;
// //         }
// //         body {
// //           scrollbar-width: thin;
// //           scrollbar-color: #ef4444 transparent;
// //         }
// //       `}</style>
// //     </div>
// //   );
// // }

// // "use client";

// // import React, { useState, useEffect } from "react";
// // import Image from "next/image";
// // import { 
// //   Clock, TrendingUp, Search, Menu, User, 
// //   Moon, Sun, Bell, Zap, ChevronRight, X, 
// //   Settings, LogOut, Bookmark, Facebook, Youtube, Share2,
// //   Globe, PlayCircle, Eye, Flame, Newspaper
// // } from "lucide-react";

// // const CATEGORIES = ["জাতীয়", "আন্তর্জাতিক", "খেলা", "বিনোদন", "প্রযুক্তি", "অর্থনীতি", "লাইফস্টাইল", "মতামত"];

// // const NEWS_DATA = [
// //   { 
// //     id: 1, 
// //     title: "২০২৬ সালের স্মার্ট বাংলাদেশ: তথ্যপ্রযুক্তিতে এক নতুন দিগন্তের সূচনা", 
// //     img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b", 
// //     cat: "প্রযুক্তি", 
// //     color: "from-blue-600 to-indigo-600",
// //     time: "১০ মিনিট আগে",
// //     views: "2.4k"
// //   },
// //   { 
// //     id: 2, 
// //     title: "বাংলাদেশের ক্রিকেটে স্বর্ণযুগ: বিশ্বমঞ্চে বাঘেদের নতুন গর্জন", 
// //     img: "https://images.unsplash.com/photo-1531415074968-036ba1b575da", 
// //     cat: "খেলা", 
// //     color: "from-green-600 to-emerald-600",
// //     time: "২৫ মিনিট আগে",
// //     views: "1.8k"
// //   },
// //   { 
// //     id: 3, 
// //     title: "অর্থনৈতিক বিপ্লব: বৈদেশিক মুদ্রার রিজার্ভে নতুন রেকর্ড", 
// //     img: "https://images.unsplash.com/photo-1611974714851-eb6747139071", 
// //     cat: "অর্থনীতি", 
// //     color: "from-amber-500 to-orange-600",
// //     time: "৪৫ মিনিট আগে",
// //     views: "3.2k"
// //   },
// // ];

// // export default function RashidulUltimatePortal() {
// //   const [mounted, setMounted] = useState(false);
// //   const [darkMode, setDarkMode] = useState(true);
// //   const [isSidebarOpen, setSidebarOpen] = useState(false);
// //   const [isSearchOpen, setSearchOpen] = useState(false);
// //   const [scrolled, setScrolled] = useState(false);

// //   useEffect(() => {
// //     setMounted(true);
// //     const handleScroll = () => setScrolled(window.scrollY > 50);
// //     window.addEventListener("scroll", handleScroll);
// //     return () => window.removeEventListener("scroll", handleScroll);
// //   }, []);

// //   if (!mounted) return null;

// //   return (
// //     <div className={`min-h-screen transition-all duration-500 ${darkMode ? "bg-[#05070a] text-slate-100" : "bg-gray-50 text-slate-900"}`}>
      
// //       {/* 🟢 TOP NAV - SUPER THIN */}
// //       <div className={`hidden md:block py-2 border-b ${darkMode ? "bg-slate-900/50 border-white/5" : "bg-gray-100 border-gray-200"}`}>
// //         <div className="max-w-7xl mx-auto px-6 flex justify-between items-center text-[11px] font-bold uppercase tracking-widest opacity-70">
// //           <div className="flex gap-4">
// //             <span className="flex items-center gap-1"><Globe size={12}/> শুক্রবার, ১৭ এপ্রিল ২০২৬</span>
// //             <span className="flex items-center gap-1"><Flame size={12} className="text-orange-500"/> trending topics</span>
// //           </div>
// //           <div className="flex gap-4">
// //             <a href="#" className="hover:text-red-500">About</a>
// //             <a href="#" className="hover:text-red-500">Contact</a>
// //             <a href="#" className="hover:text-red-500">Advertisement</a>
// //           </div>
// //         </div>
// //       </div>

// //       {/* 🔴 MAIN STICKY HEADER */}
// //       <header className={`sticky top-0 z-50 transition-all duration-300 border-b ${
// //         scrolled 
// //         ? (darkMode ? "bg-black/80 border-white/10 py-2 shadow-2xl" : "bg-white/90 border-slate-200 py-2 shadow-lg") 
// //         : (darkMode ? "bg-transparent border-transparent py-4" : "bg-white border-transparent py-4")
// //       } backdrop-blur-xl`}>
// //         <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
// //           <div className="flex items-center gap-6">
// //             <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-red-500/10 rounded-full transition-colors group">
// //               <Menu size={26} className="group-hover:rotate-180 transition-transform duration-500" />
// //             </button>
// //             <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter select-none">
// //               <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500">RASHIDUL</span>
// //               <span className={darkMode ? "text-white" : "text-black"}> NEWS</span>
// //             </h1>
// //           </div>

// //           <div className="hidden lg:flex items-center gap-8 font-black text-xs uppercase tracking-tighter">
// //             {CATEGORIES.slice(0, 6).map(c => (
// //               <a key={c} href="#" className="relative group overflow-hidden">
// //                 <span className="hover:text-red-600 transition-colors">{c}</span>
// //                 <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600 -translate-x-full group-hover:translate-x-0 transition-transform"></span>
// //               </a>
// //             ))}
// //           </div>

// //           <div className="flex items-center gap-4">
// //             <button onClick={() => setSearchOpen(true)} className="p-2.5 rounded-full bg-slate-500/10 hover:bg-red-600 hover:text-white transition-all">
// //               <Search size={20}/>
// //             </button>
// //             <button onClick={() => setDarkMode(!darkMode)} className="p-2.5 rounded-full bg-slate-500/10 hover:bg-amber-500 hover:text-white transition-all">
// //               {darkMode ? <Sun size={20} /> : <Moon size={20} />}
// //             </button>
// //             <div className="relative w-11 h-11 rounded-xl p-[2px] bg-gradient-to-tr from-red-600 to-orange-400 group cursor-pointer" onClick={() => setSidebarOpen(true)}>
// //                <div className="w-full h-full rounded-[10px] overflow-hidden relative">
// //                   <Image src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde" alt="Profile" fill className="object-cover group-hover:scale-125 transition-transform" />
// //                </div>
// //             </div>
// //           </div>
// //         </div>
// //       </header>

// //       {/* 🚀 SEARCH OVERLAY (MODERN) */}
// //       <div className={`fixed inset-0 z-[100] transition-all duration-500 flex items-center justify-center p-6 ${isSearchOpen ? "visible opacity-100" : "invisible opacity-0"}`}>
// //         <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={() => setSearchOpen(false)} />
// //         <div className="relative w-full max-w-3xl transform transition-all scale-110">
// //           <button onClick={() => setSearchOpen(false)} className="absolute -top-16 right-0 text-white/50 hover:text-white flex items-center gap-2 font-bold uppercase tracking-widest text-sm">
// //             Close <X size={24} />
// //           </button>
// //           <div className="relative">
// //             <input 
// //               type="text" 
// //               placeholder="সার্চ করুন খবরের হেডলাইন..." 
// //               className="w-full bg-transparent border-b-4 border-red-600 py-6 text-4xl md:text-6xl font-black text-white outline-none placeholder:text-white/10"
// //               autoFocus={isSearchOpen}
// //             />
// //             <Search className="absolute right-0 top-1/2 -translate-y-1/2 text-red-600" size={48} />
// //           </div>
// //           <div className="mt-12">
// //              <h4 className="text-white/40 font-bold uppercase text-xs mb-6 tracking-widest">Popular Searches</h4>
// //              <div className="flex flex-wrap gap-3">
// //                 {CATEGORIES.map(c => (
// //                   <button key={c} className="px-6 py-2 rounded-full border border-white/10 text-white hover:bg-white hover:text-black transition-all font-bold uppercase text-xs">{c}</button>
// //                 ))}
// //              </div>
// //           </div>
// //         </div>
// //       </div>

// //       {/* 📰 MAIN HERO CONTENT */}
// //       <main className="max-w-7xl mx-auto px-6 py-10">
// //         <div className="grid lg:grid-cols-12 gap-8">
          
// //           {/* Main Feature News */}
// //           <div className="lg:col-span-8 space-y-8">
// //             <div className="group relative rounded-[2.5rem] overflow-hidden shadow-2xl h-[500px] md:h-[650px] cursor-pointer">
// //               <Image src={NEWS_DATA[0].img} alt="Hero" fill className="object-cover transition-transform duration-1000 group-hover:scale-110" priority />
// //               <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              
// //               <div className="absolute top-8 left-8">
// //                 <div className={`bg-gradient-to-r ${NEWS_DATA[0].color} text-white px-5 py-2 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl`}>
// //                   Featured Story
// //                 </div>
// //               </div>

// //               <div className="absolute bottom-0 p-8 md:p-14">
// //                 <h2 className="text-4xl md:text-6xl font-black text-white leading-[1.1] mb-6 group-hover:text-red-500 transition-colors drop-shadow-2xl">
// //                   {NEWS_DATA[0].title}
// //                 </h2>
// //                 <div className="flex flex-wrap items-center gap-8 text-white/70 font-bold text-sm">
// //                   <span className="flex items-center gap-2"><Clock size={18} className="text-red-500"/> {NEWS_DATA[0].time}</span>
// //                   <span className="flex items-center gap-2"><Eye size={18} className="text-blue-500"/> {NEWS_DATA[0].views} Views</span>
// //                   <span className="flex items-center gap-2 text-white"><Share2 size={18} className="text-green-500"/> Share Now</span>
// //                 </div>
// //               </div>
// //             </div>

// //             {/* Sub Grid News */}
// //             <div className="grid md:grid-cols-2 gap-8">
// //               {NEWS_DATA.slice(1).map((news) => (
// //                 <div key={news.id} className={`group rounded-[2rem] p-6 border transition-all duration-300 ${darkMode ? "bg-slate-900/40 border-white/5 hover:border-red-500/50" : "bg-white border-slate-200 hover:shadow-2xl hover:-translate-y-2"}`}>
// //                   <div className="relative h-56 rounded-3xl overflow-hidden mb-6">
// //                     <Image src={news.img} alt="sub" fill className="object-cover group-hover:scale-110 transition-transform" />
// //                     <span className={`absolute top-4 left-4 text-white text-[10px] font-black px-4 py-1.5 rounded-xl bg-gradient-to-r ${news.color}`}>{news.cat}</span>
// //                   </div>
// //                   <h3 className="text-2xl font-black mb-4 line-clamp-2 leading-snug group-hover:text-red-600 transition-colors">{news.title}</h3>
// //                   <div className="flex justify-between items-center text-xs text-slate-500 font-bold">
// //                     <span>By Rashidul News</span>
// //                     <span className="flex items-center gap-1"><Clock size={12}/> {news.time}</span>
// //                   </div>
// //                 </div>
// //               ))}
// //             </div>
// //           </div>

// //           {/* Right Sidebar Area */}
// //           <div className="lg:col-span-4 space-y-10">
// //             {/* Live Update Card */}
// //             <div className={`p-8 rounded-[2.5rem] relative overflow-hidden ${darkMode ? "bg-slate-900 shadow-indigo-500/10" : "bg-white border shadow-xl"} shadow-2xl`}>
// //               <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-600/10 rounded-full blur-3xl animate-pulse" />
// //               <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
// //                 <TrendingUp size={28} className="text-red-600" /> হট নিউজ
// //               </h3>
// //               <div className="space-y-8">
// //                  {[1,2,3,4].map(n => (
// //                    <div key={n} className="flex gap-4 group cursor-pointer">
// //                       <span className="text-4xl font-black text-slate-500/20 group-hover:text-red-600 transition-colors">0{n}</span>
// //                       <div>
// //                         <h4 className="font-black text-sm leading-snug line-clamp-2 group-hover:underline">বিশ্বরাজনীতিতে বাংলাদেশের প্রভাব বাড়ছে, অবাক বিশ্বনেতারা...</h4>
// //                         <p className="text-[10px] text-red-500 font-bold mt-2 uppercase">International</p>
// //                       </div>
// //                    </div>
// //                  ))}
// //               </div>
// //             </div>

// //             {/* Newsletter Subscription */}
// //             <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-red-600 p-10 rounded-[2.5rem] text-white shadow-2xl relative group overflow-hidden">
// //                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
// //                   <Newspaper size={120} />
// //                </div>
// //                <h3 className="text-3xl font-black mb-4">Stay Ahead!</h3>
// //                <p className="text-white/80 text-sm font-medium mb-8 leading-relaxed">সবচেয়ে বিশ্বস্ত খবরের সাথে থাকুন। আমাদের ডেইলি নিউজলেটার সাবস্ক্রাইব করুন।</p>
// //                <div className="space-y-4">
// //                   <input type="email" placeholder="Your Email Address" className="w-full bg-white/10 border border-white/20 rounded-2xl px-6 py-4 outline-none placeholder:text-white/50 focus:bg-white/20 transition-all font-bold" />
// //                   <button className="w-full bg-white text-black font-black py-4 rounded-2xl shadow-xl hover:bg-black hover:text-white transition-all transform active:scale-95 uppercase tracking-widest">Subscribe</button>
// //                </div>
// //             </div>
// //           </div>
// //         </div>
// //       </main>

// //       {/* 👣 FOOTER - PREMIUM DESIGN */}
// //       <footer className={`mt-20 border-t ${darkMode ? "bg-slate-950 border-white/5" : "bg-slate-900 text-white"} py-20`}>
// //         <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12">
// //           <div className="col-span-2 space-y-6">
// //             <h2 className="text-5xl font-black italic tracking-tighter">
// //               <span className="text-red-600">RASHIDUL</span> NEWS
// //             </h2>
// //             <p className="text-slate-500 max-w-sm leading-relaxed font-medium">
// //               আমরা সত্যের সন্ধানে নির্ভীক। ২০২৬ সালের আধুনিক সাংবাদিকতায় আমরাই সবার আগে সঠিক খবরটি আপনার কাছে পৌঁছে দিতে প্রতিশ্রুতিবদ্ধ।
// //             </p>
// //             <div className="flex gap-4">
// //               {[Facebook, Youtube, Share2, Globe].map((Icon, i) => (
// //                 <button key={i} className="w-12 h-12 rounded-2xl border border-slate-700 flex items-center justify-center hover:bg-red-600 hover:text-white hover:border-red-600 transition-all">
// //                   <Icon size={20} />
// //                 </button>
// //               ))}
// //             </div>
// //           </div>
// //           <div>
// //             <h5 className="font-black uppercase text-xs tracking-widest mb-8 text-red-500">Categories</h5>
// //             <ul className="space-y-4 font-bold text-slate-500 text-sm">
// //               {CATEGORIES.slice(0, 5).map(c => (
// //                 <li key={c} className="hover:text-red-500 cursor-pointer transition-colors flex items-center gap-2 group">
// //                   <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" /> {c}
// //                 </li>
// //               ))}
// //             </ul>
// //           </div>
// //           <div className="p-8 rounded-3xl bg-slate-900 border border-white/5">
// //             <h5 className="font-black uppercase text-xs tracking-widest mb-6 text-white">Download App</h5>
// //             <div className="space-y-4">
// //                <button className="w-full flex items-center justify-center gap-3 bg-white text-black font-black py-3 rounded-xl">
// //                   <PlayCircle size={20}/> Google Play
// //                </button>
// //             </div>
// //           </div>
// //         </div>
// //         <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-white/5 text-center text-[10px] font-black uppercase tracking-[0.5em] text-slate-600">
// //            © 2026 Rashidul News Media Group | Developed by Rashidul Pro
// //         </div>
// //       </footer>

// //       {/* 🔴 GLOBAL ANIMATIONS */}
// //       <style jsx global>{`
// //         @keyframes marquee {
// //           0% { transform: translateX(0); }
// //           100% { transform: translateX(-50%); }
// //         }
// //         .animate-marquee {
// //           animation: marquee 40s linear infinite;
// //         }
// //         ::-webkit-scrollbar {
// //           width: 10px;
// //         }
// //         ::-webkit-scrollbar-track {
// //           background: ${darkMode ? "#05070a" : "#f1f1f1"};
// //         }
// //         ::-webkit-scrollbar-thumb {
// //           background: #ef4444;
// //           border-radius: 20px;
// //         }
// //       `}</style>
// //     </div>
// //   );
// // }
















































// // "use client";

// // import React, { useState, useEffect } from "react";
// // import Image from "next/image";
// // import { 
// //   Clock, TrendingUp, Search, Menu, User, 
// //   Moon, Sun, Bell, Zap, ChevronRight, X, 
// //   Settings, LogOut, Bookmark, Facebook, Youtube, Share2,
// //   Globe, PlayCircle, Eye
// // } from "lucide-react";

// // // --- Types & Mock Data ---
// // const CATEGORIES = ["জাতীয়", "আন্তর্জাতিক", "খেলা", "বিনোদন", "প্রযুক্তি", "অর্থনীতি", "শিক্ষা", "স্বাস্থ্য"];

// // const NEWS_DATA = [
// //   { 
// //     id: 1, 
// //     title: "স্মার্ট বাংলাদেশের অভিমুখে: প্রযুক্তিতে নতুন মাইলফলক অর্জন", 
// //     img: "https://images.unsplash.com/photo-1504711434969-e33886168f5c", 
// //     cat: "প্রযুক্তি", 
// //     color: "from-cyan-500 to-blue-600",
// //     time: "৫ মিনিট আগে",
// //     views: "1.2k"
// //   },
// //   { 
// //     id: 2, 
// //     title: "বিশ্ব অর্থনীতিতে নতুন মোড়: বাংলাদেশের অভাবনীয় অগ্রগতি", 
// //     img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c", 
// //     cat: "অর্থনীতি", 
// //     color: "from-purple-500 to-pink-600",
// //     time: "১৫ মিনিট আগে",
// //     views: "800"
// //   },
// //   { 
// //     id: 3, 
// //     title: "খেলাধুলার ইতিহাসে লাল-সবুজের গর্জন: দুর্দান্ত জয়", 
// //     img: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2", 
// //     cat: "খেলা", 
// //     color: "from-rose-500 to-orange-600",
// //     time: "৩০ মিনিট আগে",
// //     views: "2.5k"
// //   },
// // ];

// // export default function RashidulNewsPortal() {
// //   const [mounted, setMounted] = useState(false);
// //   const [darkMode, setDarkMode] = useState(true);
// //   const [isSidebarOpen, setSidebarOpen] = useState(false);
// //   const [isSearchOpen, setSearchOpen] = useState(false);

// //   // --- Hydration & Theme Logic ---
// //   useEffect(() => {
// //     setMounted(true);
// //     const theme = darkMode ? 'dark' : 'light';
// //     document.documentElement.className = theme;
// //   }, [darkMode]);

// //   if (!mounted) return null;

// //   return (
// //     <div className={`min-h-screen transition-all duration-500 ${darkMode ? "bg-[#020617] text-slate-100" : "bg-slate-50 text-slate-900"}`}>
      
// //       {/* 1. TOP ANNOUNCEMENT BAR */}
// //       <div className="bg-red-600 py-2 overflow-hidden border-b border-red-500">
// //         <div className="max-w-7xl mx-auto flex">
// //           <div className="bg-red-700 px-4 py-1 z-10 font-bold text-white flex items-center gap-2 text-sm italic">
// //             <Zap size={14} className="animate-bounce" /> ব্রেকিং
// //           </div>
// //           <div className="flex animate-marquee whitespace-nowrap items-center gap-10 text-white font-medium text-sm">
// //             {[1, 2, 3].map((n) => (
// //               <span key={n}>🔥 ২০২৬ সালের নতুন অর্থনৈতিক লক্ষ্যমাত্রা অর্জন করেছে বাংলাদেশ। 🚀 প্রযুক্তির নতুন যুগে প্রবেশ করছে দেশ।</span>
// //             ))}
// //           </div>
// //         </div>
// //       </div>

// //       {/* 2. MAIN HEADER */}
// //       <header className={`sticky top-0 z-40 border-b backdrop-blur-xl ${darkMode ? "bg-slate-950/80 border-white/5" : "bg-white/80 border-slate-200"}`}>
// //         <div className="max-w-7xl mx-auto px-4 h-20 flex justify-between items-center">
          
// //           <div className="flex items-center gap-4">
// //             <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-slate-500/10 rounded-lg lg:hidden">
// //               <Menu size={24} />
// //             </button>
// //             <h1 className="text-2xl md:text-4xl font-black tracking-tighter cursor-pointer">
// //               <span className="text-red-600">RASHIDUL</span>
// //               <span className={darkMode ? "text-white" : "text-slate-900"}> NEWS</span>
// //             </h1>
// //           </div>

// //           <nav className="hidden lg:flex items-center gap-6 font-bold text-sm uppercase tracking-wide">
// //             {CATEGORIES.slice(0, 5).map(c => (
// //               <a key={c} href="#" className="hover:text-red-600 transition-colors">{c}</a>
// //             ))}
// //           </nav>

// //           <div className="flex items-center gap-3">
// //             <button onClick={() => setSearchOpen(true)} className="p-2 rounded-full hover:bg-slate-500/10"><Search size={20}/></button>
// //             <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full hover:bg-slate-500/10">
// //               {darkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
// //             </button>
// //             <div className="h-8 w-[1px] bg-slate-700 mx-2 hidden md:block" />
// //             <div className="relative w-10 h-10 rounded-full border-2 border-red-600 overflow-hidden cursor-pointer" onClick={() => setSidebarOpen(true)}>
// //               <Image src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde" alt="User" fill className="object-cover" />
// //             </div>
// //           </div>
// //         </div>
// //       </header>

// //       {/* 3. HERO SECTION */}
// //       <main className="max-w-7xl mx-auto px-4 py-8">
// //         <div className="grid lg:grid-cols-12 gap-6">
          
// //           {/* Main Big News */}
// //           <div className="lg:col-span-8 group cursor-pointer">
// //             <div className="relative h-[400px] md:h-[550px] rounded-3xl overflow-hidden shadow-2xl">
// //               <Image src={NEWS_DATA[0].img} alt="Hero" fill className="object-cover group-hover:scale-105 transition-transform duration-700" priority />
// //               <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
// //               <div className="absolute bottom-0 p-6 md:p-10">
// //                 <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full mb-4 inline-block">TRENDING</span>
// //                 <h2 className="text-3xl md:text-5xl font-black text-white leading-tight mb-4 group-hover:text-red-400 transition-colors">
// //                   {NEWS_DATA[0].title}
// //                 </h2>
// //                 <div className="flex items-center gap-6 text-slate-300 text-sm">
// //                   <span className="flex items-center gap-2"><Clock size={16}/> {NEWS_DATA[0].time}</span>
// //                   <span className="flex items-center gap-2"><Eye size={16}/> {NEWS_DATA[0].views} Views</span>
// //                 </div>
// //               </div>
// //             </div>
// //           </div>

// //           {/* Side News List */}
// //           <div className="lg:col-span-4 space-y-6">
// //             <h3 className="text-xl font-black border-l-4 border-red-600 pl-3">শীর্ষ সংবাদ</h3>
// //             {NEWS_DATA.slice(1).map((news) => (
// //               <div key={news.id} className={`flex gap-4 p-3 rounded-2xl border transition-all ${darkMode ? "bg-slate-900/50 border-white/5 hover:border-red-500/50" : "bg-white border-slate-200 hover:shadow-lg"}`}>
// //                 <div className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden">
// //                   <Image src={news.img} alt="Thumb" fill className="object-cover" />
// //                 </div>
// //                 <div className="flex flex-col justify-center">
// //                   <span className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">{news.cat}</span>
// //                   <h4 className="font-bold text-sm leading-snug line-clamp-2 hover:text-red-500 cursor-pointer">{news.title}</h4>
// //                   <p className="text-[10px] text-slate-500 mt-2">{news.time}</p>
// //                 </div>
// //               </div>
// //             ))}
            
// //             {/* Newsletter Box */}
// //             <div className="p-6 rounded-3xl bg-gradient-to-br from-red-600 to-orange-600 text-white">
// //               <h4 className="font-black text-lg mb-2">খবর পান সবার আগে!</h4>
// //               <p className="text-xs opacity-90 mb-4">আমাদের নিউজলেটার সাবস্ক্রাইব করুন।</p>
// //               <div className="flex gap-2">
// //                 <input type="email" placeholder="Email" className="bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-sm outline-none w-full placeholder:text-white/60" />
// //                 <button className="bg-white text-red-600 px-4 py-2 rounded-lg font-bold text-sm">OK</button>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       </main>

// //       {/* 4. FOOTER */}
// //       <footer className={`mt-20 border-t ${darkMode ? "bg-slate-950 border-white/5" : "bg-slate-100 border-slate-200"} py-12 px-4 text-center`}>
// //         <h2 className="text-3xl font-black italic mb-6">
// //           <span className="text-red-600">RASHIDUL</span> NEWS
// //         </h2>
// //         <div className="flex justify-center gap-6 mb-8 text-slate-500">
// //           <Facebook className="hover:text-red-600 cursor-pointer" />
// //           <Youtube className="hover:text-red-600 cursor-pointer" />
// //           <Share2 className="hover:text-red-600 cursor-pointer" />
// //         </div>
// //         <p className="text-xs text-slate-500 uppercase tracking-[0.3em]">
// //           © ২০২৬ RASHIDUL NEWS | SATYAR SANDHANE NIRVHIK
// //         </p>
// //       </footer>

// //       {/* 5. SIDEBAR (GLASSMORPHISM) */}
// //       <div className={`fixed inset-0 z-50 transition-all duration-300 ${isSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}>
// //         <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
// //         <div className={`absolute right-0 w-80 h-full p-8 shadow-2xl transition-transform duration-500 ${isSidebarOpen ? "translate-x-0" : "translate-x-full"} ${darkMode ? "bg-slate-900" : "bg-white"}`}>
// //           <X className="absolute top-6 right-6 cursor-pointer" onClick={() => setSidebarOpen(false)} />
// //           <div className="mt-10 space-y-4">
// //              <div className="flex items-center gap-4 p-4 hover:bg-red-500/10 rounded-xl cursor-pointer">
// //                 <User size={20} className="text-red-500" /> <span className="font-bold">প্রোফাইল</span>
// //              </div>
// //              <div className="flex items-center gap-4 p-4 hover:bg-red-500/10 rounded-xl cursor-pointer">
// //                 <Bookmark size={20} className="text-red-500" /> <span className="font-bold">সংরক্ষিত</span>
// //              </div>
// //              <div className="flex items-center gap-4 p-4 hover:bg-red-500/10 rounded-xl cursor-pointer">
// //                 <Settings size={20} className="text-red-500" /> <span className="font-bold">সেটিংস</span>
// //              </div>
// //              <hr className="border-slate-700" />
// //              <div className="flex items-center gap-4 p-4 text-red-500 font-black cursor-pointer">
// //                 <LogOut size={20} /> <span>লগআউট</span>
// //              </div>
// //           </div>
// //         </div>
// //       </div>

// //       {/* --- Global Styles --- */}
// //       <style jsx global>{`
// //         @keyframes marquee {
// //           0% { transform: translateX(0); }
// //           100% { transform: translateX(-50%); }
// //         }
// //         .animate-marquee {
// //           animation: marquee 30s linear infinite;
// //           display: flex;
// //           width: fit-content;
// //         }
// //         ::-webkit-scrollbar {
// //           width: 8px;
// //         }
// //         ::-webkit-scrollbar-thumb {
// //           background: #ef4444;
// //           border-radius: 10px;
// //         }
// //       `}</style>
// //     </div>
// //   );
// // }