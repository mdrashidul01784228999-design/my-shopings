'use client';
import { useEffect, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from 'framer-motion';
import Api from '../../../api/Api';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

/* দাম সুন্দর করে দেখানোর জন্য (যেমন 1200 → 1,200) */
const formatPrice = (p: any) => {
  const n = Number(p);
  return isNaN(n) ? String(p) : n.toLocaleString('en-US');
};

/* ------------------------------------------------------------------ */
/*  Premium 3D Floating Card (শুধু ডিজাইন — কোনো লজিক নেই)            */
/* ------------------------------------------------------------------ */
function FloatingCard({ product, index }: { product: any; index: number }) {
  const reduceMotion = useReducedMotion();

  // মাউস / টাচ থেকে 3D টিল্ট
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 140, damping: 18 });
  const sy = useSpring(my, { stiffness: 140, damping: 18 });

  const rotateX = useTransform(sy, [-0.5, 0.5], [12, -12]);
  const rotateY = useTransform(sx, [-0.5, 0.5], [-12, 12]);

  // ছবি উল্টো দিকে সরে গভীরতা (parallax) তৈরি করে
  const imgX = useTransform(sx, [-0.5, 0.5], [14, -14]);
  const imgY = useTransform(sy, [-0.5, 0.5], [14, -14]);

  // আলোর ঝিলিক
  const glareX = useTransform(sx, [-0.5, 0.5], ['0%', '100%']);
  const glareY = useTransform(sy, [-0.5, 0.5], ['0%', '100%']);
  const glare = useTransform(
    [glareX, glareY] as any,
    ([x, y]: any) =>
      `radial-gradient(circle at ${x} ${y}, rgba(255,255,255,0.30), transparent 55%)`
  );

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleLeave = () => {
    mx.set(0);
    my.set(0);
  };

  // প্রতিটি কার্ড আলাদা তালে ভাসবে
  const floatDuration = 4.2 + (index % 4) * 0.7;
  const floatDelay = (index % 5) * 0.3;

  const displayName = product.name || product.brand || product.catagori;
  const hasPrice =
    product.price !== undefined && product.price !== null && product.price !== '';

  return (
    <div className="relative" style={{ perspective: 1100 }}>
      {/* মেঝের রঙিন আলো */}
      <motion.div
        aria-hidden
        className="absolute left-1/2 -bottom-8 h-8 w-4/5 -translate-x-1/2 rounded-full bg-gradient-to-r from-cyan-500/50 via-purple-500/50 to-pink-500/50 blur-2xl"
        animate={reduceMotion ? undefined : { scaleX: [1, 0.78, 1], opacity: [0.8, 0.35, 0.8] }}
        transition={{ duration: floatDuration, delay: floatDelay, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* মেঝের ছায়া */}
      <motion.div
        aria-hidden
        className="absolute left-1/2 -bottom-5 h-4 w-2/3 -translate-x-1/2 rounded-full bg-black/90 blur-lg"
        animate={reduceMotion ? undefined : { scaleX: [1, 0.8, 1], opacity: [0.9, 0.5, 0.9] }}
        transition={{ duration: floatDuration, delay: floatDelay, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* ভেসে থাকা */}
      <motion.div
        animate={reduceMotion ? undefined : { y: [0, -16, 0] }}
        transition={{ duration: floatDuration, delay: floatDelay, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* 3D টিল্ট */}
        <motion.div
          onPointerMove={handleMove}
          onPointerLeave={handleLeave}
          onPointerUp={handleLeave}
          style={{ rotateX, rotateY, transformStyle: 'preserve-3d', touchAction: 'pan-y' }}
          className="relative"
        >
          {/* পেছনের জ্বলন্ত আভা */}
          <div
            className="absolute -inset-2 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-[2.2rem] blur-xl opacity-20 group-hover:opacity-70 transition duration-700"
            style={{ transform: 'translateZ(-40px)' }}
          />

          {/* ঘূর্ণায়মান আলোর বর্ডার */}
          <div className="relative rounded-[1.9rem] p-[1.5px] overflow-hidden shadow-[0_35px_70px_-20px_rgba(0,0,0,0.95)]">
            <div
              aria-hidden
              className="absolute inset-[-100%] animate-spin-slow opacity-60 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background:
                  'conic-gradient(from 0deg, transparent 0deg, #22d3ee 70deg, transparent 150deg, #a855f7 240deg, #ec4899 290deg, transparent 340deg)',
              }}
            />

            {/* কার্ডের ভেতরের অংশ */}
            <div className="relative aspect-[3/4] rounded-[1.8rem] bg-[#0a0a0f] overflow-hidden">
              <motion.img
                style={{ x: imgX, y: imgY }}
                initial={{ scale: 1.12 }}
                animate={{ scale: 1.12 }}
                whileHover={{ scale: 1.22 }}
                transition={{ duration: 0.7 }}
                src={
                  product.img
                    ? `${process.env.NEXT_PUBLIC_IMAGE_URL}/uploads_product/${product.img}`
                    : product.imglink
                }
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* উপরে হালকা ও নিচে গাঢ় গ্রেডিয়েন্ট */}
              <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/95 via-black/50 to-transparent pointer-events-none" />

              {/* হোভারে আলোর রেখা পার হয়ে যায় */}
              <div
                aria-hidden
                className="absolute top-0 bottom-0 left-0 w-1/3 -translate-x-[150%] skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none transition-transform duration-1000 ease-out group-hover:translate-x-[420%]"
              />

              {/* কার্সর অনুসরণ করা glare */}
              <motion.div
                aria-hidden
                className="absolute inset-0 pointer-events-none mix-blend-overlay"
                style={{ background: glare }}
              />
            </div>
          </div>

          {/* PREMIUM ব্যাজ — সামনে ভাসছে */}
          <div
            className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full border border-amber-300/40 bg-black/55 backdrop-blur-md px-3 py-1 shadow-[0_8px_20px_rgba(0,0,0,0.5)]"
            style={{ transform: 'translateZ(65px)' }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-amber-300">
              <path d="M12 2l2.6 6.9L22 10l-5.5 4.8L18 22l-6-3.6L6 22l1.5-7.2L2 10l7.4-1.1L12 2z" />
            </svg>
            <span className="text-[11px] font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-400">
              PREMIUM
            </span>
          </div>

          {/* নাম ও দামের গ্লাস প্যানেল — সবচেয়ে সামনে ভাসছে */}
          <div
            className="absolute inset-x-3 bottom-3 rounded-2xl border border-white/20 bg-gradient-to-b from-white/[0.16] to-white/[0.05] backdrop-blur-xl px-3.5 py-3 sm:px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_18px_40px_rgba(0,0,0,0.65)]"
            style={{ transform: 'translateZ(80px)' }}
          >
            <h3 className="text-base sm:text-lg font-semibold text-white group-hover:text-cyan-200 transition-colors tracking-tight leading-tight truncate">
              {displayName}
            </h3>

            <div className="mt-2.5 flex items-center justify-between gap-2">
              {hasPrice ? (
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-bold text-amber-300/90">৳</span>
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-300 to-amber-500 drop-shadow-[0_2px_8px_rgba(251,191,36,0.35)]">
                    {formatPrice(product.price)}
                  </span>
                </div>
              ) : (
                <span className="text-xs text-slate-300 font-medium">Click to view</span>
              )}

              <motion.div
                whileHover={{ x: 5 }}
                className="w-9 h-9 shrink-0 rounded-full bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center text-white text-sm shadow-[0_6px_18px_rgba(124,58,237,0.55)] border border-white/30"
              >
                →
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page (লজিক হুবহু আগের মতো)                                        */
/* ------------------------------------------------------------------ */
export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [brand, setBrand] = useState('');
  const [branNams, setBrnadnms] = useState('');
  const [loading, setLoading] = useState(true);

  const params = useParams();
  const currentCategory = params?.catagori as string | undefined;
  const barnds = params?.brandname as string | undefined;

  const router = useRouter();
  
  
  // 📡 API Data Load
  useEffect(() => {
    const fetchData = async () => {
      if (!currentCategory) return;
      setLoading(true);
      try {
        const res = await Api.get(`/get_all_product_brandName/${barnds}/${currentCategory}`);
        setProducts(res.data.message);
      } catch (err) {
        console.error('❌ Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // প্রতি 3 সেকেন্ডে আপডেট চাইলে
    
  }, [currentCategory]);

  const handleProductClick = (product: any) => {
    if (brand) {
      setBrnadnms(product.brand);
    } else {
      setBrand(product.catagori);
    }
  };

  return (
       <main className="relative min-h-screen bg-[#050505] text-white overflow-hidden font-sans">
      
      {/* 🌈 Dynamic Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[0%] right-[-5%] w-[40%] h-[40%] bg-cyan-500/20 blur-[120px] rounded-full animate-bounce duration-[10s]" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-pink-500/10 blur-[100px] rounded-full" />

        {/* হালকা গ্রিড টেক্সচার */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
            backgroundSize: '56px 56px',
            maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
          }}
        />
        {/* কোণায় অন্ধকার (vignette) */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.65)_100%)]" />
      </div>

      {/* 🌨️ Floating Particles Effect */}
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 50, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: Math.random() * 10 + 5,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute bg-white rounded-full"
            style={{
              width: Math.random() * 4 + 'px',
              height: Math.random() * 4 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 py-12">
        {/* 🔥 Header with Animated Underline */}
        <header className="mb-16 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 animate-gradient-x">
                {currentCategory || "Explore"}
              </span>
            </h1>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "120px" }}
              transition={{ delay: 0.5, duration: 1 }}
              className="h-2 bg-gradient-to-r from-cyan-400 to-purple-600 mt-4 rounded-full mx-auto lg:mx-0" 
            />
            {!loading && (
              <p className="mt-5 text-sm text-slate-400">
                {products.length} products
              </p>
            )}
          </motion.div>
        </header>

        {/* 🔄 Loading State (Glass Skeleton) */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-3xl bg-white/5 border border-white/10 animate-pulse" />
            ))}
          </div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-16 sm:gap-x-9 sm:gap-y-20"
          >
            <AnimatePresence>
              {products.map((product, index) => (
                <motion.div
                  key={product.id || index}
                  layout
                  initial={{ opacity: 0, scale: 0.8, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ delay: index * 0.08, type: "spring", stiffness: 100 }}
                  whileHover={{ y: -12 }}
                  className="group relative cursor-pointer"
                >
                  <Link href={`/products/${currentCategory}/${product.catagori}/${product.brand}`} className="block" aria-label={String(product?.catagori || product?.brand || "")}>
                    <FloatingCard product={product} index={index} />
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>

            
            

          </motion.div>
        )}
      </div>

      <style jsx global>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 5s ease infinite;
        }
        @keyframes spin-slow {
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 7s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-spin-slow { animation: none; }
        }
      `}</style>
    </main>
  );
}


















// 'use client';
// import { useEffect, useState } from 'react';
// import { AnimatePresence, motion } from 'framer-motion';
// import Api from '../../../api/Api';
// import Link from 'next/link';
// import { useParams, useRouter } from 'next/navigation';



// export default function Home() {
//   const [products, setProducts] = useState<any[]>([]);
//   const [brand, setBrand] = useState('');
//   const [branNams, setBrnadnms] = useState('');
//   const [loading, setLoading] = useState(true);

//   const params = useParams();
//   const currentCategory = params?.catagori as string | undefined;
//   const barnds = params?.brandname as string | undefined;

//   const router = useRouter();
  
  
//   // 📡 API Data Load
//   useEffect(() => {
//     const fetchData = async () => {
//       if (!currentCategory) return;
//       setLoading(true);
//       try {
//         const res = await Api.get(`/get_all_product_brandName/${barnds}/${currentCategory}`);
//         setProducts(res.data.message);
//       } catch (err) {
//         console.error('❌ Fetch error:', err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();

//     // প্রতি 3 সেকেন্ডে আপডেট চাইলে
    
//   }, [currentCategory]);

//   const handleProductClick = (product: any) => {
//     if (brand) {
//       setBrnadnms(product.brand);
//     } else {
//       setBrand(product.catagori);
//     }
//   };

//   return (
//        <main className="relative min-h-screen bg-[#050505] text-white overflow-hidden font-sans">
      
//       {/* 🌈 Dynamic Animated Background */}
//       <div className="fixed inset-0 z-0">
//         <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[120px] rounded-full animate-pulse" />
//         <div className="absolute bottom-[0%] right-[-5%] w-[40%] h-[40%] bg-cyan-500/20 blur-[120px] rounded-full animate-bounce duration-[10s]" />
//         <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-pink-500/10 blur-[100px] rounded-full" />
//       </div>

//       {/* 🌨️ Floating Particles Effect */}
//       <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
//         {[...Array(15)].map((_, i) => (
//           <motion.div
//             key={i}
//             animate={{
//               y: [0, -100, 0],
//               x: [0, Math.random() * 50, 0],
//               opacity: [0.2, 0.5, 0.2],
//             }}
//             transition={{
//               duration: Math.random() * 10 + 5,
//               repeat: Infinity,
//               ease: "linear",
//             }}
//             className="absolute bg-white rounded-full"
//             style={{
//               width: Math.random() * 4 + 'px',
//               height: Math.random() * 4 + 'px',
//               left: Math.random() * 100 + '%',
//               top: Math.random() * 100 + '%',
//             }}
//           />
//         ))}
//       </div>

//       <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
//         {/* 🔥 Header with Animated Underline */}
//         <header className="mb-16 text-center lg:text-left">
//           <motion.div
//             initial={{ opacity: 0, x: -50 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.8 }}
//           >
//             <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none">
//               <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 animate-gradient-x">
//                 {currentCategory || "Explore"}
//               </span>
//             </h1>
//             <motion.div 
//               initial={{ width: 0 }}
//               animate={{ width: "120px" }}
//               transition={{ delay: 0.5, duration: 1 }}
//               className="h-2 bg-gradient-to-r from-cyan-400 to-purple-600 mt-4 rounded-full mx-auto lg:mx-0" 
//             />
//           </motion.div>
//         </header>

//         {/* 🔄 Loading State (Glass Skeleton) */}
//         {loading ? (
//           <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
//             {Array.from({ length: 8 }).map((_, i) => (
//               <div key={i} className="aspect-[3/4] rounded-3xl bg-white/5 border border-white/10 animate-pulse" />
//             ))}
//           </div>
//         ) : (
//           <motion.div 
//             layout
//             className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8"
//           >
//             <AnimatePresence>
//               {products.map((product, index) => (
//                 <motion.div
//                   key={product.id || index}
//                   layout
//                   initial={{ opacity: 0, scale: 0.8, y: 30 }}
//                   animate={{ opacity: 1, scale: 1, y: 0 }}
//                   exit={{ opacity: 0, scale: 0.5 }}
//                   transition={{ delay: index * 0.08, type: "spring", stiffness: 100 }}
//                   whileHover={{ y: -12 }}
//                   onClick={() => router.push(`/products/${currentCategory}/${product.catagori}/${product.brand}`)}
//                   className="group relative"
//                 >
//                   {/* Glowing Aura behind card */}
//                   <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-[2rem] blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                  
//                   <div className="relative aspect-[3/4] rounded-[1.8rem] bg-[#111] border border-white/10 overflow-hidden flex flex-col">
                    
//                     {/* Image Wrap */}
//                     <div className="relative flex-1 overflow-hidden">
//                       <motion.img
//                         whileHover={{ scale: 1.15, rotate: 2 }}
//                         transition={{ duration: 0.6 }}
//                         src={product.img ? `${process.env.NEXT_PUBLIC_IMAGE_URL}/uploads_product/${product.img}` : product.imglink}
//                         alt={product.name}
//                         className="w-full h-full object-cover"
//                       />
//                       {/* Price Tag Overlay */}
//                       <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
//                          <span className="text-xs font-bold text-cyan-400">PREMIUM</span>
//                       </div>
//                     </div>

//                     {/* Content Section */}
//                     <div className="p-5 bg-gradient-to-b from-transparent to-black/90">
//                       <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors uppercase tracking-tight">
//                      {product.name}
//                       </h3>
//                       <div className="mt-2 flex items-center justify-between">
//                         <span className="text-xs text-slate-400 font-medium">Click to view</span>
//                         <motion.div 
//                           whileHover={{ x: 5 }}
//                           className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10"
//                         >
//                             →
//                         </motion.div>
//                       </div>
//                     </div>
//                   </div>
//                 </motion.div>
//               ))}
//             </AnimatePresence>

            
            

//           </motion.div>
//         )}
//       </div>

//       <style jsx global>{`
//         @keyframes gradient-x {
//           0%, 100% { background-position: 0% 50%; }
//           50% { background-position: 100% 50%; }
//         }
//         .animate-gradient-x {
//           background-size: 200% 200%;
//           animation: gradient-x 5s ease infinite;
//         }
//       `}</style>
//     </main>
//   );
// }

/* ===== SEO UPDATE BACKUP: নিচের মূল লাইনগুলো SEO আপডেটে বদলানো হয়েছে (ব্যাকআপ হিসেবে রাখা) =====
                  onClick={() => router.push(`/products/${currentCategory}/${product.catagori}/${product.brand}`)}
                  <FloatingCard product={product} index={index} />
===== END BACKUP ===== */
