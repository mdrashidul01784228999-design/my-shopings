'use client';
import React, { useState } from 'react';

interface Product {
  id: number;
  title: string;
  category: string;
  price: string;
}

export default function ScalableProductCatalog() {
  const [productCount, setProductCount] = useState<1 | 6 | 10 | 20 | 100>(6);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Generates dummy data on the fly matching the scale state
  const generateProducts = (count: number): Product[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      title: `Quantum Product Tier-${i + 1}`,
      category: i % 2 === 0 ? 'Core System' : 'Interface Extension',
      price: `$ ${(99 + i * 15).toFixed(2)}`
    }));
  };

  const products = generateProducts(productCount);

  return (
    <div className={`relative min-h-screen p-6 md:p-12 transition-colors duration-500 font-sans
      ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}
    >
      {/* Glow Effects */}
      <div className={`absolute top-0 left-1/4 w-96 h-96 rounded-full blur-[150px] pointer-events-none transition-all duration-700
        ${isDarkMode ? 'bg-cyan-500/10' : 'bg-pink-400/20'}`} 
      />

      <header className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-800/40 pb-6">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-cyan-400 via-pink-500 to-indigo-500 bg-clip-text text-transparent">
            Scale-Adaptive Ecosystem
          </h1>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Simulate layout adaptations across shifting catalog weights instantly.
          </p>
        </div>

        {/* CONTROLS AREA */}
        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-xs font-bold tracking-wider uppercase text-slate-400">Scale Simulator:</span>
          <div className={`flex rounded-xl p-1 border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            {([1, 6, 10, 20, 100] as const).map((num) => (
              <button
                key={num}
                onClick={() => setProductCount(num)}
                className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all duration-300
                  ${productCount === num 
                    ? 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-white shadow-md' 
                    : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
              >
                {num} {num === 1 ? 'Item' : 'Items'}
              </button>
            ))}
          </div>

          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800 text-yellow-400' : 'bg-white border-slate-200 text-indigo-600'}`}
          >
            {isDarkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      </header>

      {/* --- LIVE RENDER ZONE --- */}
      <main className="max-w-7xl mx-auto z-10 relative">
        
        {/* CASE 1: SINGLE PRODUCT FEATURE TARGET */}
        {productCount === 1 && (
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-12 items-center p-8 md:p-12 rounded-3xl border transition-all duration-500
            ${isDarkMode ? 'bg-slate-900/30 border-slate-800' : 'bg-white border-slate-200 shadow-xl'}`}
          >
            <div className="relative group aspect-square rounded-2xl bg-gradient-to-br from-cyan-500/20 via-indigo-500/10 to-transparent flex items-center justify-center border border-slate-700/30 overflow-hidden">
              <span className="text-8xl font-black drop-shadow-2xl animate-pulse text-transparent bg-clip-text bg-gradient-to-tr from-cyan-400 to-pink-500">
                💎
              </span>
            </div>
            <div>
              <span className="text-xs font-bold tracking-widest text-cyan-400 uppercase bg-cyan-950/40 border border-cyan-800/40 px-3 py-1 rounded-full">
                Flagship Edition
              </span>
              <h2 className={`text-4xl font-black mt-4 mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{products[0].title}</h2>
              <p className="text-2xl font-bold text-pink-500 mb-6">{products[0].price}</p>
              <p className={`text-base leading-relaxed mb-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Our signature system asset, fully optimized for deep implementation pipelines. Engineered to handle max capacity with zero bottlenecks.
              </p>
              <button className="w-full sm:w-auto px-8 py-4 font-bold rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 text-white shadow-lg shadow-cyan-500/20 hover:opacity-95 transition-all">
                Purchase Flagship Tier
              </button>
            </div>
          </div>
        )}

        {/* CASE 2: MATRIX DISPLAY (6 OR 10 ITEMS) */}
        {(productCount === 6 || productCount === 10) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {products.map((p) => (
              <div 
                key={p.id}
                className={`p-6 rounded-2xl border transition-all duration-500 hover:scale-[1.02] group
                  ${isDarkMode ? 'bg-slate-900/40 border-slate-800 hover:border-cyan-500/40' : 'bg-white border-slate-200 hover:border-pink-500/40 shadow-sm'}`}
              >
                <div className="w-full h-40 rounded-xl bg-slate-950/40 flex items-center justify-center mb-4 text-3xl border border-slate-800/50">📦</div>
                <span className="text-xs text-indigo-400 font-bold uppercase">{p.category}</span>
                <h3 className={`text-lg font-bold mt-1 mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{p.title}</h3>
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-800/40">
                  <span className="font-bold text-cyan-400">{p.price}</span>
                  <button className="text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-800 text-white hover:bg-cyan-500 hover:text-slate-950 transition-colors">Add</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CASE 3: HIGH-VOLUME DENSER DISPLAY (20 OR 100 ITEMS) */}
        {(productCount === 20 || productCount === 100) && (
          <div>
            <div className="mb-6 flex justify-between items-center px-2">
              <span className="text-xs font-bold text-slate-400">Showing {products.length} catalog positions</span>
              <span className="text-xs text-cyan-400 font-mono">Status: Paginated Stream Engine Active</span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {products.map((p) => (
                <div 
                  key={p.id}
                  className={`p-4 rounded-xl border transition-all duration-300 text-center
                    ${isDarkMode ? 'bg-slate-900/20 border-slate-800/80 hover:bg-slate-900/60' : 'bg-white border-slate-200 shadow-2xs hover:border-indigo-400'}`}
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-950/40 flex items-center justify-center mx-auto mb-3 text-lg border border-slate-800/50">⚡</div>
                  <h4 className={`text-xs font-bold truncate ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{p.title}</h4>
                  <p className="text-xs text-pink-500 font-bold mt-1">{p.price}</p>
                  <button className="w-full mt-3 py-1 text-[10px] font-black tracking-wider uppercase rounded bg-slate-800 text-slate-300 hover:bg-gradient-to-r hover:from-cyan-400 hover:to-indigo-500 hover:text-white transition-all">
                    Quick Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}



// "use client";
// import { useState, useRef } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { Check, Lock, Unlock, ChevronDown, Layout, Sparkles, CreditCard, Wallet, X, PartyPopper, Plus, ArrowRight, ShoppingCart, Smartphone, TrendingUp, Upload, Trash2, Monitor } from "lucide-react";
// import { toast, Toaster } from "react-hot-toast";

// export default function PremiumPage() {
//   const [isPurchased, setIsPurchased] = useState(false);
//   const [selectedPlan, setSelectedPlan] = useState("Free");
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const [showPaymentModal, setShowPaymentModal] = useState(false);
//   const [showSuccessModal, setShowSuccessModal] = useState(false);
//   const [tempPlan, setTempPlan] = useState(null);
  
//   const [landingPages, setLandingPages] = useState([]);
//   const [newPageName, setNewPageName] = useState("");

//   // ল্যান্ডিং পেজ ও ই-কমার্স কাস্টমাইজেশন স্টেট
//   const [siteTitle, setSiteTitle] = useState("Cyber Mart");
//   const [productPrice, setProductPrice] = useState("49");
//   const [productImage, setProductImage] = useState(null);
//   const [accentColor, setAccentColor] = useState("#00f2fe"); // Neon Cyan
  
//   const fileInputRef = useRef(null);

//   const plans = [
//     { name: "Free", price: "0", pages: 1, desc: "মৌলিক ফিচার টেস্ট করার জন্য", popular: false, glow: "shadow-slate-900" },
//     { name: "Basic", price: "15", pages: 2, desc: "ব্যক্তিগত বা ছোট উদ্যোগের জন্য", popular: false, glow: "shadow-blue-500/10" },
//     { name: "Standard", price: "39", pages: 5, desc: "সবচেয়ে জনপ্রিয় নিয়ন প্যাক", popular: true, glow: "shadow-purple-500/30" },
//     { name: "Premium Pro", price: "79", pages: 20, desc: "এজেন্সি ও মেগা ই-কমার্সের জন্য", popular: false, glow: "shadow-pink-500/20" },
//   ];

//   const handlePlanSelect = (plan) => {
//     setTempPlan(plan);
//     setShowPaymentModal(true);
//   };

//   const executePayment = (method) => {
//     setSelectedPlan(tempPlan.name);
//     setIsPurchased(true);
//     setShowPaymentModal(false);
//     setShowSuccessModal(true);
    
//     toast.success(`${tempPlan.name} প্ল্যানটি সফলভাবে আনলক হয়েছে!`, {
//       style: {
//         borderRadius: '16px',
//         background: '#0b0f19',
//         color: '#00f2fe',
//         border: '1px solid #00f2fe',
//         boxShadow: '0 0 20px rgba(0, 242, 254, 0.3)'
//       },
//     });
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setProductImage(reader.result);
//         toast.success("প্রোডাক্ট ইমেজ লাইভ সিঙ্ক হয়েছে!");
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleRemoveProduct = () => {
//     setSiteTitle("Cyber Mart");
//     setProductPrice("49");
//     setProductImage(null);
//     if (fileInputRef.current) fileInputRef.current.value = "";
//     toast.error("কনফিগারেশন রিসেট করা হয়েছে।");
//   };

//   const handleCreatePage = (e) => {
//     e.preventDefault();
//     const currentMaxPages = plans.find(p => p.name === selectedPlan)?.pages || 1;
    
//     if (landingPages.length >= currentMaxPages) {
//       toast.error(`দুঃখিত! এই প্ল্যানের সর্বোচ্চ সীমা (${currentMaxPages} টি পেজ) পূর্ণ হয়ে গেছে।`);
//       return;
//     }

//     if (newPageName.trim()) {
//       setLandingPages([...landingPages, { name: newPageName, slug: newPageName.toLowerCase().replace(/\s+/g, '-') }]);
//       toast.success(`"${newPageName}" স্টোরফ্রন্ট লাইভ!`);
//       setNewPageName("");
//     }
//   };

//   const currentMaxPages = plans.find(p => p.name === selectedPlan)?.pages || 1;

//   return (
//     <div className="min-h-screen bg-[#05070c] text-slate-100 font-sans antialiased pb-20 relative overflow-hidden selection:bg-purple-500/30 selection:text-purple-200">
      
//       {/* গ্লোবাল ব্যাকগ্রাউন্ড নিয়ন ইফেক্ট */}
//       <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>
//       <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none"></div>

//       <Toaster position="top-center" reverseOrder={false} />

//       {/* ১. নিয়ন হেডার */}
//       <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#05070c]/75 border-b border-purple-500/10 px-8 py-4 flex justify-between items-center shadow-[0_1px_20px_rgba(168,85,247,0.05)]">
//         <div className="flex items-center gap-2.5 font-black text-xl tracking-wider bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(0,242,254,0.3)]">
//           <Sparkles className="text-cyan-400 w-5 h-5 animate-pulse" /> SAASIFY NEON
//         </div>

//         <div className="relative">
//           <button 
//             onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
//             className="flex items-center gap-3 bg-slate-900/60 border border-purple-500/20 hover:border-cyan-400/50 px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)]"
//           >
//             <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-xs font-bold shadow-[0_0_10px_rgba(0,242,254,0.4)]">U</div>
//             <span className="text-slate-300">Terminal</span>
//             <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`} />
//           </button>

//           <AnimatePresence>
//             {isDropdownOpen && (
//               <motion.div 
//                 initial={{ opacity: 0, y: 12, scale: 0.95 }} 
//                 animate={{ opacity: 1, y: 0, scale: 1 }} 
//                 exit={{ opacity: 0, y: 12, scale: 0.95 }} 
//                 className="absolute right-0 mt-3 w-64 bg-slate-950/95 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-2 z-50 shadow-[0_10px_40px_rgba(0,0,0,0.7)]"
//               >
//                 {isPurchased ? (
//                   <div className="divide-y divide-slate-800/60">
//                     <div className="p-3 text-xs font-black text-cyan-400 tracking-widest uppercase">NODE: {selectedPlan}</div>
//                     <div className="py-1">
//                       <button 
//                         onClick={() => setShowSuccessModal(true)} 
//                         className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-300 hover:bg-purple-950/40 hover:text-cyan-400 rounded-xl transition-all"
//                       >
//                         <Layout className="w-4 h-4 text-purple-400" /> Store Setup ({landingPages.length}/{currentMaxPages})
//                       </button>
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="p-5 text-center">
//                     <Lock className="w-5 h-5 text-pink-500 mx-auto mb-2 drop-shadow-[0_0_8px_rgba(236,72,153,0.5)]" />
//                     <p className="text-xs text-slate-400">প্রিমিয়াম সিস্টেম লকড। আপগ্রেড প্রয়োজন।</p>
//                   </div>
//                 )}
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>
//       </header>

//       {/* ২. নিয়ন প্রাইসিং প্যানেল */}
//       <main className="max-w-7xl mx-auto px-6 py-12 relative z-10">
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
//           {plans.map((plan, index) => (
//             <div 
//               key={index} 
//               className={`relative p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between group
//                 ${plan.popular 
//                   ? "bg-[#0b0c16] border-purple-500 shadow-purple-500/20 lg:scale-105 z-10" 
//                   : "bg-slate-900/10 border-slate-800/80 hover:border-purple-500/40"
//                 } ${plan.glow}`}
//             >
//               <div>
//                 <h3 className="text-base font-bold text-slate-100 group-hover:text-cyan-400 transition-colors tracking-wide">{plan.name}</h3>
//                 <div className="mt-4 flex items-baseline gap-1">
//                   <span className="text-3xl font-black text-white tracking-tight">${plan.price}</span>
//                   <span className="text-xs text-slate-500 font-medium">/mo</span>
//                 </div>
                
//                 <ul className="mt-6 space-y-3 text-xs text-slate-400 border-t border-slate-800/60 pt-4">
//                   <li className="flex items-center gap-2">
//                     <Check className="w-3.5 h-3.5 text-cyan-400" />
//                     <span>Stores: <b className="text-slate-200">{plan.pages}টি</b></span>
//                   </li>
//                   <li className="flex items-center gap-2">
//                     {plan.name === "Free" ? <Lock className="w-3.5 h-3.5 text-pink-500" /> : <Unlock className="w-3.5 h-3.5 text-purple-400" />}
//                     <span className={plan.name === "Free" ? "text-slate-600" : "text-slate-200"}>Live Dual Preview Pack</span>
//                   </li>
//                 </ul>
//               </div>

//               <button 
//                 onClick={() => plan.name !== "Free" && handlePlanSelect(plan)} 
//                 disabled={plan.name === "Free"}
//                 className={`mt-6 w-full py-2.5 rounded-xl font-bold text-xs tracking-widest transition-all uppercase
//                   ${selectedPlan === plan.name 
//                     ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30" 
//                     : plan.name === "Free"
//                       ? "bg-slate-950 text-slate-600 border border-slate-900 cursor-not-allowed"
//                       : "bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white active:scale-[0.98]"
//                   }`}
//               >
//                 {selectedPlan === plan.name ? "✓ ACTIVE NODE" : plan.name === "Free" ? "CORE DEFAULT" : "INITIALIZE UPGRADE"}
//               </button>
//             </div>
//           ))}
//         </div>

//         {/* ৩. কোর মেকানিজম: কনফিগারেশন + ডাবল প্রিভিউ (ওয়েবসাইট এবং মোবাইল) */}
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
//           {/* কাস্টমাইজেশন কন্ট্রোল প্যানেল */}
//           <div className="lg:col-span-4 bg-[#0b0f19]/40 border border-slate-800 rounded-3xl p-5 relative overflow-hidden backdrop-blur-md flex flex-col justify-between">
//             <div>
//               <div className="flex items-center justify-between mb-5">
//                 <div className="flex items-center gap-2">
//                   <ShoppingCart className="text-cyan-400 w-4 h-4" />
//                   <h3 className="text-xs font-bold tracking-wider uppercase text-slate-200">Store Core</h3>
//                 </div>
//                 {isPurchased && (
//                   <button onClick={handleRemoveProduct} className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/20 transition-colors">
//                     <Trash2 className="w-3.5 h-3.5" />
//                   </button>
//                 )}
//               </div>
              
//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Product Asset Graphic</label>
//                   <div 
//                     onClick={() => isPurchased && fileInputRef.current.click()} 
//                     className={`border border-dashed rounded-xl p-3 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1
//                       ${isPurchased ? "border-slate-800 hover:border-cyan-500/50 bg-slate-950/40" : "border-slate-900 bg-slate-950/10"}`}
//                   >
//                     <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageChange} className="hidden" disabled={!isPurchased} />
//                     {productImage ? (
//                       <img src={productImage} alt="Preview" className="w-full h-16 object-cover rounded-lg" />
//                     ) : (
//                       <>
//                         <Upload className="w-5 h-5 text-slate-500" />
//                         <span className="text-[11px] text-slate-400">Upload product image</span>
//                       </>
//                     )}
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Store Brand Title</label>
//                   <input type="text" value={siteTitle} onChange={(e) => isPurchased && setSiteTitle(e.target.value)} disabled={!isPurchased} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-400 text-slate-200" />
//                 </div>

//                 <div>
//                   <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Price Token ($)</label>
//                   <input type="number" value={productPrice} onChange={(e) => isPurchased && setProductPrice(e.target.value)} disabled={!isPurchased} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500 text-slate-200" />
//                 </div>
//               </div>
//             </div>

//             {isPurchased && (
//               <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-3">
//                 <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-center">
//                   <span className="text-[9px] font-bold text-slate-500 uppercase block">Live Balance</span>
//                   <p className="text-sm font-black text-cyan-400 mt-0.5">$1,420</p>
//                 </div>
//                 <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-center">
//                   <span className="text-[9px] font-bold text-slate-500 uppercase block">Deployed Nodes</span>
//                   <p className="text-sm font-black text-purple-400 mt-0.5">{landingPages.length} active</p>
//                 </div>
//               </div>
//             )}
            
//             {!isPurchased && (
//               <div className="absolute inset-0 bg-[#05070c]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
//                 <Lock className="w-5 h-5 text-pink-400 drop-shadow-[0_0_5px_rgba(236,72,153,0.5)] mb-2" />
//                 <h4 className="font-black text-xs text-slate-200 uppercase tracking-wider">Module Locked</h4>
//               </div>
//             )}
//           </div>

//           {/* লাইভ ডেমো স্ক্রিন গ্রিড (ওয়েবসাইট ভিউ + মোবাইল ভিউ) */}
//           <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch bg-slate-900/10 border border-slate-800/80 rounded-3xl p-5 relative overflow-hidden">
            
//             {/* ক) ডেক্সটপ লাইভ ওয়েবসাইট মকআপ */}
//             <div className="md:col-span-7 bg-[#03050a] rounded-2xl border border-slate-800 p-4 flex flex-col justify-between shadow-inner relative overflow-hidden min-h-[360px]">
//               <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-3">
//                 <div className="flex items-center gap-1.5"><Monitor className="w-3.5 h-3.5 text-slate-500" /><span className="text-[10px] font-mono text-slate-500">https://{siteTitle.toLowerCase().replace(/\s+/g, '')}.saasify.io</span></div>
//                 <div className="flex gap-1"><div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div><div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div></div>
//               </div>
              
//               <div className="flex-1 flex flex-col justify-center items-center text-center p-2 relative z-10">
//                 <h3 className="text-2xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">{isPurchased ? siteTitle : "Cyber Mart Live"}</h3>
//                 <p className="text-[11px] text-slate-500 mt-1 max-w-[200px]">Welcome to the synchronized desktop storefront portal.</p>
                
//                 {productImage ? (
//                   <img src={productImage} alt="Web Asset" className="w-32 h-20 object-cover rounded-xl mt-4 border border-slate-800 shadow-xl" />
//                 ) : (
//                   <div className="w-32 h-20 bg-slate-950 rounded-xl border border-slate-900 flex items-center justify-center mt-4"><Sparkles className="w-5 h-5 text-slate-800" /></div>
//                 )}
//                 <span className="mt-3 text-xs font-black px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 shadow-[0_0_10px_rgba(0,242,254,0.1)]">${isPurchased ? productPrice : "49"} USD</span>
//               </div>
//             </div>

//             {/* খ) প্রিমিয়াম মোবাইল অ্যাপ মকআপ */}
//             <div className="md:col-span-5 flex flex-col items-center justify-center">
//               <motion.div 
//                 animate={isPurchased ? { boxShadow: `0 0 35px -5px ${accentColor}30` } : {}}
//                 className="w-[200px] h-[380px] bg-[#03050a] rounded-[35px] border-[4px] border-slate-800 relative p-2.5 flex flex-col justify-between overflow-hidden shadow-2xl transition-all duration-500"
//               >
//                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-3.5 bg-slate-800 rounded-b-xl z-30"></div>
                
//                 <div className="flex flex-col justify-between h-full pt-4 pb-1 relative z-10 text-[10px]">
//                   <div className="flex justify-between items-center border-b border-slate-900 pb-2">
//                     <span className="font-black tracking-wider text-slate-400 uppercase truncate max-w-[100px]">{isPurchased ? siteTitle : "App View"}</span>
//                     <ShoppingCart className="w-3 h-3 text-slate-500" />
//                   </div>

//                   <div className="my-2 flex-1 bg-slate-950/80 rounded-xl border border-slate-900 p-2 flex flex-col justify-center items-center text-center">
//                     {productImage ? (
//                       <img src={productImage} alt="App Asset" className="w-full h-20 object-cover rounded-lg border border-slate-900 shadow-sm" />
//                     ) : (
//                       <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center"><Smartphone className="w-4 h-4 opacity-30" style={{ color: accentColor }} /></div>
//                     )}
//                     <h5 className="mt-2 font-bold text-slate-300 truncate max-w-[140px]">{isPurchased ? siteTitle : "Asset Node"}</h5>
//                   </div>

//                   <div className="space-y-2">
//                     <div className="flex justify-between items-baseline px-0.5"><span className="text-[8px] text-slate-500 font-bold">Cost:</span><span className="font-black text-white text-xs">${isPurchased ? productPrice : "49"}</span></div>
//                     <button 
//                       onClick={() => { if (!isPurchased) { toast.error("ড্যাশবোর্ড আনলক করুন প্রথমে।"); } else { toast.success("অর্ডার সফল!", { icon: "⚡" }); } }}
//                       style={{ boxShadow: isPurchased ? `0 0 10px ${accentColor}30` : "none", borderColor: isPurchased ? accentColor : "#1e293b", background: isPurchased ? `${accentColor}10` : "#0f172a" }}
//                       className="w-full py-2 rounded-lg border text-[9px] font-black tracking-widest text-white uppercase transition-all active:scale-[0.96]"
//                     >
//                       BUY NOW
//                     </button>
//                   </div>
//                 </div>
//               </motion.div>
//             </div>

//           </div>
//         </div>
//       </main>

//       {/* ৪. পেমেন্ট গেটওয়ে মোডাল */}
//       <AnimatePresence>
//         {showPaymentModal && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
//             <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-[#0b0f19] border border-purple-500/20 rounded-3xl w-full max-w-md p-6 relative">
//               <button onClick={() => setShowPaymentModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-slate-300"><X className="w-4 h-4" /></button>
//               <h3 className="text-xs font-black mb-5 tracking-widest text-slate-400 uppercase">Secure Payment Nodes</h3>
//               <div className="space-y-3">
//                 <button onClick={() => executePayment("bKash")} className="w-full flex items-center justify-between p-4 rounded-2xl bg-[#e2136e] font-bold text-sm text-white shadow-lg active:scale-[0.99]"><span className="flex items-center gap-3"><Wallet className="w-5 h-5" /> Pay with bKash</span><ArrowRight className="w-4 h-4" /></button>
//                 <button onClick={() => executePayment("Stripe")} className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800 font-semibold text-sm text-slate-300 active:scale-[0.99]"><span className="flex items-center gap-3"><CreditCard className="text-cyan-400 w-5 h-5" /> Stripe Terminal</span><ArrowRight className="w-4 h-4 text-slate-500" /></button>
//               </div>
//             </motion.div>
//           </div>
//         )}
//       </AnimatePresence>

//       {/* ৫. সাকসেস ও পেজ ক্রিয়েশন মোডাল */}
//       <AnimatePresence>
//         {showSuccessModal && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
//             <motion.div initial={{ opacity: 0, scale: 0.93 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.93 }} className="bg-[#0b0f19] border border-cyan-500/30 rounded-3xl w-full max-w-lg p-6 relative">
//               <button onClick={() => setShowSuccessModal(false)} className="absolute top-5 right-5 text-slate-500 bg-slate-900 p-1.5 rounded-full"><X className="w-4 h-4" /></button>
              
//               <div className="text-center mb-5">
//                 <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto mb-2"><PartyPopper className="w-4 h-4 text-cyan-400" /></div>
//                 <h3 className="text-lg font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent uppercase tracking-wider">SYSTEM INITIALIZED</h3>
//                 <p className="text-xs text-slate-400 mt-1">সক্রিয় নোড প্যাকেজ: <span className="text-cyan-400 font-black">{selectedPlan}</span> ({currentMaxPages} টি স্টোরফ্রন্ট অ্যালাউড)</p>
//               </div>

//               <hr className="border-slate-800/80 my-4" />

//               <div>
//                 <form onSubmit={handleCreatePage} className="flex gap-2 mb-4">
//                   <input type="text" placeholder="যেমন: Cyber Monday Deal" value={newPageName} onChange={(e) => setNewPageName(e.target.value)} className="flex-1 bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl px-4 py-2 text-xs focus:outline-none text-slate-200" />
//                   <button type="submit" className="bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-[0.97] shadow-[0_0_10px_rgba(0,242,254,0.2)]">ক্রিয়েট</button>
//                 </form>

//                 <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
//                   {landingPages.length === 0 ? (
//                     <p className="text-xs text-slate-500 italic p-3 bg-slate-950/40 rounded-xl border border-slate-900 text-center">কোনো সায়ান স্টোর তৈরি করা হয়নি।</p>
//                   ) : (
//                     landingPages.map((page, index) => (
//                       <div key={index} className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-900 text-xs">
//                         <span className="font-semibold text-slate-300">{page.name}</span>
//                         <span className="text-cyan-400/80 font-mono">/{page.slug}</span>
//                       </div>
//                     ))
//                   )}
//                 </div>
//               </div>
//               <button onClick={() => setShowSuccessModal(false)} className="mt-5 w-full bg-slate-950 text-slate-400 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest border border-slate-800">সেভ করুন</button>
//             </motion.div>
//           </div>
//         )}
//       </AnimatePresence>

//     </div>
//   );
// }


