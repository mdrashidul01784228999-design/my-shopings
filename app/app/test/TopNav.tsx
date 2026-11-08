


"use client";

import { Bell, Search, User, Coins, Home, Settings, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import CountUp from "react-countup";

export default function Neon3DPage() {
  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col overflow-hidden">
      {/* 🌌 Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-black to-cyan-900 animate-pulse opacity-40"></div>
      <div className="absolute inset-0">
        <motion.div
          className="absolute w-40 h-40 rounded-full bg-pink-500/30 blur-3xl"
          animate={{ x: [0, 200, -200, 0], y: [0, 150, -150, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute w-60 h-60 rounded-full bg-cyan-500/30 blur-3xl"
          animate={{ x: [200, -200, 0], y: [-100, 200, 0] }}
          transition={{ duration: 25, repeat: Infinity }}
        />
      </div>

      {/* 🔵 Top Bar */}
      <div className="relative z-10 w-full bg-black/60 backdrop-blur-md text-white shadow-lg px-4 py-2 flex items-center justify-between 
      border-b-2 border-blue-500 rounded-b-2xl 
      [box-shadow:0_0_20px_#00f,0_0_40px_#00f,inset_0_0_15px_#00f]">
        
        {/* Left Logo */}
        <div className="flex items-center gap-2">
          <motion.div
            whileHover={{ scale: 1.3, rotate: 5 }}
            className="text-2xl font-bold text-blue-400 cursor-pointer
            [text-shadow:0_0_15px_#00f,0_0_30px_#0ff,0_0_60px_#0ff]"
          >
            f
          </motion.div>
          <span className="hidden sm:block font-semibold">MyFacebook</span>
        </div>

        {/* Search */}
        <div className="hidden sm:flex items-center rounded-full px-3 py-1 w-72 
        border border-pink-500 [box-shadow:0_0_20px_#ff00ff,0_0_40px_#ff00ff,inset_0_0_15px_#ff00ff]">
          <Search className="w-4 h-4 text-pink-400" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent outline-none px-2 text-sm w-full text-pink-200 placeholder-pink-400"
          />
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* Coin Balance */}
          <motion.div
            whileHover={{ scale: 1.2, rotate: 10 }}
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex items-center gap-1 px-3 py-1 rounded-full cursor-pointer
            border border-yellow-400 bg-black/80 
            [box-shadow:0_0_20px_#ff0,0_0_40px_#ff0,inset_0_0_15px_#ff0]"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <Coins className="w-5 h-5 text-yellow-300" />
            </motion.div>
            <span className="font-semibold text-yellow-200">
              <CountUp end={2500} duration={2} separator="," /> R
            </span>
          </motion.div>

          <Bell className="w-6 h-6 cursor-pointer text-cyan-300 hover:text-cyan-400 
          [text-shadow:0_0_15px_#0ff,0_0_30px_#0ff]" />
          <User className="w-6 h-6 cursor-pointer text-green-300 hover:text-green-400 
          [text-shadow:0_0_15px_#0f0,0_0_30px_#0f0]" />
        </div>
      </div>

      {/* 🔴 Page Body */}
      <div className="relative z-10 flex flex-1">
        {/* Sidebar */}
        <div className="w-20 md:w-60 bg-black/60 backdrop-blur-md border-r-2 border-purple-500 
        [box-shadow:0_0_20px_#a0f,0_0_40px_#a0f,inset_0_0_15px_#a0f] p-4 flex flex-col gap-6">
          {[
            { icon: <Home />, label: "Home" },
            { icon: <MessageCircle />, label: "Messages" },
            { icon: <Settings />, label: "Settings" },
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.15, x: 6 }}
              className="flex items-center gap-3 cursor-pointer px-3 py-2 rounded-lg border border-purple-400 
              [box-shadow:0_0_15px_#a0f,0_0_30px_#a0f,inset_0_0_10px_#a0f]"
            >
              {item.icon}
              <span className="hidden md:block">{item.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((card, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.08, rotate: 2 }}
              className="p-6 rounded-xl border border-cyan-400 
              [box-shadow:0_0_25px_#0ff,0_0_50px_#0ff,inset_0_0_15px_#0ff]
              bg-black/40 backdrop-blur-md relative overflow-hidden"
            >
              {/* Floating shape inside card */}
              <motion.div
                className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-cyan-500/20 blur-3xl"
                animate={{ x: [0, 30, -30, 0], y: [0, -20, 20, 0] }}
                transition={{ duration: 12, repeat: Infinity }}
              />
              <h2 className="text-xl font-bold text-cyan-300 mb-2">Neon Card {card}</h2>
              <p className="text-sm text-gray-300">
                3D Glass + Neon Glow Card। Hover করলে rotate + glow বাড়বে 🚀
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
