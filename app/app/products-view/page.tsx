



'use client';

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star, ShoppingCart } from "lucide-react";

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  rating: number;
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [suggested, setSuggested] = useState<Product[]>([]);

  useEffect(() => {
    // 🔹 Simulated API fetch
    const fetchedProduct = {
      id: 1,
      name: "Neon Smart Watch X",
      price: 9500,
      image: "/watch.jpg",
      description:
        "Neon Smart Watch X with AMOLED display, Bluetooth call, and 3D motion design. Built for performance and style.",
      rating: 4.8,
    };
    const similarProducts = [
      { id: 2, name: "Neon Fit Band 7", price: 3200, image: "/band.jpg", description: "", rating: 4.2 },
      { id: 3, name: "Galaxy Watch Glow", price: 12900, image: "/galaxy.jpg", description: "", rating: 4.7 },
      { id: 4, name: "Amazfit Light", price: 5800, image: "/amazfit.jpg", description: "", rating: 4.3 },
    ];
    setProduct(fetchedProduct);
    setSuggested(similarProducts);
  }, [params.id]);

  if (!product) return <div className="text-center py-10 text-white">Loading...</div>;


  

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white px-4 sm:px-6 py-10">
      {/* 🟩 Product Section */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 bg-gray-900/40 backdrop-blur-xl rounded-2xl shadow-[0_0_40px_rgba(0,255,180,0.4)] p-6 md:p-10 border border-green-400/30">
        {/* 🖼️ Product Image with Neon Glow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotateY: 15 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ duration: 0.8 }}
          className="relative flex justify-center items-center"
        >
          <div className="absolute inset-0 blur-3xl bg-green-500/30 rounded-full animate-pulse"></div>
          <Image
            src={product.image}
            alt={product.name}
            width={420}
            height={420}
            className="relative z-10 rounded-2xl object-cover w-full max-w-sm shadow-[0_0_25px_#00ffcc]"
          />
        </motion.div>

        {/* 🧾 Product Details */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-green-300 drop-shadow-[0_0_10px_#00ffcc]">
            {product.name}
          </h1>
          <p className="text-yellow-400 flex items-center mt-2">
            {Array.from({ length: Math.round(product.rating) }).map((_, i) => (
              <Star key={i} size={18} fill="#facc15" stroke="none" />
            ))}
            <span className="ml-2 text-gray-300">{product.rating.toFixed(1)}</span>
          </p>

          <p className="text-gray-300 mt-4 leading-relaxed">{product.description}</p>

          <h2 className="text-3xl font-semibold mt-6 text-green-400">
            ৳ {product.price.toLocaleString("bn-BD")}
          </h2>

          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 25px #00ffcc" }}
            whileTap={{ scale: 0.95 }}
            className="mt-8 px-8 py-3 bg-gradient-to-r from-green-500 to-teal-400 text-black font-semibold rounded-xl flex items-center gap-2 transition-all"
          >
            <ShoppingCart size={20} /> Add to Cart
          </motion.button>
        </div>
      </div>

      {/* 🟨 Suggested Products */}
      <div className="max-w-6xl mx-auto mt-14">
        <h2 className="text-2xl font-bold mb-6 text-green-300 drop-shadow-[0_0_10px_#00ffcc]">
          🔮 Suggested Products
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {suggested.map((p) => (
            <motion.div
              key={p.id}
              whileHover={{ scale: 1.08, rotateY: 10 }}
              transition={{ type: "spring", stiffness: 150 }}
              className="bg-gray-900/60 border border-green-400/20 rounded-xl p-4 cursor-pointer hover:shadow-[0_0_25px_#00ffcc] transition-all"
            >
              <div className="relative">
                <div className="absolute inset-0 blur-xl bg-green-400/20 rounded-lg"></div>
                <Image
                  src={p.image}
                  alt={p.name}
                  width={220}
                  height={220}
                  className="relative rounded-lg object-cover w-full mx-auto"
                />
              </div>
              <h3 className="text-lg font-semibold mt-3 text-white">{p.name}</h3>
              <p className="text-green-400 font-medium">৳ {p.price}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 🟦 Reviews Section */}
      <div className="max-w-4xl mx-auto mt-14 bg-gray-900/60 backdrop-blur-xl p-6 rounded-2xl shadow-[0_0_25px_rgba(0,255,204,0.3)] border border-green-400/20">
        <h2 className="text-2xl font-bold mb-4 text-green-300 drop-shadow-[0_0_10px_#00ffcc]">
          💬 Customer Reviews
        </h2>
        {[
          { user: "Rashid", comment: "Absolutely amazing! The neon glow looks premium.", stars: 5 },
          { user: "Sara", comment: "Stylish and functional – perfect for gifts.", stars: 4 },
        ].map((r, i) => (
          <div key={i} className="border-b border-green-500/20 py-3">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-white">{r.user}</p>
              <div className="flex text-yellow-400">
                {Array.from({ length: r.stars }).map((_, j) => (
                  <Star key={j} size={14} fill="#facc15" stroke="none" />
                ))}
              </div>
            </div>
            <p className="text-gray-300">{r.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}






// // app/products/[id]/page.tsx
// import { Metadata } from "next";
// import Image from "next/image";
// import { Star, ShoppingCart } from "lucide-react";
// import { motion } from "framer-motion";

// // 🟩 SEO Metadata
// export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
//   const productName = "Smart Watch Pro X";
//   return {
//     title: `${productName} | RShop`,
//     description: `Buy ${productName} at the best price in Bangladesh. Features include heart rate monitor, Bluetooth call, and AMOLED display.`,
//     openGraph: {
//       title: `${productName} | RShop`,
//       description: `Smart Watch Pro X — best smartwatch in Bangladesh with AMOLED display.`,
//       images: ["/watch.jpg"],
//     },
//     twitter: {
//       card: "summary_large_image",
//       title: productName,
//       description: "Buy Smart Watch Pro X online from RShop",
//       images: ["/watch.jpg"],
//     },
//     keywords: ["Smart Watch", "Watch Bangladesh", "RShop", "Electronics", "স্মার্ট ওয়াচ"],
//   };
// }

// // 🟦 Simulated API (Replace with Laravel API later)
// async function getProduct(id: string) {
//   // Replace with: const res = await fetch(`https://yourapi.com/products/${id}`, { cache: "no-store" });
//   return {
//     id,
//     name: "Smart Watch Pro X",
//     price: 8500,
//     image: "/watch.jpg",
//     description:
//       "Smart Watch Pro X with heart rate monitor, Bluetooth call, and AMOLED display.",
//     rating: 4.6,
//   };
// }

// async function getSuggestedProducts() {
//   return [
//     { id: 2, name: "Smart Band 7", price: 3200, image: "/band.jpg", rating: 4.2 },
//     { id: 3, name: "Galaxy Watch 5", price: 12900, image: "/galaxy.jpg", rating: 4.8 },
//     { id: 4, name: "Amazfit Fit", price: 5800, image: "/amazfit.jpg", rating: 4.3 },
//   ];
// }

// export default async function ProductPage({ params }: { params: { id: string } }) {
//   const product = await getProduct(params.id);
//   const suggested = await getSuggestedProducts();

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 px-4 sm:px-6 py-8">
//       {/* 🟩 Product Section */}
//       <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 bg-white rounded-2xl shadow-lg p-6 md:p-10">
//         <motion.div
//           initial={{ opacity: 0, scale: 0.9 }}
//           animate={{ opacity: 1, scale: 1 }}
//           transition={{ duration: 0.6 }}
//           className="flex justify-center items-center"
//         >
//           <Image
//             src={product.image}
//             alt={product.name}
//             width={400}
//             height={400}
//             className="rounded-xl object-cover w-full h-auto max-h-[400px]"
//             priority
//           />
//         </motion.div>

//         <div>
//           <h1 className="text-3xl md:text-4xl font-bold mb-2">{product.name}</h1>

//           <p className="text-yellow-500 flex items-center">
//             {Array.from({ length: Math.round(product.rating) }).map((_, i) => (
//               <Star key={i} size={18} fill="gold" stroke="none" />
//             ))}
//             <span className="ml-2 text-gray-600 text-sm">{product.rating.toFixed(1)}</span>
//           </p>

//           <p className="text-gray-600 mt-3 leading-relaxed">{product.description}</p>

//           <h2 className="text-2xl font-semibold mt-4 text-green-600">
//             ৳ {product.price.toLocaleString("bn-BD")}
//           </h2>

//           <motion.button
//             whileTap={{ scale: 0.9 }}
//             className="mt-6 px-6 py-3 bg-green-600 text-white font-medium rounded-xl flex items-center gap-2 hover:bg-green-700 transition"
//           >
//             <ShoppingCart size={18} /> Add to Cart
//           </motion.button>
//         </div>
//       </div>

//       {/* 🟨 Suggested Products */}
//       <div className="max-w-6xl mx-auto mt-12">
//         <h2 className="text-2xl font-bold mb-4">Suggested Products</h2>
//         <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
//           {suggested.map((p) => (
//             <motion.div
//               key={p.id}
//               whileHover={{ scale: 1.05, y: -5 }}
//               transition={{ type: "spring", stiffness: 200 }}
//               className="bg-white shadow-md rounded-xl p-3 cursor-pointer hover:shadow-lg transition"
//             >
//               <Image
//                 src={p.image}
//                 alt={p.name}
//                 width={200}
//                 height={200}
//                 className="rounded-lg object-cover w-full h-auto"
//               />
//               <h3 className="text-lg font-semibold mt-2">{p.name}</h3>
//               <p className="text-green-600 font-medium">৳ {p.price}</p>
//             </motion.div>
//           ))}
//         </div>
//       </div>

//       {/* 🟦 Reviews Section */}
//       <div className="max-w-4xl mx-auto mt-12 bg-white p-6 rounded-2xl shadow">
//         <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
//         {[
//           { user: "Rashid", comment: "Great product!", stars: 5 },
//           { user: "Sara", comment: "Value for money!", stars: 4 },
//         ].map((r, i) => (
//           <div key={i} className="border-b border-gray-200 py-3">
//             <div className="flex items-center gap-2">
//               <p className="font-semibold">{r.user}</p>
//               <div className="flex text-yellow-500">
//                 {Array.from({ length: r.stars }).map((_, j) => (
//                   <Star key={j} size={14} fill="gold" stroke="none" />
//                 ))}
//               </div>
//             </div>
//             <p className="text-gray-700">{r.comment}</p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }




// 'use client';

// import { useEffect, useState } from "react";
// import Image from "next/image";
// import { motion } from "framer-motion";
// import { Star, ShoppingCart, ArrowRight } from "lucide-react";

// interface Product {
//   id: number;
//   name: string;
//   price: number;
//   image: string;
//   description: string;
//   rating: number;
// }

// export default function ProductPage({ params }: { params: { id: string } }) {
//   const [product, setProduct] = useState<Product | null>(null);
//   const [suggested, setSuggested] = useState<Product[]>([]);
//   const [reviews, setReviews] = useState([
//     { user: "Rashid", comment: "Great product!", stars: 5 },
//     { user: "Sara", comment: "Value for money!", stars: 4 },
//   ]);

//   useEffect(() => {
//     // 🔹 Simulated API fetch
//     const fetchedProduct = {
//       id: 1,
//       name: "Smart Watch Pro X",
//       price: 8500,
//       image: "/watch.jpg",
//       description:
//         "Smart Watch Pro X with heart rate monitor, Bluetooth call, and AMOLED display.",
//       rating: 4.6,
//     };
//     const similarProducts = [
//       { id: 2, name: "Smart Band 7", price: 3200, image: "/band.jpg", description: "", rating: 4.2 },
//       { id: 3, name: "Galaxy Watch 5", price: 12900, image: "/galaxy.jpg", description: "", rating: 4.8 },
//       { id: 4, name: "Amazfit Fit", price: 5800, image: "/amazfit.jpg", description: "", rating: 4.3 },
//     ];
//     setProduct(fetchedProduct);
//     setSuggested(similarProducts);
//   }, [params.id]);

//   if (!product) return <div className="text-center py-10">Loading...</div>;

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 p-4 md:p-8">
//       {/* 🟩 Product Section */}
//       <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 bg-white rounded-2xl shadow-lg p-6">
//         <motion.div
//           initial={{ opacity: 0, scale: 0.9 }}
//           animate={{ opacity: 1, scale: 1 }}
//           transition={{ duration: 0.6 }}
//           className="flex justify-center"
//         >
//           <Image
//             src={product.image}
//             alt={product.name}
//             width={400}
//             height={400}
//             className="rounded-xl object-cover"
//           />
//         </motion.div>

//         <div>
//           <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
//           <p className="text-yellow-500 flex items-center">
//             {Array.from({ length: Math.round(product.rating) }).map((_, i) => (
//               <Star key={i} size={18} fill="gold" stroke="none" />
//             ))}
//             <span className="ml-2 text-gray-600">{product.rating.toFixed(1)}</span>
//           </p>

//           <p className="text-gray-600 mt-3">{product.description}</p>
//           <h2 className="text-2xl font-semibold mt-4 text-green-600">
//             ৳ {product.price.toLocaleString("bn-BD")}
//           </h2>

//           <motion.button
//             whileTap={{ scale: 0.9 }}
//             className="mt-6 px-6 py-3 bg-green-600 text-white font-medium rounded-xl flex items-center gap-2 hover:bg-green-700 transition"
//           >
//             <ShoppingCart size={18} /> Add to Cart
//           </motion.button>
//         </div>
//       </div>

//       {/* 🟨 Suggested Products */}
//       <div className="max-w-6xl mx-auto mt-10">
//         <h2 className="text-2xl font-bold mb-4">Suggested Products</h2>
//         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//           {suggested.map((p) => (
//             <motion.div
//               key={p.id}
//               whileHover={{ scale: 1.05 }}
//               className="bg-white shadow-md rounded-xl p-3 cursor-pointer hover:shadow-lg"
//             >
//               <Image
//                 src={p.image}
//                 alt={p.name}
//                 width={200}
//                 height={200}
//                 className="rounded-lg object-cover mx-auto"
//               />
//               <h3 className="text-lg font-semibold mt-2">{p.name}</h3>
//               <p className="text-green-600 font-medium">৳ {p.price}</p>
//             </motion.div>
//           ))}
//         </div>
//       </div>

//       {/* 🟦 Reviews Section */}
//       <div className="max-w-4xl mx-auto mt-10 bg-white p-6 rounded-2xl shadow">
//         <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
//         {reviews.map((r, i) => (
//           <div key={i} className="border-b border-gray-200 py-3">
//             <div className="flex items-center gap-2">
//               <p className="font-semibold">{r.user}</p>
//               <div className="flex text-yellow-500">
//                 {Array.from({ length: r.stars }).map((_, j) => (
//                   <Star key={j} size={14} fill="gold" stroke="none" />
//                 ))}
//               </div>
//             </div>
//             <p className="text-gray-700">{r.comment}</p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }








// "use client";

// import { useState } from "react";
// import Image from "next/image";
// import { motion } from "framer-motion";
// import Head from "next/head";

// interface Product {
//   id: number;
//   name: string;
//   price: number;
//   description: string;
//   image: string;
//   category: string;
// }

// interface Props {
//   product: Product;
// }

// export default function ProductView(){
//   const [quantity, setQuantity] = useState(1);






//   const addToCart = () => {
//     let cart = JSON.parse(localStorage.getItem("cart") || "[]");
//     const exist = cart.find((item: any) => item.id === product.id);
//     if (exist) {
//       exist.quantity += quantity;
//     } else {
//       cart.push({ ...product, quantity });
//     }
//     localStorage.setItem("cart", JSON.stringify(cart));
//     alert("Product added to cart!");
//   };

//   return (
//     <>
//       {/* SEO Meta */}
//       <Head>
//         <title>{product.name} | MyShop</title>
//         <meta name="description" content={product.description} />
//         <meta property="og:title" content={product.name} />
//         <meta property="og:description" content={product.description} />
//         <meta property="og:image" content={product.image} />
//         <script
//           type="application/ld+json"
//           dangerouslySetInnerHTML={{
//             __html: JSON.stringify({
//               "@context": "https://schema.org",
//               "@type": "Product",
//               name: product.name,
//               image: product.image,
//               description: product.description,
//               sku: product.id,
//               offers: {
//                 "@type": "Offer",
//                 priceCurrency: "BDT",
//                 price: product.price,
//                 availability: "https://schema.org/InStock",
//               },
//             }),
//           }}
//         />
//       </Head>

//       {/* Product Section */}
//       <div className="max-w-7xl mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-8">
//         {/* Product Image */}
//         <motion.div
//           className="md:w-1/2 w-full rounded-lg overflow-hidden cursor-zoom-in"
//           whileHover={{ scale: 1.05 }}
//         >
//           <Image
//             src={product.image}
//             alt={product.name}
//             width={600}
//             height={600}
//             className="w-full h-auto object-cover rounded-lg"
//           />
//         </motion.div>

//         {/* Product Details */}
//         <div className="md:w-1/2 flex flex-col gap-4">
//           <h1 className="text-3xl md:text-4xl font-bold">{product.name}</h1>
//           <p className="text-2xl text-green-600 font-semibold">৳ {product.price}</p>
//           <p className="text-gray-700 text-base md:text-lg">{product.description}</p>

//           {/* Quantity Selector */}
//           <div className="flex items-center gap-3 mt-4">
//             <button
//               onClick={() => setQuantity((q) => Math.max(1, q - 1))}
//               className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition"
//             >
//               -
//             </button>
//             <span className="text-lg">{quantity}</span>
//             <button
//               onClick={() => setQuantity((q) => q + 1)}
//               className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition"
//             >
//               +
//             </button>
//           </div>

//           {/* Add to Cart */}
//           <motion.button
//             onClick={addToCart}
//             whileTap={{ scale: 0.95 }}
//             className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition w-full md:w-auto"
//           >
//             Add to Cart
//           </motion.button>

//           {/* Category */}
//           <p className="text-gray-500 mt-2">Category: {product.category}</p>
//         </div>
//       </div>

//       {/* Reviews Section */}
//       <div className="max-w-7xl mx-auto p-4 md:p-8 border-t border-gray-200 mt-10">
//         <h2 className="text-2xl font-bold mb-5">Reviews</h2>
//         <div className="flex flex-col gap-4">
//           <div className="p-3 border rounded">
//             <p className="font-semibold">Rashidul</p>
//             <p className="text-gray-600">★★★★★ Amazing product!</p>
//           </div>
//           <div className="p-3 border rounded">
//             <p className="font-semibold">Sadia</p>
//             <p className="text-gray-600">★★★★ Very good, recommended.</p>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }





// "use client";

// import { Canvas, useFrame } from "@react-three/fiber";
// import { useState, useRef, useEffect } from "react";
// import { OrbitControls, Sparkles, Stars } from "@react-three/drei";
// import * as THREE from "three";

// // ---------------- Player Ship ----------------
// function Player({ bullets, setBullets }: any) {
//   const ref = useRef<any>();
//   const speed = 0.25;

//   useEffect(() => {
//     const handleKey = (e: KeyboardEvent) => {
//       if (!ref.current) return;

//       if (e.key === "ArrowLeft") ref.current.position.x -= speed;
//       if (e.key === "ArrowRight") ref.current.position.x += speed;

//       if (e.key === " ") {
//         // Bullet spawn
//         setBullets((prev: any[]) => [
//           ...prev,
//           { position: [...ref.current.position], id: Math.random() },
//         ]);
//       }
//     };
//     window.addEventListener("keydown", handleKey);
//     return () => window.removeEventListener("keydown", handleKey);
//   }, [setBullets]);

//   return (
//     <mesh ref={ref} position={[0, -3, 0]}>
//       <coneGeometry args={[0.3, 1, 16]} />
//       <meshStandardMaterial color="#00ffff" emissive="#00ffff" />
//     </mesh>
//   );
// }

// // ---------------- Bullets ----------------
// function Bullets({ bullets }: any) {
//   return (
//     <>
//       {bullets.map((b: any) => (
//         <mesh key={b.id} position={b.position}>
//           <sphereGeometry args={[0.12, 12, 12]} />
//           <meshStandardMaterial color="#ff00ff" emissive="#ff00ff" />
//           {/* Neon trail effect */}
//           <Sparkles size={5} scale={[0.2, 0.5, 0.2]} speed={1} />
//         </mesh>
//       ))}
//     </>
//   );
// }

// // ---------------- Enemy ----------------
// function Enemy({ position }: any) {
//   const ref = useRef<any>();
//   useFrame(() => {
//     if (ref.current) ref.current.position.y -= 0.015;
//   });
//   return (
//     <mesh ref={ref} position={position}>
//       <boxGeometry args={[0.6, 0.6, 0.6]} />
//       <meshStandardMaterial color="#ff3333" emissive="#ff3333" />
//     </mesh>
//   );
// }

// // ---------------- Explosion ----------------
// function Explosion({ position }: any) {
//   const meshRef = useRef<any>();
//   const [scale, setScale] = useState(0.1);

//   useFrame(() => {
//     setScale((s) => s + 0.2);
//   });

//   return (
//     <mesh ref={meshRef} position={position} scale={[scale, scale, scale]}>
//       <sphereGeometry args={[0.2, 16, 16]} />
//       <meshStandardMaterial color="#ffff00" emissive="#ffff00" transparent opacity={1 - scale / 5} />
//     </mesh>
//   );
// }

// // ---------------- Main Game ----------------
// export default function Game() {
//   const [bullets, setBullets] = useState<any[]>([]);
//   const [enemies, setEnemies] = useState<any[]>([]);
//   const [explosions, setExplosions] = useState<any[]>([]);

//   // Enemy spawn waves
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setEnemies((prev) => [
//         ...prev,
//         { position: [Math.random() * 6 - 3, 4, 0], id: Math.random() },
//       ]);
//     }, 1500);
//     return () => clearInterval(interval);
//   }, []);

//   // Bullet & collision logic
//   useFrame(() => {
//     // Move bullets up
//     setBullets((prev) =>
//       prev
//         .map((b) => ({ ...b, position: [b.position[0], b.position[1] + 0.25, 0] }))
//         .filter((b) => b.position[1] < 5)
//     );

//     // Collision detection
//     setEnemies((prevEnemies) => {
//       return prevEnemies.filter((enemy) => {
//         const hitIndex = bullets.findIndex(
//           (b) =>
//             Math.abs(b.position[0] - enemy.position[0]) < 0.35 &&
//             Math.abs(b.position[1] - enemy.position[1]) < 0.35
//         );
//         if (hitIndex !== -1) {
//           // Spawn explosion
//           setExplosions((exp) => [...exp, { position: enemy.position, id: Math.random() }]);
//           // Remove bullet
//           setBullets((b) => b.filter((_, i) => i !== hitIndex));
//           return false; // remove enemy
//         }
//         return true;
//       });
//     });

//     // Remove explosions after some scale
//     setExplosions((prev) => prev.filter((e) => e));
//   });

//   return (
//     <div className="w-full h-screen bg-black">
//       <Canvas camera={{ position: [0, 0, 7] }}>
//         <ambientLight intensity={0.5} />
//         <pointLight position={[10, 10, 10]} />
//         <Stars radius={100} depth={50} count={5000} factor={4} saturation={0.5} fade />
//         <Player bullets={bullets} setBullets={setBullets} />
//         <Bullets bullets={bullets} />
//         {enemies.map((enemy) => (
//           <Enemy key={enemy.id} position={enemy.position} />
//         ))}
//         {explosions.map((exp) => (
//           <Explosion key={exp.id} position={exp.position} />
//         ))}
//         <OrbitControls />
//       </Canvas>
//     </div>
//   );
// }







// // "use client";

// // import { useState } from "react";
// // import { motion } from "framer-motion";

// // export default function NeonCoinFlipGame() {
// //   const [flipping, setFlipping] = useState(false);
// //   const [result, setResult] = useState<null | "Heads" | "Tails">(null);

// //   const flipCoin = () => {
// //     if (flipping) return;
// //     setFlipping(true);
// //     setResult(null);

// //     setTimeout(() => {
// //       const outcome = Math.random() > 0.5 ? "Heads" : "Tails";
// //       setResult(outcome);
// //       setFlipping(false);
// //     }, 2000);
// //   };

// //   return (
// //     <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
// //       <motion.div
// //         className="w-40 h-40 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 flex items-center justify-center text-2xl font-bold shadow-[0_0_30px_rgba(255,0,255,0.7)]"
// //         animate={flipping ? { rotateY: [0, 720] } : {}}
// //         transition={{ duration: 2, ease: "easeInOut" }}
// //       >
// //         {result ? result : "?"}
// //       </motion.div>

// //       <button
// //         onClick={flipCoin}
// //         disabled={flipping}
// //         className="mt-6 px-6 py-2 text-lg font-semibold rounded-lg bg-gradient-to-r from-cyan-400 to-purple-600 shadow-[0_0_20px_rgba(0,255,255,0.7)] hover:scale-110 transition-transform"
// //       >
// //         {flipping ? "Flipping..." : "Flip Coin"}
// //       </button>

// //       {result && (
// //         <motion.p
// //           className="mt-4 text-2xl font-bold text-cyan-300"
// //           initial={{ opacity: 0 }}
// //           animate={{ opacity: 1 }}
// //         >
// //           🎉 You got <span className="text-pink-400">{result}</span>!
// //         </motion.p>
// //       )}
// //     </div>
// //   );
// // }





// "use client";

// import { Canvas, useFrame } from "@react-three/fiber";
// import { useState, useRef, useEffect } from "react";
// import * as THREE from "three";
// import { OrbitControls } from "@react-three/drei";

// // Player Ship
// function Player({ bullets, setBullets }: any) {
//   const ref = useRef<any>();
//   const speed = 0.2;

//   // Move with keyboard
//   useEffect(() => {
//     const handleKey = (e: KeyboardEvent) => {
//       if (ref.current) {
//         if (e.key === "ArrowLeft") ref.current.position.x -= speed;
//         if (e.key === "ArrowRight") ref.current.position.x += speed;
//         if (e.key === " ") {
//           setBullets((prev: any[]) => [
//             ...prev,
//             { position: [ref.current.position.x, -2, 0] },
//           ]);
//         }
//       }
//     };
//     window.addEventListener("keydown", handleKey);
//     return () => window.removeEventListener("keydown", handleKey);
//   }, [setBullets]);

//   return (
//     <mesh ref={ref} position={[0, -3, 0]}>
//       <coneGeometry args={[0.3, 1, 16]} />
//       <meshStandardMaterial color={"#00ffff"} emissive={"#00ffff"} />
//     </mesh>
//   );
// }

// // Bullet
// function Bullets({ bullets }: any) {
//   return bullets.map((b: any, i: number) => (
//     <mesh key={i} position={b.position}>
//       <sphereGeometry args={[0.1, 8, 8]} />
//       <meshStandardMaterial color={"#ff00ff"} emissive={"#ff00ff"} />
//     </mesh>
//   ));
// }

// // Enemy
// function Enemy({ enemy, index }: any) {
//   const ref = useRef<any>();
//   useFrame(() => {
//     if (ref.current) {
//       ref.current.position.y -= 0.01;
//     }
//   });
//   return (
//     <mesh ref={ref} position={enemy.position}>
//       <boxGeometry args={[0.6, 0.6, 0.6]} />
//       <meshStandardMaterial color={"#ff3333"} emissive={"#ff3333"} />
//     </mesh>
//   );
// }

// export default function Game() {
//   const [bullets, setBullets] = useState<any[]>([]);
//   const [enemies, setEnemies] = useState<any[]>([]);

//   // Enemy spawn waves
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setEnemies((prev) => [
//         ...prev,
//         { position: [Math.random() * 6 - 3, 4, 0] },
//       ]);
//     }, 2000);
//     return () => clearInterval(interval);
//   }, []);

//   // Bullet move
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setBullets((prev) =>
//         prev.map((b) => ({
//           ...b,
//           position: [b.position[0], b.position[1] + 0.2, 0],
//         }))
//       );
//     }, 50);
//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <div className="w-full h-screen bg-black">
//       <Canvas camera={{ position: [0, 0, 7] }}>
//         <ambientLight intensity={0.5} />
//         <pointLight position={[10, 10, 10]} />
//         <Player bullets={bullets} setBullets={setBullets} />
//         <Bullets bullets={bullets} />
//         {enemies.map((enemy, i) => (
//           <Enemy key={i} enemy={enemy} index={i} />
//         ))}
//         <OrbitControls />
//       </Canvas>
//     </div>
//   );
// }





































// "use client";

// import { Canvas, useFrame } from "@react-three/fiber";
// import { useState, useRef, useEffect } from "react";
// import * as THREE from "three";
// import { OrbitControls } from "@react-three/drei";

// // Player Ship
// function Player({ bullets, setBullets }: any) {
//   const ref = useRef<any>();
//   const speed = 0.2;

//   // Move with keyboard
//   useEffect(() => {
//     const handleKey = (e: KeyboardEvent) => {
//       if (ref.current) {
//         if (e.key === "ArrowLeft") ref.current.position.x -= speed;
//         if (e.key === "ArrowRight") ref.current.position.x += speed;
//         if (e.key === " ") {
//           setBullets((prev: any[]) => [
//             ...prev,
//             { position: [ref.current.position.x, -2, 0] },
//           ]);
//         }
//       }
//     };
//     window.addEventListener("keydown", handleKey);
//     return () => window.removeEventListener("keydown", handleKey);
//   }, [setBullets]);

//   return (
//     <mesh ref={ref} position={[0, -3, 0]}>
//       <coneGeometry args={[0.3, 1, 16]} />
//       <meshStandardMaterial color={"#00ffff"} emissive={"#00ffff"} />
//     </mesh>
//   );
// }

// // Bullet
// function Bullets({ bullets }: any) {
//   return bullets.map((b: any, i: number) => (
//     <mesh key={i} position={b.position}>
//       <sphereGeometry args={[0.1, 8, 8]} />
//       <meshStandardMaterial color={"#ff00ff"} emissive={"#ff00ff"} />
//     </mesh>
//   ));
// }

// // Enemy
// function Enemy({ enemy, index }: any) {
//   const ref = useRef<any>();
//   useFrame(() => {
//     if (ref.current) {
//       ref.current.position.y -= 0.01;
//     }
//   });
//   return (
//     <mesh ref={ref} position={enemy.position}>
//       <boxGeometry args={[0.6, 0.6, 0.6]} />
//       <meshStandardMaterial color={"#ff3333"} emissive={"#ff3333"} />
//     </mesh>
//   );
// }

// export default function Game() {
//   const [bullets, setBullets] = useState<any[]>([]);
//   const [enemies, setEnemies] = useState<any[]>([]);

//   // Enemy spawn waves
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setEnemies((prev) => [
//         ...prev,
//         { position: [Math.random() * 6 - 3, 4, 0] },
//       ]);
//     }, 2000);
//     return () => clearInterval(interval);
//   }, []);

//   // Bullet move
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setBullets((prev) =>
//         prev.map((b) => ({
//           ...b,
//           position: [b.position[0], b.position[1] + 0.2, 0],
//         }))
//       );
//     }, 50);
//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <div className="w-full h-screen bg-black">
//       <Canvas camera={{ position: [0, 0, 7] }}>
//         <ambientLight intensity={0.5} />
//         <pointLight position={[10, 10, 10]} />
//         <Player bullets={bullets} setBullets={setBullets} />
//         <Bullets bullets={bullets} />
//         {enemies.map((enemy, i) => (
//           <Enemy key={i} enemy={enemy} index={i} />
//         ))}
//         <OrbitControls />
//       </Canvas>
//     </div>
//   );
// }





// import React, { useRef, useState, useEffect, useCallback } from "react";
// import { Canvas, useFrame, useThree } from "@react-three/fiber";
// import { OrbitControls, Stars, Html, useTexture } from "@react-three/drei";
// import { Bloom, EffectComposer } from "@react-three/postprocessing";
// import * as THREE from "three";

// type Vec3 = [number, number, number];

// /* ---------------------------
//    Helpers / small primitives
//    --------------------------- */
// function NeonShip(props: { position: Vec3; rotation?: Vec3 }) {
//   // simple ship using boxes & cones with emissive materials for neon look
//   return (
//     <group position={props.position} rotation={(props.rotation as any) ?? [0, 0, 0]}>
//       <mesh position={[0, 0, 0]}>
//         <boxGeometry args={[1.6, 0.6, 2]} />
//         <meshStandardMaterial color="#0ef28b" emissive="#0ef28b" emissiveIntensity={0.9} metalness={0.2} roughness={0.1} />
//       </mesh>

//       {/* cockpit */}
//       <mesh position={[0, 0.25, 0.3]}>
//         <sphereGeometry args={[0.35, 16, 12]} />
//         <meshStandardMaterial color="#6df0ff" emissive="#6df0ff" emissiveIntensity={0.9} transparent opacity={0.95} roughness={0.1} />
//       </mesh>

//       {/* wings */}
//       <mesh position={[-0.9, -0.05, -0.2]} rotation={[0, 0, 0.3]}>
//         <boxGeometry args={[0.6, 0.12, 1.4]} />
//         <meshStandardMaterial color="#15b3ff" emissive="#15b3ff" emissiveIntensity={0.6} roughness={0.15} />
//       </mesh>
//       <mesh position={[0.9, -0.05, -0.2]} rotation={[0, 0, -0.3]}>
//         <boxGeometry args={[0.6, 0.12, 1.4]} />
//         <meshStandardMaterial color="#15b3ff" emissive="#15b3ff" emissiveIntensity={0.6} roughness={0.15} />
//       </mesh>

//       {/* thrusters */}
//       <mesh position={[-0.4, -0.18, 1.05]}>
//         <cylinderGeometry args={[0.12, 0.12, 0.5, 10]} />
//         <meshStandardMaterial color="#ffd166" emissive="#ffd166" emissiveIntensity={1} />
//       </mesh>
//       <mesh position={[0.4, -0.18, 1.05]}>
//         <cylinderGeometry args={[0.12, 0.12, 0.5, 10]} />
//         <meshStandardMaterial color="#ffd166" emissive="#ffd166" emissiveIntensity={1} />
//       </mesh>
//     </group>
//   );
// }

// /* ---------------------------
//    Main Scene / game logic
//    --------------------------- */
// function Scene({
//   onScore,
//   onGameOver,
//   paused,
// }: {
//   onScore: (inc: number) => void;
//   onGameOver: (lives: number) => void;
//   paused: boolean;
// }) {
//   const shipRef = useRef<any>();
//   const bulletsRef = useRef<any[]>([]);
//   const enemiesRef = useRef<any[]>([]);
//   const { viewport } = useThree();
//   const [shipX, setShipX] = useState(0);
//   const [lives, setLives] = useState(3);

//   // create enemy grid on mount
//   useEffect(() => {
//     const grid: any[] = [];
//     const rows = 4;
//     const cols = 8;
//     const startZ = -8;
//     const gapX = 1.8;
//     const gapY = 1.2;
//     for (let r = 0; r < rows; r++) {
//       for (let c = 0; c < cols; c++) {
//         grid.push({
//           id: `${r}-${c}`,
//           pos: new THREE.Vector3((c - (cols - 1) / 2) * gapX, (rows - 1 - r) * gapY + 3, startZ - r * 0.1),
//           alive: true,
//         });
//       }
//     }
//     enemiesRef.current = grid;
//   }, []);

//   // controls: keyboard and mouse/touch
//   useEffect(() => {
//     const keys: any = {};
//     const onKeyDown = (e: KeyboardEvent) => (keys[e.code] = true);
//     const onKeyUp = (e: KeyboardEvent) => (keys[e.code] = false);

//     window.addEventListener("keydown", onKeyDown);
//     window.addEventListener("keyup", onKeyUp);

//     let shootCooldown = 0;
//     const loop = () => {
//       if (paused) return;
//       // move left/right
//       if (keys["ArrowLeft"] || keys["KeyA"]) setShipX((x) => Math.max(x - 0.12, -viewport.width / 3));
//       if (keys["ArrowRight"] || keys["KeyD"]) setShipX((x) => Math.min(x + 0.12, viewport.width / 3));

//       // shoot
//       if (keys["Space"] || keys["Spacebar"] || keys["KeyK"]) {
//         if (shootCooldown <= 0) {
//           spawnBullet();
//           shootCooldown = 10;
//         }
//       }
//       if (shootCooldown > 0) shootCooldown--;
//       requestAnimationFrame(loop);
//     };
//     loop();

//     return () => {
//       window.removeEventListener("keydown", onKeyDown);
//       window.removeEventListener("keyup", onKeyUp);
//     };
//   }, [viewport.width, paused]);

//   // touch/mouse drag for mobile
//   useEffect(() => {
//     let dragging = false;
//     const onPointerDown = (e: PointerEvent) => {
//       dragging = true;
//     };
//     const onPointerUp = (e: PointerEvent) => {
//       dragging = false;
//     };
//     const onPointerMove = (e: PointerEvent) => {
//       if (!dragging) return;
//       const xN = (e.clientX / window.innerWidth) * 2 - 1;
//       // map -1..1 to playable width
//       setShipX(xN * (viewport.width / 3));
//     };
//     window.addEventListener("pointerdown", onPointerDown);
//     window.addEventListener("pointerup", onPointerUp);
//     window.addEventListener("pointermove", onPointerMove);
//     return () => {
//       window.removeEventListener("pointerdown", onPointerDown);
//       window.removeEventListener("pointerup", onPointerUp);
//       window.removeEventListener("pointermove", onPointerMove);
//     };
//   }, [viewport.width]);

//   const spawnBullet = useCallback(() => {
//     bulletsRef.current.push({
//       pos: new THREE.Vector3(shipX, -2.2, -0.5),
//       speed: 0.5,
//     });
//   }, [shipX]);

//   // main frame loop
//   useFrame((state, delta) => {
//     if (paused) return;

//     // update ship position (lerp for smoothness)
//     if (shipRef.current) {
//       shipRef.current.position.x += (shipX - shipRef.current.position.x) * 0.2;
//     }

//     // update bullets
//     bulletsRef.current.forEach((b, i) => {
//       b.pos.y += b.speed;
//       // remove when offscreen
//       if (b.pos.y > 8) bulletsRef.current.splice(i, 1);
//     });

//     // simple enemy movement: slight horizontal oscillation + descend slowly
//     enemiesRef.current.forEach((en, idx) => {
//       if (!en.alive) return;
//       const t = state.clock.elapsedTime;
//       en.pos.x += Math.sin(t + idx) * 0.002; // tiny wiggle
//       en.pos.y -= 0.0006; // gradual descend
//     });

//     // collision bullet vs enemy
//     bulletsRef.current.forEach((b, bi) => {
//       enemiesRef.current.forEach((en, ei) => {
//         if (!en.alive) return;
//         const dx = b.pos.x - en.pos.x;
//         const dy = b.pos.y - en.pos.y;
//         const dist = Math.sqrt(dx * dx + dy * dy);
//         if (dist < 0.6) {
//           // hit
//           en.alive = false;
//           bulletsRef.current.splice(bi, 1);
//           onScore(10);
//         }
//       });
//     });

//     // enemies reach bottom -> damage
//     enemiesRef.current.forEach((en) => {
//       if (!en.alive) return;
//       if (en.pos.y < -2) {
//         en.alive = false;
//         setLives((l) => {
//           const newL = l - 1;
//           if (newL <= 0) onGameOver(newL);
//           return newL;
//         });
//       }
//     });
//   });

//   return (
//     <>
//       {/* player's ship */}
//       <group ref={shipRef} position={[0, -2.5, 0]}>
//         <NeonShip position={[0, 0, 0]} />
//       </group>

//       {/* bullets visual */}
//       {bulletsRef.current.map((b, i) => (
//         <mesh key={i} position={[b.pos.x, b.pos.y, b.pos.z ?? -1]}>
//           <coneGeometry args={[0.08, 0.3, 6]} />
//           <meshStandardMaterial emissive="#00ff8a" color="#00ff8a" emissiveIntensity={2} />
//         </mesh>
//       ))}

//       {/* enemies */}
//       {enemiesRef.current.map((en) =>
//         en.alive ? (
//           <mesh key={en.id} position={[en.pos.x, en.pos.y - 0.2, en.pos.z]}>
//             <boxGeometry args={[0.9, 0.5, 0.9]} />
//             <meshStandardMaterial color="#ff5c8a" emissive="#ff5c8a" emissiveIntensity={0.9} metalness={0.2} roughness={0.2} />
//           </mesh>
//         ) : null
//       )}

//       {/* subtle starfield */}
//       <Stars radius={50} depth={50} count={300} factor={4} saturation={0.7} fade />

//       {/* Lights */}
//       <ambientLight intensity={0.25} color={"#ffffff"} />
//       <pointLight position={[5, 5, 5]} intensity={0.7} color={"#9ef5ff"} />
//       <pointLight position={[-5, 5, 5]} intensity={0.5} color={"#ffd166"} />

//       {/* Bloom for neon glow */}
//       <EffectComposer>
//         <Bloom luminanceThreshold={0.0} luminanceSmoothing={0.8} intensity={1.2} />
//       </EffectComposer>
//     </>
//   );
// }

// /* ---------------------------
//    Wrapper + UI overlay
//    --------------------------- */
// export default function SpaceScene3D() {
//   const [score, setScore] = useState(0);
//   const [lives, setLives] = useState(3);
//   const [paused, setPaused] = useState(false);
//   const [gameOver, setGameOver] = useState(false);

//   const handleScore = (inc: number) => setScore((s) => s + inc);
//   const handleGameOver = (remainingLives: number) => {
//     setGameOver(true);
//     setPaused(true);
//     setLives(remainingLives);
//   };

//   const restart = () => {
//     // full reload would reset scene; simpler approach: reload page
//     setPaused(false);
//     setGameOver(false);
//     setScore(0);
//     setLives(3);
//     // a robust impl would reset internal refs — for simple demo we reload
//     window.location.reload();
//   };

//   return (
//     <div className="w-screen h-screen bg-gradient-to-b from-[#05030b] via-[#0b0420] to-[#060017] relative text-white overflow-hidden">
//       {/* Top UI */}
//       <div className="absolute z-30 left-4 top-4 flex flex-col gap-2">
//         <div className="bg-black/50 backdrop-blur-md px-3 py-2 rounded-lg border border-white/10 shadow-lg flex items-center gap-3">
//           <div className="text-sm">Score</div>
//           <div className="text-xl font-extrabold text-[#7df9b6] drop-shadow-[0_0_12px_#7df9b6]">{score}</div>
//         </div>

//         <div className="bg-black/50 backdrop-blur-md px-3 py-2 rounded-lg border border-white/10 shadow-lg flex items-center gap-3">
//           <div className="text-sm">Lives</div>
//           <div className="text-lg font-semibold text-[#ffd166]">{lives}</div>
//         </div>
//       </div>

//       {/* Controls (bottom) */}
//       <div className="absolute z-30 left-1/2 -translate-x-1/2 bottom-6 flex gap-3">
//         <button
//           onClick={() => setPaused((p) => !p)}
//           className="px-4 py-2 rounded-full bg-gradient-to-r from-[#6d28d9] to-[#0ea5e9] text-white font-semibold drop-shadow-lg"
//         >
//           {paused ? "Resume" : "Pause"}
//         </button>
//         <button onClick={restart} className="px-4 py-2 rounded-full bg-black/60 border border-white/10 text-white font-semibold">
//           Restart
//         </button>
//       </div>

//       {/* center hint */}
//       <div className="absolute z-30 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
//         {!gameOver && <div className="text-sm text-white/30">Use ← → or drag/touch. Press Space / Tap to shoot</div>}
//         {gameOver && (
//           <div className="bg-black/70 px-6 py-4 rounded-2xl border border-white/10">
//             <div className="text-2xl font-bold text-red-400">Game Over</div>
//             <div className="mt-2 text-white/80">Score: {score}</div>
//             <button onClick={restart} className="mt-4 w-full px-4 py-2 rounded-lg bg-gradient-to-r from-[#ef4444] to-[#f97316] text-white font-bold">
//               Restart
//             </button>
//           </div>
//         )}
//       </div>

//       {/* 3D Canvas */}
//       <Canvas camera={{ position: [0, 0, 8], fov: 50 }} style={{ width: "100%", height: "100%" }}>
//         <Scene onScore={handleScore} onGameOver={handleGameOver} paused={paused} />
//       </Canvas>
//     </div>
//   );
// }








// import { useState, useEffect } from 'react';
// import Head from 'next/head';

// export default function Dashboard() {
//   const [isMobile, setIsMobile] = useState(false);

//   useEffect(() => {
//     const checkMobile = () => {
//       setIsMobile(window.innerWidth < 768);
//     };
    
//     checkMobile();
//     window.addEventListener('resize', checkMobile);
    
//     return () => {
//       window.removeEventListener('resize', checkMobile);
//     };
//   }, []);

//   return (
//     <>
//       <Head>
//         <title>Beta Papa Dashboard</title>
//         <meta name="description" content="Dashboard with neon glow and 3D cards" />
//         <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
//       </Head>

//       <div className="min-h-screen bg-gray-900 text-white flex flex-col">
//         <div className="container mx-auto px-4 py-8 flex-1">
//           {/* Header */}
//           <header className="flex flex-col md:flex-row justify-between items-center mb-8 py-4 border-b border-green-500/30">
//             <h1 className="text-3xl font-bold text-green-400 mb-4 md:mb-0">
//               Beta Papa <span className="text-white">hu (CEO)</span>
//             </h1>
//             <div className="flex items-center space-x-4">
//               <div className="bg-gray-800 p-3 rounded-xl shadow-lg">
//                 <i className="fas fa-crown text-green-400 text-xl"></i>
//               </div>
//               <div className="text-right">
//                 <div className="font-semibold">Grandmaster</div>
//                 <div className="text-green-400">9,711 | 8PBTT</div>
//               </div>
//             </div>
//           </header>

//           {/* Stats Grid */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//             {/* Daily Reward Card */}
//             <div className="bg-gray-800 rounded-2xl p-5 shadow-lg neon-border hover:transform hover:-translate-y-2 transition-all duration-300">
//               <div className="flex justify-between items-start mb-4">
//                 <h2 className="text-lg font-semibold">Daily reward</h2>
//                 <div className="bg-green-500/20 p-1 rounded">
//                   <i className="fas fa-gift text-green-400"></i>
//                 </div>
//               </div>
//               <p className="text-3xl font-bold text-green-400">23.35</p>
//               <div className="mt-4 flex items-center text-sm text-gray-400">
//                 <span>Daily cipher</span>
//               </div>
//             </div>

//             {/* Daily Center Card */}
//             <div className="bg-gray-800 rounded-2xl p-5 shadow-lg neon-border hover:transform hover:-translate-y-2 transition-all duration-300">
//               <div className="flex justify-between items-start mb-4">
//                 <h2 className="text-lg font-semibold">Daily center</h2>
//                 <div className="bg-green-500/20 p-1 rounded">
//                   <i className="fas fa-clock text-green-400"></i>
//                 </div>
//               </div>
//               <p className="text-3xl font-bold text-green-400">18.24</p>
//               <div className="mt-4 flex items-center text-sm text-gray-400">
//                 <span>Next reward in 3h 12m</span>
//               </div>
//             </div>

//             {/* Mini Game Card */}
//             <div className="bg-gray-800 rounded-2xl p-5 shadow-lg neon-border hover:transform hover:-translate-y-2 transition-all duration-300">
//               <div className="flex justify-between items-start mb-4">
//                 <h2 className="text-lg font-semibold">Mini game</h2>
//                 <div className="bg-green-500/20 p-1 rounded">
//                   <i className="fas fa-gamepad text-green-400"></i>
//                 </div>
//               </div>
//               <p className="text-3xl font-bold text-green-400">19.24</p>
//               <div className="mt-4">
//                 <div className="w-full bg-gray-700 rounded-full h-2.5">
//                   <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '65%' }}></div>
//                 </div>
//               </div>
//             </div>

//             {/* Grandmaster Card */}
//             <div className="bg-gray-800 rounded-2xl p-5 shadow-lg neon-border hover:transform hover:-translate-y-2 transition-all duration-300">
//               <div className="flex justify-between items-start mb-4">
//                 <h2 className="text-lg font-semibold">Grandmaster</h2>
//                 <div className="bg-green-500 text-xs px-2 py-1 rounded">8PBTT</div>
//               </div>
//               <p className="text-3xl font-bold text-green-400">9,711</p>
//               <div className="mt-4 flex items-center text-sm text-gray-400">
//                 <span className="bg-gray-700 px-2 py-1 rounded">Level 5</span>
//               </div>
//             </div>
//           </div>

//           {/* Main Content */}
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-20">
//             {/* Left Column */}
//             <div className="lg:col-span-2 space-y-6">
//               {/* Daily Cipher Section */}
//               <div className="bg-gray-800 rounded-2xl p-6 shadow-lg neon-border">
//                 <div className="flex justify-between items-center mb-6">
//                   <h2 className="text-xl font-semibold">Daily cipher</h2>
//                   <span className="text-xs text-green-400 bg-gray-700 px-2 py-1 rounded">Active</span>
//                 </div>
//                 <div className="bg-gray-700 p-4 rounded-xl mb-6">
//                   <div className="flex flex-col md:flex-row justify-between items-center">
//                     <div className="mb-4 md:mb-0">
//                       <p className="text-sm text-gray-400">Faucet</p>
//                       <p className="text-2xl font-bold text-green-400">+1,000,000</p>
//                     </div>
//                     <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all">
//                       Claim
//                     </button>
//                   </div>
//                 </div>
//                 <p className="text-sm text-gray-400">Next cipher resets in 22h 15m</p>
//               </div>

//               {/* Daily Card Section */}
//               <div className="bg-gray-800 rounded-2xl p-6 shadow-lg neon-border">
//                 <div className="flex justify-between items-center mb-6">
//                   <h2 className="text-xl font-semibold">Daily card</h2>
//                   <span className="text-sm font-bold text-green-400">8000 / 8000</span>
//                 </div>
//                 <div className="w-full bg-gray-700 rounded-full h-4 mb-4">
//                   <div className="bg-green-500 h-4 rounded-full" style={{ width: '100%' }}></div>
//                 </div>
//                 <p className="text-sm text-gray-400">Complete your daily tasks to earn rewards</p>
//               </div>
//             </div>

//             {/* Right Column */}
//             <div className="space-y-6">
//               {/* Boot Section */}
//               <div className="bg-gray-800 rounded-2xl p-6 shadow-lg neon-border hover:transform hover:-translate-y-2 transition-all duration-300">
//                 <h2 className="text-xl font-semibold mb-4">Boot</h2>
//                 <button className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all">
//                   Start Earning
//                 </button>
//               </div>

//               {/* BTC Section */}
//               <div className="bg-gray-800 rounded-2xl p-6 shadow-lg neon-border hover:transform hover:-translate-y-2 transition-all duration-300">
//                 <h2 className="text-xl font-semibold mb-4">BTC</h2>
//                 <button className="w-full bg-gray-700 hover:bg-gray-600 border border-green-500 text-green-400 py-4 rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all">
//                   Exchange
//                 </button>
//               </div>

//               {/* Playground Section */}
//               <div className="bg-gray-800 rounded-2xl p-6 shadow-lg neon-border hover:transform hover:-translate-y-2 transition-all duration-300">
//                 <h2 className="text-xl font-semibold mb-4">Playground</h2>
//                 <div className="grid grid-cols-3 gap-3">
//                   <div className="bg-gray-700 aspect-square rounded-xl flex items-center justify-center hover:bg-green-500/20 transition-colors">
//                     <i className="fas fa-gamepad text-green-400 text-xl"></i>
//                   </div>
//                   <div className="bg-gray-700 aspect-square rounded-xl flex items-center justify-center hover:bg-green-500/20 transition-colors">
//                     <i className="fas fa-dice text-green-400 text-xl"></i>
//                   </div>
//                   <div className="bg-gray-700 aspect-square rounded-xl flex items-center justify-center hover:bg-green-500/20 transition-colors">
//                     <i className="fas fa-chess text-green-400 text-xl"></i>
//                   </div>
//                 </div>
//               </div>

//               {/* Additional Sections */}
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="bg-gray-800 rounded-2xl p-4 shadow-lg text-center neon-border hover:transform hover:-translate-y-2 transition-all duration-300">
//                   <div className="bg-gray-700 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
//                     <i className="fas fa-user-friends text-green-400"></i>
//                   </div>
//                   <h3 className="font-semibold">Friends</h3>
//                 </div>
//                 <div className="bg-gray-800 rounded-2xl p-4 shadow-lg text-center neon-border hover:transform hover:-translate-y-2 transition-all duration-300">
//                   <div className="bg-gray-700 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
//                     <i className="fas fa-coins text-green-400"></i>
//                   </div>
//                   <h3 className="font-semibold">Earn</h3>
//                 </div>
//                 <div className="bg-gray-800 rounded-2xl p-4 shadow-lg text-center neon-border hover:transform hover:-translate-y-2 transition-all duration-300">
//                   <div className="bg-gray-700 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
//                     <i className="fas fa-parachute-box text-green-400"></i>
//                   </div>
//                   <h3 className="font-semibold">AirDrop</h3>
//                 </div>
//                 <div className="bg-gray-800 rounded-2xl p-4 shadow-lg text-center neon-border hover:transform hover:-translate-y-2 transition-all duration-300">
//                   <div className="bg-gray-700 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
//                     <i className="fas fa-cog text-green-400"></i>
//                   </div>
//                   <h3 className="font-semibold">Settings</h3>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Bottom Navigation (for mobile) */}
//         {isMobile && (
//           <div className="fixed bottom-0 left-0 right-0 bg-gray-800 p-4 flex justify-around border-t border-green-500/30">
//             <div className="text-center text-green-400">
//               <i className="fas fa-home block text-xl"></i>
//               <span className="text-xs">Home</span>
//             </div>
//             <div className="text-center text-gray-400">
//               <i className="fas fa-chart-line block text-xl"></i>
//               <span className="text-xs">Stats</span>
//             </div>
//             <div className="text-center text-gray-400">
//               <i className="fas fa-wallet block text-xl"></i>
//               <span className="text-xs">Wallet</span>
//             </div>
//             <div className="text-center text-gray-400">
//               <i className="fas fa-user block text-xl"></i>
//               <span className="text-xs">Profile</span>
//             </div>
//           </div>
//         )}

//         <style jsx global>{`
//           @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
          
//           body {
//             font-family: 'Poppins', sans-serif;
//           }
          
//           .neon-border {
//             position: relative;
//             border: 1px solid transparent;
//             background-clip: padding-box;
//           }
          
//           .neon-border::before {
//             content: '';
//             position: absolute;
//             top: 0;
//             left: 0;
//             right: 0;
//             bottom: 0;
//             border-radius: 1rem;
//             padding: 2px;
//             background: linear-gradient(45deg, #22c55e, transparent, #22c55e);
//             mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
//             mask-composite: exclude;
//             -webkit-mask-composite: xor;
//             opacity: 0.7;
//             z-index: -1;
//           }
          
//           .neon-border:hover::before {
//             opacity: 1;
//             background: linear-gradient(45deg, #22c55e, #86efac, #22c55e);
//             animation: neonGlow 1.5s ease-in-out infinite alternate;
//           }
          
//           @keyframes neonGlow {
//             from {
//               box-shadow: 0 0 5px #22c55e, 0 0 10px #22c55e44, 0 0 15px #22c55e22;
//             }
//             to {
//               box-shadow: 0 0 10px #22c55e, 0 0 20px #22c55e66, 0 0 30px #22c55e44;
//             }
//           }
//         `}</style>
//       </div>
//     </>
//   );
// }








// <!DOCTYPE html>
// <html lang="en">
// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Dashboard UI</title>
//     <script src="https://cdn.tailwindcss.com"></script>
//     <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
//     <script>
//         tailwind.config = {
//             theme: {
//                 extend: {
//                     colors: {
//                         dark: {
//                             100: '#1e293b',
//                             200: '#172033',
//                             300: '#0f172a',
//                         },
//                         primary: {
//                             500: '#22c55e',
//                             600: '#16a34a',
//                         }
//                     }
//                 }
//             }
//         }
//     </script>
// </head>
// <body class="bg-dark-300 min-h-screen text-white">
//     <div class="container mx-auto px-4 py-8">
//         <!-- Header -->
//         <header class="flex justify-between items-center mb-8">
//             <h1 class="text-2xl font-bold">Beta Papa <span class="text-primary-500">hu (CEO)</span></h1>
//             <div class="flex items-center space-x-4">
//                 <div class="bg-dark-200 p-2 rounded-lg">
//                     <i class="fas fa-bell text-primary-500"></i>
//                 </div>
//                 <div class="bg-dark-200 p-2 rounded-lg">
//                     <i class="fas fa-user text-primary-500"></i>
//                 </div>
//             </div>
//         </header>

//         <!-- Stats Grid -->
//         <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//             <!-- Grandmaster Card -->
//             <div class="bg-dark-200 rounded-xl p-5 shadow-lg">
//                 <div class="flex justify-between items-start mb-4">
//                     <h2 class="text-lg font-semibold">Grandmaster</h2>
//                     <div class="bg-primary-500 text-xs px-2 py-1 rounded">8PBTT</div>
//                 </div>
//                 <p class="text-3xl font-bold">9,711</p>
//                 <div class="mt-4 flex items-center text-sm text-gray-400">
//                     <span class="bg-dark-100 px-2 py-1 rounded">Level 5</span>
//                 </div>
//             </div>

//             <!-- Daily Reward Card -->
//             <div class="bg-dark-200 rounded-xl p-5 shadow-lg">
//                 <h2 class="text-lg font-semibold mb-4">Daily reward</h2>
//                 <p class="text-3xl font-bold">23.35</p>
//                 <div class="mt-4 flex items-center text-sm text-primary-500">
//                     <i class="fas fa-gift mr-2"></i>
//                     <span>Daily cipher</span>
//                 </div>
//             </div>

//             <!-- Daily Center Card -->
//             <div class="bg-dark-200 rounded-xl p-5 shadow-lg">
//                 <h2 class="text-lg font-semibold mb-4">Daily center</h2>
//                 <p class="text-3xl font-bold">18.24</p>
//                 <div class="mt-4 flex items-center text-sm text-gray-400">
//                     <i class="fas fa-clock mr-2"></i>
//                     <span>Next reward in 3h 12m</span>
//                 </div>
//             </div>

//             <!-- Mini Game Card -->
//             <div class="bg-dark-200 rounded-xl p-5 shadow-lg">
//                 <h2 class="text-lg font-semibold mb-4">Mini game</h2>
//                 <p class="text-3xl font-bold">19.24</p>
//                 <div class="mt-4">
//                     <div class="w-full bg-dark-100 rounded-full h-2.5">
//                         <div class="bg-primary-500 h-2.5 rounded-full" style="width: 65%"></div>
//                     </div>
//                 </div>
//             </div>
//         </div>

//         <!-- Main Content Area -->
//         <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
//             <!-- Left Column -->
//             <div class="lg:col-span-2 space-y-6">
//                 <!-- Daily Cipher Section -->
//                 <div class="bg-dark-200 rounded-xl p-6 shadow-lg">
//                     <div class="flex justify-between items-center mb-6">
//                         <h2 class="text-xl font-semibold">Daily cipher</h2>
//                         <span class="text-xs text-primary-500 bg-dark-100 px-2 py-1 rounded">Active</span>
//                     </div>
//                     <div class="bg-dark-100 p-4 rounded-lg mb-6">
//                         <div class="flex justify-between items-center">
//                             <div>
//                                 <p class="text-sm text-gray-400">Faucet</p>
//                                 <p class="text-2xl font-bold">+1,000,000</p>
//                             </div>
//                             <button class="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg">
//                                 Claim
//                             </button>
//                         </div>
//                     </div>
//                     <p class="text-sm text-gray-400">Next cipher resets in 22h 15m</p>
//                 </div>

//                 <!-- Daily Card Section -->
//                 <div class="bg-dark-200 rounded-xl p-6 shadow-lg">
//                     <div class="flex justify-between items-center mb-6">
//                         <h2 class="text-xl font-semibold">Daily card</h2>
//                         <span class="text-sm font-bold">8000 / 8000</span>
//                     </div>
//                     <div class="w-full bg-dark-100 rounded-full h-4 mb-4">
//                         <div class="bg-primary-500 h-4 rounded-full" style="width: 100%"></div>
//                     </div>
//                     <p class="text-sm text-gray-400">Complete your daily tasks to earn rewards</p>
//                 </div>
//             </div>

//             <!-- Right Column -->
//             <div class="space-y-6">
//                 <!-- Boot Section -->
//                 <div class="bg-dark-200 rounded-xl p-6 shadow-lg">
//                     <h2 class="text-xl font-semibold mb-4">Boot</h2>
//                     <button class="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-lg font-semibold">
//                         Start Earning
//                     </button>
//                 </div>

//                 <!-- BTC Section -->
//                 <div class="bg-dark-200 rounded-xl p-6 shadow-lg">
//                     <h2 class="text-xl font-semibold mb-4">BTC</h2>
//                     <button class="w-full bg-dark-100 hover:bg-dark-100 border border-primary-500 text-primary-500 py-3 rounded-lg font-semibold">
//                         Exchange
//                     </button>
//                 </div>

//                 <!-- Playground Section -->
//                 <div class="bg-dark-200 rounded-xl p-6 shadow-lg">
//                     <h2 class="text-xl font-semibold mb-4">Playground</h2>
//                     <div class="grid grid-cols-3 gap-2">
//                         <div class="bg-dark-100 aspect-square rounded-lg flex items-center justify-center">
//                             <i class="fas fa-gamepad text-primary-500"></i>
//                         </div>
//                         <div class="bg-dark-100 aspect-square rounded-lg flex items-center justify-center">
//                             <i class="fas fa-dice text-primary-500"></i>
//                         </div>
//                         <div class="bg-dark-100 aspect-square rounded-lg flex items-center justify-center">
//                             <i class="fas fa-chess text-primary-500"></i>
//                         </div>
//                     </div>
//                 </div>

//                 <!-- Additional Sections -->
//                 <div class="grid grid-cols-2 gap-4">
//                     <div class="bg-dark-200 rounded-xl p-4 shadow-lg text-center">
//                         <div class="bg-dark-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
//                             <i class="fas fa-user-friends text-primary-500"></i>
//                         </div>
//                         <h3 class="font-semibold">Friends</h3>
//                     </div>
//                     <div class="bg-dark-200 rounded-xl p-4 shadow-lg text-center">
//                         <div class="bg-dark-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
//                             <i class="fas fa-coins text-primary-500"></i>
//                         </div>
//                         <h3 class="font-semibold">Earn</h3>
//                     </div>
//                     <div class="bg-dark-200 rounded-xl p-4 shadow-lg text-center">
//                         <div class="bg-dark-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
//                             <i class="fas fa-parachute-box text-primary-500"></i>
//                         </div>
//                         <h3 class="font-semibold">AirDrop</h3>
//                     </div>
//                     <div class="bg-dark-200 rounded-xl p-4 shadow-lg text-center">
//                         <div class="bg-dark-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
//                             <i class="fas fa-cog text-primary-500"></i>
//                         </div>
//                         <h3 class="font-semibold">Settings</h3>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     </div>

//     <!-- Bottom Navigation (for mobile) -->
//     <div class="fixed bottom-0 left-0 right-0 bg-dark-200 p-4 flex justify-around md:hidden">
//         <div class="text-center text-primary-500">
//             <i class="fas fa-home block text-xl"></i>
//             <span class="text-xs">Home</span>
//         </div>
//         <div class="text-center text-gray-400">
//             <i class="fas fa-chart-line block text-xl"></i>
//             <span class="text-xs">Stats</span>
//         </div>
//         <div class="text-center text-gray-400">
//             <i class="fas fa-wallet block text-xl"></i>
//             <span class="text-xs">Wallet</span>
//         </div>
//         <div class="text-center text-gray-400">
//             <i class="fas fa-user block text-xl"></i>
//             <span class="text-xs">Profile</span>
//         </div>
//     </div>
// </body>
// </html>












// // app/page.tsx
// import React from 'react';
// import Image from 'next/image'; // Import Image for optimized images

// export default function Home() {

//   // --- Header Component Logic (integrated) ---
//   const Header: React.FC = () => {
//     return (
//       <header className="w-full flex justify-between items-center p-4 bg-gray-900 border-b border-gray-700">
//         <div className="flex items-center space-x-2">
//           <Image src="/profile-icon.png" alt="Profile" width={32} height={32} className="rounded-full" />
//           <div>
//             <p className="text-sm font-semibold">Beta Papa hu (CEO)</p>
//             <p className="text-xs text-gray-400">Grandmaster 9/11</p>
//           </div>
//         </div>
//         <div className="flex items-center space-x-2">
//           <Image src="/coin-icon.png" alt="Coin" width={20} height={20} />
//           <span className="text-lg font-bold">90</span>
//           <button className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors">
//             <Image src="/settings-icon.png" alt="Settings" width={20} height={20} />
//           </button>
//         </div>
//       </header>
//     );
//   };

//   // --- Daily Actions Component Logic (integrated) ---
//   const DailyActions: React.FC = () => {
//     const actions = [
//       { name: 'Daily reward', icon: '/daily-reward.png', time: '23:30' },
//       { name: 'Daily cipher', icon: '/daily-cipher.png', time: '10:34' },
//       { name: 'Daily combo', icon: '/daily-combo.png', time: '11:58' },
//       { name: 'Mini game', icon: '/mini-game.png', time: '19:34' },
//     ];

//     return (
//       <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-3xl">
//         {actions.map((action, index) => (
//           <div key={index} className="flex flex-col items-center bg-gray-800 p-4 rounded-xl shadow-md cursor-pointer hover:bg-gray-700 transition-colors">
//             <Image src={action.icon} alt={action.name} width={48} height={48} className="mb-2" />
//             <p className="text-sm font-semibold text-center">{action.name}</p>
//             <p className="text-xs text-gray-400">{action.time}</p>
//           </div>
//         ))}
//       </div>
//     );
//   };

//   // --- Hamster Tap Area Component Logic (integrated) ---
//   const HamsterTapArea: React.FC = () => {
//     return (
//       <div className="relative w-64 h-64 flex items-center justify-center rounded-full bg-gradient-to-br from-red-800 to-red-600 shadow-inner ring-4 ring-red-500 ring-offset-4 ring-offset-gray-950 cursor-pointer active:scale-98 transition-transform duration-100">
//         <Image src="/hamster-character.png" alt="Hamster Mascot" width={150} height={150} />
//       </div>
//     );
//   };

//   // --- Boost Section Component Logic (integrated) ---
//   const BoostSection: React.FC = () => {
//     return (
//       <div className="w-full max-w-sm flex justify-between items-center mt-8">
//         <div className="flex items-center space-x-2 text-yellow-400">
//           <Image src="/lightning-icon.png" alt="Energy" width={24} height={24} />
//           <span className="font-semibold">8000 / 8000</span>
//         </div>
//         <button className="flex items-center space-x-2 bg-blue-700 hover:bg-blue-800 text-white py-2 px-4 rounded-full shadow-lg transition-colors">
//           <Image src="/rocket-icon.png" alt="Boost" width={20} height={20} />
//           <span>Boost</span>
//         </button>
//       </div>
//     );
//   };

//   // --- Bottom Navigation Component Logic (integrated) ---
//   const BottomNavigation: React.FC = () => {
//     const navItems = [
//       { name: 'Exchange', icon: '/exchange-icon.png' },
//       { name: 'Mine', icon: '/mine-icon.png' },
//       { name: 'Friends', icon: '/friends-icon.png' },
//       { name: 'Earn', icon: '/earn-icon.png' },
//       { name: 'Airdrop', icon: '/airdrop-icon.png' },
//     ];

//     return (
//       <nav className="w-full bg-gray-900 border-t border-gray-700 p-2 flex justify-around items-center sticky bottom-0 z-10"> {/* Added z-10 for layering */}
//         {navItems.map((item, index) => (
//           <button key={index} className="flex flex-col items-center p-2 rounded-lg text-xs font-medium text-gray-400 hover:text-white transition-colors">
//             <Image src={item.icon} alt={item.name} width={24} height={24} className="mb-1" />
//             <span>{item.name}</span>
//           </button>
//         ))}
//       </nav>
//     );
//   };


//   return (
//     <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col font-sans relative overflow-hidden">
//       {/* Top Header */}
//       <Header />

//       {/* Main Content Area */}
//       <div className="flex-grow flex flex-col items-center justify-start px-4 py-6">
//         {/* Daily Actions */}
//         <DailyActions />

//         {/* Current Coin Balance */}
//         <div className="my-8 text-center">
//           <p className="text-sm text-gray-400">Daily cipher</p>
//           <p className="text-5xl font-bold text-white tracking-wide">897,071,639</p>
//         </div>

//         {/* Faucet/Daily Cipher Section */}
//         <div className="flex items-center justify-between w-full max-w-sm mb-8 bg-gray-800 p-3 rounded-xl shadow-lg">
//           <span className="text-xl font-semibold">FAUCET</span>
//           <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-5 rounded-lg transition-colors duration-200 flex items-center space-x-2">
//             <span>+1,000,000</span>
//           </button>
//         </div>

//         {/* Hamster Tap Area */}
//         <HamsterTapArea />

//         {/* Boost Section */}
//         <BoostSection />
//       </div>

//       {/* Bottom Navigation */}
//       <BottomNavigation />
//     </div>
//   );
// }








// // app/page.tsx
// import React from 'react';
// import Image from 'next/image'; // Import Image for optimized images

// export default function Home() {

//   // --- Header Component Logic (integrated) ---
//   const Header: React.FC = () => {
//     return (
//       <header className="w-full flex justify-between items-center p-4 bg-gray-900 border-b border-gray-700">
//         <div className="flex items-center space-x-2">
//           <Image src="/profile-icon.png" alt="Profile" width={32} height={32} className="rounded-full" />
//           <div>
//             <p className="text-sm font-semibold">Beta Papa hu (CEO)</p>
//             <p className="text-xs text-gray-400">Grandmaster 9/11</p>
//           </div>
//         </div>
//         <div className="flex items-center space-x-2">
//           <Image src="/coin-icon.png" alt="Coin" width={20} height={20} />
//           <span className="text-lg font-bold">90</span>
//           <button className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors">
//             <Image src="/settings-icon.png" alt="Settings" width={20} height={20} />
//           </button>
//         </div>
//       </header>
//     );
//   };

//   // --- Daily Actions Component Logic (integrated) ---
//   const DailyActions: React.FC = () => {
//     const actions = [
//       { name: 'Daily reward', icon: '/daily-reward.png', time: '23:30' },
//       { name: 'Daily cipher', icon: '/daily-cipher.png', time: '10:34' },
//       { name: 'Daily combo', icon: '/daily-combo.png', time: '11:58' },
//       { name: 'Mini game', icon: '/mini-game.png', time: '19:34' },
//     ];

//     return (
//       <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-3xl">
//         {actions.map((action, index) => (
//           <div key={index} className="flex flex-col items-center bg-gray-800 p-4 rounded-xl shadow-md cursor-pointer hover:bg-gray-700 transition-colors">
//             <Image src={action.icon} alt={action.name} width={48} height={48} className="mb-2" />
//             <p className="text-sm font-semibold text-center">{action.name}</p>
//             <p className="text-xs text-gray-400">{action.time}</p>
//           </div>
//         ))}
//       </div>
//     );
//   };

//   // --- Hamster Tap Area Component Logic (integrated) ---
//   const HamsterTapArea: React.FC = () => {
//     return (
//       <div className="relative w-64 h-64 flex items-center justify-center rounded-full bg-gradient-to-br from-red-800 to-red-600 shadow-inner ring-4 ring-red-500 ring-offset-4 ring-offset-gray-950 cursor-pointer active:scale-98 transition-transform duration-100">
//         <Image src="/hamster-character.png" alt="Hamster Mascot" width={150} height={150} />
//       </div>
//     );
//   };

//   // --- Boost Section Component Logic (integrated) ---
//   const BoostSection: React.FC = () => {
//     return (
//       <div className="w-full max-w-sm flex justify-between items-center mt-8">
//         <div className="flex items-center space-x-2 text-yellow-400">
//           <Image src="/lightning-icon.png" alt="Energy" width={24} height={24} />
//           <span className="font-semibold">8000 / 8000</span>
//         </div>
//         <button className="flex items-center space-x-2 bg-blue-700 hover:bg-blue-800 text-white py-2 px-4 rounded-full shadow-lg transition-colors">
//           <Image src="/rocket-icon.png" alt="Boost" width={20} height={20} />
//           <span>Boost</span>
//         </button>
//       </div>
//     );
//   };

//   // --- Bottom Navigation Component Logic (integrated) ---
//   const BottomNavigation: React.FC = () => {
//     const navItems = [
//       { name: 'Exchange', icon: '/exchange-icon.png' },
//       { name: 'Mine', icon: '/mine-icon.png' },
//       { name: 'Friends', icon: '/friends-icon.png' },
//       { name: 'Earn', icon: '/earn-icon.png' },
//       { name: 'Airdrop', icon: '/airdrop-icon.png' },
//     ];

//     return (
//       <nav className="w-full bg-gray-900 border-t border-gray-700 p-2 flex justify-around items-center sticky bottom-0 z-10"> {/* Added z-10 for layering */}
//         {navItems.map((item, index) => (
//           <button key={index} className="flex flex-col items-center p-2 rounded-lg text-xs font-medium text-gray-400 hover:text-white transition-colors">
//             <Image src={item.icon} alt={item.name} width={24} height={24} className="mb-1" />
//             <span>{item.name}</span>
//           </button>
//         ))}
//       </nav>
//     );
//   };


//   return (
//     <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col font-sans relative overflow-hidden">
//       {/* Top Header */}
//       <Header />

//       {/* Main Content Area */}
//       <div className="flex-grow flex flex-col items-center justify-start px-4 py-6">
//         {/* Daily Actions */}
//         <DailyActions />

//         {/* Current Coin Balance */}
//         <div className="my-8 text-center">
//           <p className="text-sm text-gray-400">Daily cipher</p>
//           <p className="text-5xl font-bold text-white tracking-wide">897,071,639</p>
//         </div>

//         {/* Faucet/Daily Cipher Section */}
//         <div className="flex items-center justify-between w-full max-w-sm mb-8 bg-gray-800 p-3 rounded-xl shadow-lg">
//           <span className="text-xl font-semibold">FAUCET</span>
//           <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-5 rounded-lg transition-colors duration-200 flex items-center space-x-2">
//             <span>+1,000,000</span>
//           </button>
//         </div>

//         {/* Hamster Tap Area */}
//         <HamsterTapArea />

//         {/* Boost Section */}
//         <BoostSection />
//       </div>

//       {/* Bottom Navigation */}
//       <BottomNavigation />
//     </div>
//   );
// }






// "use client";

// import React from "react";
// import { motion } from "framer-motion";

// /**
//  * Neon3DCoin component
//  * Props:
//  * - size: number (diameter in px)
//  * - title: string
//  * - price: string | number
//  * - imageFront: string (url for front artwork, optional)
//  * - imageBack: string (url for back artwork, optional)
//  * - glow: string (Tailwind color name / CSS color, default: '#00FFFF')
//  */

// export default function Neon3DCoin({
//   size = 220,
//   title = "R-Coin",
//   price = "৳ 1,250",
//   imageFront = null,
//   imageBack = null,
//   glow = "#00FFFF",
// }) {
//   const edgeThickness = Math.max(12, Math.round(size * 0.12));
//   const coinStyle = {
//     width: `${size}px`,
//     height: `${size}px`,
//   };
//   const edgeStyle = {
//     width: `${size}px`,
//     height: `${edgeThickness}px`,
//     transformOrigin: "center",
//   };

//   return (
//     <div className="flex flex-col items-center gap-4">
//       <motion.div
//         className="relative will-change-transform"
//         style={coinStyle}
//         initial={{ rotateY: 0, rotateX: 0 }}
//         whileHover={{ rotateY: 12, rotateX: -8 }}
//         transition={{ type: "spring", stiffness: 120, damping: 18 }}
//       >
//         {/* Light Glow */}
//         <div
//           aria-hidden
//           className="absolute -inset-4 rounded-full blur-3xl opacity-70"
//           style={{
//             boxShadow: `0 0 40px 14px ${glow}, 0 0 80px 28px ${glow}44`,
//             filter: "saturate(140%)",
//           }}
//         />

//         {/* Back face (slightly rotated) */}
//         <div
//           className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center overflow-hidden"
//           style={{
//             transform: "translateZ(-18px) scale(0.96)",
//             boxShadow: "inset 0 -12px 40px rgba(0,0,0,0.6)",
//           }}
//         >
//           {imageBack ? (
//             // If user supplies an image for back
//             <img
//               src={imageBack}
//               alt="coin-back"
//               className="w-full h-full object-cover opacity-40"
//             />
//           ) : (
//             <div className="text-sm text-white/30">BACK</div>
//           )}
//         </div>

//         {/* Coin front */}
//         <div
//           className="absolute inset-0 rounded-full bg-gradient-to-b from-black/60 to-black/30 flex items-center justify-center overflow-hidden border border-white/5"
//           style={{
//             transform: "translateZ(16px)",
//             backdropFilter: "blur(6px)",
//           }}
//         >
//           {/* Artwork */}
//           {imageFront ? (
//             <img
//               src={imageFront}
//               alt="coin-front"
//               className="w-11/12 h-11/12 object-contain drop-shadow-xl"
//               style={{ mixBlendMode: "screen" }}
//             />
//           ) : (
//             <div className="flex flex-col items-center justify-center gap-1">
//               <div
//                 className="text-2xl font-extrabold tracking-tight"
//                 style={{ color: glow }}
//               >
//                 {title}
//               </div>
//               <div className="text-sm text-white/80">{price}</div>
//             </div>
//           )}
//         </div>

//         {/* Coin rim (simulated 3D edge) */}
//         <div
//           className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex items-center justify-center"
//           style={{ perspective: `${size * 4}px` }}
//         >
//           <div
//             className="rounded-full overflow-hidden"
//             style={{ transformStyle: "preserve-3d", width: `${size}px` }}
//           >
//             {/* Edge element: will appear as the coin thickness */}
//             <div
//               className="mx-auto rounded-full"
//               style={{
//                 ...edgeStyle,
//                 background: `repeating-linear-gradient(90deg, #d6c090, #d6c090 4px, #b87f2b 4px, #b87f2b 8px)`,
//                 transform: `translateZ(-${edgeThickness / 2}px) rotateX(90deg)`,
//                 boxShadow: "0 8px 30px rgba(0,0,0,0.6)",
//               }}
//             />
//           </div>
//         </div>

//         {/* Subtle top rim shine */}
//         <div
//           className="absolute inset-0 rounded-full pointer-events-none"
//           style={{
//             background: `radial-gradient(120px 60px at 30% 22%, rgba(255,255,255,0.12), transparent 20%), radial-gradient(80px 36px at 70% 78%, rgba(255,255,255,0.06), transparent 40%)`,
//             mixBlendMode: "overlay",
//           }}
//         />

//         {/* Floating micro-decoration - animated particles */}
//         <motion.div
//           className="absolute inset-0 pointer-events-none"
//           animate={{ rotate: 360 }}
//           transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
//           style={{ opacity: 0.12 }}
//         >
//           <svg
//             viewBox="0 0 200 200"
//             className="w-full h-full"
//             preserveAspectRatio="xMidYMid slice"
//           >
//             <defs>
//               <linearGradient id="g1" x1="0%" x2="100%">
//                 <stop offset="0%" stopColor={glow} stopOpacity="0.7" />
//                 <stop offset="100%" stopColor="#fff" stopOpacity="0.05" />
//               </linearGradient>
//             </defs>
//             <circle cx="30" cy="40" r="1.5" fill="url(#g1)" />
//             <circle cx="160" cy="80" r="1.2" fill="url(#g1)" />
//             <circle cx="120" cy="150" r="1.8" fill="url(#g1)" />
//             <path d="M60 30 Q80 40 70 60" stroke={glow} strokeWidth="0.6" fill="none" opacity="0.6" />
//           </svg>
//         </motion.div>
//       </motion.div>

//       {/* Caption / CTA */}
//       <div className="text-center">
//         <div className="text-lg font-semibold text-white">{title}</div>
//         <div className="text-sm text-white/80">{price}</div>
//         <div className="mt-3 flex items-center justify-center gap-2">
//           <button className="px-4 py-2 rounded-full bg-white/6 backdrop-blur-sm border border-white/10 hover:scale-105 transition-transform">
//             View
//           </button>
//           <button className="px-4 py-2 rounded-full bg-gradient-to-r from-white/6 to-white/3 border border-white/10 hover:scale-105 transition-transform">
//             Buy
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }











// "use client";

// import { Canvas, useFrame } from "@react-three/fiber";
// import { useState, useRef, useEffect } from "react";
// import { OrbitControls, Sparkles, Stars } from "@react-three/drei";

// // ---------------- Audio Hook ----------------
// function useAudio(url: string) {
//   const audio = useRef(new Audio(url));
//   const play = () => audio.current.play();
//   return play;
// }

// // ---------------- Player ----------------
// function Player({ bullets, setBullets, playerPos }: any) {
//   const ref = useRef<any>();
//   const speed = 0.25;

//   const shootSound = useAudio("/sounds/shoot.mp3");

//   useEffect(() => {
//     const handleKey = (e: KeyboardEvent) => {
//       if (!ref.current) return;
//       if (e.key === "ArrowLeft") ref.current.position.x -= speed;
//       if (e.key === "ArrowRight") ref.current.position.x += speed;
//       if (e.key === " ") {
//         setBullets((prev: any[]) => [
//           ...prev,
//           { position: [...ref.current.position], type: "player", id: Math.random() },
//         ]);
//         shootSound();
//       }
//     };
//     window.addEventListener("keydown", handleKey);
//     return () => window.removeEventListener("keydown", handleKey);
//   }, [setBullets, shootSound]);

//   useFrame(() => {
//     if (ref.current) playerPos.current = [...ref.current.position];
//   });

//   return (
//     <mesh ref={ref} position={[0, -3, 0]}>
//       <coneGeometry args={[0.3, 1, 16]} />
//       <meshStandardMaterial color="#00ffff" emissive="#00ffff" />
//       <Sparkles size={5} scale={[0.5, 0.5, 0.5]} speed={2} />
//     </mesh>
//   );
// }

// // ---------------- Bullets ----------------
// function Bullets({ bullets }: any) {
//   return (
//     <>
//       {bullets.map((b: any) => (
//         <mesh key={b.id} position={b.position}>
//           <sphereGeometry args={[0.12, 12, 12]} />
//           <meshStandardMaterial color={b.type === "enemy" ? "#ff3333" : "#ff00ff"} emissive={b.type === "enemy" ? "#ff3333" : "#ff00ff"} />
//           <Sparkles size={5} scale={[0.2, 0.5, 0.2]} speed={1} />
//         </mesh>
//       ))}
//     </>
//   );
// }

// // ---------------- Enemy ----------------
// function Enemy({ enemyRef }: any) {
//   return (
//     <mesh ref={enemyRef} position={enemyRef.current.position}>
//       <boxGeometry args={[0.6, 0.6, 0.6]} />
//       <meshStandardMaterial color="#ff3333" emissive="#ff3333" />
//     </mesh>
//   );
// }

// // ---------------- Boss ----------------
// function Boss({ bossRef }: any) {
//   return (
//     <mesh ref={bossRef} position={bossRef.current.position}>
//       <boxGeometry args={[1.2, 1.2, 1.2]} />
//       <meshStandardMaterial color="#ff00ff" emissive="#ff00ff" />
//       <Sparkles size={10} scale={[1, 1, 1]} speed={1.5} />
//     </mesh>
//   );
// }

// // ---------------- Explosion ----------------
// function Explosion({ position }: any) {
//   const meshRef = useRef<any>();
//   const [scale, setScale] = useState(0.1);

//   useFrame(() => {
//     setScale((s) => s + 0.2);
//   });

//   return (
//     <mesh ref={meshRef} position={position} scale={[scale, scale, scale]}>
//       <sphereGeometry args={[0.2, 16, 16]} />
//       <meshStandardMaterial color="#ffff00" emissive="#ffff00" transparent opacity={1 - scale / 5} />
//     </mesh>
//   );
// }

// // ---------------- Power-up ----------------
// function PowerUp({ position }: any) {
//   return (
//     <mesh position={position}>
//       <icosahedronGeometry args={[0.3, 0]} />
//       <meshStandardMaterial color="#00ff00" emissive="#00ff00" />
//       <Sparkles size={8} scale={[0.5, 0.5, 0.5]} speed={2} />
//     </mesh>
//   );
// }

// // ---------------- Game Loop ----------------
// function GameLogic({
//   bullets,
//   setBullets,
//   enemies,
//   setEnemies,
//   boss,
//   setBoss,
//   explosions,
//   setExplosions,
//   powerUps,
//   setPowerUps,
//   playerPos,
//   setScore,
//   score,
// }: any) {
//   const enemyRefs = useRef<any[]>([]);
//   const bossRef = useRef<any>({ current: { position: [0, 6, 0] } });
//   const explosionSound = useAudio("/sounds/explosion.mp3");
//   const powerUpSound = useAudio("/sounds/powerup.mp3");

//   // Spawn enemies
//   useEffect(() => {
//     const interval = setInterval(() => {
//       if (score >= 100 && !boss.active) {
//         setBoss({ ref: bossRef, active: true, id: Math.random() });
//         return;
//       }
//       const enemyRef = { current: { position: [Math.random() * 6 - 3, 4, 0] } };
//       enemyRefs.current.push(enemyRef);
//       setEnemies((prev: any) => [...prev, enemyRef]);
//     }, 2000);
//     return () => clearInterval(interval);
//   }, [setEnemies, score, setBoss]);

//   // Spawn power-ups
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setPowerUps((prev: any) => [
//         ...prev,
//         { position: [Math.random() * 6 - 3, 5, 0], id: Math.random() },
//       ]);
//     }, 15000);
//     return () => clearInterval(interval);
//   }, [setPowerUps]);

//   useFrame(() => {
//     // Move bullets
//     setBullets((prev: any) =>
//       prev
//         .map((b: any) =>
//           b.type === "enemy"
//             ? { ...b, position: [b.position[0], b.position[1] - 0.15, 0] }
//             : { ...b, position: [b.position[0], b.position[1] + 0.3, 0] }
//         )
//         .filter((b: any) => Math.abs(b.position[1]) < 6)
//     );

//     // Bullet-Enemy collision
//     setEnemies((prevEnemies: any) =>
//       prevEnemies.filter((enemyRef: any) => {
//         const hitIndex = bullets.findIndex(
//           (b: any) =>
//             b.type !== "enemy" &&
//             Math.abs(b.position[0] - enemyRef.current.position[0]) < 0.35 &&
//             Math.abs(b.position[1] - enemyRef.current.position[1]) < 0.35
//         );
//         if (hitIndex !== -1) {
//           setExplosions((exp: any) => [...exp, { position: enemyRef.current.position, id: Math.random() }]);
//           setBullets((b: any) => b.filter((_, i) => i !== hitIndex));
//           setScore((s: number) => s + 10);
//           explosionSound();
//           return false;
//         }
//         return true;
//       })
//     );

//     // Bullet-Player collision
//     bullets.forEach((b: any, i: number) => {
//       if (b.type === "enemy") {
//         if (
//           Math.abs(b.position[0] - playerPos.current[0]) < 0.35 &&
//           Math.abs(b.position[1] - playerPos.current[1]) < 0.35
//         ) {
//           setExplosions((exp: any) => [...exp, { position: [...playerPos.current], id: Math.random() }]);
//           setBullets((prev: any) => prev.filter((_, idx) => idx !== i));
//           setScore((s: number) => Math.max(0, s - 10));
//           explosionSound();
//         }
//       }
//     });

//     // Power-ups collection
//     setPowerUps((prev: any) =>
//       prev.filter((p: any) => {
//         if (
//           Math.abs(p.position[0] - playerPos.current[0]) < 0.4 &&
//           Math.abs(p.position[1] - playerPos.current[1]) < 0.4
//         ) {
//           setScore((s: number) => s + 20);
//           powerUpSound();
//           return false;
//         }
//         return true;
//       })
//     );

//     // Move power-ups down
//     setPowerUps((prev: any) => prev.map((p: any) => ({ ...p, position: [p.position[0], p.position[1] - 0.02, 0] })));
//   });

//   return null;
// }

// // ---------------- Main Game ----------------
// export default function Game() {
//   const [bullets, setBullets] = useState<any[]>([]);
//   const [enemies, setEnemies] = useState<any[]>([]);
//   const [boss, setBoss] = useState<any>({ active: false, ref: null });
//   const [explosions, setExplosions] = useState<any[]>([]);
//   const [powerUps, setPowerUps] = useState<any[]>([]);
//   const [score, setScore] = useState(0);
//   const playerPos = useRef<any>([0, -3]);

//   return (
//     <div className="w-full h-screen bg-black relative">
//       <div className="absolute top-2 left-2 text-white text-lg z-10">Score: {score}</div>
//       <Canvas camera={{ position: [0, 0, 7] }}>
//         <ambientLight intensity={0.5} />
//         <pointLight position={[10, 10, 10]} />
//         <Stars radius={100} depth={50} count={5000} factor={4} saturation={0.5} fade />

//         <Player bullets={bullets} setBullets={setBullets} playerPos={playerPos} />
//         <Bullets bullets={bullets} />
//         {enemies.map((enemyRef: any, i: number) => (
//           <Enemy key={i} enemyRef={enemyRef} />
//         ))}
//         {boss.active && <Boss bossRef={boss.ref} />}
//         {explosions.map((exp: any) => (
//           <Explosion key={exp.id} position={exp.position} />
//         ))}
//         {powerUps.map((p: any) => (
//           <PowerUp key={p.id} position={p.position} />
//         ))}

//         <GameLogic
//           bullets={bullets}
//           setBullets={setBullets}
//           enemies={enemies}
//           setEnemies={setEnemies}
//           boss={boss}
//           setBoss={setBoss}
//           explosions={explosions}
//           setExplosions={setExplosions}
//           powerUps={powerUps}
//           setPowerUps={setPowerUps}
//           playerPos={playerPos}
//           setScore={setScore}
//           score={score}
//         />

//         <OrbitControls />
//       </Canvas>
//     </div>
//   );
// }


// "use client";

// import { Canvas, useFrame } from "@react-three/fiber";
// import { useState, useRef, useEffect } from "react";
// import { OrbitControls, Sparkles, Stars } from "@react-three/drei";

// // ---------------- Player ----------------
// function Player({ bullets, setBullets, playerPos }: any) {
//   const ref = useRef<any>();
//   const speed = 0.25;

//   useEffect(() => {
//     const handleKey = (e: KeyboardEvent) => {
//       if (!ref.current) return;
//       if (e.key === "ArrowLeft") ref.current.position.x -= speed;
//       if (e.key === "ArrowRight") ref.current.position.x += speed;
//       if (e.key === " ") {
//         setBullets((prev: any[]) => [
//           ...prev,
//           { position: [...ref.current.position], type: "player", id: Math.random() },
//         ]);
//       }
//     };
//     window.addEventListener("keydown", handleKey);
//     return () => window.removeEventListener("keydown", handleKey);
//   }, [setBullets]);

//   // Update player's position
//   useFrame(() => {
//     if (ref.current) playerPos.current = [...ref.current.position];
//   });

//   return (
//     <mesh ref={ref} position={[0, -3, 0]}>
//       <coneGeometry args={[0.3, 1, 16]} />
//       <meshStandardMaterial color="#00ffff" emissive="#00ffff" />
//     </mesh>
//   );
// }

// // ---------------- Bullets ----------------
// function Bullets({ bullets }: any) {
//   return (
//     <>
//       {bullets.map((b: any) => (
//         <mesh key={b.id} position={b.position}>
//           <sphereGeometry args={[0.12, 12, 12]} />
//           <meshStandardMaterial color={b.type === "enemy" ? "#ff3333" : "#ff00ff"} emissive={b.type === "enemy" ? "#ff3333" : "#ff00ff"} />
//           <Sparkles size={5} scale={[0.2, 0.5, 0.2]} speed={1} />
//         </mesh>
//       ))}
//     </>
//   );
// }

// // ---------------- Enemy ----------------
// function Enemy({ enemyRef }: any) {
//   return (
//     <mesh ref={enemyRef} position={enemyRef.current.position}>
//       <boxGeometry args={[0.6, 0.6, 0.6]} />
//       <meshStandardMaterial color="#ff3333" emissive="#ff3333" />
//     </mesh>
//   );
// }

// // ---------------- Explosion ----------------
// function Explosion({ position }: any) {
//   const meshRef = useRef<any>();
//   const [scale, setScale] = useState(0.1);

//   useFrame(() => {
//     setScale((s) => s + 0.2);
//   });

//   return (
//     <mesh ref={meshRef} position={position} scale={[scale, scale, scale]}>
//       <sphereGeometry args={[0.2, 16, 16]} />
//       <meshStandardMaterial color="#ffff00" emissive="#ffff00" transparent opacity={1 - scale / 5} />
//     </mesh>
//   );
// }

// // ---------------- Power-up ----------------
// function PowerUp({ position }: any) {
//   return (
//     <mesh position={position}>
//       <icosahedronGeometry args={[0.3, 0]} />
//       <meshStandardMaterial color="#00ff00" emissive="#00ff00" />
//       <Sparkles size={8} scale={[0.5, 0.5, 0.5]} speed={2} />
//     </mesh>
//   );
// }

// // ---------------- Game Logic Component ----------------
// function GameLogic({ bullets, setBullets, enemies, setEnemies, explosions, setExplosions, powerUps, setPowerUps, playerPos, setScore }: any) {
//   const enemyRefs = useRef<any[]>([]);

//   // Spawn enemies
//   useEffect(() => {
//     const interval = setInterval(() => {
//       const enemyRef = { current: { position: [Math.random() * 6 - 3, 4, 0] } };
//       enemyRefs.current.push(enemyRef);
//       setEnemies((prev: any) => [...prev, enemyRef]);
//     }, 2000);
//     return () => clearInterval(interval);
//   }, [setEnemies]);

//   // Spawn power-ups
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setPowerUps((prev: any) => [
//         ...prev,
//         { position: [Math.random() * 6 - 3, 5, 0], id: Math.random() },
//       ]);
//     }, 10000);
//     return () => clearInterval(interval);
//   }, [setPowerUps]);

//   useFrame(() => {
//     // Move bullets
//     setBullets((prev: any) =>
//       prev
//         .map((b: any) =>
//           b.type === "enemy"
//             ? { ...b, position: [b.position[0], b.position[1] - 0.15, 0] }
//             : { ...b, position: [b.position[0], b.position[1] + 0.25, 0] }
//         )
//         .filter((b: any) => Math.abs(b.position[1]) < 6)
//     );

//     // Bullet-Enemy collision
//     setEnemies((prevEnemies: any) =>
//       prevEnemies.filter((enemyRef: any) => {
//         const hitIndex = bullets.findIndex(
//           (b: any) =>
//             b.type !== "enemy" &&
//             Math.abs(b.position[0] - enemyRef.current.position[0]) < 0.35 &&
//             Math.abs(b.position[1] - enemyRef.current.position[1]) < 0.35
//         );
//         if (hitIndex !== -1) {
//           setExplosions((exp: any) => [...exp, { position: enemyRef.current.position, id: Math.random() }]);
//           setBullets((b: any) => b.filter((_, i) => i !== hitIndex));
//           setScore((s: number) => s + 10);
//           return false;
//         }
//         return true;
//       })
//     );

//     // Enemy bullets
//     enemies.forEach((enemyRef: any) => {
//       if (Math.random() < 0.01) {
//         setBullets((prev: any) => [
//           ...prev,
//           { position: [...enemyRef.current.position], type: "enemy", id: Math.random() },
//         ]);
//       }
//     });

//     // Bullet-Player collision
//     bullets.forEach((b: any, i: number) => {
//       if (b.type === "enemy") {
//         if (
//           Math.abs(b.position[0] - playerPos.current[0]) < 0.35 &&
//           Math.abs(b.position[1] - playerPos.current[1]) < 0.35
//         ) {
//           setExplosions((exp: any) => [...exp, { position: [...playerPos.current], id: Math.random() }]);
//           setBullets((prev: any) => prev.filter((_, idx) => idx !== i));
//           setScore((s: number) => Math.max(0, s - 5));
//         }
//       }
//     });

//     // Power-ups collection
//     setPowerUps((prev: any) =>
//       prev.filter((p: any) => {
//         if (
//           Math.abs(p.position[0] - playerPos.current[0]) < 0.4 &&
//           Math.abs(p.position[1] - playerPos.current[1]) < 0.4
//         ) {
//           setScore((s: number) => s + 20);
//           return false;
//         }
//         return true;
//       })
//     );

//     // Move power-ups down
//     setPowerUps((prev: any) => prev.map((p: any) => ({ ...p, position: [p.position[0], p.position[1] - 0.02, 0] })));
//   });

//   return null;
// }

// // ---------------- Main Game Component ----------------
// export default function Game() {
//   const [bullets, setBullets] = useState<any[]>([]);
//   const [enemies, setEnemies] = useState<any[]>([]);
//   const [explosions, setExplosions] = useState<any[]>([]);
//   const [powerUps, setPowerUps] = useState<any[]>([]);
//   const [score, setScore] = useState(0);
//   const playerPos = useRef<any>([0, -3]);

//   return (
//     <div className="w-full h-screen bg-black relative">
//       <div className="absolute top-2 left-2 text-white text-lg z-10">Score: {score}</div>
//       <Canvas camera={{ position: [0, 0, 7] }}>
//         <ambientLight intensity={0.5} />
//         <pointLight position={[10, 10, 10]} />
//         <Stars radius={100} depth={50} count={5000} factor={4} saturation={0.5} fade />

//         <Player bullets={bullets} setBullets={setBullets} playerPos={playerPos} />
//         <Bullets bullets={bullets} />
//         {enemies.map((enemyRef: any, i: number) => (
//           <Enemy key={i} enemyRef={enemyRef} />
//         ))}
//         {explosions.map((exp: any) => (
//           <Explosion key={exp.id} position={exp.position} />
//         ))}
//         {powerUps.map((p: any) => (
//           <PowerUp key={p.id} position={p.position} />
//         ))}

//         <GameLogic
//           bullets={bullets}
//           setBullets={setBullets}
//           enemies={enemies}
//           setEnemies={setEnemies}
//           explosions={explosions}
//           setExplosions={setExplosions}
//           powerUps={powerUps}
//           setPowerUps={setPowerUps}
//           playerPos={playerPos}
//           setScore={setScore}
//         />

//         <OrbitControls />
//       </Canvas>
//     </div>
//   );
// }



// "use client";

// import React from "react";
// import { motion } from "framer-motion";

// /**
//  * Neon3DCoin component
//  * Props:
//  * - size: number (diameter in px)
//  * - title: string
//  * - price: string | number
//  * - imageFront: string (url for front artwork, optional)
//  * - imageBack: string (url for back artwork, optional)
//  * - glow: string (Tailwind color name / CSS color, default: '#00FFFF')
//  */

// export default function Neon3DCoin({
//   size = 220,
//   title = "R-Coin",
//   price = "৳ 1,250",
//   imageFront = null,
//   imageBack = null,
//   glow = "#00FFFF",
// }) {
//   const edgeThickness = Math.max(12, Math.round(size * 0.12));
//   const coinStyle = {
//     width: `${size}px`,
//     height: `${size}px`,
//   };
//   const edgeStyle = {
//     width: `${size}px`,
//     height: `${edgeThickness}px`,
//     transformOrigin: "center",
//   };

//   return (
//     <div className="flex flex-col items-center gap-4">
//       <motion.div
//         className="relative will-change-transform"
//         style={coinStyle}
//         initial={{ rotateY: 0, rotateX: 0 }}
//         whileHover={{ rotateY: 12, rotateX: -8 }}
//         transition={{ type: "spring", stiffness: 120, damping: 18 }}
//       >
//         {/* Light Glow */}
//         <div
//           aria-hidden
//           className="absolute -inset-4 rounded-full blur-3xl opacity-70"
//           style={{
//             boxShadow: `0 0 40px 14px ${glow}, 0 0 80px 28px ${glow}44`,
//             filter: "saturate(140%)",
//           }}
//         />

//         {/* Back face (slightly rotated) */}
//         <div
//           className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center overflow-hidden"
//           style={{
//             transform: "translateZ(-18px) scale(0.96)",
//             boxShadow: "inset 0 -12px 40px rgba(0,0,0,0.6)",
//           }}
//         >
//           {imageBack ? (
//             // If user supplies an image for back
//             <img
//               src={imageBack}
//               alt="coin-back"
//               className="w-full h-full object-cover opacity-40"
//             />
//           ) : (
//             <div className="text-sm text-white/30">BACK</div>
//           )}
//         </div>

//         {/* Coin front */}
//         <div
//           className="absolute inset-0 rounded-full bg-gradient-to-b from-black/60 to-black/30 flex items-center justify-center overflow-hidden border border-white/5"
//           style={{
//             transform: "translateZ(16px)",
//             backdropFilter: "blur(6px)",
//           }}
//         >
//           {/* Artwork */}
//           {imageFront ? (
//             <img
//               src={imageFront}
//               alt="coin-front"
//               className="w-11/12 h-11/12 object-contain drop-shadow-xl"
//               style={{ mixBlendMode: "screen" }}
//             />
//           ) : (
//             <div className="flex flex-col items-center justify-center gap-1">
//               <div
//                 className="text-2xl font-extrabold tracking-tight"
//                 style={{ color: glow }}
//               >
//                 {title}
//               </div>
//               <div className="text-sm text-white/80">{price}</div>
//             </div>
//           )}
//         </div>

//         {/* Coin rim (simulated 3D edge) */}
//         <div
//           className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex items-center justify-center"
//           style={{ perspective: `${size * 4}px` }}
//         >
//           <div
//             className="rounded-full overflow-hidden"
//             style={{ transformStyle: "preserve-3d", width: `${size}px` }}
//           >
//             {/* Edge element: will appear as the coin thickness */}
//             <div
//               className="mx-auto rounded-full"
//               style={{
//                 ...edgeStyle,
//                 background: `repeating-linear-gradient(90deg, #d6c090, #d6c090 4px, #b87f2b 4px, #b87f2b 8px)`,
//                 transform: `translateZ(-${edgeThickness / 2}px) rotateX(90deg)`,
//                 boxShadow: "0 8px 30px rgba(0,0,0,0.6)",
//               }}
//             />
//           </div>
//         </div>

//         {/* Subtle top rim shine */}
//         <div
//           className="absolute inset-0 rounded-full pointer-events-none"
//           style={{
//             background: `radial-gradient(120px 60px at 30% 22%, rgba(255,255,255,0.12), transparent 20%), radial-gradient(80px 36px at 70% 78%, rgba(255,255,255,0.06), transparent 40%)`,
//             mixBlendMode: "overlay",
//           }}
//         />

//         {/* Floating micro-decoration - animated particles */}
//         <motion.div
//           className="absolute inset-0 pointer-events-none"
//           animate={{ rotate: 360 }}
//           transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
//           style={{ opacity: 0.12 }}
//         >
//           <svg
//             viewBox="0 0 200 200"
//             className="w-full h-full"
//             preserveAspectRatio="xMidYMid slice"
//           >
//             <defs>
//               <linearGradient id="g1" x1="0%" x2="100%">
//                 <stop offset="0%" stopColor={glow} stopOpacity="0.7" />
//                 <stop offset="100%" stopColor="#fff" stopOpacity="0.05" />
//               </linearGradient>
//             </defs>
//             <circle cx="30" cy="40" r="1.5" fill="url(#g1)" />
//             <circle cx="160" cy="80" r="1.2" fill="url(#g1)" />
//             <circle cx="120" cy="150" r="1.8" fill="url(#g1)" />
//             <path d="M60 30 Q80 40 70 60" stroke={glow} strokeWidth="0.6" fill="none" opacity="0.6" />
//           </svg>
//         </motion.div>
//       </motion.div>

//       {/* Caption / CTA */}
//       <div className="text-center">
//         <div className="text-lg font-semibold text-white">{title}</div>
//         <div className="text-sm text-white/80">{price}</div>
//         <div className="mt-3 flex items-center justify-center gap-2">
//           <button className="px-4 py-2 rounded-full bg-white/6 backdrop-blur-sm border border-white/10 hover:scale-105 transition-transform">
//             View
//           </button>
//           <button className="px-4 py-2 rounded-full bg-gradient-to-r from-white/6 to-white/3 border border-white/10 hover:scale-105 transition-transform">
//             Buy
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

