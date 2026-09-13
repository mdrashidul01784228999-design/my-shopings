
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