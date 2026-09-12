"use client";
import React from "react";
// ✅ ফিক্সড: টাইপস্ক্রিপ্ট এরর এড়াতে Variants টাইপ ইম্পোর্ট করা হয়েছে
import { motion, Variants } from "framer-motion";
import { FaInfoCircle, FaUserShield, FaLock, FaCookieBite, FaUserCheck, FaSyncAlt, FaEnvelope } from "react-icons/fa";
import { TypeAnimation } from "react-type-animation";

const sections = [
  {
    title: "তথ্য সংগ্রহ",
    description: "আমরা আপনার নাম, ইমেইল, ফোন নম্বর এবং অন্যান্য প্রাসঙ্গিক তথ্য সংগ্রহ করতে পারি, যখন আপনি আমাদের সাইটে নিবন্ধন করেন বা অর্ডার দেন।",
    icon: <FaInfoCircle className="text-2xl text-blue-500 dark:text-blue-400" />,
    borderColor: "hover:border-blue-500/80 dark:hover:border-blue-400",
    shadowColor: "hover:shadow-[0_0_25px_rgba(59,130,246,0.25)] dark:hover:shadow-[0_0_30px_rgba(59,130,246,0.35)]",
    badgeBg: "bg-blue-50 dark:bg-blue-950/60"
  },
  {
    title: "can তথ্যের ব্যবহার",
    description: "আমরা আপনার তথ্য ব্যবহার করি কাস্টমার সার্ভিস উন্নত করতে, অর্ডার প্রক্রিয়া করতে এবং আমাদের অফার ও বিজ্ঞাপন আরও প্রাসঙ্গিক করতে।",
    icon: <FaUserShield className="text-2xl text-emerald-500 dark:text-emerald-400" />,
    borderColor: "hover:border-emerald-500/80 dark:hover:border-emerald-400",
    shadowColor: "hover:shadow-[0_0_25px_rgba(16,185,129,0.25)] dark:hover:shadow-[0_0_30px_rgba(16,185,129,0.35)]",
    badgeBg: "bg-emerald-50 dark:bg-emerald-950/60"
  },
  {
    title: "তথ্য সুরক্ষা",
    description: "আপনার তথ্য নিরাপদ রাখতে আমরা শক্তিশালী সুরক্ষা ব্যবস্থা গ্রহণ করি এবং আপনার অনুমতি ছাড়া তা কোনো তৃতীয় পক্ষের সাথে শেয়ার করি না।",
    icon: <FaLock className="text-xl text-rose-500 dark:text-rose-400" />,
    borderColor: "hover:border-rose-500/80 dark:hover:border-rose-400",
    shadowColor: "hover:shadow-[0_0_25px_rgba(244,63,94,0.25)] dark:hover:shadow-[0_0_30px_rgba(244,63,94,0.35)]",
    badgeBg: "bg-rose-50 dark:bg-rose-950/60"
  },
  {
    title: "কুকিজ ব্যবহারের নীতি",
    description: "আমাদের ওয়েবসাইটে কুকিজ ব্যবহার করা হয় যাতে আমরা ব্যবহারকারীর অভিজ্ঞতা উন্নত করতে পারি। আপনি চাইলে আপনার ব্রাউজার থেকে কুকিজ অস্বীকার করতে পারেন।",
    icon: <FaCookieBite className="text-xl text-amber-500 dark:text-amber-400" />,
    borderColor: "hover:border-amber-500/80 dark:hover:border-amber-400",
    shadowColor: "hover:shadow-[0_0_25px_rgba(245,158,11,0.25)] dark:hover:shadow-[0_0_30px_rgba(245,158,11,0.35)]",
    badgeBg: "bg-amber-50 dark:bg-amber-950/60"
  },
  {
    title: "আপনার অধিকার",
    description: "আপনি আপনার ব্যক্তিগত তথ্য দেখতে, সংশোধন করতে অথবা মুছে ফেলতে আমাদের সাথে যোগাযোগ করতে পারেন।",
    icon: <FaUserCheck className="text-xl text-purple-500 dark:text-purple-400" />,
    borderColor: "hover:border-purple-500/80 dark:hover:border-purple-400",
    shadowColor: "hover:shadow-[0_0_25px_rgba(168,85,247,0.25)] dark:hover:shadow-[0_0_30px_rgba(168,85,247,0.35)]",
    badgeBg: "bg-purple-50 dark:bg-purple-950/60"
  },
  {
    title: "নীতির পরিবর্তন",
    description: "আমরা প্রয়োজন অনুযায়ী গোপনীয়তা নীতি আপডেট করতে পারি। পরিবর্তনের ক্ষেত্রে আমরা এই পেজে তারিখসহ জানিয়ে দেবো।",
    icon: <FaSyncAlt className="text-xl text-indigo-500 dark:text-indigo-400" />,
    borderColor: "hover:border-indigo-500/80 dark:hover:border-indigo-400",
    shadowColor: "hover:shadow-[0_0_25px_rgba(99,102,241,0.25)] dark:hover:shadow-[0_0_30px_rgba(99,102,241,0.35)]",
    badgeBg: "bg-indigo-50 dark:bg-indigo-950/60"
  },
  {
    title: "যোগাযোগ করুন",
    description: "গোপনীয়তা নীতি সম্পর্কে যেকোনো প্রশ্ন থাকলে, আমাদের সাথে যোগাযোগ করুন: support@yourdomain.com",
    icon: <FaEnvelope className="text-xl text-fuchsia-500 dark:text-fuchsia-400" />,
    borderColor: "hover:border-fuchsia-500/80 dark:hover:border-fuchsia-400",
    shadowColor: "hover:shadow-[0_0_25px_rgba(217,70,239,0.25)] dark:hover:shadow-[0_0_30px_rgba(217,70,239,0.35)]",
    badgeBg: "bg-fuchsia-50 dark:bg-fuchsia-950/60"
  },
];

