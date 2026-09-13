"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Languages, Binary, Copy, Check, CircleDollarSign } from "lucide-react";

export default function UltimateConverter() {
  const [number, setNumber] = useState<string>("");
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // ================= ENGLISH MAIN LOGIC =================
  const rawEnglishWords = (n: number): string => {
    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : "");
    if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 !== 0 ? " and " + rawEnglishWords(n % 100) : "");
    if (n < 100000) return rawEnglishWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 !== 0 ? " " + rawEnglishWords(n % 1000) : "");
    if (n < 10000000) return rawEnglishWords(Math.floor(n / 100000)) + " Lakh" + (n % 100000 !== 0 ? " " + rawEnglishWords(n % 100000) : "");
    return rawEnglishWords(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 !== 0 ? " " + rawEnglishWords(n % 10000000) : "");
  };

  const convertToEnglishWords = (numStr: string): string => {
    if (!numStr || isNaN(Number(numStr)) || parseFloat(numStr) < 0) return "";
    
    const parts = numStr.split(".");
    const takaPart = parseInt(parts[0]) || 0;
    let poishaPart = parts[1] ? parts[1].substring(0, 2) : "0";
    if (parts[1] && parts[1].length === 1) poishaPart += "0"; 
    const poishaNum = parseInt(poishaPart) || 0;

    if (takaPart === 0 && poishaNum === 0) return "Zero Taka Only";
    
    let result = "";
    if (takaPart > 0) {
      result += rawEnglishWords(takaPart) + (takaPart === 1 ? " Taka" : " Taka");
    }
    if (poishaNum > 0) {
      if (takaPart > 0) result += " and ";
      result += rawEnglishWords(poishaNum) + " Poisha";
    }
    return result + " Only";
  };

  // ================= BANGLA MAIN LOGIC =================
  const rawBanglaWords = (n: number): string => {
    const bnNumbers = [
      "", "এক", "দুই", "তিন", "চার", "পাঁচ", "ছয়", "সাত", "আট", "নয়", "দশ", "এগারো", "বারো", "তেরো", "চোদ্দ", "পনেরো", "ষোলো", "সতেরো", "আঠারো", "উনিশ", "বিশ", "একুশ", "বাইশ", "তেইশ", "চব্বিশ", "পঁচিশ", "ছাব্বিশ", "সাতাশ", "আটআশ", "উনত্রিশ", "ত্রিশ", "একত্রিশ", "বত্রিশ", "তেত্রিশ", "চৌত্রিশ", "পঁয়ত্রিশ", "ছত্রিশ", "সাইত্রিশ", "আটত্রিশ", "ঊনচল্লিশ", "চল্লিশ", "একচল্লিশ", "বিয়াল্লিশ", "তেতাল্লিশ", "চৌয়াল্লিশ", "পঁয়তাল্লিশ", "ছেচল্লিশ", "চল্লিশ", "আটচল্লিশ", "ঊনপঞ্চাশ", "পঞ্চাশ", "একান্ন", "বায়ান্ন", "তিরিশ", "চৌয়ান্ন", "পঞ্চান্ন", "ছাপ্পান্ন", "সাতান্ন", "আটান্ন", "ঊনষাট", "ষাট", "একষট্টি", "বাষট্টি", "তেষট্টি", "চৌষট্টি", "পঁয়ষট্টি", "ছেষট্টি", "সাতষট্টি", "আটষট্টি", "ঊনসত্তর", "সত্তর", "একাত্তর", "বাহাত্তর", "তেহাত্তর", "চৌহাত্তর", "পঁচাত্তর", "ছেয়াত্তর", "সাতাত্তর", "আটাত্তর", "ঊনআশি", "আশি", "একাশি", "বিরাশি", "তিরাশি", "চৌরাশি", "পঁচিশ", "ছেঁড়াশি", "সাতাসি", "অষ্টআশি", "ঊননব্বই", "নব্বই", "একানব্বই", "বিরানব্বই", "তিরানব্বই", "চৌরানব্বই", "পঁচানব্বই", "ছেয়ানব্বই", "সাতানব্বই", "আটানব্বই", "নিরানব্বই"
    ];

    if (n < 100) return bnNumbers[n];
    if (n < 1000) return bnNumbers[Math.floor(n / 100)] + " শত " + (n % 100 !== 0 ? rawBanglaWords(n % 100) : "");
    if (n < 100000) return rawBanglaWords(Math.floor(n / 1000)) + " হাজার " + (n % 1000 !== 0 ? rawBanglaWords(n % 1000) : "");
    if (n < 10000000) return rawBanglaWords(Math.floor(n / 100000)) + " লক্ষ " + (n % 100000 !== 0 ? rawBanglaWords(n % 100000) : "");
    return rawBanglaWords(Math.floor(n / 10000000)) + " কোটি " + (n % 10000000 !== 0 ? rawBanglaWords(n % 10000000) : "");
  };

  const convertToBanglaWords = (numStr: string): string => {
    if (!numStr || isNaN(Number(numStr)) || parseFloat(numStr) < 0) return "";

    const parts = numStr.split(".");
    const takaPart = parseInt(parts[0]) || 0;
    let poishaPart = parts[1] ? parts[1].substring(0, 2) : "0";
    if (parts[1] && parts[1].length === 1) poishaPart += "0"; 
    const poishaNum = parseInt(poishaPart) || 0;

    if (takaPart === 0 && poishaNum === 0) return "শূণ্য টাকা মাত্র";

    let result = "";
    if (takaPart > 0) {
      result += rawBanglaWords(takaPart) + " টাকা";
    }
    if (poishaNum > 0) {
      if (takaPart > 0) result += " ";
      result += rawBanglaWords(poishaNum) + " পয়সা";
    }
    return result.trim().replace(/\s+/g, ' ') + " মাত্র";
  };

  const copyToClipboard = (text: string, type: string): void => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 md:p-8 relative overflow-hidden font-sans selection:bg-cyan-500/30">
      
      {/* ফিউচারিস্টিক গ্লো বেস ব্যাকগ্রাউন্ড */}
      <div className="absolute top-1/4 left-1/3 w-[350px] h-[350px] bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 rounded-full blur-[100px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-[350px] h-[350px] bg-gradient-to-br from-fuchsia-500/10 to-indigo-500/20 rounded-full blur-[120px] animate-bounce pointer-events-none [animation-duration:12s]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl bg-slate-900/40 backdrop-blur-3xl border border-slate-800 rounded-[2rem] shadow-[0_30px_100px_-15px_rgba(6,182,212,0.15)] p-6 md:p-10 relative z-10"
      >
        {/* প্রিমিয়াম নিয়ন লাইন */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-fuchsia-500" />

        {/* হেডার */}
        <div className="flex flex-col items-center text-center mb-8">
          <motion.div whileHover={{ scale: 1.1, rotate: 360 }} transition={{ duration: 0.5 }} className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl mb-4 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            <CircleDollarSign className="w-6 h-6" />
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Fin<span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Word</span> Smart
          </h1>
          <p className="text-slate-400 text-xs md:text-sm mt-1.5 tracking-wider font-medium flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-fuchsia-400 animate-pulse" /> টাকা ও পয়সার অল-ইন-ওয়ান কনভার্টার
          </p>
        </div>

        {/* ইনপুট ফিল্ড (দশমিক ও পয়সা সাপোর্ট সহ) */}
        <div className="mb-8 relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300" />
          <div className="relative bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex items-center gap-4 focus-within:border-cyan-500/40 transition-all">
            <Binary className="w-6 h-6 text-slate-500 shrink-0 hidden sm:block" />
            <input
              type="number"
              step="0.01" 
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="টাকা ও পয়সা লিখুন (যেমন: ৪২০.৫০)"
              className="w-full bg-transparent text-2xl md:text-3xl font-bold tracking-wide text-white focus:outline-none placeholder-slate-700"
            />
          </div>
        </div>

        {/* রেজাল্ট কার্ডস */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            
            {/* বাংলা কার্ড */}
            <motion.div layout className="relative bg-gradient-to-b from-slate-950/40 to-transparent border border-slate-800/60 rounded-2xl p-5 hover:border-cyan-500/20 transition-all duration-300">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold tracking-widest uppercase text-cyan-400 bg-cyan-500/5 px-2.5 py-1 rounded-md border border-cyan-500/10">বাংলায় কথা</span>
                {number && (
                  <button onClick={() => copyToClipboard(convertToBanglaWords(number), 'bn')} className="text-slate-500 hover:text-white p-1.5 hover:bg-slate-800/50 rounded-lg transition">
                    {copiedType === 'bn' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                )}
              </div>
              <motion.p key={number ? "bn-active" : "bn-empty"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-lg md:text-xl font-bold text-cyan-300 min-h-[2rem] leading-relaxed">
                {number ? convertToBanglaWords(number) : <span className="text-slate-600 font-normal italic text-sm">সংখ্যা লেখার জন্য অপেক্ষা করা হচ্ছে...</span>}
              </motion.p>
            </motion.div>

            {/* ইংরেজি কার্ড */}
            <motion.div layout className="relative bg-gradient-to-b from-slate-950/40 to-transparent border border-slate-800/60 rounded-2xl p-5 hover:border-purple-500/20 transition-all duration-300">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold tracking-widest uppercase text-purple-400 bg-purple-500/5 px-2.5 py-1 rounded-md border border-purple-500/10">In English</span>
                {number && (
                  <button onClick={() => copyToClipboard(convertToEnglishWords(number), 'en')} className="text-slate-500 hover:text-white p-1.5 hover:bg-slate-800/50 rounded-lg transition">
                    {copiedType === 'en' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                )}
              </div>
              <motion.p key={number ? "en-active" : "en-empty"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-lg md:text-xl font-bold text-slate-100 min-h-[2rem] leading-relaxed capitalize">
                {number ? convertToEnglishWords(number) : <span className="text-slate-600 font-normal italic text-sm">Awaiting numeric digits...</span>}
              </motion.p>
            </motion.div>

          </AnimatePresence>
        </div>

        {/* বটম ফুটার বার */}
        <div className="mt-8 pt-5 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <span className="tracking-wider">AUTOMATIC TAKA-POISHA DETECTOR</span>
          <span className="flex items-center gap-1.5 text-cyan-400/80">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" /> Engine Ready
          </span>
        </div>

      </motion.div>
    </div>
  );
}




// "use client";
// import { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { Sparkles, Languages, Binary, Copy, Check } from "lucide-react";

// export default function NumberToWordsPremium() {
//   const [number, setNumber] = useState("");
//   const [copiedType, setCopiedType] = useState(null);

//   // ================= ENGLISH LOGIC =================
//   const convertToEnglishWords = (num) => {
//     if (!num || isNaN(num) || num < 0) return "";
//     if (parseInt(num) === 0) return "Zero";
//     const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
//     const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    
//     const convert = (n) => {
//       if (n < 20) return ones[n];
//       if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : "");
//       if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 !== 0 ? " and " + convert(n % 100) : "");
//       if (n < 100000) return convert(Math.floor(n / 1000)) + " Thousand" + (n % 1000 !== 0 ? " " + convert(n % 1000) : "");
//       if (n < 10000000) return convert(Math.floor(n / 100000)) + " Lakh" + (n % 100000 !== 0 ? " " + convert(n % 100000) : "");
//       return convert(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 !== 0 ? " " + convert(n % 10000000) : "");
//     };
//     return convert(parseInt(num));
//   };

//   // ================= BANGLA LOGIC =================
//   const convertToBanglaWords = (num) => {
//     if (!num || isNaN(num) || num < 0) return "";
//     if (parseInt(num) === 0) return "শূন্য";
//     const bnNumbers = [
//       "", "এক", "দুই", "তিন", "চার", "পাঁচ", "ছয়", "সাত", "আট", "নয়", "দশ", "এগারো", "বারো", "তেরো", "চোদ্দ", "পনেরো", "ষোলো", "সতেরো", "আঠারো", "উনিশ", "বিশ", "একুশ", "বাইশ", "তেইশ", "চব্বিশ", "পঁচিশ", "ছাব্বিশ", "সাতাশ", "আটআশ", "উনত্রিশ", "ত্রিশ", "একত্রিশ", "বত্রিশ", "তেত্রিশ", "চৌত্রিশ", "পঁয়ত্রিশ", "ছত্রিশ", "সাইত্রিশ", "আটত্রিশ", "ঊনচল্লিশ", "চল্লিশ", "একচল্লিশ", "বিয়াল্লিশ", "তেтал্লিশ", "চৌয়াল্লিশ", "পঁয়তাল্লিশ", "ছেচল্লিশ", "চল্লিশ", "আটচল্লিশ", "ঊনপঞ্চাশ", "পঞ্চাশ", "একান্ন", "বায়ান্ন", "তিরিশ", "চৌয়ান্ন", "পঞ্চান্ন", "ছাপ্পান্ন", "সাতան্ন", "আটান্ন", "ঊনষাট", "ষাট", "একষট্টি", "বাষট্টি", "তেষট্টি", "চৌষট্টি", "পঁয়ষট্টি", "ছেষট্টি", "সাতষট্টি", "আটষট্টি", "ঊনসত্তর", "সত্তর", "একাত্তর", "বাহাত্তর", "তেহাত্তর", "চৌহাত্তর", "পঁচাত্তর", "ছেয়াত্তর", "সাতাত্তর", "আটাত্তর", "ঊনআশি", "আশি", "একাশি", "বিরাশি", "তিরাশি", "চৌরাশি", "পঁচিশ", "ছেঁড়াশি", "সাতাসি", "অষ্টআশি", "ঊননব্বই", "নব্বই", "একানব্বই", "বিরানব্বই", "তিরানব্বই", "চৌরানব্বই", "পঁচানব্বই", "ছেয়ানব্বই", "সাতানব্বই", "আটানব্বই", "নিরানব্বই"
//     ];

//     const convertBn = (n) => {
//       if (n < 100) return bnNumbers[n];
//       if (n < 1000) return bnNumbers[Math.floor(n / 100)] + " শত " + (n % 100 !== 0 ? convertBn(n % 100) : "");
//       if (n < 100000) return convertBn(Math.floor(n / 1000)) + " হাজার " + (n % 1000 !== 0 ? convertBn(n % 1000) : "");
//       if (n < 10000000) return convertBn(Math.floor(n / 100000)) + " লক্ষ " + (n % 100000 !== 0 ? convertBn(n % 100000) : "");
//       return convertBn(Math.floor(n / 10000000)) + " কোটি " + (n % 10000000 !== 0 ? convertBn(n % 10000000) : "");
//     };
//     return convertBn(parseInt(num)).trim().replace(/\s+/g, ' ');
//   };

//   const copyToClipboard = (text, type) => {
//     if (!text) return;
//     navigator.clipboard.writeText(text);
//     setCopiedType(type);
//     setTimeout(() => setCopiedType(null), 2000);
//   };

//   const englishText = convertToEnglishWords(number);
//   const banglaText = convertToBanglaWords(number);

//   return (
//     <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4 md:p-8 relative overflow-hidden font-sans selection:bg-fuchsia-500/30">
      
//       {/* ফিউচারিস্টিক গ্লোয়িং অরবিটস (Animated Background Background) */}
//       <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-gradient-to-r from-purple-600/20 to-fuchsia-600/20 rounded-full blur-[80px] md:blur-[120px] mix-blend-screen animate-pulse pointer-events-none" />
//       <div className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] md:w-[450px] md:h-[450px] bg-gradient-to-r from-cyan-600/20 to-emerald-600/20 rounded-full blur-[60px] md:blur-[100px] mix-blend-screen animate-bounce pointer-events-none [animation-duration:10s]" />

//       {/* মেইন কন্টেইনার কার্ড */}
//       <motion.div 
//         initial={{ opacity: 0, y: 30 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.6, ease: "easeOut" }}
//         className="w-full max-w-2xl bg-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-[0_0_50px_-12px_rgba(168,85,247,0.2)] p-6 md:p-12 relative z-10"
//       >
//         {/* টপ নিয়ন বর্ডার লাইন */}
//         <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-cyan-500 opacity-70" />

//         {/* হেডার */}
//         <div className="flex flex-col items-center text-center mb-10">
//           <motion.div 
//             whileHover={{ scale: 1.05, rotate: 5 }}
//             className="p-3 bg-gradient-to-br from-purple-500/10 to-fuchsia-500/10 border border-purple-500/20 rounded-2xl mb-4 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.15)]"
//           >
//             <Sparkles className="w-6 h-6 animate-spin [animation-duration:4s]" />
//           </motion.div>
//           <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
//             Lexi<span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Num</span>
//           </h1>
//           <p className="text-gray-400 text-xs md:text-sm mt-2 tracking-widest uppercase font-medium flex items-center gap-2">
//             <Languages className="w-4 h-4 text-cyan-400" /> Bilingual Number Synthesizer
//           </p>
//         </div>

//         {/* ইনপুট ফিল্ড */}
//         <div className="mb-10 relative group">
//           <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
//           <div className="relative bg-[#0b0f19] border border-white/10 rounded-2xl p-4 flex items-center gap-4 focus-within:border-purple-500/50 transition-all">
//             <Binary className="w-6 h-6 text-gray-500 shrink-0 hidden sm:block" />
//             <input
//               type="number"
//               value={number}
//               onChange={(e) => setNumber(e.target.value)}
//               placeholder="যেকোনো সংখ্যা টাইপ করুন..."
//               className="w-full bg-transparent text-2xl md:text-3xl font-bold tracking-wide text-white focus:outline-none placeholder-gray-600"
//             />
//           </div>
//         </div>

//         {/* রেজাল্ট কার্ডস */}
//         <div className="space-y-6">
//           <AnimatePresence mode="popLayout">
//             {/* ENGLISH CARD */}
//             <motion.div 
//               layout
//               className="relative bg-gradient-to-b from-white/[0.03] to-transparent border border-white/5 rounded-2xl p-6 hover:border-purple-500/30 transition-all duration-300"
//             >
//               <div className="flex justify-between items-center mb-3">
//                 <span className="text-[10px] font-bold tracking-widest uppercase text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-md border border-purple-500/10">In English</span>
//                 {englishText && (
//                   <button 
//                     onClick={() => copyToClipboard(englishText, 'en')}
//                     className="text-gray-400 hover:text-white p-1.5 hover:bg-white/5 rounded-lg transition"
//                   >
//                     {copiedType === 'en' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
//                   </button>
//                 )}
//               </div>
//               <motion.p 
//                 key={englishText || "empty-en"}
//                 initial={{ opacity: 0, y: 5 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 className="text-lg md:text-xl font-bold text-slate-100 min-h-[2rem] leading-relaxed capitalize"
//               >
//                 {englishText ? englishText : <span className="text-gray-600 font-normal italic text-base">Awaiting digital inputs...</span>}
//               </motion.p>
//             </motion.div>

//             {/* BANGLA CARD */}
//             <motion.div 
//               layout
//               className="relative bg-gradient-to-b from-white/[0.03] to-transparent border border-white/5 rounded-2xl p-6 hover:border-cyan-500/30 transition-all duration-300"
//             >
//               <div className="flex justify-between items-center mb-3">
//                 <span className="text-[10px] font-bold tracking-widest uppercase text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/10">বাংলায় অনুবাদ</span>
//                 {banglaText && (
//                   <button 
//                     onClick={() => copyToClipboard(banglaText, 'bn')}
//                     className="text-gray-400 hover:text-white p-1.5 hover:bg-white/5 rounded-lg transition"
//                   >
//                     {copiedType === 'bn' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
//                   </button>
//                 )}
//               </div>
//               <motion.p 
//                 key={banglaText || "empty-bn"}
//                 initial={{ opacity: 0, y: 5 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 className="text-lg md:text-xl font-bold text-cyan-300 min-h-[2rem] leading-relaxed"
//               >
//                 {banglaText ? banglaText : <span className="text-gray-600 font-normal italic text-base">উচ্চারণ দেখার জন্য সংখ্যা লিখুন...</span>}
//               </motion.p>
//             </motion.div>
//           </AnimatePresence>
//         </div>

//         {/* বটম স্টেটাস বার */}
//         <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500 gap-2">
//           <span>DESIGN LEVEL: ULTRA PREMIUM</span>
//           <span className="flex items-center gap-1.5 text-purple-400/70">
//             <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> Real-time Processing Active
//           </span>
//         </div>

//       </motion.div>
//     </div>
//   );
// }



// "use client";
// import { useState } from "react";

// export default function NumberToWords() {
//   const [number, setNumber] = useState("");

//   // ================= ENGLISH CONVERSION LOGIC =================
//   const convertToEnglishWords = (num) => {
//     if (!num || isNaN(num) || num < 0) return "";
//     if (parseInt(num) === 0) return "Zero";

//     const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
//     const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    
//     const convert = (n) => {
//       if (n < 20) return ones[n];
//       if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : "");
//       if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 !== 0 ? " and " + convert(n % 100) : "");
//       if (n < 100000) return convert(Math.floor(n / 1000)) + " Thousand" + (n % 1000 !== 0 ? " " + convert(n % 1000) : "");
//       if (n < 10000000) return convert(Math.floor(n / 100000)) + " Lakh" + (n % 100000 !== 0 ? " " + convert(n % 100000) : "");
//       return convert(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 !== 0 ? " " + convert(n % 10000000) : "");
//     };
    
//     return convert(parseInt(num));
//   };

//   // ================= BANGLA CONVERSION LOGIC =================
//   const convertToBanglaWords = (num) => {
//     if (!num || isNaN(num) || num < 0) return "";
//     if (parseInt(num) === 0) return "শূন্য";

//     const bnNumbers = [
//       "", "এক", "দুই", "তিন", "চার", "পাঁচ", "ছয়", "সাত", "আট", "নয়", "দশ",
//       "এগারো", "বারো", "তেরো", "চোদ্দ", "পনেরো", "ষোলো", "সতেরো", "আঠারো", "উনিশ", "বিশ",
//       "একুশ", "বাইশ", "তেইশ", "চব্বিশ", "পঁচিশ", "ছাব্বিশ", "সাতাশ", "আটআশ", "উনত্রিশ", "ত্রিশ",
//       "একত্রিশ", "বত্রিশ", "তেত্রিশ", "চৌত্রিশ", "পঁয়ত্রিশ", "ছত্রিশ", "সাইত্রিশ", "আটত্রিশ", "ঊনচল্লিশ", "চল্লিশ",
//       "একচল্লিশ", "বিয়াল্লিশ", "তেতাল্লিশ", "চৌয়াল্লিশ", "পঁয়তাল্লিশ", "ছেচল্লিশ", "চল্লিশ", "আটচল্লিশ", "ঊনপঞ্চাশ", "পঞ্চাশ",
//       "একান্ন", "বায়ান্ন", "তিরিশ", "চৌয়ান্ন", "পঞ্চান্ন", "ছাপ্পান্ন", "সাতান্ন", "আটান্ন", "ঊনষাট", "ষাট",
//       "একষট্টি", "বাষট্টি", "তেষট্টি", "চৌষট্টি", "পঁয়ষট্টি", "ছেষট্টি", "সাতষট্টি", "আটষট্টি", "ঊনসত্তর", "সত্তর",
//       "একাত্তর", "বাহাত্তর", "তেহাত্তর", "চৌহাত্তর", "পঁচাত্তর", "ছেয়াত্তর", "সাতাত্তর", "আটাত্তর", "ঊনআশি", "আশি",
//       "একাশি", "বিরাশি", "তিরাশি", "চৌরাশি", "পঁচিশ", "ছেঁড়াশি", "সাতাসি", "অষ্টআশি", "ঊননব্বই", "নব্বই",
//       "একানব্বই", "বিরানব্বই", "তিরানব্বই", "চৌরানব্বই", "পঁচানব্বই", "ছেয়ানব্বই", "সাতানব্বই", "আটানব্বই", "নিরানব্বই"
//     ];

//     const convertBn = (n) => {
//       if (n < 100) return bnNumbers[n];
//       if (n < 1000) return bnNumbers[Math.floor(n / 100)] + " শত " + (n % 100 !== 0 ? convertBn(n % 100) : "");
//       if (n < 100000) return convertBn(Math.floor(n / 1000)) + " হাজার " + (n % 1000 !== 0 ? convertBn(n % 1000) : "");
//       if (n < 10000000) return convertBn(Math.floor(n / 100000)) + " লক্ষ " + (n % 100000 !== 0 ? convertBn(n % 100000) : "");
//       return convertBn(Math.floor(n / 10000000)) + " কোটি " + (n % 10000000 !== 0 ? convertBn(n % 10000000) : "");
//     };

//     return convertBn(parseInt(num)).trim().replace(/\s+/g, ' ');
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#0f172a] flex items-center justify-center p-4 antialiased">
//       <div className="w-full max-w-xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] p-6 md:p-10 relative overflow-hidden">
        
//         {/* গ্লো ইফেক্ট ব্যাকগ্রাউন্ডে */}
//         <div className="absolute -top-10 -right-10 w-40 h-40 bg-fuchsia-500/20 rounded-full blur-3xl pointer-events-none"></div>
//         <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"></div>

//         {/* হেডার */}
//         <div className="text-center mb-10">
//           <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent tracking-tight">
//             Smart Wordify
//           </h1>
//           <p className="text-gray-400 text-xs md:text-sm mt-2 font-medium tracking-wide">
//             সংখ্যা লিখলেই স্বয়ংক্রিয়ভাবে কথা রূপান্তর করুন
//           </p>
//         </div>

//         {/* ইনপুট বক্স */}
//         <div className="space-y-3 mb-8">
//           <label className="text-[11px] font-bold text-purple-400 tracking-widest uppercase block pl-1">
//             Enter Number / সংখ্যাটি লিখুন
//           </label>
//           <div className="relative">
//             <input
//               type="number"
//               value={number}
//               onChange={(e) => setNumber(e.target.value)}
//               placeholder="যেমন: 75023"
//               className="w-full px-6 py-5 bg-black/40 border border-white/10 rounded-2xl text-2xl font-black text-center text-cyan-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 placeholder-gray-700 tracking-wider"
//             />
//           </div>
//         </div>

//         {/* আউটপুট রেজাল্ট */}
//         <div className="space-y-5">
//           {/* ইংরেজি */}
//           <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-purple-500/30 transition-all duration-300 group">
//             <div className="flex justify-between items-center mb-2">
//               <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400">In English</span>
//               <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_#a855f7]"></span>
//             </div>
//             <p className="text-base md:text-lg font-bold text-gray-100 min-h-[1.75rem] leading-relaxed capitalize">
//               {number ? convertToEnglishWords(number) : <span className="text-gray-600 font-normal italic text-sm">Waiting for input...</span>}
//             </p>
//           </div>

//           {/* বাংলা */}
//           <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-cyan-500/30 transition-all duration-300 group">
//             <div className="flex justify-between items-center mb-2">
//               <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">বাংলায় অনুবাদ</span>
//               <span className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_#06b6d4]"></span>
//             </div>
//             <p className="text-base md:text-lg font-bold text-cyan-300 min-h-[1.75rem] leading-relaxed">
//               {number ? convertToBanglaWords(number) : <span className="text-gray-600 font-normal italic text-sm">ইনপুট দেওয়ার জন্য অপেক্ষা করা হচ্ছে...</span>}
//             </p>
//           </div>
//         </div>

//         {/* ফুটার */}
//         <div className="mt-8 pt-4 border-t border-white/5 text-center text-[10px] text-gray-600 uppercase tracking-widest">
//           Premium UI Crafted with Next.js & Tailwind
//         </div>

//       </div>
//     </div>
//   );
// }
