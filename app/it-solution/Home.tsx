"use client";

import React, { useState, useEffect, useRef } from 'react';
import { FaLaptopCode, FaServer, FaShieldAlt, FaMobileAlt, FaFacebookF, FaYoutube, FaTimes, FaPaperPlane, FaUser, FaCog, FaSignOutAlt, FaThLarge } from 'react-icons/fa';
import Link from 'next/link';
import { motion, AnimatePresence, Variants } from 'framer-motion'; // Variants যুক্ত করা হয়েছে

// ================= TYPESCRIPT INTERFACES =================
interface Service {
  title: string;
  desc: string;
  icon: React.ReactNode;
  colorCode: string;
  gradient: string;
  tag: string;
}

interface FormData {
  name: string;
  email: string;
  message: string;
}
// =========================================================

// সার্ভিসের ডাটা অ্যারে
const services: Service[] = [
  {
    title: "ওয়েব অ্যাপ্লিকেশন",
    desc: "Next.js ও React দিয়ে তৈরি আল্ট্রা-ফাস্ট ও রেসপনসিভ লাইভ ওয়েব সলিউশন।",
    icon: <FaLaptopCode size={36} className="text-[#00ffff] drop-shadow-[0_0_15px_#00ffff]" />,
    colorCode: "#00ffff",
    gradient: "from-[#00ffff] via-[#0080ff] to-[#ff00ff]",
    tag: "WEB_CORE_V3"
  },
  {
    title: "ফেসবুক পেজ গ্রোথ ও ফলোয়ার",
    desc: "১০০% সেফ মেথডে পেজের রিচ, লাইক এবং অর্গানিক ফলোয়ার বাড়িয়ে নিন।",
    icon: <FaFacebookF size={36} className="text-[#0088ff] drop-shadow-[0_0_15px_#0088ff]" />,
    colorCode: "#0088ff",
    gradient: "from-[#0088ff] via-[#00f5ff] to-[#00ff88]",
    tag: "FB_GROWTH_X" 
  },
  {
    title: "ইউটিউব সাবস্ক্রাইবার ও ওয়াচটাইম",
    desc: "অর্গানিক ওয়াচটাইম এবং রিয়েল সাবস্ক্রাইবার দিয়ে দ্রুত মনিটাইজেশন অন করুন।",
    icon: <FaYoutube size={36} className="text-[#ff0055] drop-shadow-[0_0_15px_#ff0055]" />,
    colorCode: "#ff0055",
    gradient: "from-[#ff0055] via-[#ff5500] to-[#ff00ff]",
    tag: "YT_MONETIZE"
  },
  {
    title: "ক্লাউড ও সার্ভার ম্যানেজমেন্ট",
    desc: "হাই-সিকিউরড ক্লাউড সেটআপ এবং ২৪/৭ ডেডিকেটেড সার্ভার মনিটরিং।",
    icon: <FaServer size={36} className="text-[#bd00ff] drop-shadow-[0_0_15px_#bd00ff]" />,
    colorCode: "#bd00ff",
    gradient: "from-[#bd00ff] via-[#ff00ff] to-[#00ffff]",
    tag: "CLOUD_NODE_7"
  },
  {
    title: "সাইবার সিকিউরিটি",
    desc: "আপনার বিজনেস ডেটা এবং সিস্টেমকে হ্যাকিং মুক্ত রাখতে প্রিমিয়াম প্রটেকশন।",
    icon: <FaShieldAlt size={36} className="text-[#00ff66] drop-shadow-[0_0_15px_#00ff66]" />,
    colorCode: "#00ff66",
    gradient: "from-[#00ff66] via-[#00ffff] to-[#0088ff]",
    tag: "SEC_PROTOCOL"
  },
  {
    title: "মোবাইল অ্যাপ ডেভেলপমেন্ট",
    desc: "অ্যান্ড্রয়েড এবং আইওএস প্ল্যাটফর্মের জন্য আধুনিক ও ফ্লুইড নেティブ অ্যাপস।",
    icon: <FaMobileAlt size={36} className="text-[#ffcc00] drop-shadow-[0_0_15px_#ffcc00]" />,
    colorCode: "#ffcc00",
    gradient: "from-[#ffcc00] via-[#ff0055] to-[#ff00ff]",
    tag: "APP_NATIVE"
  }
];

// Framer Motion Variants (এখানে Variants টাইপ দেওয়া হয়েছে)
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } }
};

