
import React from "react";
import Image from "next/image";
import { 
  Newspaper, ShoppingBag, Car, Wrench, ShieldCheck, 
  Zap, Search, TrendingUp, Clock, ChevronRight 
} from "lucide-react";


import Stiesdata from './Slicesivdpage'

// ✅ ১. All SEO Setup (Google, Facebook, WhatsApp)
export const metadata = {
  // Google & Browser
  title: "Md Rashidul Official | বাংলাদেশের সেরা ডিজিটাল সার্ভিস প্ল্যাটফর্ম",
  description: "Rashidul Official-এ পাবেন ই-পেপার, প্রিমিয়াম পণ্য ডেলিভারি এবং এক্সপার্ট আইটি সাপোর্ট। আপনার সব ডিজিটাল সমাধান এখন এক ঠিকানায়।",
  keywords: ["Rashidul Official", "ডিজিটাল সেবা", "ই-পেপার বাংলাদেশ", "টেক সাপোর্ট", "অনলাইন সার্ভিস"],
  authors: [{ name: "Md Rashidul Islam" }],
  
  // Facebook & WhatsApp (Open Graph)
  openGraph: {
    title: "Md Rashidul Official - ডিজিটাল সেবা এখন হাতের মুঠোয়",
    description: "সব ধরণের ডিজিটাল সার্ভিস এবং লেটেস্ট নিউজ পড়ুন আমাদের প্ল্যাটফর্মে।",
    url: "https://rashidulofficial.com",
    siteName: "Rashidul Official",
    images: [
      {
        url: "https://images.unsplash.com/photo-1504711434969-e33886168f5c", // আপনার অরিজিনাল ইমেজ লিঙ্ক দিন
        width: 1200,
        height: 630,
        alt: "Rashidul Official Banner",
      },
    ],
    locale: "bn_BD",
    type: "website",
  },

  // Twitter
  twitter: {
    card: "summary_large_image",
    title: "Md Rashidul Official | ডিজিটাল সার্ভিস",
    description: "বাংলাদেশের আধুনিক ডিজিটাল সেবা প্ল্যাটফর্ম।",
    images: ["https://images.unsplash.com/photo-1504711434969-e33886168f5c"],
  },
};

