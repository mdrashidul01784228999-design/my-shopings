"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Api from "../api/Api";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "../api/Carssotres";
import { Facebook, Twitter, ShoppingCart, Star, Zap, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

// কার্ট আইটেমের জন্য টাইপ ডিফাইন
interface CartItemType {
  id: string | number;
  name: string;
  img?: string;
  imglink?: string;
  pricee: number | string;
  qty?: number;
}

// প্রোডাক্টের মূল অবজেক্ট টাইপ
interface ProductType {
  id: string | number;
  name: string;
  img?: string;
  imglink?: string;
  catagori?: string;
  discript?: string;
  pricee: number | string;
  reprice?: number | string;
}

interface ProductViewsProps {
  Ids: string | number;
}

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export default function ProductViews({ Ids }: ProductViewsProps) {
  const { cart, addToCart, removeFromCart, updateQty } = useCartStore() as any;
  const [product, setProduct] = useState<ProductType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [cartOpen, setCartOpen] = useState<boolean>(false);
  const cartRef = useRef<HTMLDivElement | null>(null);
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({});
  const [showZoom, setShowZoom] = useState<boolean>(false);
  const [reviews, setReviews] = useState<string[]>([]);
  const [text, setText] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const [recomentp, setRecomdntrodcutssset] = useState<string | null>(null);
  const [productsc, setProductsrecoment] = useState<ProductType[]>([]);

  // recommend fetch function-কে useCallback দিয়ে বাউন্ড করা হলো
  const fetchDatas = useCallback(async (categoryName: string) => {
    if (!categoryName) return;
    try {
      const res = await Api.get(`/recomentcatagoris/${categoryName}`);
      const data = res.data.message;


console.log('this a products view recoment products your febreat products ');
console.log('this a products view recoment products your febreat products ');


      setProductsrecoment(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  // ক্যাটাগরি সেট হওয়ার সাথে সাথে রিকমেন্ডেড প্রোডাক্ট ট্রিগার করার useEffect
  useEffect(() => {
    if (recomentp) {
      fetchDatas(recomentp);
    }
  }, [recomentp, fetchDatas]);

  const handleNavigation = async () => {
    setIsLoading(true);
    router.push('/checkout/order');
  };

  // মেইন প্রোডাক্ট ফেচ লজিক
  useEffect(() => {
    const fetchData = async () => {
      if (!Ids) return;
      try {
        setLoading(true);
        const res = await Api.get(`/productdateid/${Ids}`);
        const data = res.data.message;
        const productData = Array.isArray(data) ? data[0] : data;

        setProduct(productData);
        if (productData?.catagori) {
          setRecomdntrodcutssset(productData.catagori);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [Ids]);

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    const item = e.currentTarget.getBoundingClientRect();
    const bag = cartRef.current?.getBoundingClientRect();
    if (!bag) return;
    
    const fly = document.createElement("div");
    fly.innerText = "🛒";
    fly.style.cssText = `position:fixed; left:${item.left}px; top:${item.top}px; font-size:30px; z-index:9999; transition:0.8s ease;`;
    document.body.appendChild(fly);
    
    requestAnimationFrame(() => {
      fly.style.transform = `translate(${bag.left - item.left}px, ${bag.top - item.top}px) scale(0.5) rotate(360deg)`;
    });
    
    setTimeout(() => fly.remove(), 800);
    if (product) addToCart(product);
  };

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({ backgroundPosition: `${x}% ${y}%` });
  };

  const addReview = () => {
    if (!text.trim()) return;
    setReviews([...reviews, text.trim()]);
    setText("");
  };

  if (loading) return (
    <div className="h-screen bg-black flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  
  if (!product) return <div className="text-white text-center p-20">No Product Found</div>;

  return (
    <>
      <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden">
        
        {/* 🛒 FLOATING CART BUTTON */}
        <div className="fixed top-5 right-5 z-50">
          <motion.div
            ref={cartRef}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setCartOpen(true)}
            className="p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl cursor-pointer relative shadow-2xl"
          >
            <ShoppingCart className="w-6 h-6 text-pink-500" />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-pink-600 text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-black">
                {cart.length}
              </span>
            )}
          </motion.div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-10 md:py-20">
          
          {/* 🧊 PRODUCT HERO SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            
            {/* LEFT: IMAGE VIEW */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onMouseMove={handleMove}
              onMouseEnter={() => setShowZoom(true)}
              onMouseLeave={() => setShowZoom(false)}
              className="relative rounded-[2.5rem] bg-gradient-to-b from-white/5 to-transparent border border-white/10 overflow-hidden group shadow-2xl"
            >
              <img
                src={product.img ? `${process.env.NEXT_PUBLIC_IMAGE_URL}/uploads_product/${product.img}` : product.imglink || "/fallback.png"}
                className="w-full h-[350px] md:h-[550px] object-contain p-6 group-hover:scale-105 transition-transform duration-700"
                alt={product.name}
              />

              {showZoom && (
                <div
                  className="absolute inset-0 pointer-events-none scale-[2]"
                  style={{
                    backgroundImage: `url(${product.img ? `${process.env.NEXT_PUBLIC_IMAGE_URL}/uploads_product/${product.img}` : product.imglink || "/fallback.png"})`,
                    backgroundRepeat: "no-repeat",
                    ...zoomStyle,
                  }}
                />
              )}
              
              <div className="absolute top-5 left-5 px-4 py-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-xs font-medium text-pink-400">
                Premium Quality
              </div>
            </motion.div>

            {/* RIGHT: DETAILS */}
            <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col">
              <h1 className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-white via-white to-gray-500 bg-clip-text text-transparent leading-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-3 mb-6">
                 <div className="flex text-yellow-500">
                    {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                 </div>
                 <span className="text-gray-500 text-sm">(4.9/5 Rating)</span>
              </div>

              <p className="text-gray-400 text-lg leading-relaxed mb-8 max-w-lg">
                {product.discript}
              </p>

              <div className="flex items-center gap-4 mb-10">
                <span className="text-4xl font-bold text-white">৳ {product.pricee}</span>
                {product.reprice && (
                  <del className="text-xl text-gray-600">৳ {product.reprice}</del>
                )}
                <div className="ml-2 bg-green-500/10 text-green-500 text-xs px-2 py-1 rounded-lg border border-green-500/20">
                  In Stock
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <motion.button
                  onClick={handleAddToCart}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="h-16 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 flex items-center justify-center gap-3 font-bold text-lg shadow-lg shadow-pink-500/20"
                >
                  <ShoppingCart size={20} /> Add to Cart
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="h-16 rounded-2xl border border-white/10 bg-white/5 font-bold text-lg backdrop-blur-sm hover:bg-white/10 transition-all"
                >
                  Buy Now
                </motion.button>
              </div>

              {/* SOCIAL SHARE */}
              <div className="mt-12 pt-8 border-t border-white/5">
                <p className="text-gray-500 text-sm mb-4 uppercase tracking-widest font-semibold">Share with Friends</p>
                <div className="flex gap-4">
                  {[
                    { icon: Facebook, color: "bg-blue-600", url: `https://facebook.com/sharer/sharer.php?u=` },
                    { icon: Twitter, color: "bg-sky-500", url: `https://twitter.com/intent/tweet?url=` },
                  ].map((item, idx) => (
                    <motion.a
                      key={idx}
                      href={`${item.url}${typeof window !== "undefined" ? window.location.href : ""}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ y: -5 }}
                      className={`p-3 ${item.color} rounded-xl shadow-lg flex items-center justify-center text-white`}
                    >
                      <item.icon size={20} />
                    </motion.a>
                  ))}
                  <motion.div whileHover={{ y: -5 }} className="p-3 bg-green-500 rounded-xl cursor-pointer shadow-lg">
                    📱
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ⭐ REVIEWS SECTION */}
          <div className="mt-32">
            <div className="flex items-center gap-3 mb-10">
              <Zap className="text-pink-500" fill="currentColor" />
              <h2 className="text-3xl font-bold">Customer Reviews</h2>
            </div>

            <div className="bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-md">
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="flex-1 bg-black/50 border border-white/10 rounded-xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all text-white"
                  placeholder="Tell us what you think..."
                />
                <button onClick={addReview} className="bg-pink-600 hover:bg-pink-700 px-10 py-4 rounded-xl font-bold transition-all shadow-lg text-white">
                  Submit Review
                </button>
              </div>

              <div className="space-y-4">
                {reviews.length === 0 && <p className="text-gray-500 text-center py-10">No reviews yet. Be the first!</p>}
                {reviews.map((r, i) => (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={i} className="bg-white/5 p-5 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-pink-500/20 rounded-full flex items-center justify-center text-pink-500 text-xs font-bold">U</div>
                      <span className="text-sm font-medium">Verified Customer</span>
                    </div>
                    <p className="text-gray-300 italic">"{r}"</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* 🎯 RELATED PRODUCTS */}
          <div className="mt-32">
            <h2 className="text-3xl font-bold mb-10">Recommended for You</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {productsc.map((item, idx) => (
                <motion.div
                  key={item.id || idx}
                  whileHover={{ y: -10 }}
                  className="group relative bg-white/5 border border-white/10 rounded-3xl p-4 overflow-hidden"
                >
                  <div className="aspect-square rounded-2xl bg-white/5 mb-4 overflow-hidden">
                    <img 
                      src={item.img ? `${process.env.NEXT_PUBLIC_IMAGE_URL}/uploads_product/${item.img}` : item.imglink || "/fallback.png"} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      alt="Related" 
                    />
                  </div>
                  <h3 className="font-semibold text-gray-200 truncate">{item.name || `Product ${idx + 1}`}</h3>
                  <p className="text-pink-500 font-bold">৳ {item.pricee}</p>
                </motion.div>
              ))}
              {productsc.length === 0 && (
                <p className="text-gray-500 col-span-full py-4">No recommended items found in this category.</p>
              )}
            </div>
          </div>
        </div>

        {/* 🛒 CART DRAWER */}
        <AnimatePresence>
          {cartOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCartOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]" />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 w-full sm:w-[400px] h-full z-[101] bg-[#0a0a0a] border-l border-white/10 shadow-2xl p-8 flex flex-col"
              >
                <div className="flex justify-between items-center mb-10">
                  <h2 className="text-2xl font-black bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">Cart Summary</h2>
                  <button onClick={() => setCartOpen(false)} className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors">✕</button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-30">
                      <ShoppingCart size={80} className="mb-4" />
                      <p>Your cart is empty</p>
                    </div>
                  ) : (
                    cart.map((item: CartItemType, index: number) => (
                      <motion.div key={item.id || index} layout className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                        <img src={item.img ? `${process.env.NEXT_PUBLIC_IMAGE_URL}/uploads_product/${item.img}` : item.imglink || "/fallback.png"} className="w-20 h-20 object-contain rounded-lg" alt={item.name} />
                        <div className="flex-1">
                          <p className="font-bold text-sm mb-1">{item.name}</p>
                          <p className="text-pink-500 text-sm font-bold mb-3">৳ {item.pricee}</p>
                          <div className="flex items-center gap-3">
                            <button onClick={() => updateQty(item.id, Math.max((item.qty || 1) - 1, 1))} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10">-</button>
                            <span className="text-sm font-medium">{item.qty || 1}</span>
                            <button onClick={() => updateQty(item.id, (item.qty || 1) + 1)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10">+</button>
                          </div>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="text-gray-600 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                      </motion.div>
                    ))
                  )}
                </div>

                {cart.length > 0 && (
                  <div className="mt-8 pt-8 border-t border-white/10">
                    <div className="flex justify-between text-xl font-bold mb-6">
                      <span>Subtotal</span>
                      <span className="text-pink-500">৳ {cart.reduce((total: number, item: CartItemType) => total + Number(item.pricee || 0) * Number(item.qty || 1), 0)}</span>
                    </div>

                    <button 
                      onClick={handleNavigation} 
                      disabled={isLoading}
                      className="w-full py-5 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 font-bold text-lg shadow-xl shadow-pink-500/20 mb-4 text-white"
                    >
                      {isLoading ? "Waiting..." : "Complete Order 🚀"}
                    </button>
                    <button onClick={() => setCartOpen(false)} className="w-full text-gray-500 text-sm font-medium">Continue Shopping</button>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}



// // http://localhost:8000/api/recomentcatagoris/

// "use client";

// import React, { useEffect, useState, useRef } from "react";
// import Head from "next/head";
// import Api from "../api/Api";
// import {} from "../api/Api";
// import { motion, AnimatePresence } from "framer-motion";
// import { useCartStore } from "../api/Carssotres";
// import { Facebook, Twitter, Share2, ShoppingCart, Star, Zap, Trash2 } from "lucide-react";
// import { useRouter } from "next/navigation";

// export default function ProductViews({ Ids }) {
//   const { cart, addToCart, removeFromCart, updateQty } = useCartStore();
//   const [product, setProduct] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [cartOpen, setCartOpen] = useState(false);
//   const cartRef = useRef(null);
//   const [zoomStyle, setZoomStyle] = useState({});
//   const [showZoom, setShowZoom] = useState(false);
//   const [reviews, setReviews] = useState([]);
//   const [text, setText] = useState("");


//   const [isLoading, setIsLoading] = useState(false);
//   const router = useRouter();

 

// const [recomentp, setRecomdntrodcutssset]= useState(null);
//    const [productsc, setProductsrecoment] = useState([]);
//   const [loadings, setLoadings] = useState(true);
// // 1️⃣ Recommend fetch function বাইরে আনো
// const fetchDatas = async (recomentp) => {
//   if (!recomentp) return;
//   try {
//     const res = await Api.get(`/recomentcatagoris/${recomentp}`);
//     const data = res.data.message;
//     setProductsrecoment(data);

//     console.log('recoment product s ====================================');
//     console.log(data);
//     console.log('====================================');

//   } catch (err) {
//     console.error(err);
//   } finally {
//     setLoadings(false);
//   }
// };






// const handleNavigation = async () => {
//     setIsLoading(true); // Start loading effect
    
//     // Optional: Add a small delay if you want the user to actually see the "Waiting..." state
//     // await new Promise((resolve) => setTimeout(resolve, 1000));

//     router.push('/checkout/order'); // Redirect to your desired page (e.g., Home)
//   };






// // 2️⃣ Main product fetch
// useEffect(() => {
//   const fetchData = async () => {
//     if (!Ids) return;
//     try {
//       const res = await Api.get(`/productdateid/${Ids}`);
//       const data = res.data.message;
//       const productData = Array.isArray(data) ? data[0] : data;

//       setProduct(productData);
// console.log('get catagoris brand name new recoment products====================================');
// console.log(productData?.catagori);
// console.log(recomentp);

// console.log('====================================');
//       // এখানে call ঠিকভাবে কাজ করবে
//       setRecomdntrodcutssset(productData?.catagori);

//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   fetchData();
// }, [Ids]);



// //   useEffect(() => {
// //     const fetchData = async () => {
// //       if (!Ids) return;
// //       try {
// //         const res = await Api.get(`/productdateid/${Ids}`);
// //         const data = res.data.message;
// //         setProduct(Array.isArray(data) ? data[0] : data);


// // fetchDatas(data.catagori);


// //       } catch (err) {
// //         console.error(err);
// //       } finally {
// //         setLoading(false);
// //       }
// //     };
// //     fetchData();
// //   }, [Ids]);






// //   useEffect(() => {
// //     const fetchDatas = async (ids) => {
// //       if (!ids) return;
// //       try {
// //         const res = await Api.get(`/recomentcatagoris/${ids}`);
// //         const data = res.data.message;
// //         setProductsrecoment(data);

// // console.log('recoment product s ====================================');
// // console.log(data);
// // console.log('====================================');


// //       } catch (err) {
// //         console.error(err);
// //       } finally {
// //         setLoadings(false);
// //       }
// //     };
// //     fetchDatas();
// //   }, [ids]);




//   const handleAddToCart = (e) => {
//     const item = e.currentTarget.getBoundingClientRect();
//     const bag = cartRef.current?.getBoundingClientRect();
//     if (!bag) return;
//     const fly = document.createElement("div");
//     fly.innerText = "🛒";
//     fly.style.cssText = `position:fixed; left:${item.left}px; top:${item.top}px; font-size:30px; z-index:9999; transition:0.8s ease;`;
//     document.body.appendChild(fly);
//     requestAnimationFrame(() => {
//       fly.style.transform = `translate(${bag.left - item.left}px, ${bag.top - item.top}px) scale(0.5) rotate(360deg)`;
//     });
//     setTimeout(() => fly.remove(), 800);
//     addToCart(product);
//   };

//   const handleMove = (e) => {
//     const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
//     const x = ((e.clientX - left) / width) * 100;
//     const y = ((e.clientY - top) / height) * 100;
//     setZoomStyle({ backgroundPosition: `${x}% ${y}%` });
//   };

//   const addReview = () => {
//     if (!text) return;
//     setReviews([...reviews, text]);
//     setText("");
//   };

//   if (loading) return (
//     <div className="h-screen bg-black flex items-center justify-center">
//       <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
//     </div>
//   );
  
//   if (!product) return <div className="text-white text-center p-20">No Product Found</div>;

//   return (
//     <>
//       <Head>
//         <title>{product.name} | Premium Store</title>
//       </Head>

//       <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden">
        
//         {/* 🛒 FLOATING CART BUTTON */}
//         <div className="fixed top-5 right-5 z-50">
//           <motion.div
//             ref={cartRef}
//             whileHover={{ scale: 1.1 }}
//             whileTap={{ scale: 0.9 }}
//             onClick={() => setCartOpen(true)}
//             className="p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl cursor-pointer relative shadow-2xl"
//           >
//             <ShoppingCart className="w-6 h-6 text-pink-500" />
//             {cart.length > 0 && (
//               <span className="absolute -top-2 -right-2 bg-pink-600 text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-black">
//                 {cart.length}
//               </span>
//             )}
//           </motion.div>
//         </div>

//         <div className="max-w-7xl mx-auto px-4 py-10 md:py-20">
          
//           {/* 🧊 PRODUCT HERO SECTION */}
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            
//             {/* LEFT: IMAGE VIEW */}
//             <motion.div
//               initial={{ opacity: 0, scale: 0.9 }}
//               animate={{ opacity: 1, scale: 1 }}
//               onMouseMove={handleMove}
//               onMouseEnter={() => setShowZoom(true)}
//               onMouseLeave={() => setShowZoom(false)}
//               className="relative rounded-[2.5rem] bg-gradient-to-b from-white/5 to-transparent border border-white/10 overflow-hidden group shadow-2xl"
//             >
//               <img
//                 src={product.img ? `${process.env.NEXT_PUBLIC_IMAGE_URL}/uploads_product/${product.img}` : product.imglink || "/fallback.png"}
//                 className="w-full h-[350px] md:h-[550px] object-contain p-6 group-hover:scale-105 transition-transform duration-700"
//                 alt={product.name}
//               />

//               {showZoom && (
//                 <div
//                   className="absolute inset-0 pointer-events-none scale-[2]"
//                   style={{
//                     backgroundImage: `url(${product.img ? `${process.env.NEXT_PUBLIC_IMAGE_URL}/uploads_product/${product.img}` : product.imglink})`,
//                     backgroundRepeat: "no-repeat",
//                     ...zoomStyle,
//                   }}
//                 />
//               )}
              
//               <div className="absolute top-5 left-5 px-4 py-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-xs font-medium text-pink-400">
//                 Premium Quality
//               </div>
//             </motion.div>

//             {/* RIGHT: DETAILS */}
//             <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col">
//               <h1 className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-white via-white to-gray-500 bg-clip-text text-transparent leading-tight">
//                 {product.name}
//               </h1>


//               <div className="flex items-center gap-3 mb-6">
//                  <div className="flex text-yellow-500">
//                     {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
//                  </div>
//                  <span className="text-gray-500 text-sm">(4.9/5 Rating)</span>
//               </div>

//               <p className="text-gray-400 text-lg leading-relaxed mb-8 max-w-lg">
//                 {product.discript}
//               </p>

//               <div className="flex items-center gap-4 mb-10">
//                 <span className="text-4xl font-bold text-white">৳ {product.pricee}</span>
//                 {product.reprice && (
//                   <del className="text-xl text-gray-600">৳ {product.reprice}</del>
//                 )}
//                 <div className="ml-2 bg-green-500/10 text-green-500 text-xs px-2 py-1 rounded-lg border border-green-500/20">
//                   In Stock
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <motion.button
//                   onClick={handleAddToCart}
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                   className="h-16 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 flex items-center justify-center gap-3 font-bold text-lg shadow-lg shadow-pink-500/20"
//                 >
//                   <ShoppingCart size={20} /> Add to Cart
//                 </motion.button>

//                 <motion.button
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                   className="h-16 rounded-2xl border border-white/10 bg-white/5 font-bold text-lg backdrop-blur-sm hover:bg-white/10 transition-all"
//                 >
//                   Buy Now
//                 </motion.button>
//               </div>

//               {/* SOCIAL SHARE */}
//               <div className="mt-12 pt-8 border-t border-white/5">
//                 <p className="text-gray-500 text-sm mb-4 uppercase tracking-widest font-semibold">Share with Friends</p>
//                 <div className="flex gap-4">
//                   {[
//                     { icon: Facebook, color: "bg-blue-600", url: `https://facebook.com/sharer/sharer.php?u=` },
//                     { icon: Twitter, color: "bg-sky-500", url: `https://twitter.com/intent/tweet?url=` },
//                   ].map((item, idx) => (
//                     <motion.a
//                       key={idx}
//                       href={`${item.url}${typeof window !== "undefined" ? window.location.href : ""}`}
//                       target="_blank"
//                       whileHover={{ y: -5 }}
//                       className={`p-3 ${item.color} rounded-xl shadow-lg`}
//                     >
//                       <item.icon size={20} />
//                     </motion.a>
//                   ))}
//                   <motion.div whileHover={{ y: -5 }} className="p-3 bg-green-500 rounded-xl cursor-pointer shadow-lg">
//                     📱
//                   </motion.div>
//                 </div>
//               </div>
//             </motion.div>
//           </div>

//           {/* ⭐ REVIEWS SECTION */}
//           <div className="mt-32">
//             <div className="flex items-center gap-3 mb-10">
//               <Zap className="text-pink-500" fill="currentColor" />
//               <h2 className="text-3xl font-bold">Customer Reviews</h2>
//             </div>

//             <div className="bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-md">
//               <div className="flex flex-col sm:flex-row gap-4 mb-10">
//                 <input
//                   value={text}
//                   onChange={(e) => setText(e.target.value)}
//                   className="flex-1 bg-black/50 border border-white/10 rounded-xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
//                   placeholder="Tell us what you think..."
//                 />
//                 <button onClick={addReview} className="bg-pink-600 hover:bg-pink-700 px-10 py-4 rounded-xl font-bold transition-all shadow-lg">
//                   Submit Review
//                 </button>
//               </div>

//               <div className="space-y-4">
//                 {reviews.length === 0 && <p className="text-gray-500 text-center py-10">No reviews yet. Be the first!</p>}
//                 {reviews.map((r, i) => (
//                   <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={i} className="bg-white/5 p-5 rounded-2xl border border-white/5">
//                     <div className="flex items-center gap-2 mb-2">
//                       <div className="w-8 h-8 bg-pink-500/20 rounded-full flex items-center justify-center text-pink-500 text-xs font-bold">U</div>
//                       <span className="text-sm font-medium">Verified Customer</span>
//                     </div>
//                     <p className="text-gray-300 italic">"{r}"</p>
//                   </motion.div>
//                 ))}
//               </div>
//             </div>
//           </div>





          

//           {/* 🎯 RELATED PRODUCTS */}
//           <div className="mt-32">
//             <h2 className="text-3xl font-bold mb-10">Recommended for You</h2>
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
//               {productsc.map((item) => (
//                 <motion.div
                
//                   whileHover={{ y: -10 }}
//                   className="group relative bg-white/5 border border-white/10 rounded-3xl p-4 overflow-hidden"
//                 >
//                   <div className="aspect-square rounded-2xl bg-white/5 mb-4 overflow-hidden">
//                     <img src="/fallback.png" className="w-full h-full object-cover group-hover:scale-110 transition-duration-500" alt="Related" />
//                   </div>
//                   <h3 className="font-semibold text-gray-200">New Product {i}</h3>
//                   <p className="text-pink-500 font-bold">৳ {item.pricee}</p>
//                 </motion.div>
//               ))}
//             </div>
//           </div>
//         </div>






//         {/* 🛒 CART DRAWER */}
//         <AnimatePresence>
//           {cartOpen && (
//             <>
//               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCartOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]" />
//               <motion.div
//                 initial={{ x: "100%" }}
//                 animate={{ x: 0 }}
//                 exit={{ x: "100%" }}
//                 transition={{ type: "spring", damping: 25, stiffness: 200 }}
//                 className="fixed right-0 top-0 w-full sm:w-[400px] h-full z-[101] bg-[#0a0a0a] border-l border-white/10 shadow-2xl p-8 flex flex-col"
//               >
//                 <div className="flex justify-between items-center mb-10">
//                   <h2 className="text-2xl font-black bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">Cart Summary</h2>
//                   <button onClick={() => setCartOpen(false)} className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors">✕</button>
//                 </div>

//                 <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
//                   {cart.length === 0 ? (
//                     <div className="h-full flex flex-col items-center justify-center opacity-30">
//                       <ShoppingCart size={80} className="mb-4" />
//                       <p>Your cart is empty</p>
//                     </div>
//                   ) : (
//                     cart.map((item) => (
//                       <motion.div key={item.id} layout className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
//                         <img src={item.img ? `${process.env.NEXT_PUBLIC_IMAGE_URL}/uploads_product/${item.img}` : item.imglink || "/fallback.png"} className="w-20 h-20 object-contain rounded-lg" />
//                         <div className="flex-1">
//                           <p className="font-bold text-sm mb-1">{item.name}</p>
//                           <p className="text-pink-500 text-sm font-bold mb-3">৳ {item.pricee}</p>
//                           <div className="flex items-center gap-3">
//                             <button onClick={() => updateQty(item.id, Math.max((item.qty || 1) - 1, 1))} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10">-</button>
//                             <span className="text-sm font-medium">{item.qty || 1}</span>
//                             <button onClick={() => updateQty(item.id, (item.qty || 1) + 1)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10">+</button>
//                           </div>
//                         </div>
//                         <button onClick={() => removeFromCart(item.id)} className="text-gray-600 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
//                       </motion.div>
//                     ))
//                   )}
//                 </div>

//                 {cart.length > 0 && (
//                   <div className="mt-8 pt-8 border-t border-white/10">
//                     <div className="flex justify-between text-xl font-bold mb-6">
//                       <span>Subtotal</span>
//                       <span className="text-pink-500">৳ {cart.reduce((total, item) => total + Number(item.pricee || 0) * Number(item.qty || 1), 0)}</span>
//                     </div>

//                     <button 
//       onClick={handleNavigation} 
//       disabled={isLoading}
//  className="w-full py-5 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 font-bold text-lg shadow-xl shadow-pink-500/20 mb-4">
    
//       {isLoading ? "Waiting..." : "Complete Order 🚀"}
//     </button>


//                   {/* <button    onClick={() => router.push(`/checkout/order`)}   className="w-full py-5 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 font-bold text-lg shadow-xl shadow-pink-500/20 mb-4">Complete Order 🚀</button> */}
//                     <button onClick={() => setCartOpen(false)} className="w-full text-gray-500 text-sm font-medium">Continue Shopping</button>
//                   </div>
//                 )}
//               </motion.div>
//             </>
//           )}
//         </AnimatePresence>
//       </div>

//       <style jsx global>{`
//         .custom-scrollbar::-webkit-scrollbar { width: 4px; }
//         .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
//         .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
//       `}</style>
//     </>
//   );
// }


