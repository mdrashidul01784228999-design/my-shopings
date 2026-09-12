"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-screen flex flex-col items-center justify-center bg-black text-white relative overflow-hidden select-none"
    >
      {/* Background Neon Glows */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-950 via-fuchsia-950 to-purple-950 opacity-40 blur-3xl" />

      {/* 3D Floating Orbs */}
      <motion.div 
        animate={{ y: [0, -30, 0], scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
        className="absolute top-10 left-20 w-48 h-48 bg-pink-500 rounded-full mix-blend-screen filter blur-3xl opacity-30"
      />
      <motion.div 
        animate={{ y: [0, 30, 0], scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 0.5 }}
        className="absolute bottom-20 right-20 w-64 h-64 bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl opacity-20"
      />

      {/* Floating Space Emojis (নড়াচড়া করা ব্যাকগ্রাউন্ড ইমোজি) */}
      <motion.div 
        animate={{ y: [0, -15, 0], rotate: [0, 10, -10, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        className="absolute top-1/4 left-12 text-5xl md:text-6xl drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]"
      >
        🚀
      </motion.div>

      <motion.div 
        animate={{ y: [0, 20, 0], rotate: [0, -15, 15, 0] }}
        transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 0.3 }}
        className="absolute bottom-1/4 right-16 text-5xl md:text-6xl drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]"
      >
        🛸
      </motion.div>

      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        className="absolute top-1/3 right-1/4 text-3xl"
      >
        ✨
      </motion.div>

      {/* Main Content Area */}
      <div className="z-10 flex flex-col items-center text-center px-4">
        
        {/* Animated Ghost Emoji */}
        <motion.div
          animate={{ 
            y: [0, -12, 0],
            rotateY: [0, 180, 180, 0] // ভূতটি এদিক ওদিক তাকাবে
          }}
          transition={{ 
            y: { repeat: Infinity, duration: 2, ease: "easeInOut" },
            rotateY: { repeat: Infinity, duration: 6, ease: "easeInOut", repeatDelay: 2 }
          }}
          className="text-7xl mb-2 drop-shadow-[0_0_20px_rgba(255,255,255,0.6)]"
        >
          👻
        </motion.div>

        {/* 3D Styled 404 Text */}
        <h1 className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-pink-400 via-purple-500 to-indigo-700 drop-shadow-[0_10px_25px_rgba(236,72,153,0.5)] tracking-tight">
          404
        </h1>

        {/* Sad Thinking Emoji */}
        <p className="mt-4 text-xl md:text-2xl font-medium text-gray-300 max-w-md flex items-center justify-center gap-2">
          Page খুঁজে পাওয়া যাচ্ছে না! 
          <motion.span
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, repeatDelay: 1 }}
            className="inline-block"
          >
            🤔
          </motion.span>
        </p>

        {/* Interactive 3D Home Button */}
        <motion.div
          whileHover={{ 
            scale: 1.08, 
            rotateX: 10, 
            rotateY: -10,
            boxShadow: "0px 15px 35px rgba(236, 72, 153, 0.6)"
          }}
          whileTap={{ scale: 0.95 }}
          style={{ transformStyle: "preserve-3d" }}
          className="mt-10 transition-all duration-200"
        >
          <Link
            href="/"
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 rounded-2xl font-bold text-lg border border-pink-400/20"
          >
            {/* Pulsing Home Emoji */}
            <motion.span 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              🏠
            </motion.span>
            <span>বাড়ি ফিরে চল</span>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