// ✅ ফিক্সড: TypeScript কম্পাইলারকে ভ্যারিয়েন্টের ইন্টারনাল অবজেক্ট চেনাতে Variants এক্সপ্লিসিট টাইপ ডিক্লেয়ার করা হয়েছে
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    transition: { type: "spring", stiffness: 90, damping: 14 } 
  },
};

export default function PrivacyClientUI() {
  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-500 overflow-hidden">
      
      {/* Dynamic Glowing Neon Ambient Orbs */}
      <div className="absolute top-[-10%] left-[-5%] -z-10 h-[300px] w-[300px] md:h-[600px] md:w-[600px] rounded-full bg-gradient-to-tr from-blue-500/20 to-cyan-400/20 blur-[80px] md:blur-[140px] dark:from-blue-600/15 dark:to-cyan-500/10" />
      <div className="absolute top-[35%] right-[-5%] -z-10 h-[350px] w-[350px] md:h-[650px] md:w-[650px] rounded-full bg-gradient-to-br from-purple-500/15 to-pink-500/20 blur-[90px] md:blur-[160px] dark:from-purple-600/10 dark:to-pink-500/15" />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        
        {/* Hero Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-14 md:mb-24"
        >
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 dark:from-blue-400 dark:via-purple-400 dark:to-cyan-400 bg-clip-text text-transparent mb-6 tracking-tight min-h-[70px] sm:min-h-[90px] md:min-h-[120px]">
            <TypeAnimation
              sequence={[
                "গোপনীয়তা নীতি",
                1500,
                "আমাদের প্রাইভেসি গাইডলাইন",
                1500,
                "আপনার তথ্য সুরক্ষায় প্রতিশ্রুতিবদ্ধ",
                1500,
              ]}
              speed={50}
              repeat={Infinity}
              wrapper="span"
            />
          </h1>
          
          <p className="mt-2 text-sm sm:text-base md:text-xl text-slate-650 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed px-2">
            আপনার গোপনীয়তা আমাদের কাছে গুরুত্বপূর্ণ। এখানে ব্যাখ্যা করা হয়েছে আপনি আমাদের সেবা ব্যবহার করলে আমরা কিভাবে তথ্য সংগ্রহ, ব্যবহার ও সংরক্ষণ করি।
          </p>
          
          <div className="mt-6 md:mt-8 w-28 h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400 mx-auto rounded-full shadow-[0_2px_10px_rgba(59,130,246,0.3)]" />
        </motion.div>

        {/* Responsive Grid Layout with Colorful Glowing Shadows */}
        <motion.section 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 gap-6"
        >
          {sections.map((section, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ 
                y: -6, 
                scale: 1.005,
              }}
              className={`group relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl p-5 sm:p-6 md:p-8 rounded-2xl md:rounded-3xl border border-slate-200/80 dark:border-slate-800/90 shadow-sm transition-all duration-350 ${section.borderColor} ${section.shadowColor}`}
            >
              <div className="flex flex-col sm:flex-row items-start gap-4 md:gap-6">
                
                {/* Colorful Accent Badge */}
                <div className={`p-3.5 sm:p-4 rounded-xl md:rounded-2xl transition-all duration-300 shadow-inner group-hover:scale-110 ${section.badgeBg}`}>
                  {section.icon}
                </div>
                
                {/* Text Content - Forces Pure White on Dark Mode */}
                <div className="space-y-2 flex-1">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight transition-colors duration-300">
                    {section.title}
                  </h2>
                  <p className="text-sm sm:text-base text-slate-650 dark:text-slate-200 leading-relaxed font-normal">
                    {section.description}
                  </p>
                </div>

              </div>
            </motion.div>
          ))}
        </motion.section>
      </main>
    </div>
  );
}

