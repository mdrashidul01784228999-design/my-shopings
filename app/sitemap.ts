import type { MetadataRoute } from "next";
import { SITE_URL, API_URL, abs } from "./seo/site";

export const revalidate = 3600;

// শুধু ইনডেক্স-যোগ্য পাবলিক পেজ (প্রাইভেট/টেস্ট পেজ বাদ)
const STATIC: { path: string; priority: number; changeFrequency: "daily" | "weekly" | "monthly" }[] = [
  { path: "/", priority: 1.0, changeFrequency: "daily" },
  { path: "/products-view", priority: 0.9, changeFrequency: "daily" },
  { path: "/games", priority: 0.7, changeFrequency: "weekly" },
  { path: "/services", priority: 0.7, changeFrequency: "weekly" },
  { path: "/it-solution", priority: 0.6, changeFrequency: "monthly" },
  { path: "/apps", priority: 0.5, changeFrequency: "monthly" },
  { path: "/pdf", priority: 0.6, changeFrequency: "monthly" },
  { path: "/age", priority: 0.6, changeFrequency: "monthly" },
  { path: "/advance", priority: 0.6, changeFrequency: "monthly" },
  { path: "/epepar", priority: 0.6, changeFrequency: "daily" },
  { path: "/games/Jam", priority: 0.5, changeFrequency: "monthly" },
  { path: "/games/sky", priority: 0.5, changeFrequency: "monthly" },
  { path: "/games/shoter", priority: 0.5, changeFrequency: "monthly" },
  { path: "/games/real", priority: 0.5, changeFrequency: "monthly" },
  { path: "/games/Snack", priority: 0.5, changeFrequency: "monthly" },
  { path: "/gifts", priority: 0.5, changeFrequency: "monthly" },
  { path: "/real_shop", priority: 0.5, changeFrequency: "monthly" },
  { path: "/wheel", priority: 0.5, changeFrequency: "monthly" },
  { path: "/all", priority: 0.6, changeFrequency: "monthly" },
  { path: "/nikah", priority: 0.4, changeFrequency: "monthly" },
  { path: "/advance/video", priority: 0.5, changeFrequency: "monthly" },
  { path: "/games/qs", priority: 0.5, changeFrequency: "monthly" },
  { path: "/games/number", priority: 0.5, changeFrequency: "monthly" },
  { path: "/services/e-paper", priority: 0.5, changeFrequency: "daily" },
  { path: "/about-us", priority: 0.5, changeFrequency: "monthly" },
  { path: "/contact-us", priority: 0.5, changeFrequency: "monthly" },
  { path: "/privacy-policy", priority: 0.3, changeFrequency: "monthly" },
  { path: "/terms-and-conditions", priority: 0.3, changeFrequency: "monthly" },
];

async function fetchProducts(): Promise<any[]> {
  try {
    // Laravel API (আগে ভুলে Next.js-এর নিজের /api/products ডাকা হচ্ছিল, যা নেই)
    const res = await fetch(`${API_URL}/get_all_product_brandName/`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    const list = Array.isArray(data) ? data : data?.message ?? data?.data ?? data?.products ?? [];
    return Array.isArray(list) ? list : [];
  } catch {
    return []; // API ডাউন থাকলেও বিল্ড/সাইটম্যাপ ভাঙবে না
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await fetchProducts();
  const seen = new Set<string>();
  const productUrls: MetadataRoute.Sitemap = [];
  for (const p of products) {
    if (p?.id == null || seen.has(String(p.id))) continue;
    seen.add(String(p.id));
    const updated = p.updated_at || p.updatedAt;
    productUrls.push({
      url: `${SITE_URL}/products-view/${p.id}`, // আসল রুট (আগে ভুলে /product/ ছিল → 404)
      ...(updated && !isNaN(Date.parse(updated)) ? { lastModified: new Date(updated) } : {}),
      changeFrequency: "weekly",
      priority: 0.8,
    });
    if (productUrls.length >= 49000) break;
  }
  return [...STATIC.map((s) => ({ url: abs(s.path), changeFrequency: s.changeFrequency, priority: s.priority })), ...productUrls];
}

/* ===== SEO UPDATE BACKUP: মূল ফাইলের সম্পূর্ণ কোড (কিছুই মুছিনি, এখানে রাখা আছে — দরকারে ফিরিয়ে নিন) =====

import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ১. সরাসরি Environment Variable ব্যবহার করুন (import siteUrl পরিহার করুন)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  try {
    const res = await fetch(`${baseUrl}/api/products`, {
      next: { revalidate: 3600 } 
    });
    
    // API থেকে ঠিকঠাক রেসপন্স না পেলে এরর থ্রো করবে, যা catch ব্লকে যাবে
    if (!res.ok) {
        throw new Error("Failed to fetch products");
    }

    const products = await res.json();

    const productUrls = products.map((p: any) => ({
      url: `${baseUrl}/product/${p.id}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
        url: `${baseUrl}/login`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.3,
      },
      ...productUrls,
    ];

  } catch (error) {
    console.error("Sitemap API Fetch Error:", error);
    
    // API ফেইল করলেও যেন প্রজেক্টের বিল্ড ফেইল না করে, তাই একটি ডিফল্ট সাইটম্যাপ রিটার্ন করা হলো
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      }
    ];
  }
}

// import  siteUrl  from "./api/Api";
// import { MetadataRoute } from 'next';

// export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
//   // 1. Fetch products with an optional 'limit' if your store is massive
//   // Use 'revalidate' to ensure the sitemap stays fresh without hitting the DB too hard
//   const res = await fetch(`${siteUrl}/api/products`, {
//     next: { revalidate: 3600 } 
//   });
  
//   const products = await res.json();

//   const productUrls = products.map((p: any) => ({
//     url: `${siteUrl}/product/${p.id}`,
//     // 2. Use actual update dates if available, otherwise fallback to now
//     lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
//     changeFrequency: 'weekly',
//     priority: 0.8, // Products are high priority
//   }));

//   return [
//     {
//       url: siteUrl,
//       lastModified: new Date(),
//       changeFrequency: 'daily',
//       priority: 1.0, // Homepage is highest priority
//     },
//     {
//       url: `${siteUrl}/login`,
//       lastModified: new Date(),
//       changeFrequency: 'monthly',
//       priority: 0.3, // Login pages don't need much SEO love
//     },
//     ...productUrls,
//   ];
// }

// // import { siteUrl } from "./api/Api";

// // export default async function sitemap() {
// //   const res = await fetch(`${siteUrl}/api/products`);
// //   const products = await res.json();

// //   const productUrls = products.map((p: any) => ({
// //     url: `${siteUrl}/product/${p.id}`,
// //     lastModified: new Date(),
// //   }));

// //   return [
// //     {
// //       url: siteUrl,
// //       lastModified: new Date(),
// //     },
// //     {
// //       url: `${siteUrl}/login`,
// //       lastModified: new Date(),
// //     },
// //     ...productUrls,
// //   ];
// // }
===== END BACKUP ===== */
