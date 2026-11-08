"use client";

import React from "react";

// ১. প্রোডাক্ট অবজেক্টের জন্য টাইপ ইন্টারফেস ডিফাইন করা হলো
interface ProductProps {
  product: {
    name: string;
    [key: string]: any; // অন্যান্য প্রপার্টিজ থাকলে সেফ জোনে রাখার জন্য
  };
}

export default function ShareButtons({ product }: ProductProps) {
  // সার্ভার সাইড রেন্ডারিং (SSR) সেফ রাখার জন্য উইন্ডো চেক
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  
  // প্রোডাক্টের নামকে URL ফ্রেন্ডলি করার জন্য এনকোড করা হলো
  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedName = encodeURIComponent(product?.name || "");

  return (
    <div className="flex gap-3 mt-6 flex-wrap text-white font-medium text-sm">
      
      {/* ফেসবুক শেয়ার */}
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-blue-600 hover:bg-blue-700 transition-colors px-4 py-2 rounded-lg"
      >
        Facebook
      </a>

      {/* হোয়াটসঅ্যাপ শেয়ার */}
      <a
        href={`https://wa.me/?text=${encodedName}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-green-500 hover:bg-green-600 transition-colors px-4 py-2 rounded-lg"
      >
        WhatsApp
      </a>

      {/* টুইটার (X) শেয়ার */}
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedName}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-sky-500 hover:bg-sky-600 transition-colors px-4 py-2 rounded-lg"
      >
        Twitter
      </a>
    </div>
  );
}
