








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






// 'use client';


// import React from 'react'
// import  Prodcutdev from '../page'
// import { useParams } from 'next/navigation';
// import Seos from '../Seo'


// export default function page() {


//   const params = useParams();
//     const currentCategory = params?.id as Number | undefined;
//   return (
//     <div>

//       {/* <Seos />
//       <h3>lsjfl</h3>



//       {currentCategory} */}


// <Prodcutdev />


//     </div>
//   )
// }
