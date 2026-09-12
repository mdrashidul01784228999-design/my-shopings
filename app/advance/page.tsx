import React from "react";
import Script from "next/script";
import BgRemovalForm from "./Bgremove";

// 🔥 প্রিমিয়াম এসইও মেটাডাটা (গুগল র‍্যাংকিং বুস্টার)
export const metadata = {
  title: 'ফ্রি এআই ব্যাকগ্রাউন্ড রিমুভার - ছবির ব্যাকগ্রাউন্ড মুছুন নিখুঁতভাবে',
  description: 'যেকোনো ছবির ব্যাকগ্রাউন্ড মাত্র এক ক্লিকে নিখুঁতভাবে রিমুভ করুন সম্পূর্ণ ফ্রিতে। কোনো সার্ভার আপলোড ছাড়াই ১০০% নিরাপদ, ফাস্ট এবং এইচডি কোয়ালিটি বিজি রিমুভার টুল।',
  keywords: [
    'ছবি ব্যাকগ্রাউন্ড রিমুভ', 
    'background remover bangla', 
    'ছবির ব্যাকগ্রাউন্ড কাটার অ্যাপ', 
    'bg remove online free', 
    'ছবির পিছনের অংশ পরিবর্তন',
    'photo background remover free'
  ],
  alternates: {
    canonical: 'https://yourwebsite.com/bg-remover', 
  },
  openGraph: {
    title: 'অনলাইন এআই ব্যাকগ্রাউন্ড রিমুভার - ১ ক্লিকে ছবির বিজি মুছুন',
    description: 'কৃত্রিম বুদ্ধিমত্তার সাহায্যে ছবির চুল ও সূক্ষ্ম বর্ডার অক্ষুণ্ণ রেখে ব্যাকগ্রাউন্ড রিমুভ করুন সম্পূর্ণ ফ্রিতে।',
    url: 'https://yourwebsite.com/bg-remover',
    siteName: 'AI BG Remover Bangla',
    images: [
      {
        url: 'https://yourwebsite.com/og-image-bg.jpg', 
        width: 1200,
        height: 630,
        alt: 'ফ্রি এআই ব্যাকগ্রাউন্ড রিমুভার টুল',
      },
    ],
    locale: 'bn_BD',
    type: 'website',
  },
};

