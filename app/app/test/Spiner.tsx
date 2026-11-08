"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function MoneyComing() {
  const [balance, setBalance] = useState(10053.11);
  const [win, setWin] = useState(5010);
  const [spinning, setSpinning] = useState(false);
  const [angle, setAngle] = useState(0);
  const [slots, setSlots] = useState([5, 0, 10]);

  const spinWheel = () => {
    if (spinning) return;
    setSpinning(true);

    // Wheel ঘোরানো
    const newAngle = angle + 360 * 5 + Math.floor(Math.random() * 360);
    setAngle(newAngle);

    // Random Win amount
    const newWin = Math.floor(Math.random() * 10000);

    // Random Slots
    const newSlots = Array.from({ length: 3 }, () =>
      Math.floor(Math.random() * 10)
    );

    // Update after animation
    setTimeout(() => {
      setSlots(newSlots);
      setWin(newWin);
      setBalance((prev) => prev + newWin);
      setSpinning(false);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-900 to-yellow-900 flex flex-col items-center p-4">
      
      {/* Wheel Section */}
      <motion.div
        animate={{ rotate: angle }}
        transition={{ duration: 4, ease: "easeOut" }}
        className="relative mt-4 w-72 h-72 rounded-full border-[10px] border-yellow-500 flex items-center justify-center bg-green-700 text-white text-lg font-bold shadow-2xl overflow-hidden"
      >
        {/* Wheel Center */}
        <div className="absolute w-20 h-20 rounded-full bg-red-600 border-4 border-yellow-400 flex items-center justify-center text-3xl z-10">
          $
        </div>

        {/* Wheel Labels */}
        <div className="absolute inset-0 flex flex-col justify-between text-sm font-bold text-yellow-200">
          <div className="flex justify-around mt-6">
            <span>10,000</span>
            <span>50,000</span>
          </div>
          <div className="flex justify-around">
            <span>3,000</span>
            <span>1,000</span>
          </div>
          <div className="flex justify-around mb-6">
            <span>20,000</span>
            <span>100,000</span>
          </div>
        </div>
      </motion.div>

      {/* Arrow Pointer */}
      <div className="relative -top-72">
        <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-b-[35px] border-l-transparent border-r-transparent border-b-red-600"></div>
      </div>

      {/* Title */}
      <h1 className="mt-3 text-red-400 font-bold text-2xl drop-shadow-lg">
        Money Coming
      </h1>

      {/* Slot Machine */}
      <div className="flex gap-2 mt-4 bg-yellow-300 rounded-xl shadow-lg px-6 py-4">
        {slots.map((num, i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -50, 0] }} // up-down animation like rolling
            transition={{ repeat: 5, duration: 0.5 }}
            className="w-16 h-20 bg-green-700 text-white flex items-center justify-center text-3xl rounded-md shadow"
          >
            {num}
          </motion.div>
        ))}
      </div>

      {/* Win & Balance */}
      <div className="mt-4 text-center">
        <p className="text-yellow-300 text-xl">WIN: {win}</p>
        <p className="text-white text-lg">Balance: {balance.toFixed(2)}</p>
      </div>

      {/* Spin Button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        disabled={spinning}
        className={`mt-6 px-10 py-4 rounded-full text-xl font-bold shadow-lg ${
          spinning
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-yellow-500 hover:bg-yellow-400"
        }`}
        onClick={spinWheel}
      >
        🎰 {spinning ? "Spinning..." : "JILI SPIN"}
      </motion.button>
    </div>
  );
}