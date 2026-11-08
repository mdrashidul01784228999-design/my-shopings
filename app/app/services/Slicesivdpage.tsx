

"use client";




import React, { useState, useEffect } from "react";
import Image from "next/image";



import {
  Newspaper,
  ShoppingBag,
  Car,
  Wrench,
  ShieldCheck,
  Zap,
  Search,
  TrendingUp,
  Clock,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";



export default function UpgradedServicePlatform() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);

    const date = new Date().toLocaleDateString("bn-BD", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    setCurrentDate(date);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const services = [
    { title: "ই-পেপার",   link: "/services/e-paper", desc: "লাইভ আপডেট নিউজ ও ই-পেপার পড়ুন", icon: Newspaper, color: "from-blue-500 to-cyan-400" },
    { title: "পণ্য সার্ভিস", link: "/services/e-paper",  desc: "সেরা মানের প্রিমিয়াম পণ্য ডেলিভারি", icon: ShoppingBag, color: "from-pink-500 to-rose-400" },
    { title:  "ই-বই",link: "/services/ebook",  desc: "অনলাইন ল্যাইব্রি যে কোন বই পাওয়া যায়", icon: Car, color: "from-indigo-500 to-blue-400" },
    { title: "টেক সাপোর্ট",               link: "/services/e-paper",  desc: "এক্সপার্ট আইটি সমস্যা সমাধান", icon: Wrench, color: "from-orange-500 to-amber-400" },
    { title: "সিকিউরিটি", link: "/services/e-paper",  desc: "নিরাপদ পেমেন্ট ও তথ্য সুরক্ষা", icon: ShieldCheck, color: "from-emerald-500 to-teal-400" },
    { title: "এক্সপ্রেস",  link: "/services/e-paper",  desc: "জরুরী প্রয়োজনে ১ ঘণ্টায় ডেলিভারি", icon: Zap, color: "from-yellow-500 to-orange-400" },
  ];

  return (
    // ✅ ২. Semantic Tags: <div> এর বদলে <main> ব্যবহার করা হয়েছে
    <main className="min-h-screen bg-[#050810] text-gray-100 selection:bg-cyan-500/30">

      {/* Top Bar - SEO friendly <time> tag */}
      <header className="bg-[#0a0f1d] py-2 px-6 hidden md:block border-b border-white/5">
        <div className="max-w-7xl mx-auto flex justify-between text-xs text-gray-400">
          <div className="flex gap-6">
            <time className="flex items-center gap-2">
              <Clock size={14} className="text-cyan-400" /> {currentDate}
            </time>
            <span className="flex items-center gap-2 text-cyan-400 animate-pulse">
              <TrendingUp size={14} /> ট্রেন্ডিং এখন
            </span>
          </div>
          <div className="hover:text-white cursor-pointer transition-colors">সহায়তা কেন্দ্র</div>
        </div>
      </header>

      {/* Navbar */}
      <nav className={`sticky top-0 z-50 transition-all duration-500 ${
        isScrolled ? "bg-black/80 backdrop-blur-md border-b border-white/10 py-3" : "bg-transparent py-6"
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          {/* ✅ ৩. Branding - Title tag for SEO */}
          <a href="/" title="Rashidul Official Home">
            <span className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              RASHIDUL
            </span>
          </a>
          <div className="flex items-center gap-4">
            <form className="relative hidden sm:block" role="search">
               <label htmlFor="search-input" className="sr-only">Search Services</label>
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
               <input 
                id="search-input"
                type="search" 
                placeholder="সেবা খুঁজুন..." 
                className="bg-[#1a1f2e] border border-white/10 rounded-full py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:border-cyan-500 transition-all"
               />
            </form>
            <Search className="sm:hidden cursor-pointer hover:text-cyan-400 transition-colors" aria-label="Open Search" />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-6">
        <article className="relative h-[300px] md:h-[450px] rounded-3xl overflow-hidden group">
          <Image
            src="https://images.unsplash.com/photo-1504711434969-e33886168f5c"
            alt="Md Rashidul Official Digital Service Platform Portfolio"
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent">
            <div className="absolute bottom-8 left-8 right-8">
              <span className="bg-cyan-500 text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Featured Service</span>
              {/* ✅ ৪. H1 Tag: প্রতি পেজে একটি মাত্র H1 থাকতে হবে SEO এর জন্য */}
              <h1 className="text-3xl md:text-5xl font-bold mt-4 leading-tight">
                আপনার হাতের মুঠোয় <br /> <span className="text-cyan-400">আধুনিক ডিজিটাল সেবা</span>
              </h1>
            </div>
          </div>
        </article>
      </section>

      {/* Services Section */}
      <section className="max-w-7xl mx-auto px-6 py-20" id="services">
        <div className="flex justify-between items-end mb-12">
          <header>
            <h2 className="text-4xl font-bold">আমাদের বিশেষ সেবাসমূহ</h2>
            <p className="text-gray-500 mt-2">সেরা মানের অনলাইন ডিজিটাল সার্ভিস নিশ্চিত করাই আমাদের লক্ষ্য।</p>
          </header>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              // ✅ ৫. Article Tag: প্রতিটি সার্ভিসকে আলাদা আর্টিকেল হিসেবে ডিফাইন করা হয়েছে
              <article 
                key={index} 
                className="group p-8 bg-[#0a0f1d] rounded-2xl border border-white/5 hover:border-cyan-500/50 transition-all duration-300 hover:-translate-y-2"
              >

                <Link href={service.link}>
                <div className={`w-14 h-14 bg-gradient-to-br ${service.color} rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/10`}>
                  <Icon size={28} className="text-white" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-cyan-400 transition-colors">{service.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{service.desc}</p>
                <div className="mt-6 flex items-center text-xs font-bold text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  বিস্তারিত জানুন <ChevronRight size={14} />
                </div>

                </Link>
              </article>
            );
          })}
        </div>

        <div className="text-center mt-16">
          <button 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-cyan-500/20 active:scale-95"
            aria-label="সকল ডিজিটাল সার্ভিস দেখুন"
          >
            সকল সার্ভিস দেখুন <ChevronRight size={20}/>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#03060c] py-12 text-center">
        <p className="text-gray-500 text-sm">
          © ২০২৬ <span className="text-gray-300 font-semibold">Rashidul Official</span>. সর্বস্বত্ব সংরক্ষিত।
        </p>
      </footer>
    </main>
  );
}

