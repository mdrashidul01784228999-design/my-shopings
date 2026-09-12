
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingBag, 
  TrendingUp, 
  Gamepad2, 
  Gift, 
  User, 
  Settings, 
  LogOut, 
  Sparkles, 
  ChevronDown, 
  Coins, 
  PlusCircle, 
  Bell 
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";


type Category = {
  id: string;
  title: string;
  icon: React.ReactNode;
  img: string;
  color: string; // Tailwind gradient classes
  glowColor: string; // Hex code for custom shadow glow
  link: string;
  description: string; // এসইও ফ্রেন্ডলি শর্ট ডেসক্রিপশন
};

export default function AllCategorySection() {
  const [isOpen, setIsOpen] = useState(false);
  const [coins, setCoins] = useState(1250); // লাইভ কয়েন স্টেট
  const [isCoinAnimating, setIsCoinAnimating] = useState(false);

  // লাইভ কয়েন কাউন্টারের মোশন ডেমো (প্রতি ৭ সেকেন্ডে টেস্ট করার জন্য কয়েন আপডেট হবে)
  useEffect(() => {
    const interval = setInterval(() => {
      const change = Math.random() > 0.4 ? 50 : -20;
      setCoins((prev) => Math.max(0, prev + change));
      setIsCoinAnimating(true);
      setTimeout(() => setIsCoinAnimating(false), 800);
    }, 7000);

    return () => clearInterval(interval);
  }, []);

  const categories: Category[] = [
    {
      id: "games-general",
      title: "আলটিমেট গেমস",
      icon: <Gamepad2 className="w-6 h-6 md:w-8 md:h-8 text-yellow-400" />,
      img: "https://images.unsplash.com/photo-1606813902818-87952c3b42e0",
      color: "from-amber-600/40 via-orange-600/30 to-black/95",
      glowColor: "rgba(245, 158, 11, 0.25)",
      link: "/games",
      description: "জনপ্রিয় অনলাইন ও অ্যাকশন গেমসের সেরা কালেকশন খেলুন কোনো ডাউনলোড ছাড়াই।",
    },
    {
      id: "shopping",
      title: "প্রিমিয়াম শপিং",
      icon: <ShoppingBag className="w-6 h-6 md:w-8 md:h-8 text-pink-400" />,
      img: "https://images.unsplash.com/photo-1483985988355-763728e1935b",
      color: "from-rose-600/40 via-pink-600/30 to-black/95",
      glowColor: "rgba(244, 63, 94, 0.25)",
      link: "/shopping",
      description: "সেরা ব্র্যান্ডের গিজমোস, প্রিমিয়াম অ্যাক্সেসরিজ ও ট্রেন্ডি কালেকশন।",
    },
    {
      id: "trending",
      title: "ট্রেন্ডিং নাউ",
      icon: <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-purple-400" />,
      img: "https://images.unsplash.com/photo-1511512578047-dfb367046420",
      color: "from-violet-600/40 via-purple-600/30 to-black/95",
      glowColor: "rgba(139, 92, 246, 0.25)",
      link: "/trending",
      description: "এই সপ্তাহের সবচেয়ে হট এবং ভাইরাল আইটেমগুলো দেখে নিন এক নজরে।",
    },
    {
      id: "games-snake",
      title: "ক্লাসিক স্নেক",
      icon: <Gamepad2 className="w-6 h-6 md:w-8 md:h-8 text-emerald-400" />,
      img: "https://images.unsplash.com/photo-1627856013091-fed6e4e30025",
      color: "from-emerald-600/40 via-teal-600/30 to-black/95",
      glowColor: "rgba(16, 185, 129, 0.25)",
      link: "/games/Snack",
      description: "নস্টালজিক রেট্রো স্নেক গেম খেলুন মডার্ন গ্লিচ থিম ও হাই-স্কোর ট্র্যাকিং সহ।",
    },
    {
      id: "games-jam",
      title: "এরিনা জ্যাম",
      icon: <Gamepad2 className="w-6 h-6 md:w-8 md:h-8 text-cyan-400" />,
      img: "https://images.unsplash.com/photo-1542751371-adc38448a05e",
      color: "from-cyan-600/40 via-blue-600/30 to-black/95",
      glowColor: "rgba(6, 182, 212, 0.25)",
      link: "/games/Jamgam",
      description: "মাল্টিপ্লেয়ার গেমপ্লে এবং দৈনিক জ্যাম টুর্নামেন্টে অংশ নিয়ে পয়েন্ট জিতুন।",
    },
    {
      id: "gifts",
      title: "এক্সক্লুসিভ গিফট",
      icon: <Gift className="w-6 h-6 md:w-8 md:h-8 text-red-400" />,
      img: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48",
      color: "from-red-600/40 via-rose-700/30 to-black/95",
      glowColor: "rgba(239, 68, 68, 0.25)",
      link: "/gifts",
      description: "আপনার জমানো কয়েন দিয়ে রিডিম করুন গুগল প্লে, স্টিম এবং এক্সবক্স গিফট কার্ড।",
    },
  ];

  // এসইও ক্রলারের জন্য JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "সব ক্যাটাগরি একসাথে - Premium Portal",
    "description": "গেমস, প্রিমিয়াম শপিং, গিফট কার্ড এবং ট্রেন্ডিং সব কালেকশন এক জায়গায়।",
    "itemListElement": categories.map((cat, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": cat.title,
      "url": `https://yourwebsite.com${cat.link}`,
    })),
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center py-6 md:py-12 px-4 sm:px-6 md:px-8 bg-[#030303] overflow-hidden">
      
      {/* Google SEO JSON-LD injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Background Glow Lights */}
      <div className="absolute top-[-5%] left-[-10%] w-[60%] h-[50%] rounded-full bg-purple-950/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-5%] right-[-10%] w-[60%] h-[50%] rounded-full bg-cyan-950/10 blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#141414_1px,transparent_1px),linear-gradient(to_bottom,#141414_1px,transparent_1px)] bg-[size:3rem_3rem] md:bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_85%,transparent_100%)] opacity-35 pointer-events-none" />

      {/* ১. প্রিমিয়াম গ্লাসমরফিক নেভিগেশন বার (প্রোফাইল ও কয়েন কাউন্টার সহ) */}
      <nav className="w-full max-w-7xl z-50 flex items-center justify-between p-3 sm:p-4 mb-8 sm:mb-12 rounded-2xl md:rounded-[24px] bg-neutral-950/60 border border-white/5 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        {/* লোগো সেকশন */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center font-black text-white text-base md:text-xl shadow-[0_0_15px_rgba(147,51,234,0.5)]">
            P
          </div>
          <span className="hidden sm:inline-block font-extrabold text-sm md:text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-400">
            PREMIUM
          </span>
        </Link>

        {/* কয়েন ও প্রোফাইল কন্ট্রোলার */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* অ্যানিমেটেড কয়েন কাউন্টার */}
          <motion.div 
            onClick={() => {
              setCoins(prev => prev + 10);
              setIsCoinAnimating(true);
              setTimeout(() => setIsCoinAnimating(false), 800);
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 cursor-pointer group hover:border-amber-400/40 transition-colors duration-300 select-none"
          >
            <motion.div
              animate={isCoinAnimating ? { rotateY: 360, scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]"
            >
              <Coins className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.div>

            <div className="flex flex-col">
              <span className="text-[8px] sm:text-[9px] text-neutral-400 font-medium leading-none uppercase tracking-wider">Coins</span>
              <motion.span 
                key={coins}
                initial={{ y: -5, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-xs sm:text-sm font-black text-amber-300 drop-shadow-[0_0_10px_rgba(252,211,77,0.3)]"
              >
                {coins.toLocaleString()}
              </motion.span>
            </div>

            <PlusCircle className="w-3.5 h-3.5 text-amber-500/60 group-hover:text-amber-400 transition-colors" />
          </motion.div>

          {/* নোটিফিকেশন বেল */}
          <div className="relative cursor-pointer text-neutral-400 hover:text-white transition-colors p-1 sm:p-2">
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>

          <div className="w-[1px] h-6 bg-white/10" />

          {/* ইউজার ড্রপডাউন মেনু */}
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-1.5 sm:gap-2 group focus:outline-none"
            >
              <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.4)] group-hover:border-purple-400 transition-all duration-300">
                <Image
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde"
                  alt="User Profile"
                  fill
                  className="object-cover"
                />
              </div>

              <div className="hidden md:flex flex-col items-start text-left">
                <span className="text-xs font-bold text-white group-hover:text-neutral-200 transition-colors">
                  তানভীর রহমান
                </span>
                <span className="text-[9px] text-purple-400 font-semibold uppercase tracking-wider flex items-center gap-0.5">
                  PRO VIP <Sparkles className="w-2.5 h-2.5" />
                </span>
              </div>

              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-neutral-400 group-hover:text-white"
              >
                <ChevronDown className="w-4 h-4" />
              </motion.div>
            </button>

            {/* ড্রপডাউন আইটেমস */}
            <AnimatePresence>
              {isOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="absolute right-0 mt-4 w-60 rounded-2xl bg-neutral-950/95 border border-white/10 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden z-50 p-2"
                  >
                    <div className="p-3 mb-2 rounded-xl bg-white/[0.03] border border-white/5 text-left">
                      <p className="text-[10px] text-neutral-400">অ্যাকাউন্ট ইমেইল</p>
                      <p className="text-xs sm:text-sm font-bold text-white truncate">tanvir@example.com</p>
                      <div className="mt-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-[9px] text-purple-300 font-bold max-w-fit uppercase">
                        <Sparkles className="w-3 h-3 text-purple-400" />
                        VIP Gold
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <Link href="/profile" onClick={() => setIsOpen(false)}>
                        <div className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm text-neutral-300 hover:text-white hover:bg-white/[0.05] transition-all group">
                          <User className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                          <span>আমার প্রোফাইল</span>
                        </div>
                      </Link>
                      <Link href="/settings" onClick={() => setIsOpen(false)}>
                        <div className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm text-neutral-300 hover:text-white hover:bg-white/[0.05] transition-all group">
                          <Settings className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                          <span>সেটিংস</span>
                        </div>
                      </Link>
                      <div className="h-[1px] bg-white/10 my-1" />
                      <button 
                        onClick={() => setIsOpen(false)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all group text-left"
                      >
                        <LogOut className="w-4 h-4 text-rose-500 group-hover:translate-x-0.5 transition-transform" />
                        <span>লগআউট করুন</span>
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

        </div>
      </nav>

      {/* ২. হেডার সেকশন (এসইও ফোকাসড H1) */}
      <header className="text-center z-10 mb-8 md:mb-14 space-y-2 md:space-y-4 px-2">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-100 to-neutral-400">
          সব ক্যাটাগরি একসাথে
        </h1>
        <p className="text-neutral-500 text-xs sm:text-sm md:text-base font-medium max-w-sm sm:max-w-md mx-auto">
          আপনার প্রিয় প্রিমিয়াম ক্যাটাগরি বেছে নিন এবং সেরা গেম ও শপিং ডিলগুলো এক্সপ্লোর করুন।
        </p>
      </header>

      {/* ৩. রেসপন্সিভ ক্যাটাগরি গ্রিড (মোবাইলে ২ কলাম, পিসিতে ৩ কলাম) */}
      <main className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 md:gap-8 w-full max-w-7xl z-10">
        {categories.map((cat) => (
          <article key={cat.id} className="group">
            <motion.div
              whileHover={{ y: -6, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              style={{
                ['--glow-hover-color' as any]: cat.glowColor,
              }}
              className="relative h-[220px] sm:h-[280px] md:h-[340px] rounded-2xl sm:rounded-[28px] md:rounded-[32px] overflow-hidden bg-neutral-900/40 border border-neutral-800/80 backdrop-blur-md cursor-pointer shadow-xl transition-all duration-300 hover:border-neutral-700 hover:shadow-[0_15px_35px_var(--glow-hover-color)]"
            >
              {/* ব্যাকগ্রাউন্ড ইমেজ (উইথ এসইও অপ্টিমাইজড Alt ট্যাগ) */}
              <div className="absolute inset-0 z-0">
                <Image
                  src={cat.img}
                  alt={`${cat.title} - প্রিমিয়াম মেম্বারশিপ সার্ভিস`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover opacity-35 group-hover:opacity-45 group-hover:scale-105 transition-all duration-750 ease-out"
                  priority={false}
                />
              </div>

              {/* কালার ফিল্টার ও নিওন শাইন ওভারলে */}
              <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} z-10 transition-all duration-500 mix-blend-multiply`} />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/95 z-10" />
              <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-out z-20" />

              {/* কার্ডের কনটেন্ট এরিয়া */}
              <div className="absolute inset-0 flex flex-col justify-end p-3.5 sm:p-6 md:p-8 z-30">
                
                {/* আইকন বক্স */}
                <div className="w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 mb-2 sm:mb-4 flex items-center justify-center rounded-lg sm:rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md shadow-inner shadow-white/5 group-hover:bg-white/[0.08] group-hover:border-white/20 transition-all duration-300">
                  {cat.icon}
                </div>

                {/* টাইটেল */}
                <h2 className="text-base sm:text-xl md:text-2xl font-bold text-white tracking-wide">
                  {cat.title}
                </h2>

                {/* এসইও ফ্রেন্ডলি কাস্টম শর্ট ডেসক্রিপশন */}
                <p className="text-neutral-400 text-[10px] sm:text-xs mt-1 line-clamp-2 sm:line-clamp-none md:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {cat.description}
                </p>

                {/* এক্সপ্লোর বাটন */}
                <div className="mt-2 sm:mt-4 md:mt-5 overflow-hidden">
                  <Link href={cat.link} aria-label={`${cat.title} ক্যাটাগরি এক্সপ্লোর করুন`}>
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-2 md:py-3 px-3 rounded-lg sm:rounded-xl bg-white text-black font-bold text-center text-[11px] sm:text-xs md:text-sm shadow-md hover:bg-neutral-100 transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2"
                    >
                      <span>Explore</span>
                      <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
                    </motion.div>
                  </Link>
                </div>

              </div>

              {/* ইনার গ্লো বর্ডার */}
              <div className="absolute inset-[1px] rounded-[15px] sm:rounded-[27px] md:rounded-[31px] border border-white/[0.05] pointer-events-none z-40" />
            </motion.div>
          </article>
        ))}
      </main>
    </div>
  );
}



// "use client";

// import { motion } from "framer-motion";
// import { ShoppingBag, TrendingUp, Gamepad2, Gift } from "lucide-react";
// import Image from "next/image";
// import Link from "next/link";

// type Category = {
//   id: string;
//   title: string;
//   icon: React.ReactNode;
//   img: string;
//   color: string; // Tailwind gradient classes
//   glowColor: string; // Hex code for custom shadow glow
//   link: string;
// };

// export default function AllCategorySection() {
//   const categories: Category[] = [
//     {
//       id: "games-general",
//       title: "আলটিমেট গেমস",
//       icon: <Gamepad2 className="w-6 h-6 md:w-8 md:h-8 text-yellow-400" />,
//       img: "https://images.unsplash.com/photo-1606813902818-87952c3b42e0",
//       color: "from-amber-600/40 via-orange-600/30 to-black/95",
//       glowColor: "rgba(245, 158, 11, 0.25)",
//       link: "/games",
//     },
//     {
//       id: "shopping",
//       title: "প্রিমিয়াম শপিং",
//       icon: <ShoppingBag className="w-6 h-6 md:w-8 md:h-8 text-pink-400" />,
//       img: "https://images.unsplash.com/photo-1483985988355-763728e1935b",
//       color: "from-rose-600/40 via-pink-600/30 to-black/95",
//       glowColor: "rgba(244, 63, 94, 0.25)",
//       link: "/shopping",
//     },
//     {
//       id: "trending",
//       title: "ট্রেন্ডিং নাউ",
//       icon: <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-purple-400" />,
//       img: "https://images.unsplash.com/photo-1511512578047-dfb367046420",
//       color: "from-violet-600/40 via-purple-600/30 to-black/95",
//       glowColor: "rgba(139, 92, 246, 0.25)",
//       link: "/trending",
//     },
//     {
//       id: "games-snake",
//       title: "ক্লাসিক স্নেক",
//       icon: <Gamepad2 className="w-6 h-6 md:w-8 md:h-8 text-emerald-400" />,
//       img: "https://images.unsplash.com/photo-1627856013091-fed6e4e30025",
//       color: "from-emerald-600/40 via-teal-600/30 to-black/95",
//       glowColor: "rgba(16, 185, 129, 0.25)",
//       link: "/games/Snack",
//     },
//     {
//       id: "games-jam",
//       title: "এরিনা জ্যাম",
//       icon: <Gamepad2 className="w-6 h-6 md:w-8 md:h-8 text-cyan-400" />,
//       img: "https://images.unsplash.com/photo-1542751371-adc38448a05e",
//       color: "from-cyan-600/40 via-blue-600/30 to-black/95",
//       glowColor: "rgba(6, 182, 212, 0.25)",
//       link: "/games/Jamgam",
//     },
//     {
//       id: "gifts",
//       title: "এক্সক্লুসিভ গিফট",
//       icon: <Gift className="w-6 h-6 md:w-8 md:h-8 text-red-400" />,
//       img: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48",
//       color: "from-red-600/40 via-rose-700/30 to-black/95",
//       glowColor: "rgba(239, 68, 68, 0.25)",
//       link: "/gifts",
//     },
//   ];

//   return (
//     <div className="relative min-h-screen flex flex-col items-center justify-center py-12 md:py-20 px-4 sm:px-6 md:px-8 bg-[#030303] overflow-hidden">
      
//       {/* Background Radial Lights */}
//       <div className="absolute top-[-5%] left-[-10%] w-[60%] h-[50%] rounded-full bg-purple-950/10 blur-[100px] pointer-events-none" />
//       <div className="absolute bottom-[-5%] right-[-10%] w-[60%] h-[50%] rounded-full bg-cyan-950/10 blur-[100px] pointer-events-none" />

//       {/* Modern Grid Background */}
//       <div className="absolute inset-0 bg-[linear-gradient(to_right,#141414_1px,transparent_1px),linear-gradient(to_bottom,#141414_1px,transparent_1px)] bg-[size:3rem_3rem] md:bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_85%,transparent_100%)] opacity-30 pointer-events-none" />

//       {/* Header Section */}
//       <div className="text-center z-10 mb-10 md:mb-16 space-y-2 md:space-y-4 px-2">
//         <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-100 to-neutral-400">
//           সব ক্যাটাগরি একসাথে
//         </h2>
//         <p className="text-neutral-500 text-xs sm:text-sm md:text-base font-medium max-w-sm sm:max-w-md mx-auto">
//           আপনার পছন্দের ক্যাটাগরি বেছে নিন এবং একটি প্রিমিয়াম এক্সপেরিয়েন্স উপভোগ করুন।
//         </p>
//       </div>

//       {/* Highly Responsive Grid: 
//           - Mobile: 2 Columns (`grid-cols-2`) for easy navigation
//           - Tablet: 2/3 Columns (`sm:grid-cols-2 lg:grid-cols-3`)
//           - Desktop: 3 Columns with proper spacing 
//       */}
//       <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 md:gap-8 w-full max-w-7xl z-10">
//         {categories.map((cat) => (
//           <motion.div
//             key={cat.id}
//             whileHover={{ y: -6, scale: 1.01 }}
//             transition={{ type: "spring", stiffness: 350, damping: 25 }}
//             style={{
//               ['--glow-hover-color' as any]: cat.glowColor,
//             }}
//             // Mobile-friendly height (h-[240px] on mobile, h-[340px] on desktop)
//             className="relative h-[220px] sm:h-[280px] md:h-[340px] rounded-2xl sm:rounded-[28px] md:rounded-[32px] overflow-hidden bg-neutral-900/40 border border-neutral-800/80 backdrop-blur-md cursor-pointer group shadow-xl transition-all duration-300 hover:border-neutral-700 hover:shadow-[0_15px_35px_var(--glow-hover-color)]"
//           >
//             {/* Background Image */}
//             <div className="absolute inset-0 z-0">
//               <Image
//                 src={cat.img}
//                 alt={cat.title}
//                 fill
//                 sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
//                 className="object-cover opacity-35 group-hover:opacity-45 group-hover:scale-105 transition-all duration-750 ease-out"
//                 priority={false}
//               />
//             </div>

//             {/* Gradient Mask */}
//             <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} z-10 transition-all duration-500 mix-blend-multiply`} />
//             <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/95 z-10" />

//             {/* Light Stroke Sweep Effect (Runs on hover) */}
//             <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-out z-20" />

//             {/* Content Box */}
//             <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 md:p-8 z-30">
              
//               {/* Glassmorphic Icon Wrapper */}
//               <div className="w-9 h-9 sm:w-12 sm:h-12 md:w-14 md:h-14 mb-2 sm:mb-4 flex items-center justify-center rounded-xl sm:rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md shadow-inner shadow-white/5 group-hover:bg-white/[0.08] group-hover:border-white/20 transition-all duration-300">
//                 {cat.icon}
//               </div>

//               {/* Title */}
//               <h3 className="text-base sm:text-xl md:text-2xl font-bold text-white tracking-wide">
//                 {cat.title}
//               </h3>

//               {/* Description - Desktop only for clean mobile layouts */}
//               <p className="hidden md:block text-neutral-400 text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//                 এক্সপ্লোর করতে নিচের বাটনে ক্লিক করুন।
//               </p>

//               {/* Explore Button: Full-width and highly interactive */}
//               <div className="mt-3 sm:mt-4 md:mt-5 overflow-hidden">
//                 <Link href={cat.link} className="inline-block w-full">
//                   <motion.div
//                     whileHover={{ scale: 1.01 }}
//                     whileTap={{ scale: 0.98 }}
//                     className="w-full py-2 md:py-3 px-3 rounded-lg sm:rounded-xl bg-white text-black font-bold text-center text-[11px] sm:text-xs md:text-sm shadow-md hover:bg-neutral-100 transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2"
//                   >
//                     <span>Explore</span>
//                     <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
//                   </motion.div>
//                 </Link>
//               </div>

//             </div>

//             {/* Inner Glow Border for Premium Look */}
//             <div className="absolute inset-[1px] rounded-[15px] sm:rounded-[27px] md:rounded-[31px] border border-white/[0.05] pointer-events-none z-40" />
//           </motion.div>
//         ))}
//       </div>
//     </div>
//   );
// }




// "use client";

// import { motion } from "framer-motion";
// import { ShoppingBag, TrendingUp, Gamepad2, Gift } from "lucide-react";
// import Image from "next/image";
// import Link from "next/link";

// type Category = {
//   id: string;
//   title: string;
//   icon: React.ReactNode;
//   img: string;
//   color: string; // Tailwind gradient classes
//   glowColor: string; // Hex code for custom shadow glow
//   link: string;
// };

// export default function AllCategorySection() {
//   const categories: Category[] = [
//     {
//       id: "games-general",
//       title: "আলটিমেট গেমস",
//       icon: <Gamepad2 className="w-8 h-8 md:w-9 md:h-9 text-yellow-400" />,
//       img: "https://images.unsplash.com/photo-1606813902818-87952c3b42e0",
//       color: "from-amber-600/40 via-orange-600/30 to-black/80",
//       glowColor: "rgba(245, 158, 11, 0.35)",
//       link: "/games",
//     },
//     {
//       id: "shopping",
//       title: "প্রিমিয়াম শপিং",
//       icon: <ShoppingBag className="w-8 h-8 md:w-9 md:h-9 text-pink-400" />,
//       img: "https://images.unsplash.com/photo-1483985988355-763728e1935b",
//       color: "from-rose-600/40 via-pink-600/30 to-black/80",
//       glowColor: "rgba(244, 63, 94, 0.35)",
//       link: "/shopping",
//     },
//     {
//       id: "trending",
//       title: "ট্রেন্ডিং নাউ",
//       icon: <TrendingUp className="w-8 h-8 md:w-9 md:h-9 text-purple-400" />,
//       img: "https://images.unsplash.com/photo-1511512578047-dfb367046420",
//       color: "from-violet-600/40 via-purple-600/30 to-black/80",
//       glowColor: "rgba(139, 92, 246, 0.35)",
//       link: "/trending",
//     },
//     {
//       id: "games-snake",
//       title: "ক্লাসিক স্নেক",
//       icon: <Gamepad2 className="w-8 h-8 md:w-9 md:h-9 text-emerald-400" />,
//       img: "https://images.unsplash.com/photo-1627856013091-fed6e4e30025",
//       color: "from-emerald-600/40 via-teal-600/30 to-black/80",
//       glowColor: "rgba(16, 185, 129, 0.35)",
//       link: "/games/Snack",
//     },
//     {
//       id: "games-jam",
//       title: "এরিনা জ্যাম",
//       icon: <Gamepad2 className="w-8 h-8 md:w-9 md:h-9 text-cyan-400" />,
//       img: "https://images.unsplash.com/photo-1542751371-adc38448a05e",
//       color: "from-cyan-600/40 via-blue-600/30 to-black/80",
//       glowColor: "rgba(6, 182, 212, 0.35)",
//       link: "/games/Jamgam",
//     },
//     {
//       id: "gifts",
//       title: "এক্সক্লুসিভ গিফট",
//       icon: <Gift className="w-8 h-8 md:w-9 md:h-9 text-red-400" />,
//       img: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48",
//       color: "from-red-600/40 via-rose-700/30 to-black/80",
//       glowColor: "rgba(239, 68, 68, 0.35)",
//       link: "/gifts",
//     },
//   ];

//   return (
//     <div className="relative min-h-screen flex flex-col items-center justify-center py-20 px-4 md:px-8 bg-[#030303] overflow-hidden selection:bg-purple-500 selection:text-white">
      
//       {/* Dynamic Luxury Background Gradients */}
//       <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/10 blur-[120px] pointer-events-none" />
//       <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-900/10 blur-[120px] pointer-events-none" />

//       {/* Cyberpunk Grid Line Overlay */}
//       <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

//       {/* Title Section */}
//       <div className="text-center z-10 mb-16 space-y-3">
//         <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-neutral-500 tracking-tight">
//           সব ক্যাটাগরি একসাথে
//         </h2>
//         <p className="text-neutral-500 text-sm md:text-base font-medium max-w-md mx-auto">
//           আপনার পছন্দের ক্যাটাগরি বেছে নিন এবং একটি প্রিমিয়াম নেভিগেশন এক্সপেরিয়েন্স উপভোগ করুন।
//         </p>
//       </div>

//       {/* Grid Layout */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-7xl z-10">
//         {categories.map((cat) => (
//           <motion.div
//             key={cat.id}
//             whileHover={{ y: -6, scale: 1.02 }}
//             transition={{ type: "spring", stiffness: 300, damping: 20 }}
//             style={{
//               // Hover গ্লো ইফেক্ট যা CSS ভ্যারিয়েবল দিয়ে হ্যান্ডেল করা হয়েছে
//               ['--glow-hover-color' as any]: cat.glowColor,
//             }}
//             className="relative h-[340px] rounded-[32px] overflow-hidden bg-neutral-900/40 border border-neutral-800 backdrop-blur-md cursor-pointer group shadow-2xl transition-all duration-300 hover:border-neutral-700 hover:shadow-[0_20px_50px_var(--glow-hover-color)]"
//           >
//             {/* Background Cover Image with Zoom Effect */}
//             <div className="absolute inset-0 z-0">
//               <Image
//                 src={cat.img}
//                 alt={cat.title}
//                 fill
//                 sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
//                 className="object-cover opacity-40 group-hover:opacity-50 group-hover:scale-105 transition-all duration-750 ease-out grayscale-[20%] group-hover:grayscale-0"
//                 priority={false}
//               />
//             </div>

//             {/* Premium Multi-layer Gradient Overlay */}
//             <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} z-10 transition-all duration-500 mix-blend-multiply`} />
//             <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/95 z-10" />

//             {/* Premium Light-Streak Shine Effect on Hover */}
//             <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-out z-20" />

//             {/* Card Content */}
//             <div className="absolute inset-0 flex flex-col justify-end p-8 z-30">
              
//               {/* Glassmorphic Icon Wrapper */}
//               <div className="w-14 h-14 mb-4 flex items-center justify-center rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md shadow-inner shadow-white/5 group-hover:bg-white/[0.08] group-hover:border-white/20 group-hover:scale-110 transition-all duration-300">
//                 {cat.icon}
//               </div>

//               {/* Category Title */}
//               <h3 className="text-2xl font-bold text-white tracking-wide group-hover:text-neutral-200 transition-colors duration-300">
//                 {cat.title}
//               </h3>

//               {/* Sub-description (Premium Addition) */}
//               <p className="text-neutral-400 text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 line-clamp-1">
//                 এক্সপ্লোর করতে নিচের বাটনে ক্লিক করুন।
//               </p>

//               {/* Luxury Explore Button */}
//               <div className="mt-5 pt-2 overflow-hidden">
//                 <Link href={cat.link} className="inline-block w-full">
//                   <motion.div
//                     whileHover={{ scale: 1.01 }}
//                     whileTap={{ scale: 0.98 }}
//                     className="w-full py-3 px-4 rounded-xl bg-white text-black font-semibold text-center text-sm shadow-[0_4px_20px_rgba(255,255,255,0.15)] hover:bg-neutral-100 transition-all duration-300 flex items-center justify-center gap-2"
//                   >
//                     <span>Explore Now</span>
//                     <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
//                   </motion.div>
//                 </Link>
//               </div>

//             </div>

//             {/* Thin Aesthetic Border Inner Line */}
//             <div className="absolute inset-[1px] rounded-[31px] border border-white/[0.05] pointer-events-none z-40" />
//           </motion.div>
//         ))}
//       </div>
//     </div>
//   );
// }



// "use client";

// import { useEffect, useState, useMemo } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { ShoppingBag, TrendingUp, Gamepad2, Gift, Layers } from "lucide-react";
// import Image from "next/image";
// import Link from "next/link";

// // টাইপস
// type Particle = {
//   top: number;
//   left: number;
//   size: number;
//   duration: number;
//   delay: number;
//   colorIndex: number;
//   shapeIndex: number;
//   rotate: number;
//   opacity: number;
//   parallax: number;
//   id: number;
// };

// type Burst = {
//   x: number;
//   y: number;
//   size: number;
//   color: string;
//   id: number;
// };

// export default function AllCategorySection() {
//   const [scrollY, setScrollY] = useState(0);
//   const [pointerPos, setPointerPos] = useState({ x: 0, y: 0 });
//   const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
//   const [clickBursts, setClickBursts] = useState<Burst[]>([]);

//   // ক্যাটাগরি ডাটা
//   const categories = [

//     {
//       title: "গেমস",
//       icon: <Gamepad2 size={36} />,
//       img: "https://images.unsplash.com/photo-1606813902818-87952c3b42e0",
//       color: "from-yellow-500 to-orange-600",
//          link: "/games",
//     },


//     {
//       title: "গেমস",
//       icon: <Gamepad2 size={36} />,
//       img: "https://images.unsplash.com/photo-1606813902818-87952c3b42e0",
//       color: "from-yellow-500 to-orange-600",
//          link: "/games",
//     },


//     {
//       title: "গেমস",
//       icon: <Gamepad2 size={36} />,
//       img: "https://images.unsplash.com/photo-1606813902818-87952c3b42e0",
//       color: "from-yellow-500 to-orange-600",
//          link: "/games",
//     },



//     {
//       title: "গেমস",
//       icon: <Gamepad2 size={36} />,
//       img: "https://images.unsplash.com/photo-1606813902818-87952c3b42e0",
//       color: "from-yellow-500 to-orange-600",
//          link: "/games",
//     },



//     {
//       title: "গেমস (snacke )",
//       icon: <Gamepad2 size={36} />,
//       img: "https://images.unsplash.com/photo-1606813902818-87952c3b42e0",
//       color: "from-yellow-500 to-orange-600",
//          link: "/games/Snack",
//     },


//     {
//       title: "গেমস (jam) ",
//       icon: <Gamepad2 size={36} />,
//       img: "https://images.unsplash.com/photo-1606813902818-87952c3b42e0",
//       color: "from-yellow-500 to-orange-600",
//          link: "/games/Jamgam",
//     },


//     {
//       title: "গেমস",
//       icon: <Gamepad2 size={36} />,
//       img: "https://images.unsplash.com/photo-1606813902818-87952c3b42e0",
//       color: "from-yellow-500 to-orange-600",
//          link: "/games",
//     },

//   ];

//   const shapes = ["circle", "star", "triangle"];
//   const colors = [
//     "#FF3CFF",
//     "#00FFFF",
//     "#FFAA00",
//     "#FF0055",
//     "#00FFAA",
//     "#FF33AA",
//     "#33FFAA",
//   ];


//   return (
//     <div
//       className="relative min-h-screen flex flex-col items-center justify-center p-6 bg-black overflow-hidden"
//     >
//       {/* Background Effects */}
//       <div className="absolute inset-0 grid bg-transparent before:content-[''] before:absolute before:inset-0 before:bg-[repeating-linear-gradient(0deg,#0ff0_0_1px,#0000_1px_20px)] after:content-[''] after:absolute after:inset-0 after:bg-[repeating-linear-gradient(90deg,#0ff0_0_1px,#0000_1px_20px)] animate-[pulse_10s_linear_infinite] pointer-events-none"></div>
//       <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,255,255,0.05)_0_1px,transparent_1px_3px)] animate-[scroll_2s_linear_infinite] pointer-events-none"></div>

//       <h2 className="text-3xl md:text-4xl font-bold text-white mb-10 drop-shadow-lg z-10 relative">
//         সব ক্যাটাগরি একসাথে
//       </h2>

//       <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-7xl z-10 relative">
//         {categories.map((cat, index) => (
//           <motion.div
//             key={index}
//             whileHover={{ scale: 1.08, rotate: 2 }}
//             whileTap={{ scale: 0.95 }}
//             className="relative rounded-3xl shadow-2xl overflow-hidden cursor-pointer group"
//           >
//             <Image
//               src={cat.img}
//               alt={cat.title}
//               width={500}
//               height={300}
//               className="w-full h-60 object-cover group-hover:scale-110 transition-transform duration-500"
//             />
//             <div
//               className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-60 group-hover:opacity-80 transition-all duration-500`}
//             />

//             {/* Particles */}
      

//             {/* Burst effect */}
        

//             {/* Category Content */}
//             <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10 p-4 space-y-3">
//               <div className="drop-shadow-[0_0_20px_rgba(255,255,255,0.9)]">
//                 {cat.icon}
//               </div>
//               <h3 className="text-lg md:text-xl font-semibold">{cat.title}</h3>
//               <Link href={cat.link}>
//                 <motion.button
//                   whileHover={{
//                     scale: 1.1,
//                     textShadow: "0 0 15px #fff",
//                     boxShadow: "0 0 20px #fff",
//                   }}
//                   className="mt-2 px-5 py-2 rounded-xl bg-white/10 backdrop-blur-md text-white font-semibold border border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.6)] hover:bg-white/20 transition-all duration-300"
//                 >
//                   Explore Now →
//                 </motion.button>
//               </Link>
//             </div>
//             <div className="absolute inset-0 rounded-3xl border-2 border-white/20 blur-md animate-pulse"></div>
//           </motion.div>
//         ))}
//       </div>
//     </div>
//   );
// }