export default function BgRemoverPage() {
  // গুগল রিচ স্নিপেট স্কিমা (গুগল সার্চে টুলটি সরাসরি দেখানোর জন্য)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    'name': 'এআই ব্যাকগ্রাউন্ড রিমুভার',
    'url': 'https://yourwebsite.com/bg-remover',
    'applicationCategory': 'MultimediaApplication',
    'operatingSystem': 'All',
    'browserRequirements': 'Requires HTML5 and WebGL support',
    'description': 'কৃত্রিম বুদ্ধিমত্তার সাহায্যে যেকোনো ছবির ব্যাকগ্রাউন্ড নিখুঁত ও প্রফেশনালভাবে মুছে ফেলার ফ্রি অনলাইন টুল।',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'BDT'
    }
  };

  return (
    <main className="min-h-screen bg-[#0b0f19] text-slate-100 py-16 px-4 sm:px-6 lg:px-8 flex flex-col items-center relative overflow-hidden">
      
      {/* ব্যাকগ্রাউন্ড গ্লো ইফেক্ট (প্রিমিয়াম লুকের জন্য) */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] bg-teal-500/10 blur-[150px] rounded-full pointer-events-none" />

      {/* গুগল স্কিমা ইনজেকশন */}
      <Script
        id="json-ld-bg-remover"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ৩. আল্ট্রা-প্রিমিয়াম হেডার */}
      <div className="max-w-4xl w-full text-center mb-12 z-10">
        <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-blue-500/20 to-teal-500/20 text-teal-400 border border-teal-500/30 tracking-wide uppercase shadow-[0_0_15px_rgba(20,184,166,0.1)]">
          ✨ 100% Next-Gen AI Powered
        </span>
        <h1 className="text-4xl font-extrabold sm:text-6xl mt-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400 tracking-tight">
          ছবির ব্যাকগ্রাউন্ড রিমুভ <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-teal-400">
            করুন নিখুঁতভাবে এক ক্লিকে
          </span>
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto font-light">
          কোনো রকম কোয়ালিটি লস ছাড়া মাত্র কয়েক সেকেন্ডে ছবির ব্যাকগ্রাউন্ড ট্রান্সপারেন্ট বা পিএনজি (PNG) করুন সম্পূর্ণ ফ্রিতে।
        </p>
      </div>

      {/* ৪. ইন্টারঅ্যাক্টিভ ক্লায়েন্ট কম্পোনেন্ট (টুলবক্স) */}
      <div className="z-10 w-full flex justify-center">
        <BgRemovalForm />
      </div>

      {/* 🚀 ৫. গুগল এসইও ফ্রেন্ডলি কন্টেন্ট সেকশন (Semantic HTML) */}
      <article className="max-w-3xl mt-24 text-slate-300 leading-relaxed border-t border-slate-800/80 pt-12 px-4 z-10">
        
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300 mb-6">
          আমাদের অনলাইন ব্যাকগ্রাউন্ড রিমুভার কেন অনন্য?
        </h2>
        <p className="mb-6 text-slate-400 text-justify">
          ইন্টারনেটে হাজারো টুল থাকলেও বেশিরভাগ সাইটেই ছবি আপলোড করলে ইমেজ কোয়ালিটি নষ্ট হয়ে যায় কিংবা সাবস্ক্রিপশন কিনতে বলে। আমাদের এই প্রিমিয়াম <strong>ছবির ব্যাকগ্রাউন্ড রিমুভ</strong> টুলটি অত্যাধুনিক অন-ডিভাইস মেশিন লার্নিং প্রযুক্তি ব্যবহার করে। এর ফলে আপনার ছবি কোনো থার্ড-পার্টি সার্ভারে জমা হয় না। আপনার ব্রাউজারেই এআই (AI) ছবি প্রসেস করে, যা আপনার সম্পূর্ণ গোপনীয়তা ও নিরাপত্তা নিশ্চিত করে।
        </p>

        <h3 className="text-xl font-bold text-white mt-8 mb-4 flex items-center gap-2">
          <span className="w-2 h-6 bg-teal-500 rounded-full inline-block"></span>
          টুলটির প্রধান প্রিমিয়াম ফিচারসমূহ:
        </h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-400 mb-8">
          <li className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/60"><strong className="text-teal-400 block mb-1">✓ সূক্ষ্ম কাটিং এজিং:</strong> মানুষের চুল, পশুপাখির লোম বা জটিল অবজেক্টের চারপাশ নিখুঁতভাবে ডিটেক্ট করে।</li>
          <li className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/60"><strong className="text-teal-400 block mb-1">✓ এইচডি কোয়ালিটি ডাউনলোড:</strong> অরিজিনাল রেজোলিউশন বজায় রেখে একদম ফুল এইচডিতে ছবি সেভ করার সুবিধা।</li>
          <li className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/60"><strong className="text-teal-400 block mb-1">✓ আনলিমিটেড ব্যবহার:</strong> কোনো দৈনিক লিমিট বা ওয়াটারমার্ক ছাড়া যত খুশি তত ছবি এডিট করুন।</li>
          <li className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/60"><strong className="text-teal-400 block mb-1">✓ ১-ক্লিক প্রসেস:</strong> আপনাকে কোনো ম্যানুয়াল সিলেকশন করতে হবে না, বাকি কাজ এআই একাই করবে।</li>
        </ul>

        {/* এসইও এফএকিউ (FAQ) - যা গুগলের প্রথম পাতায় নিয়ে যাবে */}
        <h3 className="text-2xl font-bold text-white mt-12 mb-6 text-center">সচরাচর জিজ্ঞাসিত প্রশ্ন (FAQ)</h3>
        <div className="space-y-4">
          <div className="bg-[#111625] p-5 rounded-2xl border border-slate-800/50">
            <h4 className="font-semibold text-blue-400 text-lg">প্রশ্ন: এই টুলে ছবি এডিট করলে কি ছবির সাইজ বা রেজোলিউশন কমে যায়?</h4>
            <p className="text-sm text-slate-400 mt-2">উত্তর: না! আমাদের এআই টুল ছবির মূল রেজোলিউশন এবং ডিটেইলিং পুরোপুরি ঠিক রেখে শুধুমাত্র ব্যাকগ্রাউন্ড ট্রান্সপারেন্ট করে দেয়।</p>
          </div>
          <div className="bg-[#111625] p-5 rounded-2xl border border-slate-800/50">
            <h4 className="font-semibold text-blue-400 text-lg">প্রশ্ন: ব্যাকগ্রাউন্ড রিমুভ করার পর ছবি কোন ফরম্যাটে সেভ হবে?</h4>
            <p className="text-sm text-slate-400 mt-2">উত্তর: ব্যাকগ্রাউন্ড মুছে ফেলার পর ছবিগুলো ট্রান্সপারেন্ট ব্যাকগ্রাউন্ডসহ ইউনিভার্সাল .PNG ফরম্যাটে ডাউনলোড হবে।</p>
          </div>
        </div>

      </article>
    </main>
  );
}