export default function Page() {
  // ✅ ২. JSON-LD Schema (Google Rich Results এর জন্য)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Md Rashidul Official",
    "image": "https://images.unsplash.com/photo-1504711434969-e33886168f5c",
    "description": "Premium digital services including E-paper and IT support in Bangladesh.",
    "url": "https://rashidulofficial.com",
    "telephone": "+8801XXXXXXXXX",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Your Street",
      "addressLocality": "Dhaka",
      "addressCountry": "BD"
    },
    "sameAs": [
      "https://facebook.com/yourpage",
      "https://youtube.com/yourchannel"
    ]
  };

  const services = [
    { title: "ই-পেপার", desc: "সবশেষ খবর ও ডিজিটাল নিউজপেপার পড়ুন", icon: Newspaper, color: "from-blue-500 to-cyan-400" },
    { title: "পণ্য সার্ভিস", desc: "দ্রুততম সময়ে প্রিমিয়াম পণ্য ডেলিভারি", icon: ShoppingBag, color: "from-pink-500 to-rose-400" },
    { title: "গাড়ি সার্ভিস", desc: "নিরাপদ ও আরামদায়ক কার বুকিং সিস্টেম", icon: Car, color: "from-indigo-500 to-blue-400" },
    { title: "ই-বই", desc: "অনলাইন ল্যাইব্রি যে কোন বই পাওয়া যায়", icon: Wrench, color: "from-orange-500 to-amber-400" },
  //  { title: "ই-বই", desc: "এক্সপার্ট আইটি ও সফটওয়্যার সমাধান", icon: Wrench, color: "from-orange-500 to-amber-400" },
    { title: "সিকিউরিটি", desc: "তথ্য সুরক্ষা ও নিরাপদ ট্রানজ্যাকশন", icon: ShieldCheck, color: "from-emerald-500 to-teal-400" },
    { title: "এক্সপ্রেস", desc: "১ ঘণ্টার মধ্যে জরুরি এক্সপ্রেস ডেলিভারি", icon: Zap, color: "from-yellow-500 to-orange-400" },
  ];

  return (
    <main className="min-h-screen bg-[#050810] text-gray-100 selection:bg-cyan-500/30">
      {/* Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

     
<Stiesdata />

    </main>
  );
}








// "use client";

// import React, { useState, useEffect } from "react";
// import Image from "next/image";
// import {
//   Newspaper,
//   ShoppingBag,
//   Car,
//   Wrench, // Tool এর পরিবর্তে Wrench ব্যবহার করা হয়েছে
//   ShieldCheck,
//   Zap,
//   Search,
//   TrendingUp,
//   Clock,
//   ChevronRight,
// } from "lucide-react";

// export default function UpgradedServicePlatform() {
//   const [isScrolled, setIsScrolled] = useState(false);
//   const [currentDate, setCurrentDate] = useState("");

//   // ✅ Scroll + Date handling
//   useEffect(() => {
//     const handleScroll = () => setIsScrolled(window.scrollY > 50);
//     window.addEventListener("scroll", handleScroll);

//     const date = new Date().toLocaleDateString("bn-BD", {
//       weekday: "long",
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     });
//     setCurrentDate(date);

//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   // ✅ Optimized services data
//   const services = [
//     { title: "ই-পেপার", desc: "লাইভ আপডেট নিউজ পড়ুন", icon: Newspaper, color: "from-blue-500 to-cyan-400" },
//     { title: "পণ্য সার্ভিস", desc: "প্রিমিয়াম পণ্য ডেলিভারি", icon: ShoppingBag, color: "from-pink-500 to-rose-400" },
//     { title: "গাড়ি সার্ভিস", desc: "কার বুকিং সিস্টেম", icon: Car, color: "from-indigo-500 to-blue-400" },
//     { title: "টেক সাপোর্ট", desc: "IT সমস্যা সমাধান", icon: Wrench, color: "from-orange-500 to-amber-400" },
//     { title: "সিকিউরিটি", desc: "নিরাপদ পেমেন্ট", icon: ShieldCheck, color: "from-emerald-500 to-teal-400" },
//     { title: "এক্সপ্রেস", desc: "১ ঘণ্টায় ডেলিভারি", icon: Zap, color: "from-yellow-500 to-orange-400" },
//   ];

//   return (
//     <div className="min-h-screen bg-[#050810] text-gray-100 selection:bg-cyan-500/30">

//       {/* Top Bar */}
//       <div className="bg-[#0a0f1d] py-2 px-6 hidden md:block border-b border-white/5">
//         <div className="max-w-7xl mx-auto flex justify-between text-xs text-gray-400">
//           <div className="flex gap-6">
//             <span className="flex items-center gap-2">
//               <Clock size={14} className="text-cyan-400" /> {currentDate}
//             </span>
//             <span className="flex items-center gap-2 text-cyan-400 animate-pulse">
//               <TrendingUp size={14} /> ট্রেন্ডিং এখন
//             </span>
//           </div>
//           <div className="hover:text-white cursor-pointer transition-colors">সহায়তা কেন্দ্র</div>
//         </div>
//       </div>

//       {/* Navbar */}
//       <nav className={`sticky top-0 z-50 transition-all duration-500 ${
//         isScrolled ? "bg-black/80 backdrop-blur-md border-b border-white/10 py-3" : "bg-transparent py-6"
//       }`}>
//         <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
//           <h1 className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
//             RASHIDUL
//           </h1>
//           <div className="flex items-center gap-4">
//             <div className="relative hidden sm:block">
//                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
//                <input 
//                 type="text" 
//                 placeholder="খুঁজুন..." 
//                 className="bg-[#1a1f2e] border border-white/10 rounded-full py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:border-cyan-500 transition-all"
//                />
//             </div>
//             <Search className="sm:hidden cursor-pointer hover:text-cyan-400 transition-colors" />
//           </div>
//         </div>
//       </nav>

//       {/* Hero Section */}
//       <section className="max-w-7xl mx-auto px-6 pt-6">
//         <div className="relative h-[300px] md:h-[450px] rounded-3xl overflow-hidden group">
//           <Image
//             src="https://images.unsplash.com/photo-1504711434969-e33886168f5c"
//             alt="Digital News Platform"
//             fill
//             className="object-cover transition-transform duration-700 group-hover:scale-105"
//             priority
//           />
//           <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent">
//             <div className="absolute bottom-8 left-8 right-8">
//               <span className="bg-cyan-500 text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Featured</span>
//               <h1 className="text-3xl md:text-5xl font-bold mt-4 leading-tight">
//                 আপনার হাতের মুঠোয় <br /> <span className="text-cyan-400">ডিজিটাল সব সেবা</span>
//               </h1>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Services Section */}
//       <section className="max-w-7xl mx-auto px-6 py-20">
//         <div className="flex justify-between items-end mb-12">
//           <div>
//             <h2 className="text-4xl font-bold">আমাদের সেবাসমূহ</h2>
//             <p className="text-gray-500 mt-2">আপনার দৈনন্দিন প্রয়োজনের সব সমাধান এখানে</p>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {services.map((service, index) => {
//             const Icon = service.icon;
//             return (
//               <div 
//                 key={index} 
//                 className="group p-8 bg-[#0a0f1d] rounded-2xl border border-white/5 hover:border-cyan-500/50 transition-all duration-300 hover:-translate-y-2"
//               >
//                 <div className={`w-14 h-14 bg-gradient-to-br ${service.color} rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/10`}>
//                   <Icon size={28} className="text-white" />
//                 </div>
//                 <h3 className="text-xl font-bold mb-2 group-hover:text-cyan-400 transition-colors">{service.title}</h3>
//                 <p className="text-gray-400 text-sm leading-relaxed">{service.desc}</p>
//                 <div className="mt-6 flex items-center text-xs font-bold text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity">
//                   আরও জানুন <ChevronRight size={14} />
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//         <div className="text-center mt-16">
//           <button className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-cyan-500/20 active:scale-95">
//             সকল সার্ভিস দেখুন <ChevronRight size={20}/>
//           </button>
//         </div>
//       </section>

//       {/* Footer */}
//       <footer className="border-t border-white/5 bg-[#03060c] py-12 text-center">
//         <p className="text-gray-500 text-sm">
//           © ২০২৬ <span className="text-gray-300 font-semibold">Rashidul Official</span>. সর্বস্বত্ব সংরক্ষিত।
//         </p>
//       </footer>
//     </div>
//   );
// }


// import React from 'react';
// import { Newspaper, ShoppingBag, Car, ChevronRight, Menu } from 'lucide-react';

// const HomePage = () => {
//   // গুগলের জন্য স্ট্রাকচারড ডাটা (Schema Markup)
//   const jsonLd = {
//     "@context": "https://schema.org",
//     "@type": "Service",
//     "serviceType": "Multi-Service Platform",
//     "provider": {
//       "@type": "LocalBusiness",
//       "name": "Md Rashidul Official",
//       "image": "https://yourwebsite.com/logo.png",
//       "address": {
//         "@type": "PostalAddress",
//         "addressLocality": "Dhaka",
//         "addressCountry": "BD"
//       }
//     },
//     "areaServed": "Bangladesh",
//     "hasOfferCatalog": {
//       "@type": "OfferCatalog",
//       "name": "আমাদের সার্ভিসসমূহ",
//       "itemListElement": [
//         { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "ই-পেপার" } },
//         { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "পণ্য সার্ভিস" } },
//         { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "গাড়ি সার্ভিস" } }
//       ]
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 text-slate-900">
//       {/* গুগল এসইও স্ক্রিপ্ট */}
//       <script
//         type="application/ld+json"
//         dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
//       />

//       {/* নেভিগেশন বার */}
//       <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center h-16">
//             <div className="text-2xl font-black text-indigo-600 tracking-tighter">
//               SERVICE<span className="text-orange-500">PRO</span>
//             </div>
            
//             <div className="hidden md:flex space-x-8 font-medium">
//               <a href="#" className="hover:text-indigo-600 transition">হোম</a>
//               <a href="#services" className="hover:text-indigo-600 transition">সেবা</a>
//               <a href="#" className="hover:text-indigo-600 transition">অফার</a>
//               <a href="#" className="hover:text-indigo-600 transition">যোগাযোগ</a>
//             </div>

//             <button className="md:hidden p-2">
//               <Menu size={24} />
//             </button>
//           </div>
//         </div>
//       </nav>

//       {/* হিরো সেকশন */}
//       <section className="relative py-12 md:py-24 bg-white overflow-hidden">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center">
//             {/* H1 Tag: এসইও এর জন্য সবথেকে গুরুত্বপূর্ণ */}
//             <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight">
//               আপনার যা প্রয়োজন, <br/>
//               <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
//                 সবই এক ক্লিকে।
//               </span>
//             </h1>
//             <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-600 mb-10">
//               সেরা মানের ই-পেপার পড়া থেকে শুরু করে দ্রুত পণ্য ডেলিভারি বা গাড়ি সার্ভিসিং - Md Rashidul Official এখন আপনার হাতের মুঠোয়।
//             </p>
//             <div className="flex flex-col sm:flex-row justify-center gap-4">
//               <button className="px-8 py-4 bg-indigo-600 text-white rounded-full font-bold shadow-lg hover:bg-indigo-700 transition transform hover:scale-105">
//                 সেবা শুরু করুন
//               </button>
//               <button className="px-8 py-4 bg-white border-2 border-gray-200 rounded-full font-bold hover:bg-gray-50 transition">
//                 অ্যাপ ডাউনলোড
//               </button>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* সার্ভিস কার্ড সেকশন */}
//       <section id="services" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <h2 className="text-3xl font-bold text-center mb-12">আমাদের বিশেষ সার্ভিসসমূহ</h2>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
//           <ServiceCard 
//             icon={<Newspaper className="w-8 h-8" />}
//             title="ই-পেপার"
//             desc="প্রতিদিনের সব খবর সবার আগে আমাদের ই-পেপারে অনলাইনে পড়ুন। আপডেট থাকুন সবসময়।"
//             color="bg-blue-500"
//           />

//           <ServiceCard 
//             icon={<ShoppingBag className="w-8 h-8" />}
//             title="পণ্য সার্ভিস"
//             desc="নিত্যপ্রয়োজনীয় এবং ইলেকট্রনিক্স পণ্য অর্ডার করুন এবং পান দ্রুত হোম ডেলিভারি।"
//             color="bg-orange-500"
//           />

//           <ServiceCard 
//             icon={<Car className="w-8 h-8" />}
//             title="গাড়ি সার্ভিস"
//             desc="আপনার গাড়ির যত্ন নিতে আমাদের অভিজ্ঞ মেকানিক এবং রেন্টাল সার্ভিস সবসময় প্রস্তুত।"
//             color="bg-emerald-500"
//           />

//         </div>
//       </section>
//     </div>
//   );
// };

// const ServiceCard = ({ icon, title, desc, color }) => (
//   <div className="group p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
//     <div className={`w-16 h-16 ${color} text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:rotate-6 transition-transform`}>
//       {icon}
//     </div>
//     <h3 className="text-2xl font-bold mb-3">{title}</h3>
//     <p className="text-gray-500 leading-relaxed mb-6">{desc}</p>
//     <button className="flex items-center font-bold text-indigo-600 hover:gap-2 transition-all">
//       বিস্তারিত দেখুন <ChevronRight size={18} />
//     </button>
//   </div>
// );

// export default HomePage;


// import React from 'react';
// import { Newspaper, ShoppingBag, Car, ChevronRight, Menu } from 'lucide-react';

// const HomePage = () => {
//   return (
//     <div className="min-h-screen bg-gray-50 text-slate-900">
      
//       {/* নেভিগেশন বার */}
//       <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center h-16">
//             <div className="text-2xl font-black text-indigo-600 tracking-tighter">
//               SERVICE<span className="text-orange-500">PRO</span>
//             </div>
            
//             {/* পিসি মেনু */}
//             <div className="hidden md:flex space-x-8 font-medium">
//               <a href="#" className="hover:text-indigo-600 transition">হোম</a>
//               <a href="#services" className="hover:text-indigo-600 transition">সেবা</a>
//               <a href="#" className="hover:text-indigo-600 transition">অফার</a>
//               <a href="#" className="hover:text-indigo-600 transition">যোগাযোগ</a>
//             </div>

//             <button className="md:hidden p-2">
//               <Menu size={24} />
//             </button>
//           </div>
//         </div>
//       </nav>

//       {/* হিরো সেকশন - মোবাইল ও পিসি অ্যাডাপ্টিভ */}
//       <section className="relative py-12 md:py-24 bg-white overflow-hidden">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center">
//             <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-6">
//               আপনার যা প্রয়োজন, <br/>
//               <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
//                 সবই এক ক্লিকে।
//               </span>
//             </h1>
//             <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-600 mb-10">
//               ই-পেপার পড়া থেকে শুরু করে নিত্যপ্রয়োজনীয় পণ্য কেনা বা গাড়ি সার্ভিসিং - সবকিছুই এখন আরও সহজ।
//             </p>
//             <div className="flex flex-col sm:flex-row justify-center gap-4">
//               <button className="px-8 py-4 bg-indigo-600 text-white rounded-full font-bold shadow-lg hover:bg-indigo-700 transition transform hover:scale-105">
//                 সেবা শুরু করুন
//               </button>
//               <button className="px-8 py-4 bg-white border-2 border-gray-200 rounded-full font-bold hover:bg-gray-50 transition">
//                 অ্যাপ ডাউনলোড
//               </button>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* সার্ভিস কার্ড সেকশন */}
//       <section id="services" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
//           {/* ই-পেপার */}
//           <ServiceCard 
//             icon={<Newspaper className="w-8 h-8" />}
//             title="ই-পেপার"
//             desc="প্রতিদিনের খবর সবার আগে অনলাইনে পড়ুন। আপডেট থাকুন সবসময়।"
//             color="bg-blue-500"
//           />

//           {/* পণ্য সার্ভিস */}
//           <ServiceCard 
//             icon={<ShoppingBag className="w-8 h-8" />}
//             title="পণ্য সার্ভিস"
//             desc="আপনার পছন্দের পণ্য অর্ডার করুন এবং পান দ্রুত হোম ডেলিভারি।"
//             color="bg-orange-500"
//           />

//           {/* গাড়ি সার্ভিস */}
//           <ServiceCard 
//             icon={<Car className="w-8 h-8" />}
//             title="গাড়ি সার্ভিস"
//             desc="গাড়ি রিপেয়ার বা ভাড়ার জন্য বিশ্বস্ত প্ল্যাটফর্ম। দক্ষ মেকানিক সার্ভিস।"
//             color="bg-emerald-500"
//           />

//         </div>
//       </section>
//     </div>
//   );
// };

// // সার্ভিস কার্ড কম্পোনেন্ট (Reusable)
// const ServiceCard = ({ icon, title, desc, color }) => (
//   <div className="group p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
//     <div className={`w-16 h-16 ${color} text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:rotate-6 transition-transform`}>
//       {icon}
//     </div>
//     <h3 className="text-2xl font-bold mb-3">{title}</h3>
//     <p className="text-gray-500 leading-relaxed mb-6">{desc}</p>
//     <button className="flex items-center font-bold text-indigo-600 hover:gap-2 transition-all">
//       বিস্তারিত দেখুন <ChevronRight size={18} />
//     </button>
//   </div>
// );

// export default HomePage;
