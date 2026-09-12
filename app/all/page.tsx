"use client";

import { useState } from "react";
import { 
  Globe, Smartphone, Megaphone, ShieldCheck, Cpu, 
  Layers, ArrowUpRight, CheckCircle2, Zap, MessageSquare, X 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CountUp from "react-countup";

// আপনার সকল সার্ভিসের ডাটাবেজ
const myServices = [
  {
    id: "web-dev",
    title: "Web Architecture & Dev",
    category: "Development",
    desc: "নেক্সট-লেভেল স্পিড এবং আল্ট্রা-মডার্ন অ্যানিমেশন সহ কাস্টম ফুল-স্ট্যাক ওয়েবসাইট তৈরি।",
    icon: <Globe className="w-5 h-5 text-cyan-400" />,
    neonColor: "#00f0ff",
    features: ["React / Next.js Setup", "SEO Optimized Structure", "Secure Cloud Hosting"],
    price: 12500
  },
  {
    id: "app-dev",
    title: "Cross-Platform Mobile App",
    category: "Development",
    desc: "অ্যান্ড্রয়েড এবং আইওএস (iOS) দুই প্ল্যাটফর্মেরই জন্য প্রিমিয়াম ও স্মুথ মোবাইল অ্যাপ্লিকেশন।",
    icon: <Smartphone className="w-5 h-5 text-purple-400" />,
    neonColor: "#ab47bc",
    features: ["Flutter / Native Flow", "Play Store Deployment", "Live Notifications Integration"],
    price: 24000
  },
  {
    id: "cyber-security",
    title: "Cyber Security & Audit",
    category: "Security",
    desc: "আপনার ওয়েবসাইটের সিকিউরিটি লিক ফিক্স করা এবং ম্যালওয়্যার থেকে ১০০% প্রটেকশন দেওয়া।",
    icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
    neonColor: "#00e676",
    features: ["Penetration Testing", "Vulnerability Patching", "SSL & Encryption setup"],
    price: 8500
  },
  {
    id: "digital-marketing",
    title: "Growth & Digital Marketing",
    category: "Marketing",
    desc: "টার্গেটেড অডিয়েন্সের কাছে আপনার ব্র্যান্ডকে পৌঁছে দিতে প্রফেশনাল বুস্টিং ও এসইও।",
    icon: <Megaphone className="w-5 h-5 text-rose-500" />,
    neonColor: "#f43f5e",
    features: ["Facebook/Google Ads", "Advanced SEO Mapping", "Brand Growth Analytics"],
    price: 5000
  },
  {
    id: "ui-ux",
    title: "UI/UX Cyber Graphics",
    category: "Design",
    desc: "ইউজারদের ধরে রাখার জন্য চমৎকার ইন্টারফেস এবং ফিগমা (Figma) প্রোটোটাইপিং সার্ভিস।",
    icon: <Layers className="w-5 h-5 text-amber-500" />,
    neonColor: "#ffaa00",
    features: ["Figma Interactive Layout", "Modern Wireframing", "Custom Icon & Asset Design"],
    price: 6500
  },
  {
    id: "ai-automation",
    title: "AI & System Automation",
    category: "Intelligence",
    desc: "চ্যাটবট এবং এআই ইন্টিগ্রেশনের মাধ্যমে আপনার ব্যবসার ডেইলি টাস্ক অটোমেট করা।",
    icon: <Cpu className="w-5 h-5 text-pink-500" />,
    neonColor: "#ff007f",
    features: ["Intelligent AI Chatbots", "Workflow Automation APIs", "Database Sync Tools"],
    price: 15000
  }
];

export default function ServiceHubEngine() {
  const [selectedService, setSelectedService] = useState<any>(null);
  const [filterCategory, setFilterCategory] = useState("All");

  const categories = ["All", "Development", "Security", "Marketing", "Design", "Intelligence"];

  const filteredServices = filterCategory === "All" 
    ? myServices 
    : myServices.filter(s => s.category === filterCategory);

  return (
    <div className="min-h-screen flex flex-col font-sans overflow-x-hidden antialiased bg-[#04040a] text-neutral-200">
      
      {/* ==================== HUB HEADER ==================== */}
      <header className="w-full border-b backdrop-blur-xl px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-40 bg-[#04040a]/80 border-white/[0.03] shadow-2xl">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-400 to-purple-600 animate-spin [animation-duration:8s] flex items-center justify-center">
            <div className="w-3 h-3 bg-[#04040a] rounded-md" />
          </div>
          <h1 
            className="text-xs sm:text-sm font-mono font-black tracking-[0.2em] uppercase bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent"
            style={{ filter: "drop-shadow(0 0 10px rgba(6,182,212,0.4))" }}
          >
            CORE_SERVICES // HUB
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <a 
            href="https://wa.me/yournumber" 
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono text-[11px] font-black bg-black border-white/[0.05] text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)]"
          >
            <MessageSquare className="w-3.5 h-3.5 animate-pulse" />
            <span style={{ textShadow: "0 0 8px #00f0ff" }}>কানেক্ট করুন</span>
          </a>
        </div>
      </header>

      {/* ==================== HERO SECTION ==================== */}
      <section className="text-center py-12 px-4 max-w-3xl mx-auto space-y-4">
        <span className="text-[10px] font-mono tracking-[0.3em] uppercase px-3 py-1 bg-white/[0.02] border border-white/[0.05] rounded-full text-indigo-400 shadow-inner">
          ONE PLACE // ALL SOLUTIONS
        </span>
        <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white uppercase">
          আমাদের <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 bg-clip-text text-transparent" style={{ filter: "drop-shadow(0 0 15px rgba(0,240,255,0.3))" }}>সার্ভিস সমূহ</span>
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 font-mono max-w-xl mx-auto leading-relaxed">
          আপনার ব্যবসার অনলাইন গ্রোথ এবং টেকনিক্যাল সমস্যার সকল প্রিমিয়াম সল্যুশন এখন এক জায়গায়। ক্যাটাগরি সিলেক্ট করে আপনার প্রয়োজনীয় সার্ভিসটি বেছে নিন।
        </p>

        {/* ফিল্টার ট্যাব মডিউল */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-3 pt-4 scrollbar-none snap-x">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl font-mono text-[11px] font-bold border transition-all duration-300 flex-shrink-0 snap-center
                ${filterCategory === cat 
                  ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-cyan-400 text-white shadow-[0_0_15px_rgba(0,240,255,0.25)]" 
                  : "bg-white/[0.01] border-white/[0.04] text-neutral-500 hover:text-neutral-300"}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* ==================== SERVICES GRID ==================== */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-8 pb-16 flex-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredServices.map((service) => (
              <motion.div
                key={service.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="rounded-[2.2rem] border p-5 bg-[#090915]/90 border-white/[0.04] shadow-[0_20px_40px_rgba(0,0,0,0.6)] relative overflow-hidden group flex flex-col justify-between"
              >
                <div 
                  className="absolute top-0 left-0 w-full h-[2px] opacity-30 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ backgroundColor: service.neonColor, boxShadow: `0 0 15px ${service.neonColor}` }}
                />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-2xl bg-neutral-900/60 border border-white/[0.05]">
                      {service.icon}
                    </div>
                    <span className="text-[9px] font-mono uppercase bg-white/[0.03] px-2.5 py-0.5 rounded-md border border-white/[0.05] text-neutral-400">
                      {service.category}
                    </span>
                  </div>

                  <div>
                    <h3 
                      style={{ textShadow: `0 0 10px ${service.neonColor}60` }}
                      className="text-base font-black tracking-wide text-white"
                    >
                      {service.title}
                    </h3>
                    <p className="text-xs text-neutral-400 font-mono mt-2 leading-relaxed h-12 overflow-hidden">
                      {service.desc}
                    </p>
                  </div>

                  <ul className="space-y-1.5 pt-2 border-t border-white/[0.03]">
                    {service.features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-2 text-[11px] font-mono text-neutral-400">
                        <CheckCircle2 className="w-3.5 h-3.5 text-neutral-600 flex-shrink-0" />
                        <span className="truncate">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-white/[0.03] flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-mono text-neutral-500 block uppercase">শুরু মাত্র</span>
                    <span className="text-sm font-black text-white font-mono">
                      ৳ <CountUp end={service.price} separator="," />/-
                    </span>
                  </div>
                  
                  <button
                    onClick={() => setSelectedService(service)}
                    style={{ 
                      background: `linear-gradient(135deg, ${service.neonColor}15 0%, transparent 100%)`,
                      borderColor: `${service.neonColor}30`,
                      color: service.neonColor,
                      textShadow: `0 0 8px ${service.neonColor}`
                    }}
                    className="px-4 py-2 font-mono font-black text-[11px] rounded-xl transition-all duration-300 flex items-center gap-1 border uppercase tracking-widest active:scale-[0.97]"
                  >
                    Details <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>

      {/* ==================== INTERACTIVE DETAIL MODAL ==================== */}
      <AnimatePresence>
        {selectedService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedService(null)} className="fixed inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              style={{ borderColor: `${selectedService.neonColor}40`, boxShadow: `0 0 40px ${selectedService.neonColor}15` }}
              className="w-full max-w-md border rounded-[2.5rem] overflow-hidden relative z-10 p-6 font-mono bg-[#080812]"
            >
              <button onClick={() => setSelectedService(null)} className="absolute top-5 right-5 text-neutral-500 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
              
              <div className="flex items-center gap-3 pb-4 border-b border-white/[0.05]">
                <div className="p-2.5 rounded-xl bg-neutral-900 border border-white/[0.05]">
                  {selectedService.icon}
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase" style={{ textShadow: `0 0 10px ${selectedService.neonColor}` }}>{selectedService.title}</h3>
                  <p className="text-[10px] text-neutral-500">CATEGORY // {selectedService.category}</p>
                </div>
              </div>

              <div className="py-4 space-y-4 text-xs">
                <p className="text-neutral-400 font-sans leading-relaxed">{selectedService.desc}</p>
                
                <div className="space-y-2">
                  <p className="text-[10px] uppercase text-neutral-500 tracking-wider">প্যাকেজের অন্তর্ভুক্ত রয়েছে:</p>
                  <div className="space-y-1.5">
                    {selectedService.features.map((feat: string, i: number) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-black/30 border border-white/[0.02]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="text-neutral-300 text-[11px]">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-black border border-white/[0.04] flex items-center justify-between">
                  <span className="text-[10px] uppercase text-neutral-500">আনুমানিক বাজেট:</span>
                  <span className="text-base font-black text-amber-500">৳ <CountUp end={selectedService.price} separator="," /> BDT</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button onClick={() => setSelectedService(null)} className="py-2.5 rounded-xl border border-white/[0.05] bg-white/[0.02] text-neutral-400 text-xs font-bold hover:bg-white/[0.05] transition-all">
                  বন্ধ করুন
                </button>
                <a 
                  href={`https://wa.me/yournumber?text=Hi, I am interested in your ${selectedService.title} service.`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ backgroundColor: selectedService.neonColor, color: "#000000" }}
                  className="py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-center flex items-center justify-center gap-1 shadow-lg hover:opacity-90 transition-all active:scale-95"
                >
                  অর্ডার করুন <Zap className="w-3.5 h-3.5 fill-current" />
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================== FOOTER ==================== */}
      <footer className="w-full py-5 border-t text-center text-[9px] font-mono tracking-[0.2em] uppercase mt-auto bg-black/20 border-white/[0.03] text-neutral-600">
        All Services Active & Secured Cluster // 2026
      </footer>
    </div>
  );
}

