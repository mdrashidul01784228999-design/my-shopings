


'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Api from '../../api/Api';
import { useParams, useRouter } from 'next/navigation';

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const params = useParams();
  const router = useRouter();
  const currentCategory = params?.catagori as string | undefined;

  useEffect(() => {
    const fetchData = async () => {
      if (!currentCategory) return;
      setLoading(true);
      try {
        const res = await Api.get(`/get_all_product/${currentCategory}`);
        setProducts(res.data.message);
      } catch (err) {
        console.error('❌ Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentCategory]);

  return (
    <main className="relative min-h-screen bg-[#050505] text-white overflow-hidden font-sans">
      
      {/* 🌈 Dynamic Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[0%] right-[-5%] w-[40%] h-[40%] bg-cyan-500/20 blur-[120px] rounded-full animate-bounce duration-[10s]" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-pink-500/10 blur-[100px] rounded-full" />
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

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
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
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8"
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
                  onClick={() => router.push(`/products/${currentCategory}/${product.catagori}`)}
                  className="group relative"
                >
                  {/* Glowing Aura behind card */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-[2rem] blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                  
                  <div className="relative aspect-[3/4] rounded-[1.8rem] bg-[#111] border border-white/10 overflow-hidden flex flex-col">
                    
                    {/* Image Wrap */}
                    <div className="relative flex-1 overflow-hidden">
                      <motion.img
                        whileHover={{ scale: 1.15, rotate: 2 }}
                        transition={{ duration: 0.6 }}
                        src={product.img ? `${process.env.NEXT_PUBLIC_IMAGE_URL}/uploads_product/${product.img}` : product.imglink}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      {/* Price Tag Overlay */}
                      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                         <span className="text-xs font-bold text-cyan-400">PREMIUM</span>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-5 bg-gradient-to-b from-transparent to-black/90">
                      <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors uppercase tracking-tight">
                        {product.catagori}
                      </h3>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-medium">Click to view</span>
                        <motion.div 
                          whileHover={{ x: 5 }}
                          className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10"
                        >
                          →
                        </motion.div>
                      </div>
                    </div>
                  </div>
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
      `}</style>
    </main>
  );
}






