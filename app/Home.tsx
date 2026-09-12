"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, TrendingUp, Gamepad2, Gift, Layers, HeartIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FaFemale, FaLaptopCode, FaMale } from "react-icons/fa";

// টাইপস
type Particle = {
  top: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  colorIndex: number;
  shapeIndex: number;
  rotate: number;
  opacity: number;
  parallax: number;
  id: number;
};

type Burst = {
  x: number;
  y: number;
  size: number;
  color: string;
  id: number;
};

export default function AllCategorySection() {
  const [scrollY, setScrollY] = useState(0);
  const [pointerPos, setPointerPos] = useState({ x: 0, y: 0 });
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [clickBursts, setClickBursts] = useState<Burst[]>([]);



  // ক্যাটাগরি ডাটা
  const categories = [
    {
      title: "নতুন পণ্য",
      icon: <ShoppingBag size={36} />,
      img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
      color: "from-pink-500 to-purple-600",
  link: "/products/new",
    },
    {
      title: "পুরাতন পণ্য",
      icon: <Layers size={36} />,
      img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
      color: "from-blue-500 to-cyan-500",
      link: "/products/old",
    },
    {
      title: "শেয়ার মার্কেট",
      icon: <TrendingUp size={36} />,
      img: "https://images.unsplash.com/photo-1569025690938-a00729c9e1e8",
      color: "from-green-500 to-emerald-500",
      link: "/share-market",
    },
    {
      title: "গেমস",
      icon: <Gamepad2 size={36} />,
      img: "https://images.unsplash.com/photo-1606813902818-87952c3b42e0",
      color: "from-yellow-500 to-orange-600",
         link: "/games",
    },
    {
      title: "লটারী স্পিন",
      icon: <Gift size={36} />,
      img: "https://images.unsplash.com/photo-1603297631957-4b2c6313f93e",
      color: "from-red-500 to-pink-600",
      link: "/Lottery",
    },


{
  title: "আইটি সমাধান",
  icon: (
    <div className="relative flex items-center justify-center w-12 h-12">
      {/* গ্লো ইফেক্ট ও অ্যানিমেশনসহ মডার্ন ল্যাপটপ/কোড আইকন */}
      <FaLaptopCode 
        size={36} 
        className="text-cyan-400 animate-pulse" 
        style={{ filter: "drop-shadow(0 0 10px rgba(34, 211, 238, 0.9))" }}
      />
      
    </div>
  ),
  img: "https://images.unsplash.com/photo-1603297631957-4b2c6313f93e",
  // একটি ভাইব্রেন্ট টেক-নিয়ন গ্রেডিয়েন্ট
  color: "from-cyan-500 via-blue-600 to-indigo-700 shadow-[0_0_20px_rgba(6,182,212,0.6)]",
  link: "/it-solution", // লিংকটিও আইটির সাথে সামঞ্জস্যপূর্ণ করা হলো
},


{
  title: "বিবাহ বন্ধন বা ঘটক",
  icon: (
    <>
      <FaMale size={36} style={{position:'absolute',marginLeft:'22px'}} />
      <FaFemale size={36} />
    </>
  ),
  img: "https://images.unsplash.com/photo-1603297631957-4b2c6313f93e",
  color: "from-red-500 to-pink-600",
  link: "/nikah",
},
    {
      title: "অন্য সেবা",
      icon: <Layers size={36} />,
      img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
      color: "from-indigo-500 to-violet-600",
      link: "/services",
    },
  ];

  const shapes = ["circle", "star", "triangle"];
  const colors = [
    "#FF3CFF",
    "#00FFFF",
    "#FFAA00",
    " #FF0055",
    "#00FFAA",
    "#FF33AA",
    "#33FFAA",
  ];


  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center p-6 bg-black overflow-hidden"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 grid bg-transparent before:content-[''] before:absolute before:inset-0 before:bg-[repeating-linear-gradient(0deg,#0ff0_0_1px,#0000_1px_20px)] after:content-[''] after:absolute after:inset-0 after:bg-[repeating-linear-gradient(90deg,#0ff0_0_1px,#0000_1px_20px)] animate-[pulse_10s_linear_infinite] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,255,255,0.05)_0_1px,transparent_1px_3px)] animate-[scroll_2s_linear_infinite] pointer-events-none"></div>

      <h2 className="text-3xl md:text-4xl font-bold text-white mb-10 drop-shadow-lg z-10 relative">
        সব ক্যাটাগরি একসাথে
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-7xl z-10 relative">
        {categories.map((cat, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.08, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
            className="relative rounded-3xl shadow-2xl overflow-hidden cursor-pointer group"
          >
            <Image
              src={cat.img}
              alt={cat.title}
              width={500}
              height={300}
              className="w-full h-60 object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div
              className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-60 group-hover:opacity-80 transition-all duration-500`}
            />

            {/* Particles */}
      

            {/* Burst effect */}
        

            {/* Category Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10 p-4 space-y-3">
              <div className="drop-shadow-[0_0_20px_rgba(255,255,255,0.9)]">
                {cat.icon}
              </div>
              <h3 className="text-lg md:text-xl font-semibold">{cat.title}</h3>
              <Link href={cat.link}>
                <motion.button
                  whileHover={{
                    scale: 1.1,
                    textShadow: "0 0 15px #fff",
                    boxShadow: "0 0 20px #fff",
                  }}
                  className="mt-2 px-5 py-2 rounded-xl bg-white/10 backdrop-blur-md text-white font-semibold border border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.6)] hover:bg-white/20 transition-all duration-300"
                >
                  Explore Now →
                </motion.button>
              </Link>
            </div>
            <div className="absolute inset-0 rounded-3xl border-2 border-white/20 blur-md animate-pulse"></div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}