export default function GTSolutionPage() {
  // Typescript State Definitions
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({ name: '', email: '', message: '' });
  
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // ইউজারের ডামি ডাটা
  const user = {
    name: "Rashidul Islam",
    email: "rashidul@example.com",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop"
  };

  // মেনুর বাইরে ক্লিক করলে ড্রপডাউন বন্ধ করার লজিক
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Event type added for onChange
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Event type added for onSubmit
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedService) {
      alert(`ধন্যবাদ! আপনার "${selectedService.title}" সার্ভিসের রিকোয়েস্ট সফলভাবে পাঠানো হয়েছে।`);
    }
    setFormData({ name: '', email: '', message: '' });
    setSelectedService(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-900 overflow-x-hidden pt-20">
      
      {/* 🚀 Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(6,182,212,0.3)]">
            Rashidul IT
          </Link>
          
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-300 font-medium">
            <Link href="#services" className="hover:text-cyan-400 transition-colors">সার্ভিস সমূহ</Link>
            <Link href="/about" className="hover:text-cyan-400 transition-colors">আমাদের সম্পর্কে</Link>
            <Link href="/contact" className="hover:text-cyan-400 transition-colors">যোগাযোগ</Link>
          </div>

          {/* User Profile Area & Dropdown */}
          <div className="relative flex items-center gap-3" ref={dropdownRef}>
            {/* User Name beside Avatar (Desktop only) */}
            <span className="hidden sm:inline-block text-sm font-medium text-slate-300">
              {user.name}
            </span>

            {/* Avatar Trigger Button */}
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="relative group focus:outline-none"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full opacity-70 group-hover:opacity-100 blur transition duration-300"></div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={user.avatar} 
                alt="Profile" 
                className="relative w-10 h-10 rounded-full border-2 border-slate-950 object-cover"
              />
            </button>

            {/* 🛠️ User Settings Dropdown Menu */}
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute right-0 top-12 w-64 mt-2 overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-2xl backdrop-blur-xl z-50 origin-top-right"
                >
                  {/* User Profile Header Info */}
                  <div className="p-4 border-b border-slate-800 bg-slate-950/50">
                    <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>
                  </div>

                  {/* Dropdown Menu Links */}
                  <div className="p-2 space-y-1">
                    <Link 
                      href="/profile" 
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                    >
                      <FaUser size={14} className="text-cyan-400" />
                      আমার প্রোফাইল
                    </Link>
                    <Link 
                      href="/dashboard" 
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                    >
                      <FaThLarge size={14} className="text-blue-400" />
                      ড্যাশবোর্ড
                    </Link>
                    <Link 
                      href="/profile/Settings" 
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                    >
                      <FaCog size={14} className="text-purple-400" />
                      সেটিংস ও প্রাইভেসী
                    </Link>
                  </div>

                  {/* Logout Button */}
                  <div className="p-2 border-t border-slate-800 bg-slate-950/20">
                    <button 
                      onClick={() => { alert('লগআউট করা হচ্ছে...'); setDropdownOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-left"
                    >
                      <FaSignOutAlt size={14} />
                      লগআউট
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center text-center px-4 py-24 overflow-hidden border-b border-slate-900">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />

        <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="z-10 max-w-4xl">
          <motion.span variants={fadeInUp} className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 uppercase shadow-[0_0_15px_rgba(34,211,238,0.2)]">
            ভবিষ্যতের টেকনোলজি আজই
          </motion.span>
          <motion.h1 variants={fadeInUp} className="mt-6 text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            স্মার্ট ব্যবসার জন্য <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 drop-shadow-[0_0_20px_rgba(6,182,212,0.4)]">
              আধুনিক আইটি সমাধান
            </span>
          </motion.h1>
          <motion.p variants={fadeInUp} className="mt-6 text-base sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            আমরা প্রদান করি সর্বাধুনিক প্রযুক্তির ওয়েব, সফটওয়্যার এবং সাইবার সিকিউরিটি সার্ভিস। আপনার আইডিয়াকে বাস্তবে রূপ দিতে আমরা প্রস্তুত।
          </motion.p>
          <motion.div variants={fadeInUp} className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="#services" className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-medium text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:shadow-[0_0_30px_rgba(6,182,212,0.8)] hover:scale-105 transition-all duration-300">
              আমাদের সেবা সমূহ
            </Link>
            <Link href="/contact" className="px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800/80 font-medium border border-slate-800 hover:border-slate-700 hover:scale-105 transition-all duration-300">
              যোগাযোগ করুন
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Services Section */}
      <section id="services" className="max-w-7xl mx-auto px-4 py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-wide">
            আমরা যেসকল সার্ভিস প্রদান করি
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 mx-auto mt-4 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
        </motion.div>

        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div 
              key={index} 
              variants={fadeInUp}
              whileHover={{ y: -8, boxShadow: `0 10px 30px -10px ${service.colorCode}40`, borderColor: service.colorCode }}
              onClick={() => setSelectedService(service)}
              className="group relative rounded-2xl border border-slate-900 bg-slate-900/40 p-8 backdrop-blur-xl transition-all duration-300 cursor-pointer"
            >
              <div className={`absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl bg-gradient-to-r ${service.gradient} opacity-40 group-hover:opacity-100 transition-opacity duration-300`} />
              <div className="mb-6 flex items-center justify-between">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 group-hover:border-slate-700 transition-colors">
                  {service.icon}
                </div>
                <span className="text-[10px] font-mono tracking-widest text-slate-600 bg-slate-950/50 px-2.5 py-1 rounded border border-slate-900">
                  {service.tag}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-all duration-300">
                {service.title}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors duration-300">
                {service.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Interactive Request Modal Popup */}
      <AnimatePresence>
        {selectedService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedService(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl border bg-slate-900 p-6 shadow-2xl backdrop-blur-2xl"
              style={{ borderColor: selectedService.colorCode }}
            >
              <div className={`absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r ${selectedService.gradient}`} />
              
              <button 
                onClick={() => setSelectedService(null)} 
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-1 bg-slate-950 border border-slate-800 rounded-lg"
              >
                <FaTimes size={16} />
              </button>

              <div className="flex items-center gap-3 mt-2 mb-6">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  {selectedService.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedService.title}</h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">সার্ভিস রিকোয়েস্ট ফর্ম</p>
                </div>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">আপনার নাম</label>
                  <input 
                    type="text" name="name" required value={formData.name} onChange={handleInputChange} placeholder="John Doe" 
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">ইমেইল এড্রেস</label>
                  <input 
                    type="email" name="email" required value={formData.email} onChange={handleInputChange} placeholder="example@domain.com" 
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">আপনার মেসেজ</label>
                  <textarea 
                    rows={4} name="message" required value={formData.message} onChange={handleInputChange} placeholder="আপনার প্রয়োজনীয়তা বিস্তারিত লিখুন..." 
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
                  />
                </div>

                <motion.button 
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" 
                  className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl py-3.5 px-4 font-semibold text-slate-950 shadow-lg text-sm transition-all"
                  style={{ backgroundImage: `linear-gradient(to right, ${selectedService.colorCode}, #0088ff)` }}
                >
                  <FaPaperPlane size={14} />
                  রিকোয়েস্ট সাবমিট করুন
                </motion.button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <section className="bg-gradient-to-b from-slate-950 to-slate-900 border-t border-slate-900 py-12 text-center text-sm text-slate-500">
        <p>© {new Date().getFullYear()} Rashidul IT Solution. All rights reserved.</p>
      </section>

    </div>
  );
}



// "use client";

// import React, { useState } from 'react';
// import { FaLaptopCode, FaServer, FaShieldAlt, FaMobileAlt, FaFacebookF, FaYoutube, FaTimes, FaPaperPlane } from 'react-icons/fa';
// import Link from 'next/link';
// import { motion, AnimatePresence } from 'framer-motion';

// // সার্ভিসের ডাটা অ্যারে
// const services = [
//   {
//     title: "ওয়েব অ্যাপ্লিকেশন",
//     desc: "Next.js ও React দিয়ে তৈরি আল্ট্রা-ফাস্ট ও রেসপনসিভ লাইভ ওয়েব সলিউশন।",
//     icon: <FaLaptopCode size={36} className="text-[#00ffff] drop-shadow-[0_0_15px_#00ffff]" />,
//     colorCode: "#00ffff",
//     gradient: "from-[#00ffff] via-[#0080ff] to-[#ff00ff]",
//     tag: "WEB_CORE_V3"
//   },
//   {
//     title: "ফেসবুক পেজ গ্রোথ ও ফলোয়ার",
//     desc: "১০০% সেফ মেথডে পেজের রিচ, লাইক এবং অর্গানিক ফলোয়ার বাড়িয়ে নিন।",
//     icon: <FaFacebookF size={36} className="text-[#0088ff] drop-shadow-[0_0_15px_#0088ff]" />,
//     colorCode: "#0088ff",
//     gradient: "from-[#0088ff] via-[#00f5ff] to-[#00ff88]",
//     tag: "FB_GROWTH_X" 
//   },
//   {
//     title: "ইউটিউব সাবস্ক্রাইবার ও ওয়াচটাইম",
//     desc: "অর্গানিক ওয়াচটাইম এবং রিয়েল সাবস্ক্রাইবার দিয়ে দ্রুত মনিটাইজেশন অন করুন।",
//     icon: <FaYoutube size={36} className="text-[#ff0055] drop-shadow-[0_0_15px_#ff0055]" />,
//     colorCode: "#ff0055",
//     gradient: "from-[#ff0055] via-[#ff5500] to-[#ff00ff]",
//     tag: "YT_MONETIZE"
//   },
//   {
//     title: "ক্লাউড ও সার্ভার ম্যানেজমেন্ট",
//     desc: "হাই-সিকিউরড ক্লাউড সেটআপ এবং ২৪/৭ ডেডিকেটেড সার্ভার মনিটরিং।",
//     icon: <FaServer size={36} className="text-[#bd00ff] drop-shadow-[0_0_15px_#bd00ff]" />,
//     colorCode: "#bd00ff",
//     gradient: "from-[#bd00ff] via-[#ff00ff] to-[#00ffff]",
//     tag: "CLOUD_NODE_7"
//   },
//   {
//     title: "সাইবার সিকিউরিটি",
//     desc: "আপনার বিজনেস ডেটা এবং সিস্টেমকে হ্যাকিং মুক্ত রাখতে প্রিমিয়াম প্রটেকশন।",
//     icon: <FaShieldAlt size={36} className="text-[#00ff66] drop-shadow-[0_0_15px_#00ff66]" />,
//     colorCode: "#00ff66",
//     gradient: "from-[#00ff66] via-[#00ffff] to-[#0088ff]",
//     tag: "SEC_PROTOCOL"
//   },
//   {
//     title: "মোবাইল অ্যাপ ডেভেলপমেন্ট",
//     desc: "অ্যান্ড্রয়েড এবং আইওএস প্ল্যাটফর্মের জন্য আধুনিক ও ফ্লুইড নেティブ অ্যাপস।",
//     icon: <FaMobileAlt size={36} className="text-[#ffcc00] drop-shadow-[0_0_15px_#ffcc00]" />,
//     colorCode: "#ffcc00",
//     gradient: "from-[#ffcc00] via-[#ff0055] to-[#ff00ff]",
//     tag: "APP_NATIVE"
//   }
// ];

// // Framer Motion Variants
// const fadeInUp = {
//   hidden: { opacity: 0, y: 40 },
//   visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
// };

// const staggerContainer = {
//   hidden: { opacity: 0 },
//   visible: { opacity: 1, transition: { staggerChildren: 0.12 } }
// };

// export default function GTSolutionPage() {
//   const [selectedService, setSelectedService] = useState(null);
//   const [formData, setFormData] = useState({ name: '', email: '', message: '' });

//   const handleInputChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleFormSubmit = (e) => {
//     e.preventDefault();
//     alert(`ধন্যবাদ! আপনার "${selectedService.title}" সার্ভিসের রিকোয়েস্ট সফলভাবে পাঠানো হয়েছে। (Tag: ${selectedService.tag})`);
//     setFormData({ name: '', email: '', message: '' });
//     setSelectedService(null);
//   };

//   return (
//     <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-900 overflow-x-hidden pt-20">
      
//       {/* 🚀 Top Navigation Bar */}
//       <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/70 backdrop-blur-md border-b border-slate-900 px-6 py-4 transition-all">
//         <div className="max-w-7xl mx-auto flex items-center justify-between">
//           <Link href="/" className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(6,182,212,0.3)]">
//             Rashidul IT
//           </Link>
          
//           <div className="hidden md:flex items-center gap-8 text-sm text-slate-300 font-medium">
//             <Link href="#services" className="hover:text-cyan-400 transition-colors">সার্ভিস সমূহ</Link>
//             <Link href="/about" className="hover:text-cyan-400 transition-colors">আমাদের সম্পর্কে</Link>
//             <Link href="/contact" className="hover:text-cyan-400 transition-colors">যোগাযোগ</Link>
//           </div>

//           {/* User Profile Image / Avatar */}
//           <div className="flex items-center gap-3">
//             <div className="relative group cursor-pointer">
//               <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full opacity-70 group-hover:opacity-100 blur transition duration-300"></div>
//               <img 
//                 src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop" 
//                 alt="Profile" 
//                 className="relative w-10 h-10 rounded-full border border-slate-950 object-cover"
//               />
//             </div>
//           </div>
//         </div>
//       </nav>

//       {/* Hero Section */}
//       <section className="relative flex flex-col items-center justify-center text-center px-4 py-24 overflow-hidden border-b border-slate-900">
//         <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />
//         <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />

//         <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="z-10 max-w-4xl">
//           <motion.span variants={fadeInUp} className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 uppercase shadow-[0_0_15px_rgba(34,211,238,0.2)]">
//             ভবিষ্যতের টেকনোলজি আজই
//           </motion.span>
//           <motion.h1 variants={fadeInUp} className="mt-6 text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
//             স্মার্ট ব্যবসার জন্য <br />
//             <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 drop-shadow-[0_0_20px_rgba(6,182,212,0.4)]">
//               আধুনিক আইটি সমাধান
//             </span>
//           </motion.h1>
//           <motion.p variants={fadeInUp} className="mt-6 text-base sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
//             আমরা প্রদান করি সর্বাধুনিক প্রযুক্তির ওয়েব, সফটওয়্যার এবং সাইবার সিকিউরিটি সার্ভিস। আপনার আইডিয়াকে বাস্তবে রূপ দিতে আমরা প্রস্তুত।
//           </motion.p>
//           <motion.div variants={fadeInUp} className="mt-10 flex flex-wrap justify-center gap-4">
//             <Link href="#services" className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-medium text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:shadow-[0_0_30px_rgba(6,182,212,0.8)] hover:scale-105 transition-all duration-300">
//               আমাদের সেবা সমূহ
//             </Link>
//             <Link href="/contact" className="px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800/80 font-medium border border-slate-800 hover:border-slate-700 hover:scale-105 transition-all duration-300">
//               যোগাযোগ করুন
//             </Link>
//           </motion.div>
//         </motion.div>
//       </section>

//       {/* Services Section */}
//       <section id="services" className="max-w-7xl mx-auto px-4 py-24">
//         <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center max-w-3xl mx-auto mb-16">
//           <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-wide">
//             আমরা যেসকল সার্ভিস প্রদান করি
//           </h2>
//           <div className="w-20 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 mx-auto mt-4 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
//         </motion.div>

//         <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//           {services.map((service, index) => (
//             <motion.div 
//               key={index} 
//               variants={fadeInUp}
//               whileHover={{ y: -8, boxShadow: `0 10px 30px -10px ${service.colorCode}40`, borderColor: service.colorCode }}
//               onClick={() => setSelectedService(service)}
//               className="group relative rounded-2xl border border-slate-900 bg-slate-900/40 p-8 backdrop-blur-xl transition-all duration-300 cursor-pointer"
//             >
//               <div className={`absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl bg-gradient-to-r ${service.gradient} opacity-40 group-hover:opacity-100 transition-opacity duration-300`} />
//               <div className="mb-6 flex items-center justify-between">
//                 <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 group-hover:border-slate-700 transition-colors">
//                   {service.icon}
//                 </div>
//                 <span className="text-[10px] font-mono tracking-widest text-slate-600 bg-slate-950/50 px-2.5 py-1 rounded border border-slate-900">
//                   {service.tag}
//                 </span>
//               </div>
//               <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-all duration-300">
//                 {service.title}
//               </h3>
//               <p className="text-sm text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors duration-300">
//                 {service.desc}
//               </p>
//             </motion.div>
//           ))}
//         </motion.div>
//       </section>

//       {/* 🔮 Interactive Request Modal Popup */}
//       <AnimatePresence>
//         {selectedService && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//             {/* Background Backdrop */}
//             <motion.div 
//               initial={{ opacity: 0 }} 
//               animate={{ opacity: 1 }} 
//               exit={{ opacity: 0 }}
//               onClick={() => setSelectedService(null)}
//               className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
//             />
            
//             {/* Modal Body */}
//             <motion.div 
//               initial={{ opacity: 0, scale: 0.9, y: 20 }}
//               animate={{ opacity: 1, scale: 1, y: 0 }}
//               exit={{ opacity: 0, scale: 0.9, y: 20 }}
//               transition={{ type: "spring", damping: 25, stiffness: 350 }}
//               className="relative w-full max-w-md overflow-hidden rounded-2xl border bg-slate-900 p-6 shadow-2xl backdrop-blur-2xl"
//               style={{ borderColor: selectedService.colorCode }}
//             >
//               {/* Top Glowing Effect inside Modal */}
//               <div className={`absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r ${selectedService.gradient}`} />
              
//               {/* Close Button */}
//               <button 
//                 onClick={() => setSelectedService(null)} 
//                 className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-1 bg-slate-950 border border-slate-800 rounded-lg"
//               >
//                 <FaTimes size={16} />
//               </button>

//               {/* Header */}
//               <div className="flex items-center gap-3 mt-2 mb-6">
//                 <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
//                   {selectedService.icon}
//                 </div>
//                 <div>
//                   <h3 className="text-xl font-bold text-white">{selectedService.title}</h3>
//                   <p className="text-xs text-slate-500 font-mono mt-0.5">সার্ভিস রিকোয়েস্ট ফর্ম</p>
//                 </div>
//               </div>

//               {/* Form Input Section */}
//               <form onSubmit={handleFormSubmit} className="space-y-4">
//                 <div>
//                   <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">আপনার নাম</label>
//                   <input 
//                     type="text" 
//                     name="name"
//                     required
//                     value={formData.name}
//                     onChange={handleInputChange}
//                     placeholder="John Doe" 
//                     className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">ইমেইল এড্রেস</label>
//                   <input 
//                     type="email" 
//                     name="email"
//                     required
//                     value={formData.email}
//                     onChange={handleInputChange}
//                     placeholder="example@domain.com" 
//                     className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">আপনার মেসেজ</label>
//                   <textarea 
//                     rows={4} 
//                     name="message"
//                     required
//                     value={formData.message}
//                     onChange={handleInputChange}
//                     placeholder="এই সার্ভিসটি সম্পর্কে আপনার প্রয়োজনীয়তা বিস্তারিত লিখুন..." 
//                     className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
//                   />
//                 </div>

//                 {/* Submit button with custom hover tint */}
//                 <motion.button 
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                   type="submit" 
//                   className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl py-3.5 px-4 font-semibold text-slate-950 shadow-lg text-sm transition-all duration-300"
//                   style={{
//                     backgroundImage: `linear-gradient(to right, ${selectedService.colorCode}, #0088ff)`
//                   }}
//                 >
//                   <FaPaperPlane size={14} />
//                   রিকোয়েস্ট সাবমিট করুন
//                 </motion.button>
//               </form>
//             </motion.div>
//           </div>
//         )}
//       </AnimatePresence>

//       {/* Footer */}
//       <section className="bg-gradient-to-b from-slate-950 to-slate-900 border-t border-slate-900 py-12 text-center text-sm text-slate-500">
//         <p>© {new Date().getFullYear()} Rashidul IT Solution. All rights reserved.</p>
//       </section>

//     </div>
//   );
// }

// "use client";

// import React from 'react';
// import { FaLaptopCode, FaServer, FaShieldAlt, FaMobileAlt, FaFacebookF, FaYoutube } from 'react-icons/fa';
// import Link from 'next/link';
// import { motion } from 'framer-motion';

// /* 
// 💡 Next.js 19 App Router Note: 
// SEO Metadata শুধুমাত্র Server Component-এ কাজ করে। 
// অ্যানিমেশনের জন্য এই ফাইলটি Client Component ("use client") করা হয়েছে। 
// তাই এই মেটাডাটা অংশটি আপনার layout.js অথবা কোনো separate server page.js ফাইলে নিয়ে যাওয়া উত্তম।
// */
// /*
// export const metadata = {
//   title: 'আইটি সমাধান ও টেকনোলজি সার্ভিস | IT Solution',
//   description: 'আপনার ব্যবসার ডিজিটাল রূপান্তরের জন্য বিশ্বস্ত আইটি সমাধান। সফটওয়্যার ডেভেলপমেন্ট, ওয়েব ডিজাইন, সাইবার সিকিউরিটি এবং ক্লাউড কম্পিউটিং সেবা।',
//   keywords: ['আইটি সমাধান', 'IT Solution Bangladesh', 'ওয়েব ডেভেলপমেন্ট', 'সফটওয়্যার সার্ভিস', 'Next.js 19 Developer'],
//   openGraph: {
//     title: 'আইটি সমাধান ও টেকনোলজি সার্ভিস',
//     description: 'আধুনিক নিয়ন গ্লো টেকনোলজি ও সফটওয়্যার সリューション।',
//     url: 'https://yourdomain.com/it-solution',
//     siteName: 'Rashidul IT',
//     images: [
//       {
//         url: 'https://images.unsplash.com/photo-1603297631957-4b2c6313f93e',
//         width: 1200,
//         height: 630,
//         alt: 'IT Solution Banner',
//       },
//     ],
//     locale: 'bn_BD',
//     type: 'website',
//   },
// };
// */

// // সার্ভিসের ডাটা অ্যারে (Neon Style)
// const services = [
//   {
//     title: "ওয়েব অ্যাপ্লিকেশন",
//     desc: "Next.js ও React দিয়ে তৈরি আল্ট্রা-ফাস্ট ও রেসপনসিভ লাইভ ওয়েব সলিউশন।",
//     icon: <FaLaptopCode size={36} className="text-[#00ffff] drop-shadow-[0_0_15px_#00ffff]" />,
//     colorCode: "#00ffff",
//     gradient: "from-[#00ffff] via-[#0080ff] to-[#ff00ff]",
//     tag: "WEB_CORE_V3"
//   },
//   {
//     title: "ফেসবুক পেজ গ্রোথ ও ফলোয়ার",
//     desc: "১০০% সেফ মেথডে পেজের রিচ, লাইক এবং অর্গানিক ফলোয়ার বাড়িয়ে নিন।",
//     icon: <FaFacebookF size={36} className="text-[#0088ff] drop-shadow-[0_0_15px_#0088ff]" />,
//     colorCode: "#0088ff",
//     gradient: "from-[#0088ff] via-[#00f5ff] to-[#00ff88]",
//     tag: "FB_GROWTH_X" 
//   },
//   {
//     title: "ইউটিউব সাবস্ক্রাইবার ও ওয়াচটাইম",
//     desc: "অর্গানিক ওয়াচটাইম এবং রিয়েল সাবস্ক্রাইবার দিয়ে দ্রুত মনিটাইজেশন অন করুন।",
//     icon: <FaYoutube size={36} className="text-[#ff0055] drop-shadow-[0_0_15px_#ff0055]" />,
//     colorCode: "#ff0055",
//     gradient: "from-[#ff0055] via-[#ff5500] to-[#ff00ff]",
//     tag: "YT_MONETIZE"
//   },
//   {
//     title: "ক্লাউড ও সার্ভার ম্যানেজমেন্ট",
//     desc: "হাই-সিকিউরড ক্লাউড সেটআপ এবং ২৪/৭ ডেডিকেটেড সার্ভার মনিটরিং।",
//     icon: <FaServer size={36} className="text-[#bd00ff] drop-shadow-[0_0_15px_#bd00ff]" />,
//     colorCode: "#bd00ff",
//     gradient: "from-[#bd00ff] via-[#ff00ff] to-[#00ffff]",
//     tag: "CLOUD_NODE_7"
//   },
//   {
//     title: "সাইবার সিকিউরিটি",
//     desc: "আপনার বিজনেস ডেটা এবং সিস্টেমকে হ্যাকিং মুক্ত রাখতে প্রিমিয়াম প্রটেকশন।",
//     icon: <FaShieldAlt size={36} className="text-[#00ff66] drop-shadow-[0_0_15px_#00ff66]" />,
//     colorCode: "#00ff66",
//     gradient: "from-[#00ff66] via-[#00ffff] to-[#0088ff]",
//     tag: "SEC_PROTOCOL"
//   },
//   {
//     title: "মোবাইল অ্যাপ ডেভেলপমেন্ট",
//     desc: "অ্যান্ড্রয়েড এবং আইওএস প্ল্যাটফর্মের জন্য আধুনিক ও ফ্লুইড নেティブ অ্যাপস।",
//     icon: <FaMobileAlt size={36} className="text-[#ffcc00] drop-shadow-[0_0_15px_#ffcc00]" />,
//     colorCode: "#ffcc00",
//     gradient: "from-[#ffcc00] via-[#ff0055] to-[#ff00ff]",
//     tag: "APP_NATIVE"
//   }
// ];

// // Framer Motion Variants
// const fadeInUp = {
//   hidden: { opacity: 0, y: 40 },
//   visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
// };

// const staggerContainer = {
//   hidden: { opacity: 0 },
//   visible: {
//     opacity: 1,
//     transition: { staggerChildren: 0.15 }
//   }
// };

// export default function GTSolutionPage() {
//   return (
//     <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-900 overflow-x-hidden">
      
//       {/* Hero Section */}
//       <section className="relative flex flex-col items-center justify-center text-center px-4 py-28 overflow-hidden border-b border-slate-900">
//         {/* Background Neon Gradients */}
//         <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />
//         <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />

//         <motion.div 
//           initial="hidden"
//           animate="visible"
//           variants={staggerContainer}
//           className="z-10 max-w-4xl"
//         >
//           <motion.span 
//             variants={fadeInUp}
//             className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 uppercase shadow-[0_0_15px_rgba(34,211,238,0.2)]"
//           >
//             ভবিষ্যতের টেকনোলজি আজই
//           </motion.span>
          
//           <motion.h1 
//             variants={fadeInUp}
//             className="mt-6 text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight"
//           >
//             স্মার্ট ব্যবসার জন্য <br />
//             <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 drop-shadow-[0_0_20px_rgba(6,182,212,0.4)]">
//               আধুনিক আইটি সমাধান
//             </span>
//           </motion.h1>
          
//           <motion.p 
//             variants={fadeInUp}
//             className="mt-6 text-base sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed"
//           >
//             আমরা প্রদান করি সর্বাধুনিক প্রযুক্তির ওয়েব, সফটওয়্যার এবং সাইবার সিকিউরিটি সার্ভিস। আপনার আইডিয়াকে বাস্তবে রূপ দিতে আমরা প্রস্তুত।
//           </motion.p>
          
//           <motion.div 
//             variants={fadeInUp}
//             className="mt-10 flex flex-wrap justify-center gap-4"
//           >
//             <Link 
//               href="#services" 
//               className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-medium text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:shadow-[0_0_30px_rgba(6,182,212,0.8)] hover:scale-105 transition-all duration-300"
//             >
//               আমাদের সেবা সমূহ
//             </Link>
//             <Link 
//               href="/contact" 
//               className="px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800/80 font-medium border border-slate-800 hover:border-slate-700 hover:scale-105 transition-all duration-300"
//             >
//               যোগাযোগ করুন
//             </Link>
//           </motion.div>
//         </motion.div>
//       </section>

//       {/* Services Section */}
//       <section id="services" className="max-w-7xl mx-auto px-4 py-24">
//         <motion.div 
//           initial={{ opacity: 0, y: 20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           transition={{ duration: 0.6 }}
//           className="text-center max-w-3xl mx-auto mb-16"
//         >
//           <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-wide">
//             আমরা যেসকল সার্ভিস প্রদান করি
//           </h2>
//           <div className="w-20 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 mx-auto mt-4 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
//         </motion.div>

//         {/* 3 Column Grid for 6 items */}
//         <motion.div 
//           variants={staggerContainer}
//           initial="hidden"
//           whileInView="visible"
//           viewport={{ once: true, margin: "-100px" }}
//           className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
//         >
//           {services.map((service, index) => (
//             <motion.div 
//               key={index} 
//               variants={fadeInUp}
//               whileHover={{ 
//                 y: -8, 
//                 boxShadow: `0 10px 30px -10px ${service.colorCode}40`,
//                 borderColor: service.colorCode 
//               }}
//               className="group relative rounded-2xl border border-slate-900 bg-slate-900/40 p-8 backdrop-blur-xl transition-all duration-300"
//             >
//               {/* Dynamic Neon Border Line effect */}
//               <div className={`absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl bg-gradient-to-r ${service.gradient} opacity-40 group-hover:opacity-100 transition-opacity duration-300`} />
              
//               <div className="mb-6 flex items-center justify-between">
//                 <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 group-hover:border-slate-700 transition-colors">
//                   {service.icon}
//                 </div>
//                 <span className="text-[10px] font-mono tracking-widest text-slate-600 bg-slate-950/50 px-2.5 py-1 rounded border border-slate-900">
//                   {service.tag}
//                 </span>
//               </div>

//               <h3 className="text-xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 transition-all duration-300">
//                 {service.title}
//               </h3>
              
//               <p className="text-sm text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors duration-300">
//                 {service.desc}
//               </p>
//             </motion.div>
//           ))}
//         </motion.div>
//       </section>

//       {/* Footer / CTA Section */}
//       <section className="bg-gradient-to-b from-slate-950 to-slate-900 border-t border-slate-900 py-12 text-center text-sm text-slate-500">
//         <p>© {new Date().getFullYear()} Rashidul IT Solution. All rights reserved.</p>
//       </section>

//     </div>
//   );
// }
