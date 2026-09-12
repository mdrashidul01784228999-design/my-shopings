
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Plus,
  Trash2,
  TrendingUp,
  PackageCheck,
  X,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

// প্রাথমিক কিছু লাক্সারি প্রোডাক্ট
const initialProducts = [
  {
    id: '1',
    name: 'Royal Velvet Reserve',
    buyPrice: 300,
    profitMargin: 25, // ২৫% লাভ
    price: 375, // আসল বিক্রি দাম = ৩০৩ + ২৫%
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop',
    quantity: 1,
  },
  {
    id: '2',
    name: 'Midnight Rose Cologne',
    buyPrice: 200,
    profitMargin: 30, // ৩০% লাভ
    price: 260,
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800&auto=format&fit=crop',
    quantity: 1,
  },
];

export default function LuxuryShopBagManager() {
  const [cart, setCart] = useState(initialProducts);
  const [isBagOpen, setIsBagOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // নতুন পণ্য যোগ করার ইনপুট স্টেট
  const [newName, setNewName] = useState('');
  const [newBuyPrice, setNewBuyPrice] = useState('');
  const [newProfitPercent, setNewProfitPercent] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');

  // নতুন পন্য লাভ সহ যোগ করে সরাসরি ব্যাগে ঢুকানোর ফাংশন
  const handleAddProductToBag = (e: React.FormEvent) => {
    e.preventDefault();

    const buyPriceNum = parseFloat(newBuyPrice);
    const profitPercentNum = parseFloat(newProfitPercent);

    if (!newName || isNaN(buyPriceNum) || isNaN(profitPercentNum)) {
      alert('দয়া করে সঠিক তথ্য দিন!');
      return;
    }

    // লাভ সহ বিক্রয় মূল্য হিসাব (Formula: Buy Price + Profit)
    const profitAmount = (buyPriceNum * profitPercentNum) / 100;
    const finalSellingPrice = buyPriceNum + profitAmount;

    const newProduct = {
      id: Date.now().toString(),
      name: newName,
      buyPrice: buyPriceNum,
      profitMargin: profitPercentNum,
      price: Math.round(finalSellingPrice), // লাভ সহ দাম
      image:
        newImageUrl.trim() !== ''
          ? newImageUrl
          : 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop',
      quantity: 1,
    };

    // ব্যাগে যোগ করা
    setCart((prev) => [newProduct, ...prev]);

    // ইনপুট রিসেট ও মডাল বন্ধ
    setNewName('');
    setNewBuyPrice('');
    setNewProfitPercent('');
    setNewImageUrl('');
    setIsAddModalOpen(false);

    // প্রোডাক্ট যোগ করার পর অটোমেটিক ব্যাগ ওপেন হবে
    setIsBagOpen(true);
  };

  // আইটেম সংখ্যা বা ড্রপ করার ফাংশন
  const removeItem = (id: string) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  // মোট টাকার হিসাব
  const totalAmount = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalProfit = cart.reduce(
    (acc, item) => acc + ((item.buyPrice * item.profitMargin) / 100) * item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans relative overflow-x-hidden">
      {/* Top Header Navigation */}
      <header className="border-b border-amber-500/10 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-amber-400 to-rose-400 flex items-center justify-center text-slate-950 font-bold text-base shadow-lg">
            A
          </div>
          <span className="font-serif tracking-widest text-xl font-bold bg-gradient-to-r from-amber-200 via-rose-200 to-amber-300 bg-clip-text text-transparent uppercase">
            AURELIA
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Add Product Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-rose-300 to-amber-500 text-slate-950 font-semibold text-xs sm:text-sm hover:brightness-110 transition-all shadow-lg active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>পণ্য যোগ করুন</span>
          </button>

          {/* Shop Bag Toggle Button */}
          <button
            onClick={() => setIsBagOpen(!isBagOpen)}
            className="relative p-2.5 rounded-xl bg-slate-900 border border-amber-500/20 hover:border-amber-400/50 transition-all text-amber-300"
          >
            <ShoppingBag className="w-5 h-5" />
            {cart.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-950">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <span className="text-xs font-bold tracking-[0.2em] text-amber-400 uppercase">
            Bag Management System
          </span>
          <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-amber-100 via-rose-200 to-amber-300 bg-clip-text text-transparent">
            লাভ সহ ব্যাগ হিসাব
          </h1>
        </div>

        {/* Quick Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto mb-10">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/20 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">ব্যাগে মোট বিক্রয় মূল্য</p>
              <p className="text-2xl font-bold text-amber-300">৳{totalAmount}</p>
            </div>
            <PackageCheck className="w-8 h-8 text-amber-400/60" />
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/20 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">মোট আনুমানিক লাভ</p>
              <p className="text-2xl font-bold text-emerald-400">৳{Math.round(totalProfit)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-emerald-400/60" />
          </div>
        </div>
      </main>

      {/* ==================================== */}
      {/* 1. SHOP BAG SIDEBAR OVERLAY (DRAWER) */}
      {/* ==================================== */}
      <AnimatePresence>
        {isBagOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBagOpen(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50"
            />

            {/* Slide-in Bag Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[420px] bg-slate-950 border-l border-amber-500/20 z-50 p-6 flex flex-col justify-between shadow-2xl"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-amber-400" />
                    <h2 className="text-lg font-bold text-slate-100">শপিং ব্যাগ ({cart.length})</h2>
                  </div>
                  <button
                    onClick={() => setIsBagOpen(false)}
                    className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Items List */}
                <div className="mt-6 space-y-4 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
                  {cart.length === 0 ? (
                    <p className="text-center text-slate-500 py-10 text-sm">
                      ব্যাগ খালি আছে! নতুন পণ্য যোগ করুন।
                    </p>
                  ) : (
                    cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-900/90 border border-slate-800 group hover:border-amber-500/30 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-slate-800">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-slate-100 line-clamp-1">
                              {item.name}
                            </h4>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              কেনা: ৳{item.buyPrice} | লাভ: {item.profitMargin}%
                            </p>
                            <p className="text-xs font-bold text-amber-300 mt-1">
                              বিক্রয় মূল্য: ৳{item.price}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="সরিয়ে ফেলুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Bottom Checkout & Total Section */}
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>মোট লাভ:</span>
                  <span className="text-emerald-400 font-semibold">৳{Math.round(totalProfit)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-slate-100">
                  <span>সর্বমোট প্রদেয়:</span>
                  <span className="text-amber-300">৳{totalAmount}</span>
                </div>

                <button
                  disabled={cart.length === 0}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 via-rose-300 to-amber-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-lg"
                >
                  <span>অর্ডার সম্পন্ন করুন</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ==================================== */}
      {/* 2. ADD PRODUCT MODAL                 */}
      {/* ==================================== */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-2xl z-10"
            >
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <h3 className="text-base font-bold text-amber-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> নতুন পণ্য ব্যাগে যোগ করুন
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddProductToBag} className="mt-4 space-y-4">
                {/* Product Name */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    পণ্যের নাম
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: Swiss Gold Watch"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Buy Price & Profit Percentage */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      কেনা দাম (৳)
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="500"
                      value={newBuyPrice}
                      onChange={(e) => setNewBuyPrice(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      লাভের হার (%)
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="20"
                      value={newProfitPercent}
                      onChange={(e) => setNewProfitPercent(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Auto Calculated Preview */}
                {newBuyPrice && newProfitPercent && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex justify-between items-center text-xs">
                    <span className="text-slate-300">হিসাবকৃত বিক্রয় মূল্য:</span>
                    <span className="font-bold text-amber-300 text-sm">
                      ৳
                      {Math.round(
                        parseFloat(newBuyPrice) +
                          (parseFloat(newBuyPrice) * parseFloat(newProfitPercent)) / 100
                      )}
                    </span>
                  </div>
                )}

                {/* Image URL */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    ছবি URL (ঐচ্ছিক)
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-2.5 mt-2 rounded-xl bg-gradient-to-r from-amber-400 to-rose-400 text-slate-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all shadow-md active:scale-95"
                >
                  ব্যাগে সেভ করুন
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}



// 'use client';

// import React, { useEffect, useRef, useState } from 'react';
// import Image from 'next/image';
// import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
// import {
//   User,
//   Crown,
//   Gift,
//   Heart,
//   CreditCard,
//   Settings,
//   Bell,
//   ShieldCheck,
//   LogOut,
//   ChevronDown,
//   ExternalLink,
// } from 'lucide-react';

// const products = [
//   {
//     id: 1,
//     name: 'Royal Velvet Reserve',
//     category: 'Bespoke Curation',
//     price: '$380',
//     image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop',
//     tag: 'Limited Edition',
//   },
//   {
//     id: 2,
//     name: 'Midnight Rose Cologne',
//     category: 'Haute Parfumerie',
//     price: '$295',
//     image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800&auto=format&fit=crop',
//     tag: 'Exclusive',
//   },
//   {
//     id: 3,
//     name: 'Artisan Crystal Decanter',
//     category: 'Crystalware',
//     price: '$420',
//     image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop',
//     tag: 'Handcrafted',
//   },
//   {
//     id: 4,
//     name: '24K Gold Chronograph',
//     category: 'Fine Horology',
//     price: '$890',
//     image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop',
//     tag: 'Signature',
//   },
//   {
//     id: 5,
//     name: 'Gilded Silk Scarf',
//     category: 'Haute Couture',
//     price: '$260',
//     image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?q=80&w=800&auto=format&fit=crop',
//     tag: 'New Arrival',
//   },
//   {
//     id: 6,
//     name: 'Onyx & Gold Leather Clutch',
//     category: 'Leather Goods',
//     price: '$640',
//     image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop',
//     tag: 'Trending',
//   },
//   {
//     id: 7,
//     name: 'Imperial Scented Candle',
//     category: 'Home Fragrance',
//     price: '$175',
//     image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=800&auto=format&fit=crop',
//     tag: 'Bestseller',
//   },
//   {
//     id: 8,
//     name: 'Diamond Inlaid Pen Set',
//     category: 'Fine Writing',
//     price: '$510',
//     image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?q=80&w=800&auto=format&fit=crop',
//     tag: 'Rare',
//   },
// ];

// // Reusable Dropdown Menu Item Component
// function DropdownItem({
//   icon,
//   title,
//   subtitle,
//   badge,
//   highlight = false,
// }: {
//   icon: React.ReactNode;
//   title: string;
//   subtitle?: string;
//   badge?: string;
//   highlight?: boolean;
// }) {
//   return (
//     <a
//       href="#"
//       className="group flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-900/90 hover:border hover:border-amber-500/20 transition-all duration-200"
//     >
//       <div className="flex items-center space-x-3">
//         <div
//           className={`p-2 rounded-lg transition-colors ${
//             highlight
//               ? 'bg-amber-400/10 text-amber-300 border border-amber-500/30'
//               : 'bg-slate-900 text-slate-400 group-hover:text-amber-300 group-hover:bg-slate-800'
//           }`}
//         >
//           {icon}
//         </div>
//         <div className="flex flex-col">
//           <span className="text-xs font-medium text-slate-200 group-hover:text-amber-200 transition-colors">
//             {title}
//           </span>
//           {subtitle && <span className="text-[10px] text-slate-400">{subtitle}</span>}
//         </div>
//       </div>

//       {badge && (
//         <span
//           className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
//             highlight
//               ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
//               : 'bg-slate-800 text-slate-400'
//           }`}
//         >
//           {badge}
//         </span>
//       )}
//     </a>
//   );
// }

// // Header Navigation with Luxury Profile Dropdown Component
// function Navigation() {
//   const [isOpen, setIsOpen] = useState(false);
//   const dropdownRef = useRef<HTMLDivElement>(null);

//   // Close dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//         setIsOpen(false);
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   return (
//     <nav className="w-full bg-slate-950/80 backdrop-blur-md border-b border-amber-500/10 py-4 px-6 flex justify-between items-center text-slate-100 sticky top-0 z-50">
//       {/* Brand Logo */}
//       <div className="flex items-center space-x-2">
//         <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-amber-400 to-rose-400 flex items-center justify-center text-slate-950 font-bold text-sm shadow-md">
//           A
//         </div>
//         <span className="font-serif tracking-widest text-lg font-bold bg-gradient-to-r from-amber-200 via-rose-200 to-amber-300 bg-clip-text text-transparent uppercase">
//           AURELIA
//         </span>
//       </div>

//       {/* Profile Trigger Button */}
//       <div className="relative" ref={dropdownRef}>
//         <button
//           onClick={() => setIsOpen(!isOpen)}
//           className="group flex items-center space-x-3 p-1.5 pr-3 rounded-full bg-slate-900/90 border border-amber-500/20 hover:border-amber-400/50 transition-all duration-300 focus:outline-none shadow-lg hover:shadow-amber-500/10"
//         >
//           {/* Avatar with Metallic Ring */}
//           <div className="relative w-9 h-9 rounded-full p-[1.5px] bg-gradient-to-tr from-amber-400 via-rose-300 to-amber-500">
//             <div className="relative w-full h-full rounded-full overflow-hidden bg-slate-950">
//               <Image
//                 src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop"
//                 alt="VIP User"
//                 fill
//                 className="object-cover"
//               />
//             </div>
//             {/* Online Status Indicator */}
//             <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-amber-400 rounded-full ring-2 ring-slate-950 animate-pulse" />
//           </div>

//           {/* User Brief Info (Visible on Desktop) */}
//           <div className="hidden sm:flex flex-col text-left">
//             <span className="text-xs font-semibold text-slate-200 group-hover:text-amber-200 transition-colors">
//               Lady Eleanor
//             </span>
//             <span className="text-[10px] text-amber-400/90 font-medium tracking-wider uppercase flex items-center gap-1">
//               <Crown className="w-2.5 h-2.5 text-amber-400 inline" /> VIP Black Card
//             </span>
//           </div>

//           <ChevronDown
//             className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${
//               isOpen ? 'rotate-180 text-amber-300' : ''
//             }`}
//           />
//         </button>

//         {/* Floating Luxury Dropdown Menu */}
//         <AnimatePresence>
//           {isOpen && (
//             <motion.div
//               initial={{ opacity: 0, y: 12, scale: 0.96 }}
//               animate={{ opacity: 1, y: 0, scale: 1 }}
//               exit={{ opacity: 0, y: 8, scale: 0.96 }}
//               transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
//               className="absolute right-0 mt-3 w-80 rounded-2xl p-[1px] bg-gradient-to-b from-amber-300/30 via-slate-800/80 to-amber-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50"
//             >
//               <div className="bg-slate-950/95 backdrop-blur-2xl rounded-[15px] p-4 text-slate-200 divide-y divide-slate-800/80">
//                 {/* Header: VIP Card Banner */}
//                 <div className="pb-4">
//                   <div className="relative overflow-hidden rounded-xl p-3.5 bg-gradient-to-r from-amber-950/40 via-slate-900 to-purple-950/30 border border-amber-500/20">
//                     <div className="absolute top-0 right-0 -mr-4 -mt-4 w-20 h-20 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />

//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center space-x-3">
//                         <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300">
//                           <Crown className="w-5 h-5" />
//                         </div>
//                         <div>
//                           <p className="text-xs font-bold tracking-wide text-slate-100">
//                             VIP Royal Tier
//                           </p>
//                           <p className="text-[10px] text-amber-400/80 tracking-wider uppercase">
//                             12,450 Tier Points
//                           </p>
//                         </div>
//                       </div>
//                       <span className="text-[10px] font-bold bg-gradient-to-r from-amber-400 to-rose-300 text-slate-950 px-2 py-0.5 rounded-full uppercase">
//                         Elite
//                       </span>
//                     </div>

//                     {/* Progress Bar */}
//                     <div className="mt-3">
//                       <div className="flex justify-between text-[10px] text-slate-400 mb-1">
//                         <span>Progress to Tier II</span>
//                         <span className="text-amber-300">82%</span>
//                       </div>
//                       <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
//                         <div className="bg-gradient-to-r from-amber-400 to-rose-400 h-full w-[82%] rounded-full" />
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Main Navigation Links */}
//                 <div className="py-2 space-y-0.5">
//                   <DropdownItem
//                     icon={<User className="w-4 h-4" />}
//                     title="Personal Profile"
//                     subtitle="Account & Preferences"
//                   />
//                   <DropdownItem
//                     icon={<Gift className="w-4 h-4" />}
//                     title="Curated Gifts"
//                     badge="3 Active"
//                     highlight
//                   />
//                   <DropdownItem
//                     icon={<Heart className="w-4 h-4" />}
//                     title="Private Wishlist"
//                   />
//                   <DropdownItem
//                     icon={<CreditCard className="w-4 h-4" />}
//                     title="Concierge & Payment"
//                   />
//                 </div>

//                 {/* Settings & Preferences */}
//                 <div className="py-2 space-y-0.5">
//                   <DropdownItem
//                     icon={<Settings className="w-4 h-4" />}
//                     title="System Settings"
//                   />
//                   <DropdownItem
//                     icon={<Bell className="w-4 h-4" />}
//                     title="Notifications"
//                     badge="New"
//                   />
//                   <DropdownItem
//                     icon={<ShieldCheck className="w-4 h-4" />}
//                     title="Security & Privacy"
//                   />
//                 </div>

//                 {/* Footer / Logout */}
//                 <div className="pt-2">
//                   <button
//                     onClick={() => setIsOpen(false)}
//                     className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors group text-xs font-semibold"
//                   >
//                     <span className="flex items-center gap-2.5">
//                       <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
//                       Sign Out
//                     </span>
//                     <ExternalLink className="w-3 h-3 opacity-60" />
//                   </button>
//                 </div>
//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>
//     </nav>
//   );
// }

// // Interactive 3D Card Component
// function Luxury3DCard({ product, index }: { product: typeof products[0]; index: number }) {
//   const cardRef = useRef<HTMLDivElement>(null);

//   // Motion Values for Mouse Position Tracking
//   const x = useMotionValue(0);
//   const y = useMotionValue(0);

//   // Smooth Spring Physics for 3D Movement
//   const mouseX = useSpring(x, { stiffness: 200, damping: 20 });
//   const mouseY = useSpring(y, { stiffness: 200, damping: 20 });

//   // Map Mouse Coordinates to 3D Rotation Degrees
//   const rotateX = useTransform(mouseY, [-0.5, 0.5], [14, -14]);
//   const rotateY = useTransform(mouseX, [-0.5, 0.5], [-14, 14]);

//   // Lighting & Dynamic Highlight Position
//   const brightness = useTransform(mouseY, [-0.5, 0.5], [1.1, 0.9]);
//   const shineX = useTransform(mouseX, [-0.5, 0.5], ['0%', '100%']);
//   const shineY = useTransform(mouseY, [-0.5, 0.5], ['0%', '100%']);

//   const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
//     if (!cardRef.current) return;
//     const rect = cardRef.current.getBoundingClientRect();
//     const width = rect.width;
//     const height = rect.height;

//     const mouseXPos = e.clientX - rect.left;
//     const mouseYPos = e.clientY - rect.top;

//     const xPct = mouseXPos / width - 0.5;
//     const yPct = mouseYPos / height - 0.5;

//     x.set(xPct);
//     y.set(yPct);
//   };

//   const handleMouseLeave = () => {
//     x.set(0);
//     y.set(0);
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 30 }}
//       whileInView={{ opacity: 1, y: 0 }}
//       viewport={{ once: true }}
//       transition={{ duration: 0.6, delay: index * 0.08 }}
//       className="perspective-1000"
//     >
//       <motion.div
//         ref={cardRef}
//         onMouseMove={handleMouseMove}
//         onMouseLeave={handleMouseLeave}
//         style={{
//           rotateX,
//           rotateY,
//           transformStyle: 'preserve-3d',
//           filter: `brightness(${brightness})`,
//         }}
//         whileHover={{ scale: 1.03 }}
//         className="group relative flex flex-col rounded-2xl p-[1.5px] bg-gradient-to-b from-amber-200/40 via-purple-500/20 to-amber-500/10 hover:from-amber-300 hover:via-purple-400 hover:to-rose-400 transition-colors duration-500 shadow-2xl hover:shadow-[0_20px_50px_rgba(217,119,6,0.25)] cursor-pointer"
//       >
//         {/* Dynamic Light Beam Overlay */}
//         <motion.div
//           style={{
//             background: `radial-gradient(circle at ${shineX} ${shineY}, rgba(255, 255, 255, 0.25) 0%, transparent 60%)`,
//           }}
//           className="absolute inset-0 rounded-2xl pointer-events-none z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
//         />

//         {/* Inner Card Wrapper */}
//         <div
//           className="relative flex flex-col h-full w-full bg-slate-950/90 backdrop-blur-xl rounded-[15px] overflow-hidden"
//           style={{ transform: 'translateZ(0px)' }}
//         >
//           {/* Image Container with 3D Depth Elevation */}
//           <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-900">
//             <motion.div
//               style={{ transform: 'translateZ(30px)' }}
//               className="w-full h-full relative transition-transform duration-700 ease-out group-hover:scale-110"
//             >
//               <Image
//                 src={product.image}
//                 alt={product.name}
//                 fill
//                 priority={index < 4}
//                 sizes="(max-width: 1024px) 50vw, 25vw"
//                 className="object-cover object-center"
//               />
//             </motion.div>

//             {/* Gradient Mask for Subtle Vignette */}
//             <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80" />

//             {/* Badge floating with 3D depth */}
//             {product.tag && (
//               <motion.span
//                 style={{ transform: 'translateZ(45px)' }}
//                 className="absolute top-3 left-3 bg-slate-950/80 border border-amber-400/40 backdrop-blur-md text-amber-200 text-[10px] sm:text-xs font-semibold tracking-wider px-3 py-1 rounded-full shadow-lg"
//               >
//                 {product.tag}
//               </motion.span>
//             )}
//           </div>

//           {/* Product Details Section */}
//           <motion.div
//             style={{ transform: 'translateZ(40px)' }}
//             className="p-4 sm:p-5 flex flex-col justify-between flex-grow z-20"
//           >
//             <div>
//               <p className="text-[10px] sm:text-xs font-semibold text-amber-400/90 uppercase tracking-widest">
//                 {product.category}
//               </p>
//               <h3 className="mt-1 text-sm sm:text-base font-medium text-slate-100 group-hover:text-amber-200 transition-colors line-clamp-1">
//                 {product.name}
//               </h3>
//             </div>

//             <div className="mt-5 flex items-center justify-between">
//               <span className="text-base sm:text-lg font-bold text-slate-100 tracking-wide">
//                 {product.price}
//               </span>

//               {/* Glowing CTA Button */}
//               <button
//                 type="button"
//                 className="relative group/btn overflow-hidden rounded-lg p-[1px] font-medium text-xs focus:outline-none"
//               >
//                 <span className="absolute inset-0 bg-gradient-to-r from-amber-400 via-rose-300 to-amber-500 transition-all duration-300 group-hover/btn:opacity-100 opacity-80" />
//                 <span className="relative block px-3.5 py-1.5 rounded-[7px] bg-slate-950 text-amber-200 group-hover/btn:bg-transparent group-hover/btn:text-slate-950 font-semibold transition-all duration-300">
//                   Discover
//                 </span>
//               </button>
//             </div>
//           </motion.div>
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// }

// // Parent Section Component
// export default function Luxury3DProductGrid() {
//   return (
//     <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
//       {/* Top Navigation */}
//       <Navigation />

//       {/* Main Content Section */}
//       <section className="relative py-16 px-4 sm:px-6 lg:px-8 flex-grow flex flex-col justify-center overflow-hidden">
//         {/* Background Ambient Glowing Orbs */}
//         <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[140px] pointer-events-none" />
//         <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

//         <div className="max-w-7xl mx-auto relative z-10 w-full">
//           {/* Section Header */}
//           <div className="text-center mb-16">
//             <motion.span
//               initial={{ opacity: 0, y: 10 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="text-xs font-bold tracking-[0.25em] text-amber-400 uppercase"
//             >
//               Artisanal Collection
//             </motion.span>

//             <motion.h2
//               initial={{ opacity: 0, y: 15 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.1 }}
//               className="mt-3 text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-amber-100 via-rose-200 to-amber-300 bg-clip-text text-transparent"
//             >
//               The Luxury Showcase
//             </motion.h2>

//             <motion.p
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.2 }}
//               className="mt-3 max-w-lg mx-auto text-xs sm:text-sm text-slate-400 tracking-wide"
//             >
//               Exquisite craftsmanship meets modern interactive design. Hover to explore details in 3D space.
//             </motion.p>
//           </div>

//           {/* Grid Setup: 2 items per row on mobile | 4 items per row on desktop */}
//           <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
//             {products.map((product, index) => (
//               <Luxury3DCard key={product.id} product={product} index={index} />
//             ))}
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// }

// // 'use client';

// // import React, { useEffect, useRef, useState } from 'react';

// // import Image from 'next/image';
// // import { motion, useMotionValue, useSpring, useTransform,AnimatePresence } from 'framer-motion';

// // import {
// //   User,
// //   Crown,
// //   Gift,
// //   Sparkles,
// //   Heart,
// //   CreditCard,
// //   Settings,
// //   Bell,
// //   ShieldCheck,
// //   LogOut,
// //   ChevronDown,
// //   ExternalLink,
  
// // } from 'lucide-react';
// // const products = [
// //   {
// //     id: 1,
// //     name: 'Royal Velvet Reserve',
// //     category: 'Bespoke Curation',
// //     price: '$380',
// //     image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop',
// //     tag: 'Limited Edition',
// //   },
// //   {
// //     id: 2,
// //     name: 'Midnight Rose Cologne',
// //     category: 'Haute Parfumerie',
// //     price: '$295',
// //     image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800&auto=format&fit=crop',
// //     tag: 'Exclusive',
// //   },
// //   {
// //     id: 3,
// //     name: 'Artisan Crystal Decanter',
// //     category: 'Crystalware',
// //     price: '$420',
// //     image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop',
// //     tag: 'Handcrafted',
// //   },
// //   {
// //     id: 4,
// //     name: '24K Gold Chronograph',
// //     category: 'Fine Horology',
// //     price: '$890',
// //     image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop',
// //     tag: 'Signature',
// //   },
// //   {
// //     id: 5,
// //     name: 'Gilded Silk Scarf',
// //     category: 'Haute Couture',
// //     price: '$260',
// //     image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?q=80&w=800&auto=format&fit=crop',
// //     tag: 'New Arrival',
// //   },
// //   {
// //     id: 6,
// //     name: 'Onyx & Gold Leather Clutch',
// //     category: 'Leather Goods',
// //     price: '$640',
// //     image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop',
// //     tag: 'Trending',
// //   },
// //   {
// //     id: 7,
// //     name: 'Imperial Scented Candle',
// //     category: 'Home Fragrance',
// //     price: '$175',
// //     image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=800&auto=format&fit=crop',
// //     tag: 'Bestseller',
// //   },
// //   {
// //     id: 8,
// //     name: 'Diamond Inlaid Pen Set',
// //     category: 'Fine Writing',
// //     price: '$510',
// //     image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?q=80&w=800&auto=format&fit=crop',
// //     tag: 'Rare',
// //   },
// // ];

// // // Interactive 3D Card Component
// // function Luxury3DCard({ product, index }: { product: typeof products[0]; index: number }) {











// //   const [isOpen, setIsOpen] = useState(false);
// //   const dropdownRef = useRef<HTMLDivElement>(null);

// //   // Close dropdown when clicking outside
// //   useEffect(() => {
// //     const handleClickOutside = (event: MouseEvent) => {
// //       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
// //         setIsOpen(false);
// //       }
// //     };
// //     document.addEventListener('mousedown', handleClickOutside);
// //     return () => document.removeEventListener('mousedown', handleClickOutside);
// //   }, []);





// //   const cardRef = useRef<HTMLDivElement>(null);

// //   // Motion Values for Mouse Position Tracking
// //   const x = useMotionValue(0);
// //   const y = useMotionValue(0);

// //   // Smooth Spring Physics for 3D Movement
// //   const mouseX = useSpring(x, { stiffness: 200, damping: 20 });
// //   const mouseY = useSpring(y, { stiffness: 200, damping: 20 });

// //   // Map Mouse Coordinates to 3D Rotation Degrees
// //   const rotateX = useTransform(mouseY, [-0.5, 0.5], [14, -14]);
// //   const rotateY = useTransform(mouseX, [-0.5, 0.5], [-14, 14]);

// //   // Lighting & Dynamic Highlight Position
// //   const brightness = useTransform(mouseY, [-0.5, 0.5], [1.1, 0.9]);
// //   const shineX = useTransform(mouseX, [-0.5, 0.5], ['0%', '100%']);
// //   const shineY = useTransform(mouseY, [-0.5, 0.5], ['0%', '100%']);

// //   const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
// //     if (!cardRef.current) return;
// //     const rect = cardRef.current.getBoundingClientRect();
// //     const width = rect.width;
// //     const height = rect.height;

// //     const mouseXPos = e.clientX - rect.left;
// //     const mouseYPos = e.clientY - rect.top;

// //     const xPct = mouseXPos / width - 0.5;
// //     const yPct = mouseYPos / height - 0.5;

// //     x.set(xPct);
// //     y.set(yPct);
// //   };

// //   const handleMouseLeave = () => {
// //     x.set(0);
// //     y.set(0);
// //   };

// //   return (
// //     <motion.div
// //       initial={{ opacity: 0, y: 30 }}
// //       whileInView={{ opacity: 1, y: 0 }}
// //       viewport={{ once: true }}
// //       transition={{ duration: 0.6, delay: index * 0.08 }}
// //       className="perspective-1000"
// //     >
// //       <motion.div
// //         ref={cardRef}
// //         onMouseMove={handleMouseMove}
// //         onMouseLeave={handleMouseLeave}
// //         style={{
// //           rotateX,
// //           rotateY,
// //           transformStyle: 'preserve-3d',
// //           filter: `brightness(${brightness})`,
// //         }}
// //         whileHover={{ scale: 1.03 }}
// //         className="group relative flex flex-col rounded-2xl p-[1.5px] bg-gradient-to-b from-amber-200/40 via-purple-500/20 to-amber-500/10 hover:from-amber-300 hover:via-purple-400 hover:to-rose-400 transition-colors duration-500 shadow-2xl hover:shadow-[0_20px_50px_rgba(217,119,6,0.25)] cursor-pointer"
// //       >
// //         {/* Dynamic Light Beam Overlay */}
// //         <motion.div
// //           style={{
// //             background: `radial-gradient(circle at ${shineX} ${shineY}, rgba(255, 255, 255, 0.25) 0%, transparent 60%)`,
// //           }}
// //           className="absolute inset-0 rounded-2xl pointer-events-none z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
// //         />

// //         {/* Inner Card Wrapper */}
// //         <div 
// //           className="relative flex flex-col h-full w-full bg-slate-950/90 backdrop-blur-xl rounded-[15px] overflow-hidden"
// //           style={{ transform: 'translateZ(0px)' }}
// //         >
// //           {/* Image Container with 3D Depth Elevation */}
// //           <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-900">
// //             <motion.div
// //               style={{ transform: 'translateZ(30px)' }}
// //               className="w-full h-full relative transition-transform duration-700 ease-out group-hover:scale-110"
// //             >
// //               <Image
// //                 src={product.image}
// //                 alt={product.name}
// //                 fill
// //                 priority={index < 4}
// //                 sizes="(max-width: 1024px) 50vw, 25vw"
// //                 className="object-cover object-center"
// //               />
// //             </motion.div>

// //             {/* Gradient Mask for Subtle Vignette */}
// //             <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80" />

// //             {/* Badge floating with 3D depth */}
// //             {product.tag && (
// //               <motion.span
// //                 style={{ transform: 'translateZ(45px)' }}
// //                 className="absolute top-3 left-3 bg-slate-950/80 border border-amber-400/40 backdrop-blur-md text-amber-200 text-[10px] sm:text-xs font-semibold tracking-wider px-3 py-1 rounded-full shadow-lg"
// //               >
// //                 {product.tag}
// //               </motion.span>
// //             )}
// //           </div>

// //           {/* Product Details Section */}
// //           <motion.div 
// //             style={{ transform: 'translateZ(40px)' }}
// //             className="p-4 sm:p-5 flex flex-col justify-between flex-grow z-20"
// //           >
// //             <div>
// //               <p className="text-[10px] sm:text-xs font-semibold text-amber-400/90 uppercase tracking-widest">
// //                 {product.category}
// //               </p>
// //               <h3 className="mt-1 text-sm sm:text-base font-medium text-slate-100 group-hover:text-amber-200 transition-colors line-clamp-1">
// //                 {product.name}
// //               </h3>
// //             </div>

// //             <div className="mt-5 flex items-center justify-between">
// //               <span className="text-base sm:text-lg font-bold text-slate-100 tracking-wide">
// //                 {product.price}
// //               </span>

// //               {/* Glowing CTA Button */}
// //               <button
// //                 type="button"
// //                 className="relative group/btn overflow-hidden rounded-lg p-[1px] font-medium text-xs focus:outline-none"
// //               >
// //                 <span className="absolute inset-0 bg-gradient-to-r from-amber-400 via-rose-300 to-amber-500 transition-all duration-300 group-hover/btn:opacity-100 opacity-80" />
// //                 <span className="relative block px-3.5 py-1.5 rounded-[7px] bg-slate-950 text-amber-200 group-hover/btn:bg-transparent group-hover/btn:text-slate-950 font-semibold transition-all duration-300">
// //                   Discover
// //                 </span>
// //               </button>
// //             </div>
// //           </motion.div>
// //         </div>
// //       </motion.div>
// //     </motion.div>
// //   );
// // }

// // // Parent Section Component
// // export default function Luxury3DProductGrid() {
// //   return (
// //     <section className="relative bg-slate-950 py-20 px-4 sm:px-6 lg:px-8 min-h-screen text-slate-100 overflow-hidden flex flex-col justify-center">
// //       {/* Background Ambient Glowing Orbs */}









// //    <nav className="w-full bg-slate-950 border-b border-amber-500/10 py-4 px-6 flex justify-between items-center text-slate-100">
// //      {/* Brand Logo Placeholder */}
// //     <div className="flex items-center space-x-2">
// //         <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-amber-400 to-rose-400 flex items-center justify-center text-slate-950 font-bold text-sm">
// //      A
// //         </div>
// //         <span className="font-serif tracking-widest text-lg font-bold bg-gradient-to-r from-amber-200 via-rose-200 to-amber-300 bg-clip-text text-transparent uppercase">
// //         AURELIA
// //       </span>
// //     </div>

// //      {/* Profile Trigger Button */}
// //      <div className="relative" ref={dropdownRef}>
// //         <button
// //           onClick={() => setIsOpen(!isOpen)}
// //           className="group flex items-center space-x-3 p-1.5 pr-3 rounded-full bg-slate-900/90 border border-amber-500/20 hover:border-amber-400/50 transition-all duration-300 focus:outline-none shadow-lg hover:shadow-amber-500/10"
// //         >
// //           {/* Avatar with Metallic Ring */}
// //           <div className="relative w-9 h-9 rounded-full p-[1.5px] bg-gradient-to-tr from-amber-400 via-rose-300 to-amber-500">
// //             <div className="relative w-full h-full rounded-full overflow-hidden bg-slate-950">
// //               <Image
// //                 src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop"
// //                 alt="VIP User"
// //                 fill
// //                 className="object-cover"
// //               />
// //             </div>
// //             {/* Online Status Indicator */}
// //             <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-amber-400 rounded-full ring-2 ring-slate-950 animate-pulse" />
// //           </div>

// //           {/* User Brief Info (Visible on Desktop) */}
// //           <div className="hidden sm:flex flex-col text-left">
// //             <span className="text-xs font-semibold text-slate-200 group-hover:text-amber-200 transition-colors">
// //               Lady Eleanor
// //             </span>
// //             <span className="text-[10px] text-amber-400/90 font-medium tracking-wider uppercase flex items-center gap-1">
// //               <Crown className="w-2.5 h-2.5 text-amber-400 inline" /> VIP Black Card
// //             </span>
// //           </div>

// //           <ChevronDown
// //             className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${
// //               isOpen ? 'rotate-180 text-amber-300' : ''
// //             }`}
// //           />
// //         </button>

// //         {/* Floating Luxury Dropdown Menu */}
// //         <AnimatePresence>
// //           {isOpen && (
// //             <motion.div
// //               initial={{ opacity: 0, y: 12, scale: 0.96 }}
// //               animate={{ opacity: 1, y: 0, scale: 1 }}
// //               exit={{ opacity: 0, y: 8, scale: 0.96 }}
// //               transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
// //               className="absolute right-0 mt-3 w-80 rounded-2xl p-[1px] bg-gradient-to-b from-amber-300/30 via-slate-800/80 to-amber-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50"
// //             >
// //               <div className="bg-slate-950/95 backdrop-blur-2xl rounded-[15px] p-4 text-slate-200 divide-y divide-slate-800/80">
                
// //                 {/* Header: VIP Card Banner */}
// //                 <div className="pb-4">
// //                   <div className="relative overflow-hidden rounded-xl p-3.5 bg-gradient-to-r from-amber-950/40 via-slate-900 to-purple-950/30 border border-amber-500/20">
// //                     <div className="absolute top-0 right-0 -mr-4 -mt-4 w-20 h-20 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
                    
// //                     <div className="flex items-center justify-between">
// //                       <div className="flex items-center space-x-3">
// //                         <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300">
// //                           <Crown className="w-5 h-5" />
// //                         </div>
// //                         <div>
// //                           <p className="text-xs font-bold tracking-wide text-slate-100">
// //                             VIP Royal Tier
// //                           </p>
// //                           <p className="text-[10px] text-amber-400/80 tracking-wider uppercase">
// //                             12,450 Tier Points
// //                           </p>
// //                         </div>
// //                       </div>
// //                       <span className="text-[10px] font-bold bg-gradient-to-r from-amber-400 to-rose-300 text-slate-950 px-2 py-0.5 rounded-full uppercase">
// //                         Elite
// //                       </span>
// //                     </div>

// //                     {/* Progress Bar */}
// //                     <div className="mt-3">
// //                       <div className="flex justify-between text-[10px] text-slate-400 mb-1">
// //                         <span>Progress to Tier II</span>
// //                         <span className="text-amber-300">82%</span>
// //                       </div>
// //                       <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
// //                         <div className="bg-gradient-to-r from-amber-400 to-rose-400 h-full w-[82%] rounded-full" />
// //                       </div>
// //                     </div>
// //                   </div>
// //                 </div>

// //                 {/* Main Navigation Links */}
// //                 <div className="py-2 space-y-0.5">
// //                   <DropdownItem
// //                     icon={<User className="w-4 h-4" />}
// //                     title="Personal Profile"
// //                     subtitle="Account & Preferences"
// //                   />
// //                   <DropdownItem
// //                     icon={<Gift className="w-4 h-4" />}
// //                     title="Curated Gifts"
// //                     badge="3 Active"
// //                     highlight
// //                   />
// //                   <DropdownItem
// //                     icon={<Heart className="w-4 h-4" />}
// //                     title="Private Wishlist"
// //                   />
// //                   <DropdownItem
// //                     icon={<CreditCard className="w-4 h-4" />}
// //                     title="Concierge & Payment"
// //                   />
// //                 </div>

// //                 {/* Settings & Preferences */}
// //                 <div className="py-2 space-y-0.5">
// //                   <DropdownItem
// //                     icon={<Settings className="w-4 h-4" />}
// //                     title="System Settings"
// //                   />
// //                   <DropdownItem
// //                     icon={<Bell className="w-4 h-4" />}
// //                     title="Notifications"
// //                     badge="New"
// //                   />
// //                   <DropdownItem
// //                     icon={<ShieldCheck className="w-4 h-4" />}
// //                     title="Security & Privacy"
// //                   />
// //                 </div>

// //                 {/* Footer / Logout */}
// //                 <div className="pt-2">
// //                   <button
// //                     onClick={() => setIsOpen(false)}
// //                     className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors group text-xs font-semibold"
// //                   >
// //                     <span className="flex items-center gap-2.5">
// //                       <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
// //                       Sign Out
// //                     </span>
// //                     <ExternalLink className="w-3 h-3 opacity-60" />
// //                   </button>
// //                 </div>

// //               </div>
// //             </motion.div>
// //           )}
// //         </AnimatePresence>
// //       </div>
// //     </nav>
















// //       <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[140px] pointer-events-none" />
// //       <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

// //       <div className="max-w-7xl mx-auto relative z-10 w-full">
// //         {/* Section Header */}
// //         <div className="text-center mb-16">
// //           <motion.span 
// //             initial={{ opacity: 0, y: 10 }}
// //             animate={{ opacity: 1, y: 0 }}
// //             className="text-xs font-bold tracking-[0.25em] text-amber-400 uppercase"
// //           >
// //             Artisanal Collection
// //           </motion.span>
          
// //           <motion.h2 
// //             initial={{ opacity: 0, y: 15 }}
// //             animate={{ opacity: 1, y: 0 }}
// //             transition={{ delay: 0.1 }}
// //             className="mt-3 text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-amber-100 via-rose-200 to-amber-300 bg-clip-text text-transparent"
// //           >
// //             The Luxury Showcase
// //           </motion.h2>

// //           <motion.p 
// //             initial={{ opacity: 0, y: 20 }}
// //             animate={{ opacity: 1, y: 0 }}
// //             transition={{ delay: 0.2 }}
// //             className="mt-3 max-w-lg mx-auto text-xs sm:text-sm text-slate-400 tracking-wide"
// //           >
// //             Exquisite craftsmanship meets modern interactive design. Hover to explore details in 3D space.
// //           </motion.p>
// //         </div>

// //         {/* Grid Setup: 2 items per row on mobile | 4 items per row on desktop */}
// //         <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
// //           {products.map((product, index) => (
// //             <Luxury3DCard key={product.id} product={product} index={index} />
// //           ))}
// //         </div>
// //       </div>
// //     </section>
// //   );
// // }

// // // 'use client';

// // // import React, { useState, useRef, useEffect } from 'react';
// // // import Image from 'next/image';
// // // import { motion, AnimatePresence } from 'framer-motion';
// // // import {
// // //   User,
// // //   Crown,
// // //   Gift,
// // //   Sparkles,
// // //   Heart,
// // //   CreditCard,
// // //   Settings,
// // //   Bell,
// // //   ShieldCheck,
// // //   LogOut,
// // //   ChevronDown,
// // //   ExternalLink,
// // // } from 'lucide-react';

// // // export default function LuxuryProfileDropdown() {
// // //   const [isOpen, setIsOpen] = useState(false);
// // //   const dropdownRef = useRef<HTMLDivElement>(null);

// // //   // Close dropdown when clicking outside
// // //   useEffect(() => {
// // //     const handleClickOutside = (event: MouseEvent) => {
// // //       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
// // //         setIsOpen(false);
// // //       }
// // //     };
// // //     document.addEventListener('mousedown', handleClickOutside);
// // //     return () => document.removeEventListener('mousedown', handleClickOutside);
// // //   }, []);

// // //   return (
// // //     <nav className="w-full bg-slate-950 border-b border-amber-500/10 py-4 px-6 flex justify-between items-center text-slate-100">
// // //       {/* Brand Logo Placeholder */}
// // //       <div className="flex items-center space-x-2">
// // //         <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-amber-400 to-rose-400 flex items-center justify-center text-slate-950 font-bold text-sm">
// // //           A
// // //         </div>
// // //         <span className="font-serif tracking-widest text-lg font-bold bg-gradient-to-r from-amber-200 via-rose-200 to-amber-300 bg-clip-text text-transparent uppercase">
// // //           AURELIA
// // //         </span>
// // //       </div>

// // //       {/* Profile Trigger Button */}
// // //       <div className="relative" ref={dropdownRef}>
// // //         <button
// // //           onClick={() => setIsOpen(!isOpen)}
// // //           className="group flex items-center space-x-3 p-1.5 pr-3 rounded-full bg-slate-900/90 border border-amber-500/20 hover:border-amber-400/50 transition-all duration-300 focus:outline-none shadow-lg hover:shadow-amber-500/10"
// // //         >
// // //           {/* Avatar with Metallic Ring */}
// // //           <div className="relative w-9 h-9 rounded-full p-[1.5px] bg-gradient-to-tr from-amber-400 via-rose-300 to-amber-500">
// // //             <div className="relative w-full h-full rounded-full overflow-hidden bg-slate-950">
// // //               <Image
// // //                 src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop"
// // //                 alt="VIP User"
// // //                 fill
// // //                 className="object-cover"
// // //               />
// // //             </div>
// // //             {/* Online Status Indicator */}
// // //             <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-amber-400 rounded-full ring-2 ring-slate-950 animate-pulse" />
// // //           </div>

// // //           {/* User Brief Info (Visible on Desktop) */}
// // //           <div className="hidden sm:flex flex-col text-left">
// // //             <span className="text-xs font-semibold text-slate-200 group-hover:text-amber-200 transition-colors">
// // //               Lady Eleanor
// // //             </span>
// // //             <span className="text-[10px] text-amber-400/90 font-medium tracking-wider uppercase flex items-center gap-1">
// // //               <Crown className="w-2.5 h-2.5 text-amber-400 inline" /> VIP Black Card
// // //             </span>
// // //           </div>

// // //           <ChevronDown
// // //             className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${
// // //               isOpen ? 'rotate-180 text-amber-300' : ''
// // //             }`}
// // //           />
// // //         </button>

// // //         {/* Floating Luxury Dropdown Menu */}
// // //         <AnimatePresence>
// // //           {isOpen && (
// // //             <motion.div
// // //               initial={{ opacity: 0, y: 12, scale: 0.96 }}
// // //               animate={{ opacity: 1, y: 0, scale: 1 }}
// // //               exit={{ opacity: 0, y: 8, scale: 0.96 }}
// // //               transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
// // //               className="absolute right-0 mt-3 w-80 rounded-2xl p-[1px] bg-gradient-to-b from-amber-300/30 via-slate-800/80 to-amber-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50"
// // //             >
// // //               <div className="bg-slate-950/95 backdrop-blur-2xl rounded-[15px] p-4 text-slate-200 divide-y divide-slate-800/80">
                
// // //                 {/* Header: VIP Card Banner */}
// // //                 <div className="pb-4">
// // //                   <div className="relative overflow-hidden rounded-xl p-3.5 bg-gradient-to-r from-amber-950/40 via-slate-900 to-purple-950/30 border border-amber-500/20">
// // //                     <div className="absolute top-0 right-0 -mr-4 -mt-4 w-20 h-20 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
                    
// // //                     <div className="flex items-center justify-between">
// // //                       <div className="flex items-center space-x-3">
// // //                         <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300">
// // //                           <Crown className="w-5 h-5" />
// // //                         </div>
// // //                         <div>
// // //                           <p className="text-xs font-bold tracking-wide text-slate-100">
// // //                             VIP Royal Tier
// // //                           </p>
// // //                           <p className="text-[10px] text-amber-400/80 tracking-wider uppercase">
// // //                             12,450 Tier Points
// // //                           </p>
// // //                         </div>
// // //                       </div>
// // //                       <span className="text-[10px] font-bold bg-gradient-to-r from-amber-400 to-rose-300 text-slate-950 px-2 py-0.5 rounded-full uppercase">
// // //                         Elite
// // //                       </span>
// // //                     </div>

// // //                     {/* Progress Bar */}
// // //                     <div className="mt-3">
// // //                       <div className="flex justify-between text-[10px] text-slate-400 mb-1">
// // //                         <span>Progress to Tier II</span>
// // //                         <span className="text-amber-300">82%</span>
// // //                       </div>
// // //                       <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
// // //                         <div className="bg-gradient-to-r from-amber-400 to-rose-400 h-full w-[82%] rounded-full" />
// // //                       </div>
// // //                     </div>
// // //                   </div>
// // //                 </div>

// // //                 {/* Main Navigation Links */}
// // //                 <div className="py-2 space-y-0.5">
// // //                   <DropdownItem
// // //                     icon={<User className="w-4 h-4" />}
// // //                     title="Personal Profile"
// // //                     subtitle="Account & Preferences"
// // //                   />
// // //                   <DropdownItem
// // //                     icon={<Gift className="w-4 h-4" />}
// // //                     title="Curated Gifts"
// // //                     badge="3 Active"
// // //                     highlight
// // //                   />
// // //                   <DropdownItem
// // //                     icon={<Heart className="w-4 h-4" />}
// // //                     title="Private Wishlist"
// // //                   />
// // //                   <DropdownItem
// // //                     icon={<CreditCard className="w-4 h-4" />}
// // //                     title="Concierge & Payment"
// // //                   />
// // //                 </div>

// // //                 {/* Settings & Preferences */}
// // //                 <div className="py-2 space-y-0.5">
// // //                   <DropdownItem
// // //                     icon={<Settings className="w-4 h-4" />}
// // //                     title="System Settings"
// // //                   />
// // //                   <DropdownItem
// // //                     icon={<Bell className="w-4 h-4" />}
// // //                     title="Notifications"
// // //                     badge="New"
// // //                   />
// // //                   <DropdownItem
// // //                     icon={<ShieldCheck className="w-4 h-4" />}
// // //                     title="Security & Privacy"
// // //                   />
// // //                 </div>

// // //                 {/* Footer / Logout */}
// // //                 <div className="pt-2">
// // //                   <button
// // //                     onClick={() => setIsOpen(false)}
// // //                     className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors group text-xs font-semibold"
// // //                   >
// // //                     <span className="flex items-center gap-2.5">
// // //                       <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
// // //                       Sign Out
// // //                     </span>
// // //                     <ExternalLink className="w-3 h-3 opacity-60" />
// // //                   </button>
// // //                 </div>

// // //               </div>
// // //             </motion.div>
// // //           )}
// // //         </AnimatePresence>
// // //       </div>
// // //     </nav>
// // //   );
// // // }

// // // // Reusable Menu Item Component
// // // function DropdownItem({
// // //   icon,
// // //   title,
// // //   subtitle,
// // //   badge,
// // //   highlight = false,
// // // }: {
// // //   icon: React.ReactNode;
// // //   title: string;
// // //   subtitle?: string;
// // //   badge?: string;
// // //   highlight?: boolean;
// // // }) {
// // //   return (
// // //     <a
// // //       href="#"
// // //       className="group flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-900/90 hover:border hover:border-amber-500/20 transition-all duration-200"
// // //     >
// // //       <div className="flex items-center space-x-3">
// // //         <div
// // //           className={`p-2 rounded-lg transition-colors ${
// // //             highlight
// // //               ? 'bg-amber-400/10 text-amber-300 border border-amber-500/30'
// // //               : 'bg-slate-900 text-slate-400 group-hover:text-amber-300 group-hover:bg-slate-800'
// // //           }`}
// // //         >
// // //           {icon}
// // //         </div>
// // //         <div className="flex flex-col">
// // //           <span className="text-xs font-medium text-slate-200 group-hover:text-amber-200 transition-colors">
// // //             {title}
// // //           </span>
// // //           {subtitle && (
// // //             <span className="text-[10px] text-slate-400">{subtitle}</span>
// // //           )}
// // //         </div>
// // //       </div>

// // //       {badge && (
// // //         <span
// // //           className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
// // //             highlight
// // //               ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
// // //               : 'bg-slate-800 text-slate-400'
// // //           }`}
// // //         >
// // //           {badge}
// // //         </span>
// // //       )}
// // //     </a>
// // //   );
// // // }



// // // import React from 'react';
// // // import Image from 'next/image';

// // // const products = [
// // //   {
// // //     id: 1,
// // //     name: 'Royal Velvet Gift Set',
// // //     category: 'Curated Boxes',
// // //     price: '$240',
// // //     image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop',
// // //     tag: 'Bestseller',
// // //   },
// // //   {
// // //     id: 2,
// // //     name: 'Midnight Rose Eau de Parfum',
// // //     category: 'Fragrance',
// // //     price: '$185',
// // //     image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800&auto=format&fit=crop',
// // //     tag: 'Limited Edition',
// // //   },
// // //   {
// // //     id: 3,
// // //     name: 'Artisan Crystal Decanter',
// // //     category: 'Home & Living',
// // //     price: '$310',
// // //     image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop',
// // //     tag: 'New Arrival',
// // //   },
// // //   {
// // //     id: 4,
// // //     name: 'Gold-Plated Signature Watch',
// // //     category: 'Timepieces',
// // //     price: '$450',
// // //     image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop',
// // //     tag: 'Exclusive',
// // //   },
// // // ];

// // // export default function GiftGrid() {
// // //   return (
// // //     <section className="bg-slate-950 py-16 px-4 sm:px-6 lg:px-8 min-h-screen text-slate-100">
// // //       <div className="max-w-7xl mx-auto">
// // //         {/* Section Header */}
// // //         <div className="text-center mb-12">
// // //           <span className="text-xs font-semibold tracking-widest text-amber-400 uppercase">
// // //             Curated Elegance
// // //           </span>
// // //           <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-amber-200 via-rose-200 to-purple-300 bg-clip-text text-transparent">
// // //             Premium Luxury Gifts
// // //           </h2>
// // //           <p className="mt-3 max-w-xl mx-auto text-sm sm:text-base text-slate-400">
// // //             Handcrafted luxury items wrapped in timeless sophistication.
// // //           </p>
// // //         </div>

// // //         {/* Product Grid: 2 columns on Mobile, 4 columns on PC */}
// // //         <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
// // //           {products.map((product) => (
// // //             <div
// // //               key={product.id}
// // //               className="group relative flex flex-col rounded-2xl p-[1px] bg-gradient-to-b from-slate-800 via-slate-800/50 to-amber-500/20 hover:from-amber-500/40 hover:via-purple-500/40 hover:to-rose-500/40 transition-all duration-500 shadow-xl hover:shadow-amber-500/10"
// // //             >
// // //               <div className="flex flex-col h-full w-full bg-slate-900/90 backdrop-blur-sm rounded-[15px] overflow-hidden">
// // //                 {/* Image Wrapper */}
// // //                 <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-800">
// // //                   <Image
// // //                     src={product.image}
// // //                     alt={product.name}
// // //                     fill
// // //                     sizes="(max-width: 1024px) 50vw, 25vw"
// // //                     className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
// // //                   />

// // //                   {/* Gradient Overlay */}
// // //                   <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />

// // //                   {/* Badge */}
// // //                   {product.tag && (
// // //                     <span className="absolute top-3 left-3 bg-slate-950/70 border border-amber-500/30 backdrop-blur-md text-amber-300 text-[10px] sm:text-xs font-medium px-2.5 py-1 rounded-full">
// // //                       {product.tag}
// // //                     </span>
// // //                   )}
// // //                 </div>

// // //                 {/* Product Info */}
// // //                 <div className="p-4 flex flex-col justify-between flex-grow">
// // //                   <div>
// // //                     <p className="text-[11px] sm:text-xs font-medium text-amber-400/80 uppercase tracking-wider">
// // //                       {product.category}
// // //                     </p>
// // //                     <h3 className="mt-1 text-sm sm:text-base font-semibold text-slate-100 line-clamp-1 group-hover:text-amber-200 transition-colors">
// // //                       {product.name}
// // //                     </h3>
// // //                   </div>

// // //                   <div className="mt-4 flex items-center justify-between">
// // //                     <span className="text-base sm:text-lg font-bold text-slate-100">
// // //                       {product.price}
// // //                     </span>

// // //                     {/* Gradient CTA Button */}
// // //                     <button
// // //                       type="button"
// // //                       className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs font-medium text-slate-950 bg-gradient-to-r from-amber-300 via-rose-300 to-amber-400 hover:brightness-110 transition-all shadow-md active:scale-95"
// // //                     >
// // //                       View Gift
// // //                     </button>
// // //                   </div>
// // //                 </div>
// // //               </div>
// // //             </div>
// // //           ))}
// // //         </div>
// // //       </div>
// // //     </section>
// // //   );
// // // }
