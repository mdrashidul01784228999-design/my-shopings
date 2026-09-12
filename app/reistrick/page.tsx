"use client";
import React, { useState } from 'react';
import { X, UserCheck, Mail, FileText, Upload, ChevronRight } from 'lucide-react';

export default function SuspendedModal() {
  const [isOpen, setIsOpen] = useState(true);
  const [fileName, setFileName] = useState('');

  if (!isOpen) return null;

  // ✅ Vercel-এর টাইপ সেফটি এরর এড়াতে ইভেন্ট হ্যান্ডলার আলাদা ও নিখুঁত করা হয়েছে
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFileName(files[0].name);
    } else {
      setFileName('');
    }
  };

  return (
    <>
      {/* ইন-লাইন কাস্টম নিয়ন এবং শাইন অ্যানিমেশন স্টাইল */}
      <style jsx global>{`
        @keyframes customShine {
          100% { transform: translateX(300%); }
        }
        .animate-custom-shine {
          animation: customShine 2s infinite ease-in-out;
        }
        .shadow-neon-dual {
          box-shadow: 0 0 25px rgba(59, 130, 246, 0.5), 0 0 50px rgba(239, 68, 68, 0.4);
        }
        .shadow-neon-cyan {
          box-shadow: 0 0 20px rgba(6, 182, 212, 0.7);
        }
        .text-glow-cyan {
          filter: drop-shadow(0 0 12px rgba(6, 182, 212, 0.6));
        }
        .text-glow-red {
          filter: drop-shadow(0 0 10px rgba(239, 68, 68, 0.6));
        }
      `}</style>

      {/* ব্যাকড্রপ ওভারলে (ব্লার ইফেক্ট) */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
        
        {/* মেইন মোডাল কন্টেইনার (PC ও মোবাইলের জন্য ফুল রেসপনসিভ) */}
        <div className="relative w-full max-w-4xl my-auto bg-[#0b0f19]/90 border-2 border-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 rounded-[24px] p-[2px] shadow-neon-dual overflow-hidden transition-all duration-300">
          
          {/* ইনার ডার্ক বডি */}
          <div className="bg-[#070b13] rounded-[22px] p-5 sm:p-6 md:p-10 relative">
            
            {/* ক্লোজ বাটন */}
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 md:top-6 md:right-6 bg-red-600/10 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-xl p-2 transition-all active:scale-95"
            >
              <X className="w-4 h-4 md:w-5 h-5" />
            </button>

            {/* হেডার সেকশন */}
            <div className="text-center space-y-2 mb-6 md:mb-8 pr-6 pl-6">
              <h1 className="text-xl sm:text-2xl md:text-4xl font-black tracking-wide bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent text-glow-cyan">
                গুরুত্বপূর্ণ নোটিশ: অ্যাকাউন্ট স্থগিত
              </h1>
              <h2 className="text-base sm:text-lg md:text-2xl font-black tracking-widest text-red-500 text-glow-red uppercase pt-1">
                (ACCOUNT SUSPENDED)
              </h2>
              <p className="text-zinc-400 text-xs sm:text-sm md:text-base max-w-2xl mx-auto pt-2 font-medium leading-relaxed">
                প্রিয় ব্যবহারকারী, পরিষেবার নীতি লঙ্ঘনের কারণে আপনার অ্যাকাউন্টটি সাময়িকভাবে নিষ্ক্রিয় করা হয়েছে। পুনরায় সচল করতে নিম্নলিখিত তথ্য সরবরাহ করুন।
              </p>
            </div>

            {/* গ্রিড লেআউট: PC-তে ২ কলাম, মোবাইলে ১ কলাম */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 items-stretch">
              
              {/* বাম পাশ: প্রয়োজনীয় তথ্যের তালিকা */}
              <div className="space-y-3 flex flex-col justify-center">
                
                {/* বক্স ১ */}
                <div className="flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl border border-blue-500/30 bg-blue-950/20 shadow-[inset_0_0_12px_rgba(59,130,246,0.1)]">
                  <div className="p-2 sm:p-3 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 shrink-0">
                    <UserCheck className="w-5 h-5 sm:w-6 h-6" />
                  </div>
                  <p className="text-zinc-300 text-xs sm:text-sm font-semibold leading-normal">
                    आपका বৈধ পরিচয়পত্র (জাতীয় পরিচয়পত্র, পাসপোর্ট বা ড্রাইভিং লাইসেন্স)
                  </p>
                </div>

                {/* বক্স ২ */}
                <div className="flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl border border-blue-500/15 bg-zinc-900/40">
                  <div className="p-2 sm:p-3 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
                    <Mail className="w-5 h-5 sm:w-6 h-6" />
                  </div>
                  <p className="text-zinc-300 text-xs sm:text-sm font-semibold leading-normal">
                    আপনার সঠিক ইমেল এবং ফোন নম্বর
                  </p>
                </div>

                {/* BOX 3 */}
                <div className="flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl border border-red-500/15 bg-zinc-900/40">
                  <div className="p-2 sm:p-3 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 shrink-0">
                    <FileText className="w-5 h-5 sm:w-6 h-6" />
                  </div>
                  <p className="text-zinc-300 text-xs sm:text-sm font-semibold leading-normal">
                    ভুল ত্রুটির বিবরণ এবং আপিল আবেদন
                  </p>
                </div>
              </div>

              {/* ডান পাশ: আপলোড এবং সাবমিট বাটন */}
              <div className="flex flex-col justify-between gap-4 md:gap-6 mt-2 md:mt-0">
                
                {/* ফাইল আপলোড বক্স */}
                <div className="flex-1 min-h-[130px] flex flex-col justify-center items-center border-2 border-dashed border-red-500/40 bg-red-950/5 rounded-2xl p-5 text-center hover:bg-red-950/10 transition-all cursor-pointer relative group">
                  <input 
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                    onChange={handleFileChange} // ✅ ফিক্সড চেঞ্জ হ্যান্ডলার
                  />
                  <h3 className="text-sm sm:text-base font-bold text-white mb-2.5">ডকুমেন্ট আপলোড করুন</h3>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold text-xs sm:text-sm shadow-[0_0_15px_rgba(220,38,38,0.3)] group-hover:scale-105 transition-transform">
                    <Upload className="w-3.5 h-3.5 sm:w-4 h-4" />
                    ফাইল নির্বাচন করুন
                  </div>
                  {fileName && (
                    <p className="mt-2.5 text-xs text-green-400 font-mono max-w-[200px] truncate">✓ {fileName}</p>
                  )}
                </div>

                {/* প্রিমিয়াম নিয়ন ক্যাপসুল বাটন */}
                <button 
                  onClick={() => alert('আপিল জমা দেওয়া হচ্ছে...')}
                  className="w-full relative group overflow-hidden py-3 sm:py-4 px-6 rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-600 text-white font-black text-base sm:text-lg tracking-wider flex items-center justify-center gap-2 shadow-neon-cyan hover:brightness-110 active:scale-[0.99] transition-all"
                >
                  {/* শাইন রিফ্লেকশন ইফেক্ট */}
                  <div className="absolute inset-0 w-1/3 h-full bg-white/20 skew-x-12 -translate-x-full animate-custom-shine"></div>
                  
                  <span className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] text-center">
                    আপিল জমা দিন <span className="text-[10px] sm:text-xs font-normal block tracking-normal text-cyan-100">(SUBMIT APPEAL)</span>
                  </span>
                  <ChevronRight className="w-5 h-5 sm:w-6 h-6 shrink-0 text-white drop-shadow-md animate-pulse" />
                </button>

              </div>

            </div>

          </div>
        </div>
      </div>
    </>
  );
}


