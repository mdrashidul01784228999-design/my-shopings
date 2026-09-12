






'use client';

import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from "framer-motion";
import { 
  Search, ShoppingBag, X, ShoppingCart, 
  Eye, SlidersHorizontal, ChevronRight, 
  Home, Grid, User, Heart, Trash2, Box
} from "lucide-react";
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Api from '../../../../api/Api';
import { useCartStore } from "../../../../api/Carssotres";

interface Product {
  id: number;
  name: string;
  model: string;
  pricee: number;
  reprice?: number;
  qty: number;
  img?: string;
  imglink?: string;
  rating?: number;
  type?: string;
}

export default function DigitalShopUnified() {
  // জোস্ট্যান্ড স্টোরকে টাইপ সেফ করতে as any কাস্টিং করা হলো (যদি গ্লোবাল টাইপ ডিক্লেয়ার করা না থাকে)
  const { cart, addToCart, removeFromCart, updateQty } = useCartStore() as any;
  
  const params = useParams();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const currentCategory = params?.catagori as string | undefined;
  const barnds = params?.brandname as string | undefined;
  const finalname = params?.finalcatagori as string | undefined;

  const [productscata, setProductcatagorss] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [query, setQuery] = useState<string>("");
  const [visibleCount, setVisibleCount] = useState<number>(8); 
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [bagOpen, setBagOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('grid');
  const [sortOrder, setSortOrder] = useState<'default' | 'low' | 'high'>('default');
  const priceRange = 5000000;

  const observerTarget = useRef<HTMLDivElement | null>(null);
  const cartIconRef = useRef<HTMLDivElement | null>(null);

  const handleNavigation = async () => {
    setIsLoading(true);
    router.push('/checkout/order');
  };

  // কার্ট ফ্লাই করার জন্য পার্টিকেল ইফেক্ট
  const createParticles = (x: number, y: number) => {
    for (let i = 0; i < 6; i++) {
      const particle = document.createElement("div");
      particle.className = "cart-particle";
      particle.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: 6px;
        height: 6px;
        background: #22d3ee;
        border-radius: 50%;
        pointer-events: none;
        z-index: 10000;
        box-shadow: 0 0 10px #22d3ee;
      `;
      document.body.appendChild(particle);
      
      const angle = Math.random() * Math.PI * 2;
      const velocity = 2 + Math.random() * 3;
      const vx = Math.cos(angle) * velocity;
      const vy = Math.sin(angle) * velocity;
      
      let opacity = 1;
      let particleX = x;
      let particleY = y;

      const animateParticle = () => {
        particleX += vx;
        particleY += vy;
        opacity -= 0.02;
        particle.style.transform = `translate(${particleX - x}px, ${particleY - y}px)`;
        particle.style.opacity = opacity.toString();

        if (opacity > 0) {
          requestAnimationFrame(animateParticle);
        } else {
          particle.remove();
        }
      };
      animateParticle();
    }
  };

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>, product: Product) => {
    const itemRect = e.currentTarget.getBoundingClientRect();
    const bagRect = cartIconRef.current?.getBoundingClientRect();
    
    createParticles(itemRect.left + itemRect.width/2, itemRect.top + itemRect.height/2);

    if (bagRect) {
      const fly = document.createElement("div");
      fly.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>';
      fly.style.cssText = `
        position: fixed;
        left: ${itemRect.left + itemRect.width/2 - 12}px;
        top: ${itemRect.top + itemRect.height/2 - 12}px;
        z-index: 9999;
        transition: all 0.8s cubic-bezier(0.19, 1, 0.22, 1);
        pointer-events: none;
        filter: drop-shadow(0 0 10px #22d3ee);
      `;
      document.body.appendChild(fly);

      requestAnimationFrame(() => {
        fly.style.transform = `translate(${bagRect.left - itemRect.left}px, ${bagRect.top - itemRect.top}px) scale(0.5) rotate(360deg)`;
        fly.style.opacity = "0";
      });
      setTimeout(() => fly.remove(), 800);
    }

    addToCart(product);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!currentCategory) return;
      setLoading(true);
      try {
        const res = await Api.get(`/get_all_product_brandName_final/${barnds}/${currentCategory}/${finalname}`);
        setProducts(Array.isArray(res.data.message) ? res.data.message : []);
      } catch (err) { 
        console.error(err); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchData();
  }, [finalname, barnds, currentCategory]);

  useEffect(() => {
    const fetchCats = async () => {
      if (!currentCategory) return;
      try {
        const res = await Api.get(`/get_all_product_brandName/${barnds}/${currentCategory}`);
        setProductcatagorss(Array.isArray(res.data.message) ? res.data.message : []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCats();
  }, [currentCategory, barnds]);

  const filteredItems = useMemo(() => {
    let items = products.filter(p => 
      Number(p.pricee) <= priceRange &&
      (p.name.toLowerCase().includes(query.toLowerCase()) || p.model?.toLowerCase().includes(query.toLowerCase()))
    );
    if (sortOrder === 'low') items.sort((a, b) => a.pricee - b.pricee);
    if (sortOrder === 'high') items.sort((a, b) => b.pricee - a.pricee);
    return items;
  }, [products, query, sortOrder]);

  const displayedItems = filteredItems.slice(0, visibleCount);

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    if (entries[0].isIntersecting && !loading) setVisibleCount(prev => prev + 4);
  }, [loading]);

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, { threshold: 0.1 });
    const currentTarget = observerTarget.current;
    if (currentTarget) observer.observe(currentTarget);
    return () => {
      if (currentTarget) observer.unobserve(currentTarget);
    };
  }, [handleObserver]);

  // 3D Card tilt effect logic
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (centerY - y) / 10;
    const rotateY = (x - centerX) / 10;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    
    const glossy = card.querySelector('.glossy-overlay') as HTMLElement;
    if (glossy) {
      glossy.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)`;
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    const glossy = card.querySelector('.glossy-overlay') as HTMLElement;
    if (glossy) {
      glossy.style.background = 'none';
    }
  };

  return (
    <div className="min-h-screen bg-[#02040a] text-slate-200 font-sans pb-24 selection:bg-cyan-500 overflow-x-hidden relative">
      <div className="fixed inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#0a1120 1px, transparent 1px), linear-gradient(90deg, #0a1120 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
      
      {/* --- PREMIER NAVBAR --- */}
      <nav className="fixed top-0 left-0 right-0 z-[100] backdrop-blur-2xl bg-[#030612]/80 border-b border-cyan-900/30 h-20 shadow-[0_5px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-[1500px] mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-3 bg-white/5 hover:bg-cyan-900/30 rounded-2xl border border-white/10 transition-all group">
              <SlidersHorizontal className="w-5 h-5 text-cyan-600 group-hover:text-cyan-400" />
            </button>
            <Link href="/" className="flex flex-col group">
              <span className="text-3xl font-extrabold tracking-tighter bg-gradient-to-r from-white via-cyan-300 to-cyan-500 bg-clip-text text-transparent italic group-hover:via-white transition-all duration-300">
                DIGI<span className="font-light text-white">MART</span>
              </span>
              <span className="text-[10px] font-bold text-cyan-700 tracking-[0.4em] uppercase -mt-1 group-hover:text-cyan-500">Premium Digital Commerce</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div ref={cartIconRef} onClick={() => setBagOpen(true)} className="group relative p-4 cursor-pointer bg-slate-900 rounded-2xl border border-white/10 hover:border-cyan-700 transition-all shadow-[0_0_15px_rgba(0,0,0,0.3)]">
              <ShoppingBag className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-cyan-500 to-cyan-400 text-black text-[10px] w-6 h-6 rounded-full flex items-center justify-center font-black animate-pulse shadow-[0_0_10px_#22d3ee]">
                  {cart.length}
                </span>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-28 max-w-[1500px] mx-auto px-4 md:px-10">
        
        {/* --- DYNAMIC FILTER BAR --- */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-[#070b18] backdrop-blur-xl p-4 rounded-3xl border border-white/5 mb-12 gap-5 shadow-[inset_0_0_20px_rgba(34,211,238,0.05)]">
          <div className="flex gap-2 p-1 bg-black/30 rounded-full border border-white/5">
            <button onClick={() => setSortOrder('low')} className={`px-8 py-3 rounded-full text-[11px] font-black transition-all duration-300 ${sortOrder === 'low' ? 'bg-cyan-500 text-black shadow-[0_0_20px_#22d3ee]' : 'text-slate-400 hover:text-white'}`}>PRICE LOW</button>
            <button onClick={() => setSortOrder('high')} className={`px-8 py-3 rounded-full text-[11px] font-black transition-all duration-300 ${sortOrder === 'high' ? 'bg-cyan-500 text-black shadow-[0_0_20px_#22d3ee]' : 'text-slate-400 hover:text-white'}`}>PRICE HIGH</button>
          </div>
          <div className="relative w-full md:w-96 group">
             <Search size={18} className="absolute left-5 top-3.5 text-slate-600 group-focus-within:text-cyan-400 transition-colors" />
             <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search digital goods, assets, electronics..." className="w-full bg-[#030612] border border-white/10 rounded-full py-3.5 pl-14 pr-6 text-sm focus:outline-none focus:border-cyan-700 transition-all focus:ring-2 ring-cyan-900/30" />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* --- SIDEBAR --- */}
          <aside className={`fixed inset-y-0 left-0 z-[110] lg:relative lg:block w-80 bg-[#02040a] lg:bg-transparent transition-transform duration-500 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} p-8 lg:p-0 border-r border-white/5 lg:border-none`}>
            <div className="flex items-center justify-between lg:hidden mb-12">
              <span className="font-extrabold text-2xl text-white">BRANDS</span>
              <X onClick={() => setIsSidebarOpen(false)} className="w-9 h-9 text-slate-500 p-2 bg-white/5 rounded-xl cursor-pointer hover:bg-cyan-900/30 hover:text-white" />
            </div>
            <div className="sticky top-32 space-y-3.5">
              <h2 className="hidden lg:block text-xs font-bold text-cyan-600 uppercase tracking-[0.3em] pl-4 mb-5">Filter by Brand</h2>
              {productscata.map((cat, idx) => (
                <button key={idx} onClick={() => router.push(`/products/${currentCategory}/${cat.catagori}/${cat.brand}`)}
                  className="w-full flex items-center justify-between px-6 py-5 rounded-2xl bg-[#050813] border border-transparent hover:border-cyan-800/50 hover:bg-[#070b18] transition-all group overflow-hidden relative shadow-sm">
                  <span className="text-sm font-bold uppercase text-slate-300 group-hover:text-white z-10">{cat.brand}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-950/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <ChevronRight size={18} className="text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-1.5 transition-all z-10" />
                </button>
              ))}
            </div>
          </aside>

          {/* --- PRODUCT GRID --- */}
          <main className="flex-1">
            <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
              {displayedItems.map((product) => (
                <motion.div 
                  key={product.id}
                  layout
                  className="product-card group relative bg-[#050813] rounded-[2rem] border border-white/5 p-4 transition-all duration-300 ease-out shadow-xl hover:shadow-cyan-950/20 [transform-style:preserve-3d]"
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  whileHover={{ y: -5 }}
                >
                  <div className="glossy-overlay absolute inset-0 rounded-[2rem] pointer-events-none z-10 transition-background duration-150"></div>

                  <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-black flex items-center justify-center p-2 mb-5 [transform:translateZ(20px)] border border-white/5 group-hover:border-cyan-900/50 transition-colors">
                    <img 
                      src={product.img ? `${process.env.NEXT_PUBLIC_IMAGE_URL}/uploads_product/${product.img}` : product.imglink || "/fallback.png"} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 z-0 rounded-2xl" 
                      alt={product.name} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/60 z-0"></div>
                    <div className="absolute inset-0 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-full h-[2px] bg-cyan-400 shadow-[0_0_20px_5px_#22d3ee] absolute top-0 animate-scanLine" />
                    </div>
                  </div>

                  <div className="space-y-3 px-1 [transform:translateZ(10px)]">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-lg font-bold text-slate-100 truncate group-hover:text-cyan-300 transition-colors">{product.name}</h3>
                      <Box size={16} className="text-slate-700 mt-1 flex-shrink-0 group-hover:text-cyan-600 transition-colors" />
                    </div>
                    
                    <div className="flex justify-between items-center bg-black/40 p-2 rounded-xl border border-white/5">
                      <p className="text-[10px] font-bold text-cyan-600 uppercase tracking-[0.2em]">
                        {product.model || "DIGITAL ASSET"}
                      </p>
                      <p className="text-2xl font-black text-white tracking-tighter shadow-text-cyan">
                        ৳{Number(product.pricee).toLocaleString()}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-5 pt-2 opacity-100 translate-y-0 transition-all duration-300">
                      <Link href={`/products-view/${product.id}/${product.model}`} className="flex py-3.5 bg-slate-900 border border-white/10 text-white rounded-xl text-[11px] font-black items-center justify-center gap-2 hover:bg-white/5 transition hover:border-white/20">
                        <Eye size={16} className="text-cyan-400"/> DETAILS
                      </Link>
                      <button onClick={(e) => handleAddToCart(e, product)} className="flex py-3.5 bg-gradient-to-r from-cyan-600 to-cyan-400 text-black rounded-xl text-[11px] font-black items-center justify-center gap-2 hover:from-cyan-400 hover:to-cyan-300 transition shadow-[0_0_15px_rgba(34,211,238,0.2)] hover:shadow-cyan-400/30">
                        <ShoppingCart size={16} /> ADD TO BAG
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div ref={observerTarget} className="h-40 w-full flex items-center justify-center">
              {displayedItems.length < filteredItems.length && (
                <div className="loading-spinner w-12 h-12 border-[3px] border-cyan-900 border-t-cyan-400 rounded-full animate-spin shadow-[0_0_15px_rgba(34,211,238,0.3)]"></div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* --- MOBILE NAVIGATION --- */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md h-18 bg-[#050813]/90 backdrop-blur-3xl border border-white/10 md:hidden flex items-center justify-around z-[100] px-4 rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        {[{ id: 'home', icon: Home }, { id: 'grid', icon: Grid }, { id: 'fav', icon: Heart }, { id: 'user', icon: User }].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`relative p-4 rounded-2xl transition-all duration-300 ${activeTab === tab.id ? 'text-cyan-400 -translate-y-2' : 'text-slate-500 hover:text-slate-200'}`}>
            <tab.icon size={22} />
            {activeTab === tab.id && (
              <motion.div layoutId="activeNavIndicator" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee]" />
            )}
          </button>
        ))}
      </div>

      {/* --- CART DRAWER --- */}
      <AnimatePresence>
        {bagOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setBagOpen(false)} className="fixed inset-0 bg-black/80 z-[120] backdrop-blur-md" />
            <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.4 }} className="fixed right-0 top-0 h-full w-full max-w-md bg-[#02040a] z-[130] p-8 border-l border-cyan-900/40 shadow-2xl flex flex-col">
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h3 className="text-3xl font-extrabold text-white tracking-tighter">YOUR BAG</h3>
                  <p className="text-xs text-cyan-600 font-bold uppercase tracking-[0.2em] -mt-1">Review your digital selection</p>
                </div>
                <X onClick={() => setBagOpen(false)} className="cursor-pointer text-slate-500 hover:text-white transition-colors p-2 bg-white/5 rounded-xl" size={20} />
              </div>

              <div className="flex-1 overflow-y-auto space-y-5 no-scrollbar">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4">
                    <ShoppingBag size={60} className="opacity-10" strokeWidth={1} />
                    <p className="font-bold text-sm">Your bag is currenty empty.</p>
                  </div>
                ) : (
                  cart.map((item: any) => (
                    <div key={item.id} className="flex gap-4 bg-[#050813] p-4 rounded-2xl border border-white/5 group hover:border-cyan-900/30 transition-colors shadow-lg">
                      <div className="w-20 h-20 bg-black rounded-xl overflow-hidden p-1.5 border border-white/5">
                        <img src={item.img ? `${process.env.NEXT_PUBLIC_IMAGE_URL}/uploads_product/${item.img}` : item.imglink} className="w-full h-full object-cover rounded-lg" alt="" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <h4 className="text-white text-sm font-bold uppercase truncate">{item.name}</h4>
                          <p className="text-cyan-400 font-black text-xl tracking-tighter">৳{item.pricee.toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-5 mt-2">
                          <div className="flex items-center bg-black/50 rounded-full px-2 py-0.5 border border-white/5">
                            <button onClick={() => updateQty(item.id, item.qty - 1)} className="text-slate-400 hover:text-cyan-400 px-2.5 font-bold">-</button>
                            <span className="text-xs font-black text-white w-4 text-center">{item.qty}</span>
                            <button onClick={() => updateQty(item.id, item.qty + 1)} className="text-slate-400 hover:text-cyan-400 px-2.5 font-bold">+</button>
                          </div>
                          <Trash2 onClick={() => removeFromCart(item.id)} size={18} className="ml-auto text-pink-700 hover:text-pink-500 cursor-pointer transition-colors" />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-8 border-t border-cyan-950 mt-8 space-y-6 bg-[#02040a]">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Amount</span>
                  <span className="text-4xl font-black text-white tracking-tighter shadow-text-cyan">
                    ৳{cart.reduce((acc: number, i: any) => acc + (Number(i.pricee) * Number(i.qty)), 0).toLocaleString()}
                  </span>
                </div>
                <button 
                  onClick={handleNavigation} 
                  disabled={isLoading}
                  className="w-full py-5 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 font-bold text-lg shadow-xl shadow-pink-500/20 mb-4 text-white"
                >
                  {isLoading ? "Waiting..." : "Complete Order 🚀"}
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes scanLine { 0% { top: 0%; } 100% { top: 100%; } }
        .animate-scanLine { animation: scanLine 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .shadow-text-cyan { text-shadow: 0 0 15px rgba(34,211,238,0.6); }
        .product-card { transition: transform 0.1s ease-out, box-shadow 0.3s ease; will-change: transform; }
        @keyframes glow { 0%, 100% { box-shadow: 0 0 5px rgba(34,211,238,0.2); } 50% { box-shadow: 0 0 20px rgba(34,211,238,0.5); } }
        .loading-spinner { animation: glow 1.5s infinite, spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}



// 'use client';

// import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
// import { AnimatePresence, motion } from "framer-motion";
// import { 
//   Search, ShoppingBag, X, ShoppingCart, 
//   Eye, SlidersHorizontal, ChevronRight, 
//   Home, Grid, User, Heart, Trash2, Box
// } from "lucide-react";
// import { useParams, useRouter } from 'next/navigation';
// import Link from 'next/link';
// import Api from '../../../../api/Api';
// import { useCartStore } from "../../../../api/Carssotres";

// interface Product {
//   id: number;
//   name: string;
//   model: string;
//   pricee: number;
//   reprice?: number;
//   qty: number;
//   img?: string;
//   imglink?: string;
//   rating?: number;
//   type?: string;
// }

// export default function DigitalShopUnified() {
//   const { cart, addToCart, removeFromCart, updateQty } = useCartStore();
  
//   const params = useParams();
//   const router = useRouter();

  
//     const [isLoading, setIsLoading] = useState(false);

  

//   const currentCategory = params?.catagori as string | undefined;
//   const barnds = params?.brandname as string | undefined;
//   const finalname = params?.finalcatagori as string | undefined;

//   const [productscata, setProductcatagorss] = useState<any[]>([]);
//   const [products, setProducts] = useState<Product[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [query, setQuery] = useState("");
//   const [visibleCount, setVisibleCount] = useState(8); 
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const [bagOpen, setBagOpen] = useState(false);
//   const [activeTab, setActiveTab] = useState('grid');
//   const [sortOrder, setSortOrder] = useState<'default' | 'low' | 'high'>('default');
//   const priceRange = 5000000;

//   const observerTarget = useRef<HTMLDivElement>(null);
//   const cartIconRef = useRef<HTMLDivElement>(null);










// const handleNavigation = async () => {
//     setIsLoading(true); // Start loading effect
    
//     // Optional: Add a small delay if you want the user to actually see the "Waiting..." state
//     // await new Promise((resolve) => setTimeout(resolve, 1000));

//     router.push('/checkout/order'); // Redirect to your desired page (e.g., Home)
//   };




//   // Function to create particle effect for cart fly
//   const createParticles = (x: number, y: number) => {
//     for (let i = 0; i < 6; i++) {
//       const particle = document.createElement("div");
//       particle.className = "cart-particle";
//       particle.style.cssText = `
//         position: fixed;
//         left: ${x}px;
//         top: ${y}px;
//         width: 6px;
//         height: 6px;
//         background: #22d3ee;
//         border-radius: 50%;
//         pointer-events: none;
//         z-index: 10000;
//         box-shadow: 0 0 10px #22d3ee;
//       `;
//       document.body.appendChild(particle);
      
//       const angle = Math.random() * Math.PI * 2;
//       const velocity = 2 + Math.random() * 3;
//       const vx = Math.cos(angle) * velocity;
//       const vy = Math.sin(angle) * velocity;
      
//       let opacity = 1;
//       let particleX = x;
//       let particleY = y;

//       const animateParticle = () => {
//         particleX += vx;
//         particleY += vy;
//         opacity -= 0.02;
//         particle.style.transform = `translate(${particleX - x}px, ${particleY - y}px)`;
//         particle.style.opacity = opacity.toString();

//         if (opacity > 0) {
//           requestAnimationFrame(animateParticle);
//         } else {
//           particle.remove();
//         }
//       };
//       animateParticle();
//     }
//   };

//   const handleAddToCart = (e: React.MouseEvent, product: Product) => {
//     const itemRect = e.currentTarget.getBoundingClientRect();
//     const bagRect = cartIconRef.current?.getBoundingClientRect();
    
//     createParticles(itemRect.left + itemRect.width/2, itemRect.top + itemRect.height/2);

//     if (bagRect) {
//       const fly = document.createElement("div");
//       fly.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>';
//       fly.style.cssText = `
//         position: fixed;
//         left: ${itemRect.left + itemRect.width/2 - 12}px;
//         top: ${itemRect.top + itemRect.height/2 - 12}px;
//         z-index: 9999;
//         transition: all 0.8s cubic-bezier(0.19, 1, 0.22, 1);
//         pointer-events: none;
//         filter: drop-shadow(0 0 10px #22d3ee);
//       `;
//       document.body.appendChild(fly);

//       requestAnimationFrame(() => {
//         fly.style.transform = `translate(${bagRect.left - itemRect.left}px, ${bagRect.top - itemRect.top}px) scale(0.5) rotate(360deg)`;
//         fly.style.opacity = "0";
//       });
//       setTimeout(() => fly.remove(), 800);
//     }



//     addToCart(product);




//   };



  


//   useEffect(() => {
//     const fetchData = async () => {
//       if (!currentCategory) return;
//       setLoading(true);
//       try {
//         const res = await Api.get(`/get_all_product_brandName_final/${barnds}/${currentCategory}/${finalname}`);
//         setProducts(Array.isArray(res.data.message) ? res.data.message : []);
//       } catch (err) { console.error(err); } finally { setLoading(false); }
//     };
//     fetchData();
//   }, [finalname, barnds, currentCategory]);

//   useEffect(() => {
//     const fetchCats = async () => {
//       if (!currentCategory) return;
//       try {
//         const res = await Api.get(`/get_all_product_brandName/${barnds}/${currentCategory}`);
//         setProductcatagorss(Array.isArray(res.data.message) ? res.data.message : []);
//       } catch (err) {}
//     };
//     fetchCats();
//   }, [currentCategory, barnds]);

//   const filteredItems = useMemo(() => {
//     let items = products.filter(p => 
//       Number(p.pricee) <= priceRange &&
//       (p.name.toLowerCase().includes(query.toLowerCase()) || p.model?.toLowerCase().includes(query.toLowerCase()))
//     );
//     if (sortOrder === 'low') items.sort((a, b) => a.pricee - b.pricee);
//     if (sortOrder === 'high') items.sort((a, b) => b.pricee - a.pricee);
//     return items;
//   }, [products, query, sortOrder]);

//   const displayedItems = filteredItems.slice(0, visibleCount);

//   const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
//     if (entries[0].isIntersecting && !loading) setVisibleCount(prev => prev + 4);
//   }, [loading]);

//   useEffect(() => {
//     const observer = new IntersectionObserver(handleObserver, { threshold: 0.1 });
//     if (observerTarget.current) observer.observe(observerTarget.current);
//     return () => observer.disconnect();
//   }, [handleObserver]);

//   // 3D Card tilt effect logic
//   const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, id: number) => {
//     const card = e.currentTarget;
//     const rect = card.getBoundingClientRect();
//     const x = e.clientX - rect.left;
//     const y = e.clientY - rect.top;
//     const centerX = rect.width / 2;
//     const centerY = rect.height / 2;
//     const rotateX = (centerY - y) / 10;
//     const rotateY = (x - centerX) / 10;
//     card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    
//     // Glossy overlay position
//     const glossy = card.querySelector('.glossy-overlay') as HTMLElement;
//     if (glossy) {
//       glossy.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)`;
//     }
//   };

//   const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
//     const card = e.currentTarget;
//     card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
//     const glossy = card.querySelector('.glossy-overlay') as HTMLElement;
//     if (glossy) {
//       glossy.style.background = 'none';
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#02040a] text-slate-200 font-sans pb-24 selection:bg-cyan-500 overflow-x-hidden relative">
//       {/* Background digital grid effect */}
//       <div className="fixed inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#0a1120 1px, transparent 1px), linear-gradient(90deg, #0a1120 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
      
//       {/* --- PREMIER NAVBAR --- */}
//       <nav className="fixed top-0 left-0 right-0 z-[100] backdrop-blur-2xl bg-[#030612]/80 border-b border-cyan-900/30 h-20 shadow-[0_5px_30px_rgba(0,0,0,0.5)]">
//         <div className="max-w-[1500px] mx-auto px-6 h-full flex items-center justify-between">
//           <div className="flex items-center gap-6">
//             <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-3 bg-white/5 hover:bg-cyan-900/30 rounded-2xl border border-white/10 transition-all group">
//               <SlidersHorizontal className="w-5 h-5 text-cyan-600 group-hover:text-cyan-400" />
//             </button>
//             <Link href="/" className="flex flex-col group">
//               <span className="text-3xl font-extrabold tracking-tighter bg-gradient-to-r from-white via-cyan-300 to-cyan-500 bg-clip-text text-transparent italic group-hover:via-white transition-all duration-300">
//                 DIGI<span className="font-light text-white">MART</span>
//               </span>
//               <span className="text-[10px] font-bold text-cyan-700 tracking-[0.4em] uppercase -mt-1 group-hover:text-cyan-500">Premium Digital Commerce</span>
//             </Link>
//           </div>

//           <div className="flex items-center gap-4">
//             <div ref={cartIconRef} onClick={() => setBagOpen(true)} className="group relative p-4 cursor-pointer bg-slate-900 rounded-2xl border border-white/10 hover:border-cyan-700 transition-all shadow-[0_0_15px_rgba(0,0,0,0.3)]">
//               <ShoppingBag className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
//               {cart.length > 0 && (
//                 <span className="absolute -top-2 -right-2 bg-gradient-to-r from-cyan-500 to-cyan-400 text-black text-[10px] w-6 h-6 rounded-full flex items-center justify-center font-black animate-pulse shadow-[0_0_10px_#22d3ee]">
//                   {cart.length}
//                 </span>
//               )}
//             </div>
//           </div>
//         </div>
//       </nav>

//       <div className="pt-28 max-w-[1500px] mx-auto px-4 md:px-10">
        
//         {/* --- DYNAMIC FILTER BAR --- */}
//         <div className="flex flex-col md:flex-row justify-between items-center bg-[#070b18] backdrop-blur-xl p-4 rounded-3xl border border-white/5 mb-12 gap-5 shadow-[inset_0_0_20px_rgba(34,211,238,0.05)]">
//           <div className="flex gap-2 p-1 bg-black/30 rounded-full border border-white/5">
//             <button onClick={() => setSortOrder('low')} className={`px-8 py-3 rounded-full text-[11px] font-black transition-all duration-300 ${sortOrder === 'low' ? 'bg-cyan-500 text-black shadow-[0_0_20px_#22d3ee]' : 'text-slate-400 hover:text-white'}`}>PRICE LOW</button>
//             <button onClick={() => setSortOrder('high')} className={`px-8 py-3 rounded-full text-[11px] font-black transition-all duration-300 ${sortOrder === 'high' ? 'bg-cyan-500 text-black shadow-[0_0_20px_#22d3ee]' : 'text-slate-400 hover:text-white'}`}>PRICE HIGH</button>
//           </div>
//           <div className="relative w-full md:w-96 group">
//              <Search size={18} className="absolute left-5 top-3.5 text-slate-600 group-focus-within:text-cyan-400 transition-colors" />
//              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search digital goods, assets, electronics..." className="w-full bg-[#030612] border border-white/10 rounded-full py-3.5 pl-14 pr-6 text-sm focus:outline-none focus:border-cyan-700 transition-all focus:ring-2 ring-cyan-900/30" />
//           </div>
//         </div>

//         <div className="flex flex-col lg:flex-row gap-12">
//           {/* --- SIDEBAR --- */}
//           <aside className={`fixed inset-y-0 left-0 z-[110] lg:relative lg:block w-80 bg-[#02040a] lg:bg-transparent transition-transform duration-500 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} p-8 lg:p-0 border-r border-white/5 lg:border-none`}>
//             <div className="flex items-center justify-between lg:hidden mb-12">
//               <span className="font-extrabold text-2xl text-white">BRANDS</span>
//               <X onClick={() => setIsSidebarOpen(false)} className="w-9 h-9 text-slate-500 p-2 bg-white/5 rounded-xl cursor-pointer hover:bg-cyan-900/30 hover:text-white" />
//             </div>
//             <div className="sticky top-32 space-y-3.5">
//               <h2 className="hidden lg:block text-xs font-bold text-cyan-600 uppercase tracking-[0.3em] pl-4 mb-5">Filter by Brand</h2>
//               {productscata.map((cat, idx) => (
//                 <button key={idx} onClick={() => router.push(`/products/${currentCategory}/${cat.catagori}/${cat.brand}`)}
//                   className="w-full flex items-center justify-between px-6 py-5 rounded-2xl bg-[#050813] border border-transparent hover:border-cyan-800/50 hover:bg-[#070b18] transition-all group overflow-hidden relative shadow-sm">
//                   <span className="text-sm font-bold uppercase text-slate-300 group-hover:text-white z-10">{cat.brand}</span>
//                   <div className="absolute inset-0 bg-gradient-to-r from-cyan-950/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
//                   <ChevronRight size={18} className="text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-1.5 transition-all z-10" />
//                 </button>
//               ))}
//             </div>
//           </aside>

//           {/* --- PRODUCT GRID --- */}
//           <main className="flex-1">
//             <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
//               {displayedItems.map((product) => (
//                 <motion.div 
//                   key={product.id}
//                   layout
//                   className="product-card group relative bg-[#050813] rounded-[2rem] border border-white/5 p-4 transition-all duration-300 ease-out shadow-xl hover:shadow-cyan-950/20 [transform-style:preserve-3d]"
//                   onMouseMove={(e) => handleMouseMove(e, product.id)}
//                   onMouseLeave={handleMouseLeave}
//                   whileHover={{ y: -5 }}
//                 >
//                   {/* Glossy Overlay for 3D effect */}
//                   <div className="glossy-overlay absolute inset-0 rounded-[2rem] pointer-events-none z-10 transition-background duration-150"></div>

//                   {/* 3D Visual Container - FULL Image */}
//                   <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-black flex items-center justify-center p-2 mb-5 [transform:translateZ(20px)] border border-white/5 group-hover:border-cyan-900/50 transition-colors">
//                     <img 
//                       src={product.img ? `${process.env.NEXT_PUBLIC_IMAGE_URL}/uploads_product/${product.img}` : product.imglink || "/fallback.png"} 
//                       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 z-0 rounded-2xl" 
//                       alt={product.name} 
//                     />
                    
//                     {/* Radial gradient background accent */}
//                     <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/60 z-0"></div>
                    
//                     {/* Laser Scanner - Cyberpunk effect */}
//                     <div className="absolute inset-0 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//                       <div className="w-full h-[2px] bg-cyan-400 shadow-[0_0_20px_5px_#22d3ee] absolute top-0 animate-scanLine" />
//                     </div>
//                   </div>

//                   <div className="space-y-3 px-1 [transform:translateZ(10px)]">
//                     <div className="flex justify-between items-start gap-2">
//                       <h3 className="text-lg font-bold text-slate-100 truncate group-hover:text-cyan-300 transition-colors">{product.name}</h3>
//                       <Box size={16} className="text-slate-700 mt-1 flex-shrink-0 group-hover:text-cyan-600 transition-colors" />
//                     </div>
                    
//                     <div className="flex justify-between items-center bg-black/40 p-2 rounded-xl border border-white/5">
//                       <p className="text-[10px] font-bold text-cyan-600 uppercase tracking-[0.2em]">
//                         {product.model || "DIGITAL ASSET"}
//                       </p>
//                       <p className="text-2xl font-black text-white tracking-tighter shadow-text-cyan">
//                         ৳{Number(product.pricee).toLocaleString()}
//                       </p>
//                     </div>

//                     <div className="grid grid-cols-2 gap-3 mt-5 pt-2 opacity-100 translate-y-0 transition-all duration-300">
//                       <Link href={`/products-view/${product.id}/${product.model}`} className="flex py-3.5 bg-slate-900 border border-white/10 text-white rounded-xl text-[11px] font-black items-center justify-center gap-2 hover:bg-white/5 transition hover:border-white/20">
//                         <Eye size={16} className="text-cyan-400"/> DETAILS
//                       </Link>
//                       <button onClick={(e) => handleAddToCart(e, product)} className="flex py-3.5 bg-gradient-to-r from-cyan-600 to-cyan-400 text-black rounded-xl text-[11px] font-black items-center justify-center gap-2 hover:from-cyan-400 hover:to-cyan-300 transition shadow-[0_0_15px_rgba(34,211,238,0.2)] hover:shadow-cyan-400/30">
//                         <ShoppingCart size={16} /> ADD TO BAG
//                       </button>
//                     </div>
//                   </div>
//                 </motion.div>
//               ))}
//             </div>
            
//             {/* Infinite Scroll Trigger */}
//             <div ref={observerTarget} className="h-40 w-full flex items-center justify-center">
//               {displayedItems.length < filteredItems.length && (
//                 <div className="loading-spinner w-12 h-12 border-[3px] border-cyan-900 border-t-cyan-400 rounded-full animate-spin shadow-[0_0_15px_rgba(34,211,238,0.3)]"></div>
//               )}
//             </div>
//           </main>
//         </div>
//       </div>

//       {/* --- MOBILE NAVIGATION --- */}
//       <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md h-18 bg-[#050813]/90 backdrop-blur-3xl border border-white/10 md:hidden flex items-center justify-around z-[100] px-4 rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
//         {[{ id: 'home', icon: Home }, { id: 'grid', icon: Grid }, { id: 'fav', icon: Heart }, { id: 'user', icon: User }].map((tab) => (
//           <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`relative p-4 rounded-2xl transition-all duration-300 ${activeTab === tab.id ? 'text-cyan-400 -translate-y-2' : 'text-slate-500 hover:text-slate-200'}`}>
//             <tab.icon size={22} />
//             {activeTab === tab.id && (
//               <motion.div layoutId="activeNavIndicator" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee]" />
//             )}
//           </button>
//         ))}
//       </div>

//       {/* --- CART DRAWER --- */}
//       <AnimatePresence>
//         {bagOpen && (
//           <>
//             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setBagOpen(false)} className="fixed inset-0 bg-black/80 z-[120] backdrop-blur-md" />
//             <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.4 }} className="fixed right-0 top-0 h-full w-full max-w-md bg-[#02040a] z-[130] p-8 border-l border-cyan-900/40 shadow-2xl flex flex-col">
//               <div className="flex items-center justify-between mb-12">
//                 <div>
//                   <h3 className="text-3xl font-extrabold text-white tracking-tighter">YOUR BAG</h3>
//                   <p className="text-xs text-cyan-600 font-bold uppercase tracking-[0.2em] -mt-1">Review your digital selection</p>
//                 </div>
//                 <X onClick={() => setBagOpen(false)} className="cursor-pointer text-slate-500 hover:text-white transition-colors p-2 bg-white/5 rounded-xl" size={20} />
//               </div>

//               <div className="flex-1 overflow-y-auto space-y-5 no-scrollbar">
//                 {cart.length === 0 ? (
//                   <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4">
//                     <ShoppingBag size={60} className="opacity-10" strokeWidth={1} />
//                     <p className="font-bold text-sm">Your bag is currenty empty.</p>
//                   </div>
//                 ) : (
//                   cart.map((item) => (
//                     <div key={item.id} className="flex gap-4 bg-[#050813] p-4 rounded-2xl border border-white/5 group hover:border-cyan-900/30 transition-colors shadow-lg">
//                       <div className="w-20 h-20 bg-black rounded-xl overflow-hidden p-1.5 border border-white/5">
//                         <img src={item.img ? `${process.env.NEXT_PUBLIC_IMAGE_URL}/uploads_product/${item.img}` : item.imglink} className="w-full h-full object-cover rounded-lg" alt="" />
//                       </div>
//                       <div className="flex-1 flex flex-col justify-between py-1">
//                         <div>
//                           <h4 className="text-white text-sm font-bold uppercase truncate">{item.name}</h4>
//                           <p className="text-cyan-400 font-black text-xl tracking-tighter">৳{item.pricee.toLocaleString()}</p>
//                         </div>
//                         <div className="flex items-center gap-5 mt-2">
//                           <div className="flex items-center bg-black/50 rounded-full px-2 py-0.5 border border-white/5">
//                             <button onClick={() => updateQty(item.id, item.qty - 1)} className="text-slate-400 hover:text-cyan-400 px-2.5 font-bold">-</button>
//                             <span className="text-xs font-black text-white w-4 text-center">{item.qty}</span>
//                             <button onClick={() => updateQty(item.id, item.qty + 1)} className="text-slate-400 hover:text-cyan-400 px-2.5 font-bold">+</button>
//                           </div>
//                           <Trash2 onClick={() => removeFromCart(item.id)} size={18} className="ml-auto text-pink-700 hover:text-pink-500 cursor-pointer transition-colors" />
//                         </div>
//                       </div>
//                     </div>
//                   ))
//                 )}
//               </div>

//               <div className="pt-8 border-t border-cyan-950 mt-8 space-y-6 bg-[#02040a]">
//                 <div className="flex justify-between items-end">
//                   <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Amount</span>
//                   <span className="text-4xl font-black text-white tracking-tighter shadow-text-cyan">
//                     ৳{cart.reduce((acc, i) => acc + (i.pricee * i.qty), 0).toLocaleString()}
//                   </span>
//                 </div>
//                                <button 
//       onClick={handleNavigation} 
//       disabled={isLoading}
//  className="w-full py-5 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 font-bold text-lg shadow-xl shadow-pink-500/20 mb-4">
    
//       {isLoading ? "Waiting..." : "Complete Order 🚀"}
//     </button>
//               </div>
//             </motion.aside>
//           </>
//         )}
//       </AnimatePresence>

//       <style jsx global>{`
//         @keyframes scanLine { 0% { top: 0%; } 100% { top: 100%; } }
//         .animate-scanLine { animation: scanLine 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
//         .no-scrollbar::-webkit-scrollbar { display: none; }
//         .shadow-text-cyan { text-shadow: 0 0 15px rgba(34,211,238,0.6); }
//         .product-card { transition: transform 0.1s ease-out, box-shadow 0.3s ease; will-change: transform; }
//         @keyframes glow { 0%, 100% { box-shadow: 0 0 5px rgba(34,211,238,0.2); } 50% { box-shadow: 0 0 20px rgba(34,211,238,0.5); } }
//         .loading-spinner { animation: glow 1.5s infinite, spin 1s linear infinite; }
//         @keyframes spin { 100% { transform: rotate(360deg); } }
//       `}</style>
//     </div>
//   );
// }




